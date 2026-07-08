// Simulazioni interattive (parte 1): motore comune (player passo/auto) +
// scheduling CPU, sostituzione pagine, scheduling disco, allocazione memoria, parità RAID.
window.SIMS = [];
window.SIMKIT = (function () {
  "use strict";
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[rnd(0, a.length - 1)];
  const COL = ["#3b82f6", "#d97706", "#0d9488", "#d24d4d", "#8b5cf6", "#b8578f"];

  // stop() di tutti i player attivi: chiamato quando si esce da una simulazione,
  // così nessun autoplay resta vivo su un DOM staccato
  const registry = [];
  function stopAll() { registry.forEach(f => { try { f(); } catch (e) { } }); registry.length = 0; }

  // controlli passo/indietro/auto: build() ricrea i frame, render(frame) disegna la scena
  function player(host, opts) {
    host.innerHTML = `
      <div class="sim-controls">
        <button class="btn small secondary sp-reset" title="torna all'inizio">⏮</button>
        <button class="btn small secondary sp-back" title="un passo indietro">◀</button>
        <button class="btn small sp-step">passo ▶</button>
        <button class="btn small secondary sp-play">auto ▶▶</button>
        <span class="badge sp-pos"></span>
      </div>
      <div class="sim-stage"></div>`;
    const q = s => host.querySelector(s);
    const stage = q(".sim-stage");
    let frames = [], i = 0, timer = null;
    function stop() { if (timer) { clearInterval(timer); timer = null; } q(".sp-play").textContent = "auto ▶▶"; }
    function draw() {
      stage.innerHTML = opts.render(frames[i], i, frames);
      q(".sp-pos").textContent = `passo ${i + 1} / ${frames.length}`;
      q(".sp-back").disabled = i === 0;
      q(".sp-step").disabled = i >= frames.length - 1;
    }
    function step() { if (i < frames.length - 1) { i++; draw(); } if (i >= frames.length - 1) stop(); }
    q(".sp-step").addEventListener("click", () => { stop(); step(); });
    q(".sp-back").addEventListener("click", () => { stop(); if (i > 0) { i--; draw(); } });
    q(".sp-reset").addEventListener("click", () => { stop(); i = 0; draw(); });
    q(".sp-play").addEventListener("click", () => {
      if (timer) { stop(); return; }
      if (i >= frames.length - 1) i = 0;
      timer = setInterval(step, opts.ms || 950);
      q(".sp-play").textContent = "pausa ⏸";
      draw();
    });
    function reload() { stop(); frames = opts.build(); i = 0; draw(); }
    registry.push(stop);
    reload();
    return { reload };
  }

  const msg = (txt, cls) => `<div class="sim-msg${cls ? " " + cls : ""}">${txt}</div>`;
  return { rnd, pick, COL, player, msg, stopAll };
})();

