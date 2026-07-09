// Simulazioni interattive (parte 2): traduzione degli indirizzi con TLB,
// FAT, i-node UNIX, produttore-consumatore con semafori, stati di un processo.
(function () {
  "use strict";
  const K = window.SIMKIT;

  /* ==================== Traduzione degli indirizzi (paginazione + TLB) ==================== */
  (function () {
    const NPAGES = 16, NFRAMES = 8, OFFBITS = 12, PSIZE = 4096, TLBSIZE = 4;

    function newState() {
      const pt = Array(NPAGES).fill(-1);
      const pages = Array.from({ length: NPAGES }, (_, i) => i).sort(() => Math.random() - .5).slice(0, NFRAMES);
      const frames = Array.from({ length: NFRAMES }, (_, i) => i).sort(() => Math.random() - .5);
      pages.forEach((p, i) => { pt[p] = frames[i]; });
      const tlb = pages.slice(0, 2).map(p => ({ page: p, frame: pt[p] }));
      return { pt, tlb };
    }

    const bin = (v, n) => v.toString(2).padStart(n, "0");

    window.SIMS.push({
      id: "sim_mmu", topic: "memoria", name: "Traduzione indirizzi + TLB", icon: "MMU",
      title: "Traduzione degli indirizzi: pagine, tabella e TLB",
      desc: "Un indirizzo virtuale alla volta: lo spezzi in numero di pagina e offset, provi il TLB, poi la tabella delle pagine — fino all'indirizzo fisico o al page fault.",
      info: `<p><b>Come leggere la scena.</b> L'indirizzo virtuale a 16 bit è spezzato in due riquadri: <b>p</b> (4 bit, verde) sceglie la riga della tabella, <b>d</b> (12 bit, ambra) è l'offset che passa <i>invariato</i> nell'indirizzo fisico — la MMU traduce solo p in numero di cornice. A sinistra il TLB, a destra la tabella delle pagine col bit di validità.</p>
      <ul>
        <li><b>TLB hit</b>: la traduzione è già nella cache associativa della MMU → nessun accesso extra in memoria. Genera più indirizzi di fila: il TLB «si scalda» e gli hit aumentano (località!).</li>
        <li><b>TLB miss</b>: bisogna leggere la entry nella tabella delle pagine in RAM → un accesso in più. Poi la traduzione entra nel TLB (qui rimpiazzo FIFO).</li>
        <li><b>Page fault</b>: bit di validità a 0 → trap al SO, che carica la pagina da disco, aggiorna tabella e TLB e <i>riesegue</i> l'istruzione.</li>
      </ul>
      <p><b>Collegamento</b>: quanto pesa la differenza hit/miss sul tempo medio? È esattamente la formula dell'EAT — c'è una simulazione apposta.</p>`,
      mount(box) {
        const st = newState();
        let page = 0, off = 0;
        box.innerHTML = `<div class="sim-params">
            <button class="btn small p-addr">nuovo indirizzo virtuale</button>
            <button class="btn small secondary p-flush">svuota TLB</button>
            <span class="badge">pagine da 4 KB · indirizzi virtuali a 16 bit (16 pagine) · 8 cornici</span>
          </div>
          <div class="sim-player"></div>
          <p class="sim-hint">Il TLB (qui 4 entry, rimpiazzo FIFO) resta caldo tra un indirizzo e l'altro: genera più indirizzi e nota quando la pagina è già in TLB. Circa un indirizzo su cinque cade su una pagina non valida, per vedere il page fault.</p>`;
        const q = s => box.querySelector(s);

        function newAddr() {
          const valid = [];
          st.pt.forEach((f, p) => { if (f >= 0) valid.push(p); });
          page = Math.random() < .8 ? K.pick(valid) : K.pick(st.pt.map((f, p) => p).filter(p => st.pt[p] < 0));
          off = K.rnd(0, PSIZE - 1);
        }
        newAddr();

        function build() {
          const va = page * PSIZE + off;
          const frames = [];
          const tlbSnap = () => st.tlb.map(e => ({ page: e.page, frame: e.frame }));
          const push = (m, extra) => frames.push(Object.assign({ msg: m, tlb: tlbSnap() }, extra || {}));
          push(`La CPU genera l'indirizzo virtuale <b>${va}</b>: i ${OFFBITS} bit bassi sono l'offset d, i 4 alti il numero di pagina p.`, { step: "va" });
          const hit = st.tlb.findIndex(e => e.page === page);
          if (hit >= 0) {
            push(`Cerco p=${page} nel TLB… <b>TLB hit</b>: la traduzione è già in cache, cornice ${st.tlb[hit].frame}, senza toccare la tabella delle pagine.`, { step: "tlb", hitRow: hit });
            push(paMsg(st.tlb[hit].frame), { step: "pa", frame: st.tlb[hit].frame });
            return frames;
          }
          push(`Cerco p=${page} nel TLB… <b>TLB miss</b>: devo consultare la tabella delle pagine in memoria.`, { step: "tlb", miss: true });
          const fr = st.pt[page];
          if (fr < 0) {
            push(`La entry ${page} della tabella ha il bit di validità a 0 → <b>PAGE FAULT</b>: trap al SO, che carica la pagina da disco, aggiorna tabella e TLB e fa ripartire l'istruzione.`, { step: "pt", ptRow: page, fault: true });
            return frames;
          }
          push(`La entry ${page} della tabella è valida: la pagina è nella cornice <b>${fr}</b>.`, { step: "pt", ptRow: page });
          st.tlb.push({ page, frame: fr });
          if (st.tlb.length > TLBSIZE) st.tlb.shift();
          push(`Aggiorno il TLB (FIFO: se pieno esce la entry più vecchia) così il prossimo accesso alla pagina ${page} sarà un hit.`, { step: "tlbup", hitRow: st.tlb.length - 1 });
          push(paMsg(fr), { step: "pa", frame: fr });
          return frames;
        }
        function paMsg(fr) {
          return `Indirizzo fisico = cornice × 4096 + offset = ${fr} × 4096 + ${off} = <b>${fr * PSIZE + off}</b>.`;
        }

        function render(f) {
          let h = K.msg(f.msg, f.fault ? "err" : "");
          h += `<div class="bits"><b>virtuale:</b> <span class="bseg bseg-p">p = ${bin(page, 4)} (${page})</span><span class="bseg bseg-o">d = ${bin(off, OFFBITS)} (${off})</span></div>`;
          if (f.step === "pa") h += `<div class="bits"><b>fisico:</b> <span class="bseg bseg-p">cornice = ${bin(f.frame, 3)} (${f.frame})</span><span class="bseg bseg-o">d = ${bin(off, OFFBITS)} (${off})</span></div>`;
          h += `<div class="sim-cols"><div><b>TLB</b><table><tr><th>pagina</th><th>cornice</th></tr>`;
          for (let i = 0; i < TLBSIZE; i++) {
            const e = f.tlb[i];
            const on = (f.step === "tlb" || f.step === "tlbup") && f.hitRow === i;
            h += `<tr${on ? ' class="hlrow"' : ""}><td>${e ? e.page : "—"}</td><td>${e ? e.frame : "—"}</td></tr>`;
          }
          h += `</table>${f.miss ? '<span class="badge">miss</span>' : ""}</div>`;
          h += `<div><b>tabella delle pagine</b><table><tr><th>p</th><th>v</th><th>cornice</th><th>p</th><th>v</th><th>cornice</th></tr>`;
          for (let r = 0; r < NPAGES / 2; r++) {
            h += "<tr>";
            [r, r + NPAGES / 2].forEach(p => {
              const on = f.step === "pt" && f.ptRow === p;
              h += `<td${on ? ' class="hlcell"' : ""}>${p}</td><td${on ? ' class="hlcell"' : ""}>${st.pt[p] < 0 ? 0 : 1}</td><td${on ? ' class="hlcell"' : ""}>${st.pt[p] < 0 ? "—" : st.pt[p]}</td>`;
            });
            h += "</tr>";
          }
          h += "</table></div></div>";
          return h;
        }
        const pl = K.player(q(".sim-player"), { build, render });
        q(".p-addr").addEventListener("click", () => { newAddr(); pl.reload(); });
        q(".p-flush").addEventListener("click", () => { st.tlb = []; pl.reload(); });
      }
    });
  })();

  /* ==================== FAT: catena dei cluster ==================== */
  (function () {
    const N = 16, FCOL = { A: "#3b82f6", B: "#d97706", C: "#0d9488" };

    function gen() {
      const free = Array.from({ length: N - 2 }, (_, i) => i + 2).sort(() => Math.random() - .5);
      const fat = Array(N).fill(null); // null = libero
      const files = [];
      [["A", 4], ["B", 3], ["C", 2]].forEach(([name, len]) => {
        const chain = free.splice(0, len);
        for (let i = 0; i < chain.length - 1; i++) fat[chain[i]] = chain[i + 1];
        fat[chain[chain.length - 1]] = -1; // EOF
        files.push({ name, start: chain[0], chain });
      });
      return { fat, files };
    }

    window.SIMS.push({
      id: "sim_fat", topic: "fs", name: "FAT: catena dei cluster", icon: "FAT",
      title: "FAT: seguire la catena dei cluster di un file",
      desc: "La directory dà solo il primo cluster: il resto del file si ricostruisce saltando di cella in cella dentro la FAT, fino al marcatore di fine file.",
      info: `<p><b>Come leggere la scena.</b> La directory associa a ogni nome solo il <b>primo cluster</b>. La FAT ha una entry per ogni cluster del disco: il valore dice qual è il cluster <i>successivo</i> dello stesso file (o EOF, o libero «·»). L'area dati in basso mostra dove stanno fisicamente i pezzi: nota quanto sono sparpagliati.</p>
      <ul>
        <li><b>È una lista concatenata «esternalizzata»</b>: i puntatori non stanno nei blocchi dati ma tutti insieme in tabella — così un blocco dati contiene solo dati e la catena si percorre senza toccare il disco, se la FAT è in RAM.</li>
        <li><b>Accesso casuale lento</b>: per arrivare al cluster n bisogna comunque fare n salti nella catena (confronta con l'i-node, che arriva dritto al blocco con un indice).</li>
        <li><b>Costo in RAM</b>: la FAT va tenuta tutta in memoria e cresce col disco — è il limite che ha spinto verso FAT16 → FAT32 → e poi verso gli i-node/NTFS.</li>
        <li><b>Cluster liberi</b>: sono le entry «·» — lo spazio libero è gratis, sta già nella tabella.</li>
      </ul>`,
      mount(box) {
        let d = gen(), sel = 0;
        box.innerHTML = `<div class="sim-params p-files"></div><div class="sim-player"></div>
          <p class="sim-hint">I cluster di un file non sono contigui: la FAT è una lista concatenata «esternalizzata» in una tabella, una entry per ogni cluster del disco. Per l'accesso casuale bisogna ripercorrere la catena dall'inizio (per questo la FAT si tiene in RAM).</p>`;
        const q = s => box.querySelector(s);

        function build() {
          const file = d.files[sel];
          const frames = [];
          frames.push({ msg: `Nella directory: il file <b>${file.name}</b> inizia al cluster <b>${file.start}</b>. La FAT dirà tutto il resto.`, k: 0 });
          file.chain.forEach((c, i) => {
            const nx = d.fat[c];
            frames.push({
              msg: nx === -1
                ? `FAT[${c}] = <b>EOF</b> → il file finisce qui. Catena completa: ${file.chain.join(" → ")}.`
                : `Leggo il cluster <b>${c}</b>, poi guardo FAT[${c}] = <b>${nx}</b>: il prossimo pezzo del file è lì.`,
              k: i + 1, cur: c
            });
          });
          return frames;
        }

        function render(f) {
          const file = d.files[sel];
          const owner = c => { for (const fl of d.files) if (fl.chain.includes(c)) return fl.name; return null; };
          let h = K.msg(f.msg);
          h += `<div class="sim-cols"><div><b>directory</b><table><tr><th>nome</th><th>primo cluster</th></tr>`;
          d.files.forEach((fl, i) => { h += `<tr${i === sel && f.k === 0 ? ' class="hlrow"' : ""}><td>${fl.name}</td><td>${fl.start}</td></tr>`; });
          h += `</table></div><div><b>FAT</b><table>`;
          for (let r = 0; r < 2; r++) {
            h += "<tr>" + Array.from({ length: N / 2 }, (_, c0) => `<th>${r * N / 2 + c0}</th>`).join("") + "</tr><tr>";
            for (let c0 = 0; c0 < N / 2; c0++) {
              const c = r * N / 2 + c0;
              const v = c < 2 ? "ris." : d.fat[c] === null ? "·" : d.fat[c] === -1 ? "EOF" : d.fat[c];
              const seen = file.chain.indexOf(c);
              const cls = f.cur === c ? "hlcell" : (seen >= 0 && seen < f.k - 1) ? "dimcell" : "";
              h += `<td${cls ? ` class="${cls}"` : ""}>${v}</td>`;
            }
            h += "</tr>";
          }
          h += `</table></div></div>`;
          h += `<div class="squeue"><b>area dati:</b> ` + Array.from({ length: N }, (_, c) => {
            const o = owner(c), isCur = f.cur === c;
            const bg = o ? FCOL[o] : "transparent";
            return `<span class="scell" style="${o ? `background:${bg};color:#fff;border-color:${bg};` : ""}${isCur ? "outline:2px solid var(--accent);outline-offset:1px;" : ""}${c < 2 ? "opacity:.4;" : ""}">${o || (c < 2 ? "ris" : "·")}</span>`;
          }).join("") + `</div>`;
          h += `<div class="squeue"><b>catena letta:</b> ${f.k ? file.chain.slice(0, f.k).join(" → ") : "<i>ancora nulla</i>"}${f.k >= file.chain.length ? " → EOF ✓" : ""}</div>`;
          return h;
        }

        const filesBar = q(".p-files");
        let pl = null;
        function drawBar() {
          filesBar.innerHTML = d.files.map((fl, i) =>
            `<button class="btn small ${i === sel ? "" : "secondary"} p-f" data-i="${i}">file ${fl.name} (${fl.chain.length} cluster)</button>`).join("") +
            `<button class="btn small secondary p-new">nuovo disco</button>`;
        }
        drawBar();
        pl = K.player(q(".sim-player"), { build, render });
        filesBar.addEventListener("click", e => {
          const b = e.target.closest("button"); if (!b) return;
          if (b.classList.contains("p-new")) { d = gen(); sel = 0; } else sel = +b.dataset.i;
          drawBar(); pl.reload();
        });
      }
    });
  })();

  /* ==================== i-node UNIX ==================== */
  (function () {
    const BS = 1024, NPTR = 256, ND = 10;
    const L1 = ND + NPTR, L2 = L1 + NPTR * NPTR, L3 = L2 + NPTR * NPTR * NPTR;
    const fmt = b => b >= 1 << 30 ? (b / (1 << 30)).toFixed(1) + " GB" : b >= 1 << 20 ? (b / (1 << 20)).toFixed(1) + " MB" : b >= 1024 ? (b / 1024).toFixed(1) + " KB" : b + " B";

    function planFor(off) {
      const b = Math.floor(off / BS);
      if (b < ND) return { b, zone: 0, hops: [`i-node: puntatore diretto n. ${b}`, `blocco dati ${b}`], calc: [`${b} < 10 → basta un puntatore <b>diretto</b> dell'i-node`], acc: 1 };
      if (b < L1) { const r = b - ND; return { b, zone: 1, idx: [r], hops: [`i-node: puntatore indiretto singolo (slot 10)`, `blocco indiretto: entry ${r}`, `blocco dati ${b}`], calc: [`10 ≤ ${b} < ${L1} → zona dell'indiretto <b>singolo</b>`, `indice nel blocco indiretto: ${b} − 10 = <b>${r}</b>`], acc: 2 }; }
      if (b < L2) {
        const r = b - L1, i1 = Math.floor(r / NPTR), i2 = r % NPTR;
        return { b, zone: 2, idx: [i1, i2], hops: [`i-node: puntatore indiretto doppio (slot 11)`, `1° livello: entry ${i1}`, `2° livello: entry ${i2}`, `blocco dati ${b}`], calc: [`${L1} ≤ ${b} < ${L2} → zona dell'indiretto <b>doppio</b>`, `resto: ${b} − ${L1} = ${r}`, `1° livello: ⌊${r} / 256⌋ = <b>${i1}</b> · 2° livello: ${r} mod 256 = <b>${i2}</b>`], acc: 3 };
      }
      const r = b - L2, i1 = Math.floor(r / (NPTR * NPTR)), i2 = Math.floor(r / NPTR) % NPTR, i3 = r % NPTR;
      return { b, zone: 3, idx: [i1, i2, i3], hops: [`i-node: puntatore indiretto triplo (slot 12)`, `1° livello: entry ${i1}`, `2° livello: entry ${i2}`, `3° livello: entry ${i3}`, `blocco dati ${b}`], calc: [`${b} ≥ ${L2} → zona dell'indiretto <b>triplo</b>`, `resto: ${b} − ${L2} = ${r}`, `1° livello: ⌊${r}/65536⌋ = <b>${i1}</b> · 2° livello: ⌊${r}/256⌋ mod 256 = <b>${i2}</b> · 3° livello: ${r} mod 256 = <b>${i3}</b>`], acc: 4 };
    }

    function inodeSVG(plan, prog) {
      const rowH = 15, x0 = 8, w0 = 118, top = 8;
      const labels = [...Array.from({ length: ND }, (_, i) => "diretto " + i), "ind. singolo", "ind. doppio", "ind. triplo"];
      const slotIdx = plan.zone === 0 ? plan.b : 9 + plan.zone;
      const H = top + 13 * rowH + 16;
      const boxes = plan.hops.length - 1; // scatole dopo l'i-node
      const W = 150 + boxes * 130;
      let s = `<svg class="sim-svg" viewBox="0 0 ${W} ${H}" style="width:${Math.min(W, 660)}px">`;
      s += `<rect x="${x0}" y="${top}" width="${w0}" height="${13 * rowH}" rx="4" style="fill:var(--surface);stroke:var(--border)"/>`;
      labels.forEach((lb, i) => {
        const y = top + i * rowH;
        const on = i === slotIdx && prog >= 1;
        if (on) s += `<rect x="${x0}" y="${y}" width="${w0}" height="${rowH}" style="fill:var(--accent-soft)"/>`;
        s += `<line x1="${x0}" y1="${y}" x2="${x0 + w0}" y2="${y}" style="stroke:var(--border);stroke-width:.5"/>`;
        s += `<text x="${x0 + 6}" y="${y + 11}" style="fill:${on ? "var(--accent)" : i >= 10 ? "var(--text)" : "var(--dim)"};font-family:var(--mono);font-size:9.5px;font-weight:${on ? 700 : 400}">${i < 10 ? i + " · " + lb : lb}</text>`;
      });
      s += `<text x="${x0 + 4}" y="${top + 13 * rowH + 12}" style="fill:var(--dim);font-family:var(--mono);font-size:9px">i-node</text>`;
      const slotY = top + slotIdx * rowH + rowH / 2;
      let px = x0 + w0, py = slotY;
      for (let i = 1; i < plan.hops.length; i++) {
        const bx = 150 + (i - 1) * 130, by = 30, bw = 100, bh = 60;
        const isData = i === plan.hops.length - 1;
        const on = prog >= i + 1;
        s += `<line x1="${px}" y1="${py}" x2="${bx}" y2="${by + bh / 2}" style="stroke:${on ? "var(--accent)" : "var(--border)"};stroke-width:${on ? 2 : 1.2}"/>`;
        s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="5" style="fill:${on ? (isData ? "var(--accent)" : "var(--accent-soft)") : "var(--surface)"};stroke:${on ? "var(--accent)" : "var(--border)"}"/>`;
        const t1 = isData ? "blocco dati" : "blocco indiretto";
        const t2 = isData ? "n. " + plan.b : "entry " + plan.idx[i - 1];
        s += `<text x="${bx + bw / 2}" y="${by + 26}" text-anchor="middle" style="fill:${on && isData ? "#fff" : "var(--text)"};font-family:var(--mono);font-size:9.5px">${t1}</text>`;
        s += `<text x="${bx + bw / 2}" y="${by + 42}" text-anchor="middle" style="fill:${on && isData ? "#fff" : "var(--dim)"};font-family:var(--mono);font-size:9.5px;font-weight:700">${t2}</text>`;
        px = bx + bw; py = by + bh / 2;
      }
      return s + "</svg>";
    }

    window.SIMS.push({
      id: "sim_inode", topic: "fs", name: "i-node: diretti e indiretti", icon: "i-n",
      title: "i-node UNIX: dai byte del file al blocco su disco",
      desc: "Scegli un offset nel file e segui il cammino: puntatori diretti, poi indiretto singolo, doppio, triplo — con i calcoli degli indici e il conto degli accessi a disco.",
      info: `<p><b>Come leggere la scena.</b> A sinistra l'i-node con i suoi 13 puntatori: 10 <b>diretti</b> (blocchi 0–9), poi indiretto <b>singolo</b>, <b>doppio</b> e <b>triplo</b>. Dato l'offset in byte, si calcola il blocco logico b = ⌊offset / 1024⌋ e si decide la zona; il cammino evidenziato mostra i blocchi di puntatori da attraversare per arrivare al blocco dati.</p>
      <ul>
        <li><b>I file piccoli sono veloci</b>: fino a 10 KB basta un puntatore nell'i-node → 1 accesso. È il caso tipico: la maggior parte dei file è piccola.</li>
        <li><b>Ogni livello di indirezione = un accesso a disco in più</b>: singolo → 2, doppio → 3, triplo → 4 (l'i-node stesso è già in RAM dopo l'apertura).</li>
        <li><b>I calcoli d'esame</b>: 256 puntatori per blocco (1 KB / 4 B) → singolo copre i blocchi 10–265, doppio fino a 65801, triplo fino a ≈16 GB. Gli indici si ottengono con divisioni e resti per 256.</li>
        <li><b>Differenza dalla FAT</b>: qui l'accesso casuale è un calcolo d'indice, non una catena da ripercorrere.</li>
      </ul>`,
      mount(box) {
        const presets = [
          { label: "5 KB", off: 5 * 1024 + 300 },
          { label: "120 KB", off: 120 * 1024 + 50 },
          { label: "300 KB", off: 300 * 1024 + 700 },
          { label: "30 MB", off: 30 * (1 << 20) + 12345 },
          { label: "2 GB", off: 2 * (1 << 30) + 98765 }
        ];
        let off = presets[0].off;
        box.innerHTML = `<div class="sim-params"><span><b>offset nel file:</b></span><span class="p-btns"></span></div>
          <div class="sim-player"></div>
          <p class="sim-hint">Numeri del corso: blocchi da 1 KB, puntatori da 4 B → 256 puntatori per blocco indiretto. Diretti: blocchi 0–9 (10 KB); singolo: fino a ${fmt(L1 * BS)}; doppio: fino a ${fmt(L2 * BS)}; triplo: fino a ≈ ${fmt(L3 * BS)}. Gli accessi contati escludono la lettura dell'i-node stesso.</p>`;
        const q = s => box.querySelector(s);

        function build() {
          const plan = planFor(off);
          const frames = [];
          frames.push({ msg: `Voglio il byte a offset <b>${off.toLocaleString("it-IT")}</b> (≈ ${fmt(off)}): blocco logico b = ⌊${off.toLocaleString("it-IT")} / 1024⌋ = <b>${plan.b.toLocaleString("it-IT")}</b>.`, plan, prog: 0 });
          plan.calc.forEach(c => frames.push({ msg: c, plan, prog: 0 }));
          plan.hops.forEach((hp, i) => frames.push({ msg: `seguo: <b>${hp}</b>`, plan, prog: i + 1 }));
          frames.push({ msg: `<b>Fatto:</b> ${plan.acc} acces${plan.acc === 1 ? "so" : "si"} a disco per arrivare ai dati (${plan.acc - 1} blocc${plan.acc - 1 === 1 ? "o" : "hi"} di puntatori + il blocco dati).`, plan, prog: plan.hops.length });
          return frames;
        }
        const render = f => K.msg(f.msg) + inodeSVG(f.plan, f.prog);
        const pl = K.player(q(".sim-player"), { build, render });
        const bar = q(".p-btns");
        function drawBar() {
          bar.innerHTML = presets.map((p, i) => `<button class="btn small ${p.off === off ? "" : "secondary"}" data-i="${i}">${p.label}</button>`).join(" ") +
            ` <button class="btn small secondary" data-i="rnd">a caso</button>`;
        }
        drawBar();
        bar.addEventListener("click", e => {
          const b = e.target.closest("button"); if (!b) return;
          if (b.dataset.i === "rnd") {
            const zone = K.rnd(0, 3);
            const lo = [0, ND, L1, L2][zone] * BS, hi = [ND, L1, L2, Math.min(L3, 4 * (1 << 30) / BS)][zone] * BS - 1;
            off = K.rnd(0, 1e9) % (hi - lo) + lo;
          } else off = presets[+b.dataset.i].off;
          drawBar(); pl.reload();
        });
      }
    });
  })();

  /* ==================== Produttore-consumatore con semafori ==================== */
  (function () {
    const N = 5;
    const PSTEPS = [["down", "empty"], ["down", "mutex"], ["ins"], ["up", "mutex"], ["up", "full"]];
    const CSTEPS = [["down", "full"], ["down", "mutex"], ["rem"], ["up", "mutex"], ["up", "empty"]];
    const CODE = {
      prod: ["down(empty)", "down(mutex)", "inserisce l'item nel buffer", "up(mutex)", "up(full)"],
      cons: ["down(full)", "down(mutex)", "preleva l'item dal buffer", "up(mutex)", "up(empty)"]
    };

    window.SIMS.push({
      id: "sim_prodcons", topic: "sync", name: "Produttore–consumatore", icon: "P/C",
      title: "Produttore–consumatore con semafori (buffer limitato)",
      desc: "Esegui tu, una primitiva alla volta, il codice dei due processi: guarda empty, full e mutex cambiare valore, i processi bloccarsi sulle down e risvegliarsi con le up.",
      info: `<p><b>Come leggere la scena.</b> I due pannelli mostrano il codice dei processi con la prossima primitiva evidenziata (rossa se il processo è bloccato lì sopra). Sotto: i tre semafori con valore e coda di attesa, il buffer circolare con i puntatori in/out e il log delle operazioni.</p>
      <ul>
        <li><b>I tre semafori hanno ruoli diversi</b>: <code>empty</code> (parte da 5, i posti liberi) e <code>full</code> (parte da 0, gli item presenti) sono semafori <i>contatori</i> per la sincronizzazione; <code>mutex</code> (parte da 1) è binario e protegge la sezione critica dell'accesso al buffer.</li>
        <li><b>L'ordine delle down è vitale</b>: prima <code>down(empty)</code>, poi <code>down(mutex)</code>. Invertirle è la domanda classica: il produttore prenderebbe il mutex e si addormenterebbe su empty a buffer pieno → il consumatore non può più entrare → <b>deadlock</b>.</li>
        <li><b>up con coda non incrementa</b>: se qualcuno è in attesa sul semaforo, la up lo <i>sveglia</i> direttamente (la sua down si completa); il valore resta 0. Guardalo succedere nel log.</li>
        <li>Nomenclatura del corso: <code>down</code>/<code>up</code> sui semafori (wait/signal si usano sulle variabili condizione dei monitor).</li>
      </ul>`,
      mount(box) {
        let st;
        function reset() {
          st = {
            buf: Array(N).fill(null), inP: 0, outP: 0, item: 1,
            sem: { empty: { v: N, q: [] }, full: { v: 0, q: [] }, mutex: { v: 1, q: [] } },
            ag: { prod: { pc: 0, blocked: null }, cons: { pc: 0, blocked: null } },
            log: []
          };
        }
        reset();
        box.innerHTML = `<div class="sim-params">
            <button class="btn small p-prod">passo del produttore</button>
            <button class="btn small p-cons">passo del consumatore</button>
            <button class="btn small secondary p-reset">reset</button>
          </div>
          <div class="sim-stage"></div>
          <p class="sim-hint">Prova a mandare in blocco i processi: consuma a buffer vuoto (il consumatore si blocca su <code>down(full)</code>) o produci fino a riempire i ${N} posti (il produttore si blocca su <code>down(empty)</code>). Nota che una <code>up</code> su un semaforo con coda non incrementa il valore: <i>sveglia</i> direttamente un processo.</p>`;
        const q = s => box.querySelector(s);
        const stage = q(".sim-stage");

        const who = a => a === "prod" ? "produttore" : "consumatore";
        function act(a) {
          const ag = st.ag[a], steps = a === "prod" ? PSTEPS : CSTEPS;
          if (ag.blocked) { log(`${who(a)}: ancora bloccato su ${ag.blocked}`); return; }
          const [op, sn] = steps[ag.pc];
          if (op === "down") {
            const s = st.sem[sn];
            if (s.v > 0) { s.v--; ag.pc = (ag.pc + 1) % 5; log(`${who(a)}: down(${sn}) → ok, ${sn} = ${s.v}`); }
            else { s.q.push(a); ag.blocked = sn; log(`${who(a)}: down(${sn}) con ${sn} = 0 → <b>si blocca</b> in coda al semaforo`); }
          } else if (op === "up") {
            const s = st.sem[sn];
            if (s.q.length) {
              const w = s.q.shift();
              st.ag[w].blocked = null; st.ag[w].pc = (st.ag[w].pc + 1) % 5;
              log(`${who(a)}: up(${sn}) → <b>sveglia</b> ${who(w)} (la sua down è completata)`);
            } else { s.v++; log(`${who(a)}: up(${sn}) → ${sn} = ${s.v}`); }
            ag.pc = (ag.pc + 1) % 5;
          } else if (op === "ins") {
            st.buf[st.inP] = st.item; log(`${who(a)}: scrive l'item ${st.item} nel posto ${st.inP}`);
            st.item++; st.inP = (st.inP + 1) % N; ag.pc = (ag.pc + 1) % 5;
          } else {
            log(`${who(a)}: legge l'item ${st.buf[st.outP]} dal posto ${st.outP}`);
            st.buf[st.outP] = null; st.outP = (st.outP + 1) % N; ag.pc = (ag.pc + 1) % 5;
          }
          render();
        }
        function log(m) { st.log.push(m); if (st.log.length > 10) st.log.shift(); }

        function agentPanel(a) {
          const ag = st.ag[a];
          let h = `<div><b>${who(a)}</b> ${ag.blocked ? `<span class="badge" style="color:var(--err);border-color:var(--err)">bloccato su ${ag.blocked}</span>` : '<span class="badge acc">pronto</span>'}<div class="pc-code">`;
          CODE[a].forEach((ln, i) => {
            const cls = i === ag.pc ? (ag.blocked ? " blk" : " on") : "";
            h += `<div class="pc-line${cls}">${ln}</div>`;
          });
          return h + "</div></div>";
        }
        function render() {
          let h = `<div class="sim-cols">${agentPanel("prod")}${agentPanel("cons")}`;
          h += `<div><b>semafori</b><table><tr><th>semaforo</th><th>valore</th><th>coda</th></tr>`;
          ["empty", "full", "mutex"].forEach(sn => {
            const s = st.sem[sn];
            h += `<tr><td>${sn}</td><td>${s.v}</td><td>${s.q.map(who).join(", ") || "—"}</td></tr>`;
          });
          h += `</table></div></div>`;
          h += `<div class="squeue"><b>buffer:</b> ` + st.buf.map((v, i) => {
            const marks = `${i === st.inP ? "in→" : ""}${i === st.outP ? "out→" : ""}`;
            return `<span class="scell${v !== null ? " on" : ""}" style="min-width:2.6rem" title="posto ${i}">${marks}${v === null ? "·" : v}</span>`;
          }).join("") + `</div>`;
          h += `<div class="simlog">${st.log.map(l => "· " + l).join("<br>") || "· nessuna operazione ancora: premi un passo"}</div>`;
          stage.innerHTML = h;
          q(".p-prod").disabled = !!st.ag.prod.blocked;
          q(".p-cons").disabled = !!st.ag.cons.blocked;
        }
        q(".p-prod").addEventListener("click", () => act("prod"));
        q(".p-cons").addEventListener("click", () => act("cons"));
        q(".p-reset").addEventListener("click", () => { reset(); render(); });
        render();
      }
    });
  })();

  /* ==================== Stati di un processo ==================== */
  (function () {
    const BOX = {
      nuovo: [15, 35, 95, 40], pronto: [185, 35, 110, 40], esecuzione: [420, 35, 130, 40],
      terminato: [615, 35, 95, 40], bloccato: [330, 165, 120, 40]
    };
    const EVENTS = [
      { id: "ammissione", label: "ammissione", from: "nuovo", to: "pronto" },
      { id: "dispatch", label: "dispatch (scheduler)", from: "pronto", to: "esecuzione" },
      { id: "timeout", label: "revoca / timeout", from: "esecuzione", to: "pronto" },
      { id: "wait", label: "richiesta di I/O", from: "esecuzione", to: "bloccato" },
      { id: "iodone", label: "I/O completato", from: "bloccato", to: "pronto" },
      { id: "exit", label: "exit", from: "esecuzione", to: "terminato" }
    ];
    const ARROWS = {
      ammissione: [110, 55, 185, 55, 148, 47],
      dispatch: [295, 45, 420, 45, 357, 37],
      timeout: [420, 65, 295, 65, 357, 80],
      wait: [485, 75, 420, 168, 470, 130],
      iodone: [335, 168, 245, 75, 262, 130],
      exit: [550, 55, 615, 55, 582, 47]
    };

    window.SIMS.push({
      id: "sim_pstati", topic: "processi", name: "Stati di un processo", icon: "PS",
      title: "Il ciclo di vita di un processo: pronto, esecuzione, bloccato",
      desc: "Pilota un processo lungo il diagramma degli stati: solo gli eventi leciti sono attivi — scopri perché da «bloccato» non si torna mai direttamente in esecuzione.",
      info: `<p><b>Come leggere la scena.</b> Il diagramma a 5 stati del corso: <b>nuovo → pronto ⇄ esecuzione → terminato</b>, con la deviazione per <b>bloccato</b>. I bottoni sono gli eventi: solo quelli leciti dallo stato corrente sono attivi.</p>
      <ul>
        <li><b>pronto</b>: ha tutto per girare, gli manca solo la CPU. <b>bloccato</b>: aspetta un evento esterno (I/O) — dargli la CPU non servirebbe a niente. È la differenza concettuale chiave tra i due stati di attesa.</li>
        <li><b>bloccato → esecuzione non esiste</b>: quando l'I/O finisce il processo torna solo <i>pronto</i>; sarà lo scheduler, col dispatch, a ridargli la CPU. Distrattore classico delle crocette.</li>
        <li><b>revoca/timeout</b> esiste solo negli scheduler <i>preemptive</i> (es. Round Robin a fine quanto); in uno scheduler non preemptive la CPU si lascia solo per I/O o exit.</li>
        <li>A ogni transizione pronto ⇄ esecuzione c'è un <b>context switch</b>: salvataggio/ripristino dei registri nel PCB — non è gratis.</li>
      </ul>`,
      mount(box) {
        let cur = "nuovo", last = null, hist = [];
        box.innerHTML = `<div class="sim-params p-ev"></div><div class="sim-stage"></div>
          <p class="sim-hint">La transizione bloccato → esecuzione non esiste: quando l'I/O è completato il processo torna solo <i>pronto</i>, e sarà lo scheduler a decidere quando ridargli la CPU (dispatch). La revoca esiste solo negli scheduler preemptive.</p>`;
        const q = s => box.querySelector(s);

        function svg() {
          let s = `<svg class="sim-svg" viewBox="0 0 725 235" style="width:680px">
            <defs>
              <marker id="pst-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:var(--dim)"/></marker>
              <marker id="pst-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:var(--accent)"/></marker>
            </defs>`;
          EVENTS.forEach(ev => {
            const [x1, y1, x2, y2, lx, ly] = ARROWS[ev.id];
            const on = last === ev.id;
            s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${on ? "var(--accent)" : "var(--dim)"};stroke-width:${on ? 2.5 : 1.3}" marker-end="url(#pst-${on ? "b" : "a"})"/>`;
            s += `<text x="${lx}" y="${ly}" text-anchor="middle" style="fill:${on ? "var(--accent)" : "var(--dim)"};font-family:var(--mono);font-size:9px${on ? ";font-weight:700" : ""}">${ev.label}</text>`;
          });
          Object.entries(BOX).forEach(([name, [x, y, w, h]]) => {
            const on = name === cur;
            s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" style="fill:${on ? "var(--accent-soft)" : "var(--surface)"};stroke:${on ? "var(--accent)" : "var(--border)"};stroke-width:${on ? 2 : 1.2}"/>`;
            s += `<text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" style="fill:${on ? "var(--accent)" : "var(--text)"};font-family:var(--mono);font-size:12px;font-weight:700">${name}</text>`;
          });
          return s + "</svg>";
        }
        function render() {
          q(".p-ev").innerHTML = EVENTS.map(ev =>
            `<button class="btn small ${ev.from === cur ? "" : "secondary"}" data-ev="${ev.id}" ${ev.from === cur ? "" : "disabled"}>${ev.label}</button>`).join("") +
            ` <button class="btn small secondary" data-ev="_reset">reset</button>`;
          let h = svg();
          h += `<div class="simlog">${hist.length ? hist.map(l => "· " + l).join("<br>") : "· il processo è stato creato: è nello stato <b>nuovo</b>"}</div>`;
          q(".sim-stage").innerHTML = h;
        }
        q(".p-ev").addEventListener("click", e => {
          const b = e.target.closest("button"); if (!b || b.disabled) return;
          if (b.dataset.ev === "_reset") { cur = "nuovo"; last = null; hist = []; render(); return; }
          const ev = EVENTS.find(x => x.id === b.dataset.ev);
          if (!ev || ev.from !== cur) return;
          cur = ev.to; last = ev.id;
          hist.push(`${ev.label}: ${ev.from} → <b>${ev.to}</b>`);
          if (hist.length > 8) hist.shift();
          render();
        });
        render();
      }
    });
  })();

  /* ==================== Risoluzione di un pathname UNIX ==================== */
  (function () {
    const FAKES = ["bin", "etc", "tmp", "lib", "docs", "note.txt", "mail", "src", "old", "backup"];

    function genTree(parts) {
      // per ogni directory del cammino: numero di i-node e voci (con il figlio giusto dentro)
      const used = new Set([2]);
      const newIno = () => { let n; do { n = K.rnd(10, 99); } while (used.has(n)); used.add(n); return n; };
      const nodes = [{ name: "/", ino: 2 }];
      parts.forEach(p => nodes.push({ name: p, ino: newIno() }));
      nodes.forEach((nd, i) => {
        if (i === nodes.length - 1) return; // l'ultimo è il file: niente voci di directory
        const entries = [
          { name: ".", ino: nd.ino },
          { name: "..", ino: i === 0 ? nd.ino : nodes[i - 1].ino },
          { name: nodes[i + 1].name, ino: nodes[i + 1].ino }
        ];
        const extra = [...FAKES].sort(() => Math.random() - .5).slice(0, K.rnd(2, 3));
        extra.forEach(x => { if (x !== nodes[i + 1].name) entries.push({ name: x, ino: newIno() }); });
        nd.entries = entries.slice(0, 2).concat(entries.slice(2).sort(() => Math.random() - .5));
      });
      return nodes;
    }

    const PATHS = ["/usr/ast/mbox", "/home/anna/tesi/cap1.tex", "/var/log/sys.log"];

    window.SIMS.push({
      id: "sim_path", topic: "fs", name: "Risoluzione di un pathname", icon: "DIR",
      title: "Aprire /usr/ast/mbox: la risoluzione di un pathname in UNIX",
      desc: "Ogni componente del cammino costa due accessi a disco: il blocco dati della directory (per trovare la voce) e l'i-node del figlio. Contali uno per uno.",
      info: `<p><b>Come leggere la scena.</b> Il cammino in alto mostra a che punto siamo; la tabella è il contenuto della directory che stiamo leggendo (nome → numero di i-node, con «.» e «..» come in UNIX); il contatore tiene il conto degli accessi a disco.</p>
      <ul>
        <li><b>Il ritmo è sempre lo stesso</b>: i-node della directory (dove sta il suo blocco dati?) → blocco dati (cerco il nome, trovo il numero di i-node del figlio) → i-node del figlio → … fino al file.</li>
        <li><b>Conto d'esame</b>: 2 accessi per componente, +1 all'inizio se l'i-node della radice non è già in RAM, +1 alla fine se serve anche il primo blocco dati del file.</li>
        <li><b>Perché la directory dà solo il numero di i-node</b>: tutti i metadati (proprietario, permessi, puntatori ai blocchi) stanno nell'i-node — è ciò che rende possibili gli hard link: più voci di directory, stesso i-node.</li>
        <li><b>Percorsi lunghi costano</b>: per questo il SO tiene una cache dei nomi/i-node più usati.</li>
      </ul>
      <p class="sim-hint">(classico Tanenbaum: la risoluzione di /usr/ast/mbox)</p>`,
      mount(box) {
        let path = PATHS[0];
        let parts = path.split("/").filter(Boolean);
        let nodes = genTree(parts);
        box.innerHTML = `<div class="sim-params"><span class="p-btns"></span>
            <label style="margin-left:.4rem"><input type="checkbox" class="p-cache" checked> i-node di / già in RAM</label>
          </div>
          <div class="sim-player"></div>`;
        const q = s => box.querySelector(s);

        function build() {
          const cached = q(".p-cache").checked;
          const frames = [];
          let acc = 0;
          const push = (m, extra) => frames.push(Object.assign({ msg: m, acc, ci: -1 }, extra || {}));
          push(`Voglio aprire <b>${path}</b>: la risoluzione parte sempre dalla radice <code>/</code> e scende un componente alla volta.`);
          if (!cached) { acc++; push(`accesso ${acc}: leggo da disco l'<b>i-node della radice</b> (i-node 2) per sapere dove sta il suo blocco dati.`); }
          else push(`L'i-node della radice (i-node 2) è già in RAM (succede quasi sempre): nessun accesso.`);
          parts.forEach((p, i) => {
            const parent = nodes[i], child = nodes[i + 1];
            acc++;
            push(`accesso ${acc}: leggo il <b>blocco dati di ${parent.name === "/" ? "/" : parent.name}</b> e cerco la voce «${p}»…`, { dir: i, hlName: p, ci: i });
            acc++;
            push(`…trovata: «${p}» → i-node <b>${child.ino}</b>. Accesso ${acc}: leggo l'i-node ${child.ino}${i === parts.length - 1 ? " (è quello del file!)" : ""}.`, { dir: i, hlName: p, ci: i + 1 });
          });
          const toIno = acc;
          acc++;
          push(`L'i-node del file mi dà i puntatori ai blocchi: accesso ${acc} per il <b>primo blocco dati</b>. Totale: <b>${toIno}</b> accessi per l'i-node del file, <b>${acc}</b> col primo blocco di dati.`, { ci: parts.length });
          return frames;
        }

        function render(f) {
          let h = K.msg(f.msg);
          h += `<div class="squeue"><b>cammino:</b> <span class="scell${f.ci === 0 ? " on" : f.ci > 0 ? " past" : ""}">/</span>` +
            parts.map((p, i) => `<span class="scell${f.ci === i + 1 ? " on" : f.ci > i + 1 ? " past" : ""}">${p}</span>`).join("") +
            ` <span class="badge acc">accessi a disco: ${f.acc}</span></div>`;
          if (f.dir !== undefined) {
            const nd = nodes[f.dir];
            h += `<div class="sim-cols"><div><b>blocco dati di ${nd.name === "/" ? "/" : nd.name}</b> <span class="badge">i-node ${nd.ino}</span>
              <table><tr><th>nome</th><th>i-node</th></tr>` +
              nd.entries.map(e => `<tr${e.name === f.hlName ? ' class="hlrow"' : ""}><td style="text-align:left">${e.name}</td><td>${e.ino}</td></tr>`).join("") +
              `</table></div></div>`;
          }
          h += `<div class="squeue"><b>catena:</b> ` + ["i-node 2 (/)"].concat(parts.map((p, i) => `blocco dir → i-node ${nodes[i + 1].ino} (${p})`)).slice(0, Math.max(1, f.ci + 1)).map(s => `<span class="scell">${s}</span>`).join("<span style='color:var(--dim)'>→</span>") + `</div>`;
          return h;
        }
        const pl = K.player(q(".sim-player"), { build, render });
        const bar = q(".p-btns");
        function drawBar() {
          bar.innerHTML = PATHS.map((p, i) => `<button class="btn small ${p === path ? "" : "secondary"}" data-i="${i}"><code>${p}</code></button>`).join("");
        }
        drawBar();
        bar.addEventListener("click", e => {
          const b = e.target.closest("button"); if (!b) return;
          path = PATHS[+b.dataset.i];
          parts = path.split("/").filter(Boolean);
          nodes = genTree(parts);
          drawBar(); pl.reload();
        });
        q(".p-cache").addEventListener("change", () => pl.reload());
      }
    });
  })();

  /* ==================== EAT: Effective Access Time con TLB ==================== */
  (function () {
    window.SIMS.push({
      id: "sim_eat", topic: "memoria", name: "EAT: il peso del TLB", icon: "EAT",
      title: "Effective Access Time: quanto fa risparmiare il TLB",
      desc: "Muovi hit ratio e tempi di accesso e guarda l'EAT ricalcolarsi in tempo reale, con i due scenari (hit e miss) disegnati in scala e il confronto col caso senza TLB.",
      info: `<p><b>Come leggere la scena.</b> Le prime due barre sono i due scenari possibili, in scala: con <b>TLB hit</b> paghi TLB + un accesso in RAM (il dato); con <b>TLB miss</b> paghi TLB + <i>due</i> accessi in RAM (prima la tabella delle pagine, poi il dato). L'EAT è la media pesata con l'hit ratio ε — la formula del corso: <b>EAT = ε(t<sub>TLB</sub>+t<sub>RAM</sub>) + (1−ε)(t<sub>TLB</sub>+2t<sub>RAM</sub>)</b>.</p>
      <ul>
        <li><b>Il TLB serve perché la tabella delle pagine sta in RAM</b>: senza TLB ogni accesso costerebbe sempre 2·t<sub>RAM</sub> (tabella + dato).</li>
        <li><b>L'hit ratio domina tutto</b>: prova ε = 99% contro ε = 80% — grazie alla località dei programmi i TLB reali superano il 99%.</li>
        <li><b>Con tabelle multilivello è peggio</b>: con k livelli il miss costa (k+1) accessi in RAM: il TLB diventa ancora più indispensabile.</li>
        <li>Il t<sub>TLB</sub> è piccolo (memoria associativa dentro la MMU) ma si paga <i>sempre</i>, hit o miss.</li>
      </ul>`,
      mount(box) {
        box.innerHTML = `<div class="sim-params eat-params">
            <label>hit ratio ε <input type="range" class="e-h" min="50" max="100" step="1" value="90"><span class="badge acc e-hv"></span></label>
            <label>t<sub>TLB</sub> <input type="range" class="e-t" min="1" max="20" step="1" value="2"><span class="badge e-tv"></span></label>
            <label>t<sub>RAM</sub> <input type="range" class="e-r" min="50" max="200" step="10" value="100"><span class="badge e-rv"></span></label>
          </div>
          <div class="sim-stage"></div>`;
        const q = s => box.querySelector(s);
        const stage = q(".sim-stage");

        function bar(label, segs, total, maxT, extra) {
          const W = 640, x0 = 150, sc = (W - x0 - 70) / maxT, h = 26;
          let x = x0, s = `<text x="${x0 - 8}" y="17" text-anchor="end" style="fill:var(--text);font-family:var(--mono);font-size:10.5px;font-weight:700">${label}</text>`;
          segs.forEach(g => {
            const w = g.t * sc;
            s += `<rect x="${x}" y="2" width="${w}" height="${h}" style="fill:${g.c}"/>`;
            if (w > 34) s += `<text x="${x + w / 2}" y="19" text-anchor="middle" style="fill:#fff;font-family:var(--mono);font-size:9.5px;font-weight:700">${g.lbl}</text>`;
            x += w;
          });
          s += `<text x="${x + 6}" y="19" style="fill:var(--dim);font-family:var(--mono);font-size:10px">${total} ns${extra || ""}</text>`;
          return s;
        }

        function render() {
          const h = +q(".e-h").value / 100, t = +q(".e-t").value, r = +q(".e-r").value;
          q(".e-hv").textContent = Math.round(h * 100) + "%";
          q(".e-tv").textContent = t + " ns";
          q(".e-rv").textContent = r + " ns";
          const hitT = t + r, missT = t + 2 * r, eat = h * hitT + (1 - h) * missT, noTlb = 2 * r;
          const maxT = Math.max(missT, noTlb);
          const cT = "var(--accent)", cP = "#d97706", cD = "#3b82f6";
          let s = `<svg class="sim-svg" viewBox="0 0 640 170" style="width:640px">`;
          s += `<g transform="translate(0,4)">${bar(`TLB hit (${Math.round(h * 100)}%)`, [{ t, c: cT, lbl: "TLB" }, { t: r, c: cD, lbl: "RAM: dato" }], hitT, maxT)}</g>`;
          s += `<g transform="translate(0,44)">${bar(`TLB miss (${Math.round(100 - h * 100)}%)`, [{ t, c: cT, lbl: "TLB" }, { t: r, c: cP, lbl: "RAM: tabella" }, { t: r, c: cD, lbl: "RAM: dato" }], missT, maxT)}</g>`;
          s += `<g transform="translate(0,84)">${bar("senza TLB", [{ t: r, c: cP, lbl: "RAM: tabella" }, { t: r, c: cD, lbl: "RAM: dato" }], noTlb, maxT)}</g>`;
          // barra EAT
          const W = 640, x0 = 150, sc = (W - x0 - 70) / maxT;
          s += `<g transform="translate(0,124)"><text x="${x0 - 8}" y="17" text-anchor="end" style="fill:var(--accent);font-family:var(--mono);font-size:10.5px;font-weight:800">EAT</text>
            <rect x="${x0}" y="2" width="${(W - x0 - 70)}" height="26" rx="4" style="fill:var(--surface2)"/>
            <rect x="${x0}" y="2" width="${eat * sc}" height="26" rx="4" style="fill:var(--accent)"/>
            <line x1="${x0 + noTlb * sc}" y1="-2" x2="${x0 + noTlb * sc}" y2="32" style="stroke:var(--err);stroke-width:2;stroke-dasharray:4 3"/>
            <text x="${x0 + eat * sc + 6}" y="19" style="fill:var(--text);font-family:var(--mono);font-size:10.5px;font-weight:700">${eat.toFixed(1)} ns</text></g>`;
          s += `</svg>`;
          const gain = (100 * (noTlb - eat) / noTlb);
          stage.innerHTML = s + K.msg(`EAT = ${h.toFixed(2)}·(${t}+${r}) + ${(1 - h).toFixed(2)}·(${t}+2·${r}) = ${h.toFixed(2)}·${hitT} + ${(1 - h).toFixed(2)}·${missT} = <b>${eat.toFixed(1)} ns</b> — ${gain >= 0 ? `il <b>${gain.toFixed(1)}%</b> in meno del caso senza TLB (${noTlb} ns, linea rossa)` : `<b>peggio</b> del caso senza TLB (${noTlb} ns): con un hit ratio così basso il TLB non si ripaga`}.`);
        }
        ["e-h", "e-t", "e-r"].forEach(c => q("." + c).addEventListener("input", render));
        render();
      }
    });
  })();
})();
