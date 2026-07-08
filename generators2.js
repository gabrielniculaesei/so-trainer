// Altri generatori (nuove tipologie plausibili all'esame)
(function () {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[ri(0, arr.length - 1)];
  const fmt = n => n.toLocaleString("it-IT");
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i);[a[i], a[j]] = [a[j], a[i]]; } return a; };

  // LOOK con richieste dinamiche (stile compito-tipo, es. 7)
  function diskDynLOOK(head, initial, arrivals, maxTrack) {
    let t = 0, pos = head, dir = +1, idle = false, guard = 0;
    const pending = new Set(initial);
    const events = [], notes = [];
    const arr = arrivals.slice().sort((a, b) => a.t - b.t);
    const addArrivals = () => {
      while (arr.length && arr[0].t === t) {
        const a = arr.shift();
        notes.push({ t, pos, track: a.track });
        pending.add(a.track);
      }
    };
    addArrivals();
    while ((pending.size || arr.length) && guard++ < 20000) {
      if (!pending.size) { idle = true; t++; addArrivals(); continue; }
      const ahead = [...pending].some(r => dir > 0 ? r > pos : r < pos);
      if (!ahead) dir = -dir;
      t++; pos += dir;
      addArrivals();
      if (pending.has(pos)) { pending.delete(pos); events.push({ track: pos, time: t }); }
      if (pos < 0 || pos > maxTrack) break; // non dovrebbe accadere con LOOK
    }
    return { events, total: t, notes, idle };
  }

  window.GENERATORS.push({
    id: "gdiskdyn", topic: "dischi", title: "LOOK con richieste che arrivano durante il servizio",
    gen() {
      const maxTrack = 199;
      let head, initial, arrivals, r;
      let ok = false, tries = 0;
      while (!ok && tries++ < 200) {
        head = ri(80, 120);
        const below = ri(10, head - 25), above1 = ri(head + 8, 160), above2 = ri(above1 + 10, 195);
        initial = [below, above1, above2];
        const a1 = { t: ri(30, 70), track: ri(head + 5, 190) };
        const a2 = { t: ri(80, 150), track: ri(15, head - 5) };
        arrivals = [a1, a2];
        // niente duplicati e niente coincidenze testina/arrivo
        const all = [...initial, a1.track, a2.track];
        if (new Set(all).size !== all.length || all.includes(head)) continue;
        r = diskDynLOOK(head, initial, arrivals, maxTrack);
        ok = !r.idle && r.events.length === 5 && r.notes.every(n => n.pos !== n.track);
      }
      const seq = r.events.map(e => e.track);
      // distanze tra posizioni consecutive
      let prev = head, legs = [];
      r.events.forEach(e => { legs.push(`${prev}→${e.track} (${Math.abs(e.track - prev)} tracce, t=${e.time})`); prev = e.track; });
      const noteHtml = r.notes.map(n => {
        const ev = r.events.find(e => e.track === n.track);
        return `<li>A t=${n.t} arriva la richiesta per la traccia ${n.track}: la testina è alla traccia <b>${n.pos}</b> ⇒ la richiesta è ${n.track > n.pos ? "più in alto" : "più in basso"} e viene servita a t=${ev ? ev.time : "?"}.</li>`;
      }).join("");
      const text = `<p>Disco con 200 tracce (0–199), velocità di seek <b>1 traccia/ms</b>. All'istante t=0 il SO sta servendo una richiesta sulla traccia <b>${head}</b> e in coda ci sono già richieste per le tracce <b>(${initial.join(", ")})</b>.</p>
<p>Successivamente arrivano altre richieste: all'istante <b>t=${arrivals[0].t}</b> per la traccia <b>${arrivals[0].track}</b> e all'istante <b>t=${arrivals[1].t}</b> per la traccia <b>${arrivals[1].track}</b>.</p>
<p><b>Calcolare il tempo di ricerca complessivo (in ms) con la politica LOOK partendo in ordine ascendente, e indicare la sequenza di scheduling</b> (si trascurino latenza rotazionale e tempo di trasferimento).</p>`;
      const sol = `<ol>
<li><b>Percorso della testina</b> (LOOK: si inverte dopo l'ultima richiesta pendente nel verso corrente):<br>${legs.join("<br>")}</li>
<li><b>Posizione della testina agli arrivi</b>:<ul>${noteHtml}</ul></li>
<li><b>Sequenza di scheduling: ${seq.join(", ")}</b></li>
<li><b>Tempo totale = ${r.total} ms</b> (${r.total} tracce a 1 traccia/ms).</li></ol>
<p><b>Metodo</b>: traccia SEMPRE la posizione della testina all'istante di ogni arrivo: se la richiesta è già stata superata nel verso corrente, si serve al ritorno; con LOOK non si raggiungono mai gli estremi fisici del disco.</p>`;
      return { text, sol };
    }
  });

  // First/Best/Worst/Next fit
  function fitSim(holes, reqs) {
    const run = (mode) => {
      const h = holes.map(size => ({ size }));
      let ptr = 0;
      const chosen = [];
      for (const r of reqs) {
        let idx = -1;
        if (mode === "first") idx = h.findIndex(x => x.size >= r);
        else if (mode === "best") { let bs = Infinity; h.forEach((x, i) => { if (x.size >= r && x.size < bs) { bs = x.size; idx = i; } }); }
        else if (mode === "worst") { let bs = -1; h.forEach((x, i) => { if (x.size >= r && x.size > bs) { bs = x.size; idx = i; } }); }
        else if (mode === "next") {
          for (let k = 0; k < h.length; k++) { const i = (ptr + k) % h.length; if (h[i].size >= r) { idx = i; break; } }
        }
        if (idx === -1) { chosen.push(null); continue; }
        chosen.push({ hole: h[idx].size, rest: h[idx].size - r });
        h[idx].size -= r;
        if (mode === "next") ptr = idx + 1;
        if (h[idx].size === 0) { h.splice(idx, 1); if (mode === "next" && ptr > idx) ptr--; }
        if (mode === "next" && h.length) ptr %= h.length;
      }
      return chosen;
    };
    return { first: run("first"), best: run("best"), worst: run("worst"), next: run("next") };
  }

  window.GENERATORS.push({
    id: "gfit", topic: "memoria", title: "Allocazione contigua: first / best / worst / next fit",
    gen() {
      let holes, reqs, r;
      let ok = false, tries = 0;
      while (!ok && tries++ < 300) {
        holes = Array.from({ length: ri(6, 8) }, () => ri(3, 20));
        reqs = Array.from({ length: 3 }, () => ri(4, 14));
        r = fitSim(holes, reqs);
        const flat = [...r.first, ...r.best, ...r.worst, ...r.next];
        ok = flat.every(x => x !== null) &&
          JSON.stringify(r.first.map(x => x.hole)) !== JSON.stringify(r.best.map(x => x.hole));
      }
      const line = (name, res) => `<li><b>${name}</b>: ` + reqs.map((q, i) =>
        `${q} KB → buco da <b>${res[i].hole}</b>${res[i].rest ? ` (resta ${res[i].rest})` : " (esatto)"}`).join("; ") + `.</li>`;
      const text = `<p>La memoria presenta questi buchi liberi, in ordine di indirizzo:</p>
<pre>${holes.map(h => h + " KB").join(",  ")}</pre>
<p>Arrivano in sequenza tre richieste di segmento da <b>${reqs.join(" KB, ")} KB</b>.</p>
<p><b>In quale buco viene allocata ciascuna richiesta con first fit, best fit, worst fit e next fit?</b> (I buchi si aggiornano dopo ogni allocazione; next fit riparte da dove si era fermato.)</p>`;
      const sol = `<ol>
${line("First fit (primo buco capiente dall'inizio)", r.first)}
${line("Best fit (il più piccolo tra i capienti)", r.best)}
${line("Worst fit (il più grande)", r.worst)}
${line("Next fit (come first, ma ripartendo dall'ultimo punto)", r.next)}
</ol>
<p><b>Da ricordare</b>: best fit genera micro-buchi spesso inutilizzabili (frammentazione esterna peggiore, paradossalmente); first/next non scandiscono tutta la lista; con lista ordinata per dimensione best e worst diventano O(1).</p>`;
      return { text, sol };
    }
  });

  // Traduzione indirizzi con tabella data
  window.GENERATORS.push({
    id: "gaddr", topic: "memoria", title: "Paginazione: tradurre un indirizzo virtuale con la tabella",
    gen() {
      const psKB = pick([1, 2, 4]);
      const ps = psKB * 1024;
      const nPag = 8;
      const frames = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).slice(0, nPag);
      const present = Array.from({ length: nPag }, () => Math.random() < 0.7 ? 1 : 0);
      if (!present.includes(1)) present[0] = 1;
      const pagesPresent = present.map((p, i) => p ? i : -1).filter(i => i >= 0);
      const pg = pick(pagesPresent);
      const off = ri(1, ps - 2);
      const va = pg * ps + off;
      const pa = frames[pg] * ps + off;
      const missing = present.indexOf(0);
      let tab = `<div class="tablewrap"><table><tr><th>pagina</th><th>presente</th><th>frame</th></tr>`;
      for (let i = 0; i < nPag; i++) tab += `<tr><td>${i}</td><td>${present[i]}</td><td>${present[i] ? frames[i] : "—"}</td></tr>`;
      tab += `</table></div>`;
      const text = `<p>Sistema con pagine da <b>${psKB} KB</b> e questa tabella delle pagine:</p>${tab}
<p>1) Per l'indirizzo virtuale <b>${fmt(va)}</b>: calcolare numero di pagina, offset e indirizzo fisico.<br>
${missing >= 0 ? `2) Cosa accade se il processo genera un indirizzo nella pagina ${missing}?` : "2) Cosa accadrebbe se il bit di presenza della pagina fosse 0?"}</p>`;
      const sol = `<ol>
<li>Numero di pagina = ⌊${fmt(va)} / ${fmt(ps)}⌋ = <b>${pg}</b>; offset = ${fmt(va)} mod ${fmt(ps)} = <b>${fmt(off)}</b>.</li>
<li>La tabella dice: pagina ${pg} → frame ${frames[pg]} (presente = 1).</li>
<li>Indirizzo fisico = ${frames[pg]}·${fmt(ps)} + ${fmt(off)} = <b>${fmt(pa)}</b>.</li>
<li>${missing >= 0 ? `La pagina ${missing} ha bit di presenza 0: la MMU genera un <b>page fault</b>; l'OS carica la pagina dal disco (eventualmente scartandone un'altra), aggiorna la tabella e ritenta l'accesso — non è un errore fatale.` : `Con presenza = 0 la MMU genera un <b>page fault</b>: l'OS carica la pagina dal disco e ritenta l'accesso.`}</li></ol>
<p><b>In bit</b>: offset = ${Math.log2(ps)} bit meno significativi; la traduzione sostituisce il numero di pagina con il numero di frame e ricopia l'offset.</p>`;
      return { text, sol };
    }
  });

  // Working set
  window.GENERATORS.push({
    id: "gws2", topic: "sostituzione", title: "Working set: calcolo dalla sequenza dei riferimenti",
    gen() {
      const len = ri(11, 14);
      const refs = [];
      let last = -1;
      for (let i = 0; i < len; i++) { let p; do { p = ri(1, 5); } while (p === last); refs.push(p); last = p; }
      const delta = pick([3, 4, 5]);
      const t1 = ri(delta, Math.floor(len / 2)), t2 = ri(t1 + 2, len);
      const ws = t => { const w = refs.slice(t - delta, t); return [...new Set(w)].sort(); };
      const w1 = ws(t1), w2 = ws(t2);
      const idxRow = refs.map((_, i) => i + 1).join("  ");
      const text = `<p>Un processo genera questa sequenza di riferimenti alle pagine:</p>
<pre>istante:  ${refs.map((_, i) => String(i + 1).padStart(2)).join(" ")}
pagina :  ${refs.map(r => String(r).padStart(2)).join(" ")}</pre>
<p>Con finestra <b>Δ = ${delta}</b>, determinare il working set (e la sua cardinalità) agli istanti <b>t = ${t1}</b> e <b>t = ${t2}</b>. Se al processo fossero assegnati ${Math.max(w1.length, w2.length) - 1} frame, cosa rischierebbe?</p>`;
      const sol = `<p>WS(t, Δ) = pagine referenziate negli istanti (t−Δ+1) … t:</p>
<ol>
<li><b>t = ${t1}</b>: riferimenti agli istanti ${t1 - delta + 1}…${t1} = {${refs.slice(t1 - delta, t1).join(", ")}} ⇒ WS = {${w1.join(", ")}}, |WS| = <b>${w1.length}</b>.</li>
<li><b>t = ${t2}</b>: riferimenti agli istanti ${t2 - delta + 1}…${t2} = {${refs.slice(t2 - delta, t2).join(", ")}} ⇒ WS = {${w2.join(", ")}}, |WS| = <b>${w2.length}</b>.</li>
<li>Con ${Math.max(w1.length, w2.length) - 1} frame il working set non entrerebbe tutto in memoria: page fault continui ⇒ <b>thrashing</b>. L'OS dovrebbe assegnare almeno tanti frame quanti la cardinalità del WS (o sospendere/swappare il processo se la RAM non basta).</li></ol>`;
      return { text, sol };
    }
  });

  // Semafori: contare i bloccati
  window.GENERATORS.push({
    id: "gsemval", topic: "sync", title: "Semafori: valore finale e processi bloccati",
    gen() {
      const init = ri(1, 3);
      const nd = ri(init + 2, init + 4);   // downs > init: qualcuno si blocca
      const nu = ri(1, nd - init);         // ups: al più quanti i bloccati
      const rows = [];
      let val = init, blocked = 0;
      for (let i = 1; i <= nd; i++) {
        if (val > 0) { val--; rows.push([`P${i}: down(S)`, val, blocked, "passa"]); }
        else { blocked++; rows.push([`P${i}: down(S)`, val, blocked, "si blocca"]); }
      }
      for (let i = 1; i <= nu; i++) {
        if (blocked > 0) { blocked--; rows.push([`Q: up(S)`, val, blocked, "risveglia un processo (S resta 0)"]); }
        else { val++; rows.push([`Q: up(S)`, val, blocked, "incrementa S"]); }
      }
      let tab = `<div class="tablewrap"><table><tr><th>evento</th><th>S dopo</th><th>bloccati</th><th>effetto</th></tr>`;
      rows.forEach(r => tab += `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`);
      tab += `</table></div>`;
      const text = `<p>Un semaforo S è inizializzato a <b>${init}</b>. Nell'ordine: <b>${nd} processi</b> (P1…P${nd}) eseguono ciascuno una down(S); poi un processo Q esegue <b>${nu} up(S)</b>.</p>
<p><b>Tracciare il valore di S e i processi bloccati dopo ogni operazione. Quanti processi restano bloccati alla fine?</b></p>`;
      const sol = `${tab}
<p><b>Alla fine: S = ${val}, processi bloccati = ${blocked}.</b></p>
<p><b>Scorciatoia</b>: valore 'concettuale' = init − down + up = ${init} − ${nd} + ${nu} = ${init - nd + nu}. Se negativo, il modulo è il numero di bloccati (S reale = 0); se ≥ 0, è il valore di S (nessun bloccato). Ricorda: una up con coda non vuota risveglia un processo invece di incrementare S.</p>`;
      return { text, sol };
    }
  });

  // Fork: contare i processi
  window.GENERATORS.push({
    id: "gfork", topic: "processi", title: "Fork in sequenza: quanti processi?",
    gen() {
      const k = ri(2, 4);
      const style = pick([0, 1]);
      const code = style === 0
        ? `for (int i = 0; i &lt; ${k}; i++)\n    fork();`
        : Array.from({ length: k }, () => "fork();").join("\n");
      const tot = 2 ** k;
      const text = `<p>Un processo P esegue questo codice:</p><pre>${code}</pre>
<ol><li>Quanti processi esistono al termine (P incluso)?</li>
<li>Quanti processi sono stati creati?</li>
<li>Quante volte verrebbe stampata una printf() posta DOPO ${style === 0 ? "il ciclo" : "l'ultima fork"}?</li></ol>`;
      const sol = `<ol>
<li>Ogni fork raddoppia i processi (anche i figli eseguono le fork successive): dopo ${k} fork ⇒ <b>2<sup>${k}</sup> = ${tot} processi</b>.</li>
<li>Creati = ${tot} − 1 = <b>${tot - 1}</b>.</li>
<li>La printf dopo ${style === 0 ? "il ciclo" : "l'ultima fork"} viene eseguita da TUTTI: <b>${tot} volte</b>.</li></ol>
<p><b>Trappola</b>: rispondere "${k}" dimenticando che i figli proseguono l'esecuzione dallo stesso punto e fanno anch'essi le fork rimanenti. Albero: ad ogni livello i rami raddoppiano.</p>`;
      return { text, sol };
    }
  });

  // NRU: classi e vittima
  window.GENERATORS.push({
    id: "gnru", topic: "sostituzione", title: "NRU: classificare le pagine e scegliere la vittima",
    gen() {
      const n = ri(5, 6);
      const names = ["A", "B", "C", "D", "E", "F"].slice(0, n);
      let pages;
      do {
        const times = shuffle(Array.from({ length: 15 }, (_, i) => i + 1)).slice(0, n);
        pages = names.map((nm, i) => ({ nm, R: ri(0, 1), M: ri(0, 1), t: times[i] }));
      } while (Math.min(...pages.map(p => 2 * p.R + p.M)) === 3); // almeno una classe < 3
      const cls = p => 2 * p.R + p.M;
      const minC = Math.min(...pages.map(cls));
      const candidates = pages.filter(p => cls(p) === minC);
      const victim = candidates.reduce((a, b) => a.t < b.t ? a : b);
      let tab = `<div class="tablewrap"><table><tr><th>pagina</th><th>R</th><th>M</th><th>caricata al tempo</th></tr>`;
      pages.forEach(p => tab += `<tr><td>${p.nm}</td><td>${p.R}</td><td>${p.M}</td><td>${p.t}</td></tr>`);
      tab += `</table></div>`;
      let clsTab = `<div class="tablewrap"><table><tr><th>classe</th><th>bit</th><th>pagine</th></tr>`;
      for (let c = 0; c < 4; c++) {
        const members = pages.filter(p => cls(p) === c).map(p => p.nm);
        clsTab += `<tr><td>${c}</td><td>R=${c >> 1}, M=${c & 1}</td><td>${members.length ? members.join(", ") : "—"}</td></tr>`;
      }
      clsTab += `</table></div>`;
      const text = `<p>Un sistema usa l'algoritmo <b>NRU</b>. Al momento di un page fault le pagine in memoria hanno questi bit (R = referenziamento, azzerato periodicamente; M = modifica):</p>
${tab}
<p>1) Assegnare ogni pagina alla propria classe. 2) Quale pagina viene scartata? (A parità di classe: FIFO, cioè la più vecchia in RAM.)</p>`;
      const sol = `<ol>
<li>Classe = 2·R + M:${clsTab}</li>
<li>Classe più bassa non vuota = <b>${minC}</b> → candidate: ${candidates.map(p => p.nm).join(", ")}. ${candidates.length > 1 ? `A parità di classe si sceglie la più vecchia (FIFO): ` : ``}<b>si scarta ${victim.nm}</b> (caricata al tempo ${victim.t}).</li></ol>
<p><b>Perché R pesa più di M</b>: R viene azzerato periodicamente, quindi R=0 = "non usata di recente" (probabilmente inutile a breve). A parità di R conviene la pagina NON modificata: si scarta senza riscriverla su disco.</p>`;
      return { text, sol };
    }
  });

  // esposti per i test
  window._sims2 = { diskDynLOOK, fitSim };
})();