/* ==================== Scheduling della CPU ==================== */
(function () {
  "use strict";
  const K = window.SIMKIT, COL = K.COL;
  const idxMin = (arr, f) => arr.reduce((b, v, i) => f(v) < f(arr[b]) ? i : b, 0);

  function genProcs() {
    const arr = [0];
    while (arr.length < 4) arr.push(K.rnd(1, 7));
    arr.sort((a, b) => a - b);
    return arr.map((at, i) => ({ name: "P" + (i + 1), at, burst: K.rnd(2, 6), prio: K.rnd(1, 4) }));
  }

  function simulate(procs, algo, quantum) {
    const n = procs.length;
    const rem = procs.map(p => p.burst);
    const fin = Array(n).fill(null);
    const ready = [], gantt = [], frames = [];
    let cur = -1, qleft = 0, t = 0;
    const snap = m => frames.push({ t, msg: m, cur, gantt: gantt.slice(), ready: ready.slice(), rem: rem.slice(), fin: fin.slice() });
    snap("Situazione iniziale: premi «passo» per far scorrere il tempo, un'unità alla volta.");
    while (fin.some(f => f === null) && t < 100) {
      const ev = [];
      procs.forEach((p, i) => { if (p.at === t) { ready.push(i); ev.push(`arriva ${p.name}`); } });
      if (cur >= 0) {
        if (algo === "rr" && qleft === 0) { ready.push(cur); ev.push(`quanto scaduto: ${procs[cur].name} torna in coda pronti`); cur = -1; }
        else if (algo === "srtf" && ready.length) {
          const b = ready[idxMin(ready, i => rem[i])];
          if (rem[b] < rem[cur]) { ready.push(cur); ev.push(`${procs[b].name} ha meno tempo residuo (${rem[b]} < ${rem[cur]}): prelazione su ${procs[cur].name}`); cur = -1; }
        } else if (algo === "prio" && ready.length) {
          const b = ready[idxMin(ready, i => procs[i].prio)];
          if (procs[b].prio < procs[cur].prio) { ready.push(cur); ev.push(`${procs[b].name} ha priorità più alta (${procs[b].prio} < ${procs[cur].prio}): prelazione`); cur = -1; }
        }
      }
      if (cur < 0 && ready.length) {
        let k = 0;
        if (algo === "sjf" || algo === "srtf") k = idxMin(ready, i => rem[i]);
        else if (algo === "prio") k = idxMin(ready, i => procs[i].prio);
        cur = ready.splice(k, 1)[0];
        qleft = quantum;
        ev.push(`la CPU va a ${procs[cur].name}`);
      }
      gantt.push(cur);
      if (cur >= 0) { rem[cur]--; qleft--; } else ev.push("CPU inattiva");
      t++;
      if (cur >= 0 && rem[cur] === 0) { fin[cur] = t; ev.push(`${procs[cur].name} termina all'istante ${t}`); cur = -1; }
      snap(ev.join(" · "));
    }
    return frames;
  }

  function ganttSVG(units, T, procs) {
    const u = Math.max(16, Math.min(30, Math.floor(620 / Math.max(T, 1))));
    const pad = 10, y = 6, h = 30, W = pad * 2 + T * u, H = 60;
    let s = `<svg class="sim-svg" viewBox="0 0 ${W} ${H}" style="width:${W}px">`;
    let k = 0;
    while (k < units.length) {
      let j = k; while (j < units.length && units[j] === units[k]) j++;
      const x = pad + k * u, w = (j - k) * u, p = units[k];
      if (p < 0) s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:var(--surface2)"/><text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" style="fill:var(--dim);font-family:var(--mono);font-size:10px">—</text>`;
      else s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${COL[p % COL.length]}"/><text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" style="fill:#fff;font-family:var(--mono);font-size:11px;font-weight:700">${procs[p].name}</text>`;
      k = j;
    }
    s += `<rect x="${pad}" y="${y}" width="${T * u}" height="${h}" style="fill:none;stroke:var(--border)"/>`;
    const every = T > 24 ? 2 : 1;
    for (let i = 0; i <= T; i += every)
      s += `<line x1="${pad + i * u}" y1="${y + h}" x2="${pad + i * u}" y2="${y + h + 4}" style="stroke:var(--dim)"/><text x="${pad + i * u}" y="${y + h + 16}" text-anchor="middle" style="fill:var(--dim);font-family:var(--mono);font-size:9.5px">${i}</text>`;
    const xt = pad + units.length * u;
    s += `<line x1="${xt}" y1="${y - 4}" x2="${xt}" y2="${y + h + 4}" style="stroke:var(--accent);stroke-width:2"/>`;
    return s + "</svg>";
  }

  window.SIMS.push({
    id: "sim_sched", topic: "sched", name: "Scheduling della CPU", icon: "⏱",
    title: "Scheduling della CPU: FCFS, SJF, SRTF, Round Robin, priorità",
    desc: "Guarda il diagramma di Gantt costruirsi un'unità di tempo alla volta, con la coda dei pronti, le prelazioni e — alla fine — turnaround e attesa medi. Col confronto vedi tutti gli algoritmi sugli stessi processi.",
    info: `<p><b>Come leggere la scena.</b> Ogni cella del Gantt è un'unità di tempo: il colore dice chi ha la CPU, «—» è CPU inattiva, la barretta verde è l'istante corrente. Sotto trovi la coda dei pronti (nell'ordine in cui lo scheduler la vede) e la tabella con i tempi: <b>turnaround = completamento − arrivo</b>, <b>attesa = turnaround − burst</b>.</p>
      <p><b>Cosa cambia tra gli algoritmi.</b></p>
      <ul>
        <li><b>FCFS</b>: ordine di arrivo, mai prelazione. Semplice ma soffre l'<i>effetto convoglio</i>: un processo lungo davanti fa aspettare tutti.</li>
        <li><b>SJF</b>: sceglie il burst più corto, ma una volta partito non si ferma (non preemptive). Minimizza l'attesa media… se conosci i burst in anticipo.</li>
        <li><b>SRTF</b>: la versione preemptive di SJF — se arriva qualcuno con meno tempo residuo, prelazione. Ottimo per l'attesa media, ma i processi lunghi rischiano la <i>starvation</i>.</li>
        <li><b>Round Robin</b>: equità a fette di tempo. Quanto piccolo → più reattivo ma più context switch (overhead); quanto enorme → degenera in FCFS.</li>
        <li><b>Priorità</b>: vince il numero più basso; anche qui starvation per i processi a bassa priorità (nella realtà si cura con l'<i>aging</i>).</li>
      </ul>
      <p><b>Trappola d'esame</b>: negli esercizi si chiede quasi sempre attesa e turnaround medi — usa «📊 confronta» per vedere quanto la stessa situazione cambia da un algoritmo all'altro.</p>`,
    mount(box) {
      let procs = genProcs();
      box.innerHTML = `<div class="sim-params">
          <label>algoritmo <select class="p-algo">
            <option value="fcfs">FCFS</option>
            <option value="sjf">SJF (non preemptive)</option>
            <option value="srtf">SRTF (preemptive)</option>
            <option value="rr" selected>Round Robin</option>
            <option value="prio">Priorità (preemptive)</option>
          </select></label>
          <label class="p-qwrap">quanto <select class="p-q"><option>1</option><option selected>2</option><option>3</option><option>4</option></select></label>
          <button class="btn small secondary p-new">🎲 nuovi processi</button>
          <button class="btn small secondary p-cmp">📊 confronta</button>
        </div>
        <div class="sim-player"></div>
        <div class="sim-stage sim-compare hidden"></div>
        <p class="sim-hint">Convenzioni: a parità di criterio vince chi è in coda pronti da più tempo; nel Round Robin un processo prelazionato rientra in coda <i>dopo</i> gli arrivi contemporanei; priorità 1 = massima.</p>`;
      const q = s => box.querySelector(s);
      const algo = () => q(".p-algo").value;
      function render(f, i, frames) {
        const T = frames[frames.length - 1].gantt.length;
        const chip = p => `<span class="pchip" style="background:${COL[p % COL.length]}">${procs[p].name}</span>`;
        const usePrio = algo() === "prio";
        let h = K.msg(f.msg);
        h += ganttSVG(f.gantt, T, procs);
        h += `<div class="squeue"><b>coda pronti:</b> ${f.ready.length ? f.ready.map(chip).join(" ") : "<i>vuota</i>"}`;
        if (f.cur >= 0) h += ` <b style="margin-left:.8rem">in esecuzione:</b> ${chip(f.cur)}`;
        h += `</div><table><tr><th>processo</th><th>arrivo</th><th>burst</th>${usePrio ? "<th>priorità</th>" : ""}<th>rimanente</th><th>completamento</th><th>turnaround</th><th>attesa</th></tr>`;
        let sT = 0, sW = 0, done = 0;
        procs.forEach((p, pi) => {
          const fi = f.fin[pi];
          const tat = fi !== null ? fi - p.at : null;
          const wt = tat !== null ? tat - p.burst : null;
          if (tat !== null) { sT += tat; sW += wt; done++; }
          h += `<tr><td>${chip(pi)}</td><td>${p.at}</td><td>${p.burst}</td>${usePrio ? `<td>${p.prio}</td>` : ""}<td>${f.rem[pi]}</td><td>${fi === null ? "—" : fi}</td><td>${tat === null ? "—" : tat}</td><td>${wt === null ? "—" : wt}</td></tr>`;
        });
        h += "</table>";
        if (done === procs.length)
          h += K.msg(`<b>Fine.</b> Turnaround medio = ${(sT / done).toFixed(2)}, attesa media = ${(sW / done).toFixed(2)} (attesa = completamento − arrivo − burst).`);
        return h;
      }
      const pl = K.player(q(".sim-player"), { build: () => simulate(procs, algo(), +q(".p-q").value), render });
      const cmpBox = q(".sim-compare");
      function renderCmp() {
        const qv = +q(".p-q").value;
        const rows = [["fcfs", "FCFS"], ["sjf", "SJF"], ["srtf", "SRTF"], ["rr", `Round Robin (q=${qv})`], ["prio", "Priorità"]].map(([k, lab]) => {
          const fr = simulate(procs, k, qv), last = fr[fr.length - 1];
          let sT = 0, sW = 0;
          procs.forEach((p, i) => { const tat = last.fin[i] - p.at; sT += tat; sW += tat - p.burst; });
          return { lab, tot: last.gantt.length, tat: sT / procs.length, w: sW / procs.length };
        });
        const bT = Math.min(...rows.map(r => r.tat)), bW = Math.min(...rows.map(r => r.w));
        cmpBox.innerHTML = `<h4 class="cmp-title">stessi processi, tutti gli algoritmi</h4>
          <table><tr><th>algoritmo</th><th>fine ultimo</th><th>turnaround medio</th><th>attesa media</th></tr>` +
          rows.map(r => `<tr><td>${r.lab}</td><td>${r.tot}</td><td${r.tat === bT ? ' class="hlcell"' : ""}>${r.tat.toFixed(2)}</td><td${r.w === bW ? ' class="hlcell"' : ""}>${r.w.toFixed(2)}</td></tr>`).join("") +
          `</table><p class="sim-hint">Il totale (fine dell'ultimo processo) è quasi uguale per tutti: lo scheduling non crea CPU, redistribuisce l'attesa. In verde i minimi: di solito vince SRTF/SJF.</p>`;
      }
      const refreshCmp = () => { if (!cmpBox.classList.contains("hidden")) renderCmp(); };
      q(".p-cmp").addEventListener("click", () => { cmpBox.classList.toggle("hidden"); refreshCmp(); });
      const syncQ = () => { q(".p-qwrap").style.display = algo() === "rr" ? "" : "none"; };
      syncQ();
      q(".p-algo").addEventListener("change", () => { syncQ(); pl.reload(); });
      q(".p-q").addEventListener("change", () => { pl.reload(); refreshCmp(); });
      q(".p-new").addEventListener("click", () => { procs = genProcs(); pl.reload(); refreshCmp(); });
    }
  });
})();

/* ==================== Sostituzione delle pagine ==================== */
(function () {
  "use strict";
  const K = window.SIMKIT;

  const genRefs = () => Array.from({ length: 12 }, () => K.rnd(0, 4));

  function simulate(refs, nf, algo) {
    const frames = [];
    const slots = Array(nf).fill(null); // {page, R, loadedAt, lastUse}
    const hist = [];
    let ptr = 0, faults = 0, loadSeq = 0;
    const cols = () => slots.map(s => s ? s.page : null);
    const snap = (k, m, extra) => frames.push(Object.assign({
      k, msg: m, ptr, faults, hist: hist.slice(),
      slots: slots.map(s => s ? { page: s.page, R: s.R } : null)
    }, extra || {}));
    snap(-1, "Stringa dei riferimenti pronta: premi «passo» per elaborarla una pagina alla volta.");
    refs.forEach((p, k) => {
      const hi = slots.findIndex(s => s && s.page === p);
      if (hi >= 0) {
        slots[hi].lastUse = k;
        if (algo === "clock") slots[hi].R = 1;
        hist.push({ ref: p, col: cols(), fault: false, slot: -1 });
        snap(k, `pagina ${p}: è già in una cornice → <b>hit</b>, nessun fault${algo === "clock" ? " (bit R←1)" : ""}`, { hl: hi });
        return;
      }
      faults++;
      let v = slots.findIndex(s => s === null), why = "";
      if (algo === "clock") {
        if (v < 0) {
          while (slots[ptr].R === 1) {
            snap(k, `pagina ${p}: <b>page fault</b>. La lancetta punta alla pagina ${slots[ptr].page} con R=1 → seconda chance: R←0 e la lancetta avanza`, { hl: ptr });
            slots[ptr].R = 0;
            ptr = (ptr + 1) % nf;
          }
          why = `la lancetta l'ha trovata con R=0`;
        }
        v = ptr;
      } else if (v < 0) {
        if (algo === "fifo") { v = idxOf(slots, s => s.loadedAt, Math.min); why = "è in memoria da più tempo (FIFO)"; }
        else if (algo === "lru") { v = idxOf(slots, s => s.lastUse, Math.min); why = "è quella usata meno di recente (LRU)"; }
        else {
          const next = slots.map(s => { const j = refs.indexOf(s.page, k + 1); return j < 0 ? Infinity : j; });
          v = next.indexOf(Math.max(...next));
          why = next[v] === Infinity ? "non verrà mai più usata (Ottimo)" : `verrà riusata più lontano nel futuro, al riferimento ${next[v] + 1} (Ottimo)`;
        }
      }
      const old = slots[v] ? slots[v].page : null;
      slots[v] = { page: p, R: 1, loadedAt: loadSeq++, lastUse: k };
      if (algo === "clock") ptr = (ptr + 1) % nf;
      hist.push({ ref: p, col: cols(), fault: true, slot: v });
      snap(k, old === null
        ? `pagina ${p}: <b>page fault</b>, ma c'è una cornice libera → la carico nella cornice ${v}`
        : `pagina ${p}: <b>page fault</b> → sostituisco la pagina ${old}: ${why}`, { hl: v, fault: true });
    });
    snap(refs.length, `<b>Fine:</b> ${faults} page fault su ${refs.length} riferimenti.`);
    return frames;
  }
  const idxOf = (slots, f, cmp) => { const vals = slots.map(f); return vals.indexOf(cmp(...vals)); };

  function clockSVG(slots, ptr, nf) {
    const cx = 72, cy = 72, R = 48;
    const ang = i => -Math.PI / 2 + i * 2 * Math.PI / nf;
    let s = `<svg class="sim-svg" viewBox="0 0 144 144" style="width:150px;flex:none">`;
    const ax = cx + (R - 26) * Math.cos(ang(ptr)), ay = cy + (R - 26) * Math.sin(ang(ptr));
    s += `<line x1="${cx}" y1="${cy}" x2="${ax.toFixed(1)}" y2="${ay.toFixed(1)}" style="stroke:var(--accent);stroke-width:2.5"/><circle cx="${cx}" cy="${cy}" r="3" style="fill:var(--accent)"/>`;
    for (let i = 0; i < nf; i++) {
      const x = cx + R * Math.cos(ang(i)), y = cy + R * Math.sin(ang(i));
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="18" style="fill:${i === ptr ? "var(--accent-soft)" : "var(--surface)"};stroke:${i === ptr ? "var(--accent)" : "var(--border)"};stroke-width:1.5"/>`;
      s += `<text x="${x.toFixed(1)}" y="${(y + 1).toFixed(1)}" text-anchor="middle" style="fill:var(--text);font-family:var(--mono);font-size:12px;font-weight:700">${slots[i] ? slots[i].page : "·"}</text>`;
      s += `<text x="${x.toFixed(1)}" y="${(y + 12).toFixed(1)}" text-anchor="middle" style="fill:var(--dim);font-family:var(--mono);font-size:8px">${slots[i] ? "R=" + slots[i].R : ""}</text>`;
    }
    return s + "</svg>";
  }

  window.SIMS.push({
    id: "sim_pages", topic: "sostituzione", name: "Sostituzione delle pagine", icon: "📄",
    title: "Sostituzione delle pagine: FIFO, LRU, Clock, Ottimo",
    desc: "Una stringa di riferimenti scorre pagina per pagina: vedi hit e page fault, la scelta della vittima e — con Clock — la lancetta e i bit R della seconda chance.",
    info: `<p><b>Come leggere la scena.</b> In alto la stringa dei riferimenti (evidenziato quello corrente), poi le cornici di memoria e la tabella storica come si scrive al compito: una colonna per riferimento, «✗» quando c'è page fault. Con Clock compare anche il quadrante: la lancetta gira sulle cornici e ogni pagina porta il suo bit R.</p>
      <p><b>Cosa cambia tra gli algoritmi.</b></p>
      <ul>
        <li><b>FIFO</b>: vittima = pagina in memoria da più tempo. Banale, ma ignora l'uso: può buttare una pagina caldissima e soffre l'<i>anomalia di Belady</i> (più cornici, più fault!).</li>
        <li><b>LRU</b>: vittima = usata meno di recente. Sfrutta la località ed è quasi ottimo, ma mantenerlo esatto in hardware costa (timestamp o stack a ogni accesso).</li>
        <li><b>Clock / seconda chance</b>: l'approssimazione di LRU che si usa davvero. R=1 → la pagina si salva (R←0) e la lancetta avanza; R=0 → vittima. R torna a 1 a ogni riferimento.</li>
        <li><b>Ottimo (Belady)</b>: butta la pagina che servirà più lontano nel futuro. Irrealizzabile (serve la sfera di cristallo): è il metro con cui si giudicano gli altri.</li>
      </ul>
      <p><b>Trappola d'esame</b>: con Clock ricorda che la lancetta <i>avanza oltre</i> la pagina appena caricata, e che l'hit non muove la lancetta: imposta solo R=1.</p>`,
    mount(box) {
      let refs = genRefs();
      box.innerHTML = `<div class="sim-params">
          <label>algoritmo <select class="p-algo">
            <option value="fifo">FIFO</option>
            <option value="lru">LRU</option>
            <option value="clock" selected>Clock (seconda chance)</option>
            <option value="opt">Ottimo (Belady)</option>
          </select></label>
          <label>cornici <select class="p-nf"><option selected>3</option><option>4</option></select></label>
          <button class="btn small secondary p-new">🎲 nuova stringa</button>
          <button class="btn small secondary p-cmp">📊 confronta</button>
        </div>
        <div class="sim-player"></div>
        <div class="sim-stage sim-compare hidden"></div>
        <p class="sim-hint">Con Clock la lancetta scorre le cornici in cerchio: R=1 → azzera e avanza (seconda chance), R=0 → vittima. Il bit R si imposta a 1 a ogni riferimento.</p>`;
      const q = s => box.querySelector(s);
      const algo = () => q(".p-algo").value;
      function render(f) {
        const nf = f.slots.length;
        let h = K.msg(f.msg, f.fault ? "err" : "");
        h += `<div class="squeue"><b>riferimenti:</b> ` + refs.map((p, i) =>
          `<span class="scell${i < f.k ? " past" : i === f.k ? " on" : ""}">${p}</span>`).join("") + "</div>";
        h += `<div class="sim-row">`;
        if (algo() === "clock") h += clockSVG(f.slots, f.ptr, nf);
        h += `<div><div class="squeue"><b>cornici:</b> ` + f.slots.map((s, i) =>
          `<span class="scell${f.hl === i ? " on" : ""}" style="min-width:2.3rem">${s ? s.page : "·"}${algo() === "clock" && s ? `<sub>R${s.R}</sub>` : ""}</span>`).join("") + "</div>";
        h += `<span class="badge ${f.faults ? "acc" : ""}">page fault: ${f.faults}</span></div></div>`;
        if (f.hist.length) {
          h += `<table><tr><th>rif.</th>${f.hist.map(x => `<th>${x.ref}</th>`).join("")}</tr>`;
          for (let r = 0; r < nf; r++)
            h += `<tr><td>c${r}</td>${f.hist.map(x => `<td${x.slot === r ? ' class="hlcell"' : ""}>${x.col[r] === null ? "·" : x.col[r]}</td>`).join("")}</tr>`;
          h += `<tr><td>fault</td>${f.hist.map(x => `<td>${x.fault ? "✗" : ""}</td>`).join("")}</tr></table>`;
        }
        return h;
      }
      const pl = K.player(q(".sim-player"), { build: () => simulate(refs, +q(".p-nf").value, algo()), render });
      const cmpBox = q(".sim-compare");
      function renderCmp() {
        const nf = +q(".p-nf").value;
        const rows = [["fifo", "FIFO"], ["lru", "LRU"], ["clock", "Clock"], ["opt", "Ottimo"]].map(([k, lab]) => {
          const fr = simulate(refs, nf, k);
          return { lab, f: fr[fr.length - 1].faults };
        });
        const best = Math.min(...rows.map(r => r.f));
        cmpBox.innerHTML = `<h4 class="cmp-title">stessa stringa, tutti gli algoritmi (${nf} cornici)</h4>
          <table><tr><th>algoritmo</th><th>page fault</th></tr>` +
          rows.map(r => `<tr><td>${r.lab}</td><td${r.f === best ? ' class="hlcell"' : ""}>${r.f} / ${refs.length}</td></tr>`).join("") +
          `</table><p class="sim-hint">L'Ottimo è il minimo teorico: nessun algoritmo reale può far meglio. FIFO di solito è il peggiore; LRU e Clock gli stanno vicini.</p>`;
      }
      const refreshCmp = () => { if (!cmpBox.classList.contains("hidden")) renderCmp(); };
      q(".p-cmp").addEventListener("click", () => { cmpBox.classList.toggle("hidden"); refreshCmp(); });
      q(".p-algo").addEventListener("change", () => pl.reload());
      q(".p-nf").addEventListener("change", () => { pl.reload(); refreshCmp(); });
      q(".p-new").addEventListener("click", () => { refs = genRefs(); pl.reload(); refreshCmp(); });
    }
  });
})();

/* ==================== Scheduling del disco ==================== */
(function () {
  "use strict";
  const K = window.SIMKIT, MAX = 199;

  function gen() {
    const set = new Set();
    while (set.size < 8) set.add(K.rnd(5, 195));
    const queue = [...set];
    let head = K.rnd(40, 160);
    while (set.has(head)) head++;
    return { queue, head };
  }

  function pathFor(queue, head, up, algo) {
    const pts = [{ c: head, req: false, jump: false }];
    const add = (c, req, jump) => pts.push({ c, req: !!req, jump: !!jump });
    const q = queue.slice();
    if (algo === "fcfs") { q.forEach(c => add(c, true)); return pts; }
    if (algo === "sstf") {
      let cur = head;
      while (q.length) {
        let bi = 0;
        for (let i = 1; i < q.length; i++) if (Math.abs(q[i] - cur) < Math.abs(q[bi] - cur)) bi = i;
        cur = q.splice(bi, 1)[0]; add(cur, true);
      }
      return pts;
    }
    const asc = q.filter(c => c > head).sort((a, b) => a - b);
    const desc = q.filter(c => c < head).sort((a, b) => b - a);
    const first = up ? asc : desc, second = up ? desc : asc;
    const edge = up ? MAX : 0, otherEdge = up ? 0 : MAX;
    if (algo === "scan") {
      first.forEach(c => add(c, true));
      if (!first.length || first[first.length - 1] !== edge) add(edge, false);
      second.forEach(c => add(c, true));
    } else if (algo === "look") {
      first.forEach(c => add(c, true));
      second.forEach(c => add(c, true));
    } else if (algo === "cscan") {
      first.forEach(c => add(c, true));
      if (!first.length || first[first.length - 1] !== edge) add(edge, false);
      if (second.length) {
        add(otherEdge, false, true);
        second.slice().reverse().forEach(c => add(c, true));
      }
    } else { // clook
      first.forEach(c => add(c, true));
      const rest = second.slice().reverse(); // stessa direzione, ripartendo dall'altro capo
      if (rest.length) {
        add(rest[0], true, true);
        rest.slice(1).forEach(c => add(c, true));
      }
    }
    return pts;
  }

  function diskSVG(pts, k) {
    const W = 660, xp = 26, axY = 22;
    const dy = Math.min(30, Math.max(15, Math.floor(330 / Math.max(pts.length - 1, 1))));
    const H = axY + 18 + (pts.length - 1) * dy + 14;
    const x = c => xp + (c / MAX) * (W - 2 * xp);
    let s = `<svg class="sim-svg" viewBox="0 0 ${W} ${H}" style="width:${W}px">`;
    s += `<line x1="${xp}" y1="${axY}" x2="${W - xp}" y2="${axY}" style="stroke:var(--border)"/>`;
    [0, 50, 100, 150, 199].forEach(c => {
      s += `<line x1="${x(c)}" y1="${axY - 3}" x2="${x(c)}" y2="${axY + 3}" style="stroke:var(--dim)"/><text x="${x(c)}" y="${axY - 7}" text-anchor="middle" style="fill:var(--dim);font-family:var(--mono);font-size:9.5px">${c}</text>`;
    });
    pts.forEach((p, i) => {
      if (i === 0 || !p.req) return;
      const done = i <= k;
      s += `<circle cx="${x(p.c)}" cy="${axY}" r="4" style="fill:${done ? "var(--accent)" : "var(--surface)"};stroke:var(--accent);stroke-width:1.5"/>`;
    });
    for (let i = 1; i <= k; i++) {
      const x1 = x(pts[i - 1].c), y1 = axY + 10 + (i - 1) * dy, x2 = x(pts[i].c), y2 = axY + 10 + i * dy;
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${pts[i].jump ? "var(--amber)" : "var(--accent)"};stroke-width:2${pts[i].jump ? ";stroke-dasharray:5 4" : ""}"/>`;
    }
    for (let i = 0; i <= k; i++) {
      const px = x(pts[i].c), py = axY + 10 + i * dy;
      s += `<circle cx="${px}" cy="${py}" r="${i === k ? 5 : 3.5}" style="fill:${pts[i].req ? "var(--accent)" : "var(--surface2)"};stroke:var(--accent);stroke-width:1.5"/>`;
      s += `<text x="${px + 9}" y="${py + 4}" style="fill:var(--dim);font-family:var(--mono);font-size:9.5px">${pts[i].c}</text>`;
    }
    return s + "</svg>";
  }

  window.SIMS.push({
    id: "sim_disk", topic: "dischi", name: "Scheduling del disco", icon: "💿",
    title: "Scheduling del disco: FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK",
    desc: "La testina si muove richiesta dopo richiesta sul classico diagramma cilindri/tempo: confronta gli spostamenti totali e nota dove LOOK inverte rispetto a SCAN.",
    info: `<p><b>Come leggere la scena.</b> È il diagramma che si disegna al compito: in orizzontale i cilindri (0–199), la linea scende di un livello a ogni movimento della testina. I pallini sull'asse sono le richieste (si riempiono quando vengono servite); i tratti tratteggiati color ambra sono i salti di C-SCAN/C-LOOK, conteggiati a parte.</p>
      <p><b>Cosa cambia tra gli algoritmi.</b></p>
      <ul>
        <li><b>FCFS</b>: ordine di arrivo → zigzag e tanti cilindri percorsi. Equo ma lento.</li>
        <li><b>SSTF</b>: sempre la richiesta più vicina. Minimizza localmente, ma le richieste ai bordi rischiano la <i>starvation</i>.</li>
        <li><b>SCAN</b> (ascensore): serve tutto in una direzione fino all'<i>estremo fisico</i> del disco, poi inverte.</li>
        <li><b>LOOK</b>: come SCAN, ma inverte già dopo l'<i>ultima richiesta pendente</i> — è la convenzione usata nel corso, e la differenza SCAN/LOOK è un classico distrattore d'esame.</li>
        <li><b>C-SCAN / C-LOOK</b>: servono solo in una direzione e tornano indietro «gratis» con un salto: tempo di attesa più uniforme, niente doppio passaggio al centro del disco.</li>
      </ul>
      <p><b>Trappola d'esame</b>: specifica sempre la direzione iniziale della testina e se conti il salto di ritorno; qui i due numeri sono tenuti separati apposta.</p>`,
    mount(box) {
      let d = gen();
      box.innerHTML = `<div class="sim-params">
          <label>algoritmo <select class="p-algo">
            <option value="fcfs">FCFS</option>
            <option value="sstf">SSTF</option>
            <option value="scan">SCAN</option>
            <option value="cscan">C-SCAN</option>
            <option value="look" selected>LOOK</option>
            <option value="clook">C-LOOK</option>
          </select></label>
          <label class="p-dwrap">direzione <select class="p-dir"><option value="1" selected>verso l'alto</option><option value="0">verso il basso</option></select></label>
          <button class="btn small secondary p-new">🎲 nuova coda</button>
          <button class="btn small secondary p-cmp">📊 confronta</button>
        </div>
        <div class="sim-player"></div>
        <div class="sim-stage sim-compare hidden"></div>
        <p class="sim-hint">Convenzione del corso: LOOK/C-LOOK invertono (o saltano) dopo l'<i>ultima richiesta pendente</i> nella direzione corrente; SCAN/C-SCAN arrivano fino all'estremo fisico (0 o 199). Il salto di ritorno di C-SCAN/C-LOOK è tratteggiato e conteggiato a parte.</p>`;
      const q = s => box.querySelector(s);
      const algo = () => q(".p-algo").value;
      let pts = [];
      function build() {
        pts = pathFor(d.queue, d.head, q(".p-dir").value === "1", algo());
        return pts.map((p, k) => {
          let m;
          if (k === 0) m = `Testina al cilindro <b>${p.c}</b>, ${d.queue.length} richieste in coda: ${d.queue.join(", ")}.`;
          else if (p.jump) m = `<b>salto</b> da ${pts[k - 1].c} a ${p.c} senza servire nulla lungo il percorso${p.req ? ` (e servo ${p.c})` : ""}`;
          else if (!p.req) m = `raggiungo l'estremo fisico <b>${p.c}</b> e inverto la direzione`;
          else m = `mi sposto da ${pts[k - 1].c} a <b>${p.c}</b> (${Math.abs(p.c - pts[k - 1].c)} cilindri) e servo la richiesta`;
          return { k, msg: m };
        });
      }
      function render(f) {
        let move = 0, jump = 0, served = 0;
        for (let i = 1; i <= f.k; i++) {
          const dlt = Math.abs(pts[i].c - pts[i - 1].c);
          if (pts[i].jump) jump += dlt; else move += dlt;
          if (pts[i].req) served++;
        }
        let h = K.msg(f.msg);
        h += `<div class="squeue"><span class="badge acc">spostamento: ${move} cilindri</span>${jump ? `<span class="badge">salto: ${jump}</span>` : ""}<span class="badge">servite: ${served} / ${d.queue.length}</span></div>`;
        return h + diskSVG(pts, f.k);
      }
      const pl = K.player(q(".sim-player"), { build, render, ms: 800 });
      const cmpBox = q(".sim-compare");
      function renderCmp() {
        const up = q(".p-dir").value === "1";
        const rows = [["fcfs", "FCFS"], ["sstf", "SSTF"], ["scan", "SCAN"], ["cscan", "C-SCAN"], ["look", "LOOK"], ["clook", "C-LOOK"]].map(([k, lab]) => {
          const pp = pathFor(d.queue, d.head, up, k);
          let move = 0, jump = 0;
          for (let i = 1; i < pp.length; i++) {
            const dl = Math.abs(pp[i].c - pp[i - 1].c);
            if (pp[i].jump) jump += dl; else move += dl;
          }
          return { lab, move, jump };
        });
        const best = Math.min(...rows.map(r => r.move));
        cmpBox.innerHTML = `<h4 class="cmp-title">stessa coda (testina a ${d.head}, direzione ${up ? "↑" : "↓"})</h4>
          <table><tr><th>algoritmo</th><th>spostamento</th><th>salto</th></tr>` +
          rows.map(r => `<tr><td>${r.lab}</td><td${r.move === best ? ' class="hlcell"' : ""}>${r.move}</td><td>${r.jump || "—"}</td></tr>`).join("") +
          `</table><p class="sim-hint">SSTF di solito vince sul totale, ma LOOK gli sta vicino senza rischiare starvation: è il compromesso che si usa davvero.</p>`;
      }
      const refreshCmp = () => { if (!cmpBox.classList.contains("hidden")) renderCmp(); };
      q(".p-cmp").addEventListener("click", () => { cmpBox.classList.toggle("hidden"); refreshCmp(); });
      q(".p-algo").addEventListener("change", () => {
        q(".p-dwrap").style.display = ["fcfs", "sstf"].includes(algo()) ? "none" : "";
        pl.reload();
      });
      q(".p-dir").addEventListener("change", () => { pl.reload(); refreshCmp(); });
      q(".p-new").addEventListener("click", () => { d = gen(); pl.reload(); refreshCmp(); });
    }
  });
})();

/* ==================== Allocazione della memoria (fit) ==================== */
(function () {
  "use strict";
  const K = window.SIMKIT, MEM = 64;

  function gen() {
    for (; ;) {
      const segs = [{ size: 8, kind: "used", tag: "SO" }];
      let free = true, addr = 8, u = 0;
      while (addr < MEM) {
        let sz = Math.min(free ? K.rnd(4, 12) : K.rnd(3, 7), MEM - addr);
        segs.push({ size: sz, kind: free ? "free" : "used", tag: free ? "" : "X" + (++u) });
        addr += sz; free = !free;
      }
      if (segs.filter(s => s.kind === "free").length >= 3) {
        const reqs = ["A", "B", "C", "D"].map(n => ({ name: n, size: K.rnd(3, 9) }));
        return { segs, reqs };
      }
    }
  }

  function withAddr(segs) { let a = 0; return segs.map(s => { const o = Object.assign({ addr: a }, s); a += s.size; return o; }); }

  function simulate(data, algo) {
    const frames = [];
    let segs = data.segs.map(s => Object.assign({}, s));
    let nextPtr = 0;
    const snap = (m, extra) => frames.push(Object.assign({ msg: m, segs: withAddr(segs) }, extra || {}));
    snap(`Memoria da ${MEM} unità con i suoi buchi. Richieste da servire in ordine: ` + data.reqs.map(r => `${r.name}(${r.size})`).join(", ") + ".");
    data.reqs.forEach((r, ri) => {
      const holes = withAddr(segs).map((s, i) => Object.assign({ i }, s)).filter(s => s.kind === "free");
      let order = holes;
      if (algo === "next") order = holes.filter(h => h.addr >= nextPtr).concat(holes.filter(h => h.addr < nextPtr));
      let best = null;
      for (const h of order) {
        const fits = h.size >= r.size;
        let m, decided = false;
        if (!fits) m = `richiesta ${r.name}(${r.size}): il buco a ${h.addr} è di ${h.size} → troppo piccolo, avanti`;
        else if (algo === "first" || algo === "next") { best = h; m = `richiesta ${r.name}(${r.size}): il buco a ${h.addr} è di ${h.size} → <b>basta, lo prendo</b> (${algo === "first" ? "first" : "next"} fit)`; decided = true; }
        else if (algo === "best") {
          if (!best || h.size < best.size) { best = h; m = `richiesta ${r.name}(${r.size}): buco a ${h.addr} di ${h.size} → candidato migliore finora (il più piccolo che basta)`; }
          else m = `richiesta ${r.name}(${r.size}): buco a ${h.addr} di ${h.size} → ci sta, ma non è più piccolo di ${best.size}`;
        } else {
          if (!best || h.size > best.size) { best = h; m = `richiesta ${r.name}(${r.size}): buco a ${h.addr} di ${h.size} → candidato migliore finora (il più grande)`; }
          else m = `richiesta ${r.name}(${r.size}): buco a ${h.addr} di ${h.size} → ci sta, ma non è più grande di ${best.size}`;
        }
        snap(m, { hl: h.addr, ri });
        if (decided) break;
      }
      if (!best) { snap(`nessun buco ≥ ${r.size}: la richiesta ${r.name} non può essere servita (frammentazione esterna: lo spazio libero totale può bastare, ma è spezzettato)`, { ri, err: true }); return; }
      const addrs = withAddr(segs);
      const idx = segs.findIndex((s, i) => addrs[i].addr === best.addr && s.kind === "free");
      const rest = segs[idx].size - r.size;
      const ins = [{ size: r.size, kind: "used", tag: r.name }];
      if (rest > 0) ins.push({ size: rest, kind: "free", tag: "" });
      segs.splice(idx, 1, ...ins);
      nextPtr = best.addr + r.size;
      snap(`alloco <b>${r.name}</b> (${r.size} unità) all'indirizzo ${best.addr}` + (rest > 0 ? `; resta un buco di ${rest}` : `: il buco è riempito esattamente`), { ri, newTag: r.name });
    });
    snap("<b>Fine delle richieste.</b> Nota come la strategia cambia dove finiscono i processi e quali buchi sopravvivono.");
    return frames;
  }

  function memSVG(segs, hl, newTag) {
    const W = 660, x0 = 14, sc = (W - 2 * x0) / MEM, y = 8, h = 36;
    let s = `<svg class="sim-svg" viewBox="0 0 ${W} 70" style="width:${W}px">`;
    segs.forEach(g => {
      const x = x0 + g.addr * sc, w = g.size * sc;
      const isNew = g.tag === newTag && g.kind === "used" && newTag;
      const fill = g.kind === "free" ? "var(--accent-soft)" : isNew ? "var(--accent)" : "var(--surface2)";
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${fill};stroke:${g.addr === hl ? "var(--amber)" : "var(--border)"};stroke-width:${g.addr === hl ? 2.5 : 1}${g.kind === "free" ? ";stroke-dasharray:4 3" : ""}"/>`;
      s += `<text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" style="fill:${isNew ? "#fff" : "var(--text)"};font-family:var(--mono);font-size:10.5px;font-weight:700">${g.kind === "free" ? g.size : g.tag}</text>`;
      s += `<text x="${x + 1}" y="${y + h + 12}" style="fill:var(--dim);font-family:var(--mono);font-size:8.5px">${g.addr}</text>`;
    });
    s += `<text x="${W - x0}" y="${y + h + 12}" text-anchor="end" style="fill:var(--dim);font-family:var(--mono);font-size:8.5px">${MEM}</text>`;
    return s + "</svg>";
  }

  window.SIMS.push({
    id: "sim_fit", topic: "memoria", name: "First / best / worst fit", icon: "🧩",
    title: "Allocazione contigua: first fit, best fit, worst fit, next fit",
    desc: "Una fila di buchi e una coda di richieste: guarda la strategia scandire la memoria, scegliere il buco e lasciare frammentazione esterna diversa a ogni scelta.",
    info: `<p><b>Come leggere la scena.</b> La barra è la memoria: i blocchi pieni sono occupati (SO e processi già presenti), quelli tratteggiati verdi sono i buchi con la loro dimensione. Il buco evidenziato in ambra è quello che la strategia sta esaminando; quando alloca, il nuovo processo appare in verde pieno e l'eventuale resto del buco sopravvive come buco più piccolo.</p>
      <p><b>Cosa cambia tra le strategie.</b></p>
      <ul>
        <li><b>First fit</b>: primo buco che basta. Veloce (non scandisce tutto) e nella pratica sorprendentemente buono.</li>
        <li><b>Next fit</b>: come first, ma riparte da dove si era fermato: distribuisce le allocazioni lungo la memoria invece di affollare l'inizio (e in media rende un filo peggio di first fit).</li>
        <li><b>Best fit</b>: il più piccolo buco sufficiente. Sembra furbo, ma scandisce tutto e lascia <i>briciole</i> inutilizzabili.</li>
        <li><b>Worst fit</b>: il buco più grande, così il resto rimane usabile… però distrugge proprio i buchi grandi che servirebbero alle richieste future.</li>
      </ul>
      <p><b>Concetto chiave</b>: la <b>frammentazione esterna</b> — quando una richiesta fallisce anche se lo spazio libero totale basterebbe, perché è spezzettato in buchi troppo piccoli. Prova a farla succedere!</p>`,
    mount(box) {
      let data = gen();
      box.innerHTML = `<div class="sim-params">
          <label>strategia <select class="p-algo">
            <option value="first" selected>first fit</option>
            <option value="best">best fit</option>
            <option value="worst">worst fit</option>
            <option value="next">next fit</option>
          </select></label>
          <button class="btn small secondary p-new">🎲 nuova memoria</button>
        </div>
        <div class="sim-player"></div>
        <p class="sim-hint">I buchi (tratteggiati, col numero di unità libere) sono scanditi per indirizzi crescenti; next fit riparte da dove si era fermato. Best fit tende a lasciare briciole inutilizzabili, worst fit distrugge i buchi grandi.</p>`;
      const q = s => box.querySelector(s);
      function render(f) {
        let h = K.msg(f.msg, f.err ? "err" : "");
        h += `<div class="squeue"><b>richieste:</b> ` + data.reqs.map((r, i) => {
          const cls = f.ri === i ? " on" : (f.ri !== undefined && i < f.ri) ? " past" : "";
          return `<span class="scell${cls}">${r.name}(${r.size})</span>`;
        }).join("") + "</div>";
        return h + memSVG(f.segs, f.hl, f.newTag);
      }
      const pl = K.player(q(".sim-player"), { build: () => simulate(data, q(".p-algo").value), render });
      q(".p-algo").addEventListener("change", () => pl.reload());
      q(".p-new").addEventListener("click", () => { data = gen(); pl.reload(); });
    }
  });
})();

/* ==================== RAID: parità XOR ==================== */
(function () {
  "use strict";
  const K = window.SIMKIT, NB = 8;

  function gen() {
    const disks = [0, 1, 2].map(() => Array.from({ length: NB }, () => K.rnd(0, 1)));
    disks.push(disks[0].map((_, i) => disks[0][i] ^ disks[1][i] ^ disks[2][i]));
    return disks;
  }
  const NAMES = ["D1", "D2", "D3", "P"];

  function simulate(disks, failed) {
    const frames = [];
    const snap = (m, extra) => frames.push(Object.assign({ msg: m }, extra || {}));
    snap(`Strip di ${NB} bit su 3 dischi dati + 1 di parità: per ogni colonna P = D1 ⊕ D2 ⊕ D3 (numero pari di 1 in ogni colonna).`, { rec: -1 });
    snap(`Il disco <b>${NAMES[failed]}</b> si guasta: i suoi bit sono persi. Ma lo XOR è invertibile: ogni bit si ricalcola dagli altri tre.`, { rec: 0 });
    for (let i = 0; i < NB; i++) {
      const others = [0, 1, 2, 3].filter(d => d !== failed);
      const vals = others.map(d => disks[d][i]);
      const v = vals[0] ^ vals[1] ^ vals[2];
      snap(`bit ${i}: ${others.map((d, j) => `${NAMES[d]}=${vals[j]}`).join(", ")} → ${vals.join(" ⊕ ")} = <b>${v}</b>`, { rec: i + 1, col: i });
    }
    snap(`<b>Ricostruzione completata.</b> In RAID 4 la parità sta tutta su un disco (collo di bottiglia in scrittura); RAID 5 la distribuisce a rotazione sui dischi, ma il calcolo è lo stesso.`, { rec: NB });
    return frames;
  }

  window.SIMS.push({
    id: "sim_raid", topic: "dischi", name: "RAID: parità XOR", icon: "🛡️",
    title: "RAID 4/5: parità XOR e ricostruzione di un disco guasto",
    desc: "Rompi un disco e guarda la parità ricostruirlo bit per bit: ogni colonna deve avere un numero pari di 1, quindi il bit perso è lo XOR degli altri.",
    info: `<p><b>Come leggere la scena.</b> Ogni riga è un disco (D1–D3 dati, P parità), ogni colonna un bit della strip. La riga P è calcolata così che ogni colonna abbia un numero <b>pari</b> di 1: P = D1 ⊕ D2 ⊕ D3. Quando un disco muore, i suoi bit diventano «?» e vengono ricalcolati colonna per colonna con lo XOR dei tre superstiti — funziona anche se a morire è proprio P.</p>
      <ul>
        <li><b>Perché lo XOR</b>: è invertibile — se a ⊕ b ⊕ c = p, allora b = a ⊕ c ⊕ p. Un solo disco di ridondanza tollera un guasto qualunque.</li>
        <li><b>RAID 4</b>: parità tutta su un disco dedicato → ogni scrittura lo tocca, diventa il collo di bottiglia.</li>
        <li><b>RAID 5</b>: stessa matematica, ma la parità ruota tra i dischi a ogni strip: le scritture si distribuiscono.</li>
        <li><b>Costo delle scritture piccole</b>: aggiornare un blocco richiede leggere blocco vecchio + parità vecchia, ricalcolare e riscrivere entrambi (read-modify-write).</li>
      </ul>
      <p><b>Trappola d'esame</b>: con un secondo guasto simultaneo i dati sono persi — per quello esiste RAID 6 (doppia parità).</p>`,
    mount(box) {
      let disks = gen();
      box.innerHTML = `<div class="sim-params">
          <label>disco guasto <select class="p-fail">
            <option value="0">D1</option><option value="1" selected>D2</option><option value="2">D3</option><option value="3">P (parità)</option>
          </select></label>
          <button class="btn small secondary p-new">🎲 nuovi dati</button>
        </div>
        <div class="sim-player"></div>`;
      const q = s => box.querySelector(s);
      const failed = () => +q(".p-fail").value;
      function render(f) {
        const fl = failed();
        let h = K.msg(f.msg, f.rec === 0 ? "err" : "");
        h += `<table><tr><th>disco</th>${Array.from({ length: NB }, (_, i) => `<th${f.col === i ? ' class="hlcell"' : ""}>bit ${i}</th>`).join("")}</tr>`;
        disks.forEach((d, di) => {
          const dead = di === fl && f.rec >= 0;
          h += `<tr><td><b>${NAMES[di]}</b>${di === 3 ? " ⊕" : ""}</td>` + d.map((b, i) => {
            if (dead && i >= f.rec) return `<td class="deadcell">?</td>`;
            const cls = [];
            if (f.col === i) cls.push("hlcell");
            if (dead && i < f.rec) cls.push("reccell");
            return `<td${cls.length ? ` class="${cls.join(" ")}"` : ""}>${b}</td>`;
          }).join("") + "</tr>";
        });
        h += "</table>";
        return h;
      }
      const pl = K.player(q(".sim-player"), { build: () => simulate(disks, failed()), render, ms: 750 });
      q(".p-fail").addEventListener("change", () => pl.reload());
      q(".p-new").addEventListener("click", () => { disks = gen(); pl.reload(); });
    }
  });
})();
