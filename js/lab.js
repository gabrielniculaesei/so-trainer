// Laboratorio (C + pthread): Manuale delle funzioni e Kata.
// window.LABCORE: logica pura senza DOM (confronto output, controlli euristici, script del
//   ciclo di 100 esecuzioni, zip), usabile anche da Node per verificare i kata.
// window.LAB_UI: la vista "lab"; mount() la chiama app.js alla prima apertura, così
//   può contare su window.APP (labStore/labSave per i progressi, separati dalle statistiche di teoria).
(function () {
  "use strict";

  // ---------------------------------------------------------------- confronto output
  // Righe [MAIN]: devono coincidere esattamente e nello stesso ordine.
  // Altre righe (una per thread): confrontate come multinsieme, in qualsiasi ordine.
  function splitLines(text) {
    return String(text || "").replace(/\r/g, "").split("\n").map(l => l.replace(/\s+$/, "")).filter(l => l.length);
  }
  const isMain = l => l.startsWith("[MAIN]");
  // diff riga per riga (LCS) → [{ t: "=" | "-" (manca) | "+" (in più), l }]
  function diffLines(a, b) {
    const n = a.length, m = b.length, L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
      L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const out = []; let i = 0, j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { out.push({ t: "=", l: a[i] }); i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) out.push({ t: "-", l: a[i++] });
      else out.push({ t: "+", l: b[j++] });
    }
    while (i < n) out.push({ t: "-", l: a[i++] });
    while (j < m) out.push({ t: "+", l: b[j++] });
    return out;
  }
  function compare(expected, text) {
    const lines = splitLines(text);
    const main = lines.filter(isMain), other = lines.filter(l => !isMain(l));
    const ops = diffLines(expected.exact, main);
    const need = new Map();
    expected.set.forEach(l => need.set(l, (need.get(l) || 0) + 1));
    const extra = [];
    other.forEach(l => { const k = need.get(l) || 0; if (k > 0) need.set(l, k - 1); else extra.push(l); });
    const missing = [];
    need.forEach((k, l) => { for (let i = 0; i < k; i++) missing.push(l); });
    const finalLine = expected.exact[expected.exact.length - 1];
    const ok = ops.every(o => o.t === "=") && !missing.length && !extra.length;
    return { ok, empty: !lines.length, ops, missing, extra, noFinal: !main.includes(finalLine), finalLine };
  }
  // un ordine plausibile dell'output atteso: prima riga [MAIN], righe dei thread, riepilogo
  function sampleOutput(expected) {
    return [expected.exact[0]].concat(expected.set, expected.exact.slice(1)).join("\n");
  }

  // ---------------------------------------------------------------- script del ciclo
  function cicloScript(inst) {
    const run = "./kata" + (inst.args ? " " + inst.args : "");
    return `#!/bin/bash
# ciclo di 100 esecuzioni: segnala blocchi (timeout 5 s) e output diversi dall'atteso
# (il confronto qui è sulle righe ordinate; quello completo è nel riquadro della pagina)
cat > atteso.txt <<'FINE'
${sampleOutput(inst.expected)}
FINE
sort atteso.txt > atteso.ord
blocchi=0; diversi=0
for i in $(seq 1 100); do
  { perl -e 'alarm shift; exec @ARGV' 5 ${run} > out.txt; } 2>/dev/null
  rc=$?
  if [ $rc -ne 0 ]; then blocchi=$((blocchi+1)); echo "run $i: BLOCCO o crash (codice $rc)"; continue; fi
  sort out.txt | cmp -s - atteso.ord || { diversi=$((diversi+1)); echo "run $i: output diverso"; }
done
echo "fatto: $blocchi blocchi/crash e $diversi output diversi su 100 esecuzioni"
`;
  }

  // ---------------------------------------------------------------- controlli euristici
  // toglie commenti, stringhe e caratteri (lasciando gli a-capo) e le righe del preprocessore
  function stripC(src) {
    let out = "", i = 0;
    const s = String(src || "");
    while (i < s.length) {
      const c = s[i], d = s[i + 1];
      if (c === "/" && d === "*") { const e = s.indexOf("*/", i + 2); const end = e < 0 ? s.length : e + 2; out += s.slice(i, end).replace(/[^\n]/g, " "); i = end; }
      else if (c === "/" && d === "/") { while (i < s.length && s[i] !== "\n") { out += " "; i++; } }
      else if (c === '"' || c === "'") {
        const q = c; out += q; i++;
        while (i < s.length && s[i] !== q && s[i] !== "\n") { if (s[i] === "\\") { out += " "; i++; } out += " "; i++; }
        if (i < s.length && s[i] === q) { out += q; i++; }
      } else { out += c; i++; }
    }
    // preprocessore (anche con le righe continuate da '\')
    return out.replace(/^[ \t]*#(?:[^\n]*\\\n)*[^\n]*/gm, m => m.replace(/[^\n]/g, " "));
  }
  function matchBack(s, j, open, close) { // j punta a close: restituisce l'indice dell'open corrispondente
    let depth = 0;
    for (let k = j; k >= 0; k--) {
      if (s[k] === close) depth++;
      else if (s[k] === open && --depth === 0) return k;
    }
    return -1;
  }
  const prevNonWs = (s, j) => { while (j >= 0 && /\s/.test(s[j])) j--; return j; };
  const wordBefore = (s, j) => { j = prevNonWs(s, j); let k = j; while (k >= 0 && /\w/.test(s[k])) k--; return s.slice(k + 1, j + 1); };
  // parola chiave del costrutto che contiene la chiamata in posizione i
  function controlOf(s, i) {
    let j = prevNonWs(s, i - 1);
    if (s[j] === ")") return wordBefore(s, matchBack(s, j, "(", ")") - 1);
    // cerca la '{' che apre il blocco corrente
    let depth = 0, k = i - 1;
    for (; k >= 0; k--) {
      if (s[k] === "}") depth++;
      else if (s[k] === "{") { if (depth === 0) break; depth--; }
    }
    if (k < 0) return "";
    j = prevNonWs(s, k - 1);
    if (s[j] === ")") return wordBefore(s, matchBack(s, j, "(", ")") - 1);
    return wordBefore(s, j);
  }
  // dichiarazioni al livello più esterno che non sono tipi né prototipi
  function globals(s) {
    const found = []; let buf = "", i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === "{") {
        let depth = 0, k = i;
        for (; k < s.length; k++) { if (s[k] === "{") depth++; else if (s[k] === "}" && --depth === 0) break; }
        if (/\)\s*$/.test(buf)) buf = "";       // definizione di funzione
        else buf += "{}";                        // struct/enum/inizializzatore: continua fino al ';'
        i = k + 1; continue;
      }
      if (c === ";") {
        const t = buf.replace(/\s+/g, " ").trim(); buf = "";
        if (t && !/^typedef\b/.test(t) && !/^(struct|union|enum)\b[^=()]*\{\}$/.test(t) && !/^(struct|union|enum)\s+\w+$/.test(t) &&
          !(/\)$/.test(t) && !/=/.test(t))) found.push(t.length > 70 ? t.slice(0, 67) + "…" : t);
        i++; continue;
      }
      buf += c; i++;
    }
    return found;
  }
  // restituisce [{ ok: true|false, msg }]; ok:false = da guardare
  function heuristics(code, kata) {
    const s = stripC(code), res = [];
    if (!s.trim()) return res;
    // while attorno a pthread_cond_wait
    const waits = [...s.matchAll(/\bpthread_cond_wait\s*\(/g)];
    if (waits.length) {
      const bad = waits.map(m => controlOf(s, m.index)).filter(kw => !["while", "for", "do"].includes(kw));
      if (bad.length) res.push({ ok: false, msg: `${bad.length} pthread_cond_wait su ${waits.length} non sono dentro un while${bad.includes("if") ? " (c'è un if al posto del while)" : ""}` });
      else res.push({ ok: true, msg: `tutte le ${waits.length} pthread_cond_wait sono dentro un ciclo` });
    }
    // variabili globali
    const g = globals(s);
    if (g.length) res.push({ ok: false, msg: "possibili variabili globali: " + g.map(x => "<code>" + x.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</code>").join(", ") });
    else res.push({ ok: true, msg: "nessuna variabile globale trovata" });
    // flockfile / funlockfile in coppia
    const fl = (s.match(/\bflockfile\s*\(/g) || []).length, fu = (s.match(/\bfunlockfile\s*\(/g) || []).length;
    if (fl !== fu) res.push({ ok: false, msg: `flockfile (${fl}) e funlockfile (${fu}) non sono in coppia` });
    // API richieste e vietate dal kata
    if (kata && kata.check) {
      kata.check.need.forEach(([re, label]) => {
        if (!new RegExp(re).test(s)) res.push({ ok: false, msg: `manca ${label}` });
        else res.push({ ok: true, msg: `presente ${label}` });
      });
      kata.check.ban.forEach(([re, label]) => {
        if (new RegExp(re).test(s)) res.push({ ok: false, msg: `trovato ${label}` });
      });
    }
    // contatore dei produttori attivi incrementato dai thread invece che inizializzato a N nel main
    if (/\bactive\w*\s*\+\+|\+\+\s*[\w.>-]*active\w*/.test(s))
      res.push({ ok: false, msg: "un contatore <code>active…</code> viene incrementato con <code>++</code>: va inizializzato a N nel main, prima di creare i thread" });
    // join e create: stesso indice
    if (/pthread_create\s*\(\s*&\s*\w+\s*,/.test(s) && /for\s*\(/.test(s) && !/pthread_create\s*\(\s*&\s*\w+\s*(\[|\.|->)/.test(s))
      res.push({ ok: false, msg: "pthread_create sembra usare sempre lo stesso pthread_t (manca l'indice [i]?)" });
    return res;
  }

  // ---------------------------------------------------------------- zip (store, senza compressione)
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  // files: [{ name, data }] file regolari, { name: "dir/", dir: true } cartelle, { name, link: "destinazione" } link simbolici.
  // "version made by" Unix (3), così unzip ripristina permessi, cartelle vuote e link simbolici.
  function zip(files) {
    const enc = new TextEncoder(), parts = [], central = [];
    let off = 0;
    const u16 = v => [v & 255, (v >>> 8) & 255], u32 = v => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];
    const now = new Date(), DOS_T = (now.getHours() << 11) | (now.getMinutes() << 5), DOS_D = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    files.forEach(f => {
      const name = enc.encode(f.dir && !f.name.endsWith("/") ? f.name + "/" : f.name);
      const data = f.dir ? new Uint8Array(0) : f.link != null ? enc.encode(f.link) : typeof f.data === "string" ? enc.encode(f.data) : f.data;
      const crc = crc32(data), mode = f.dir ? 0o40755 : f.link != null ? 0o120777 : (f.mode || 0o100644);
      const common = [...u16(20), ...u16(0x0800), ...u16(0), ...u16(DOS_T), ...u16(DOS_D), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0)];
      const local = new Uint8Array([...u32(0x04034b50), ...common]);
      parts.push(local, name, data);
      central.push(new Uint8Array([...u32(0x02014b50), ...u16(0x031E), ...common, ...u16(0), ...u16(0), ...u16(0), ...u32(((mode << 16) | (f.dir ? 0x10 : 0)) >>> 0), ...u32(off)]), name);
      off += local.length + name.length + data.length;
    });
    const cdSize = central.reduce((x, p) => x + p.length, 0);
    const end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(cdSize), ...u32(off), ...u16(0)]);
    const all = parts.concat(central, [end]), out = new Uint8Array(all.reduce((x, p) => x + p.length, 0));
    let p = 0; all.forEach(a => { out.set(a, p); p += a.length; });
    return out;
  }

  window.LABCORE = { compare, sampleOutput, cicloScript, heuristics, stripC, globals, zip, crc32 };
})();

// ======================================================================= vista "lab"
(function () {
  "use strict";
  const CORE = window.LABCORE;
  const EXAM = new Date(2026, 10, 4).getTime();          // appello del 4 novembre 2026
  const DAY = 86400000, INTERVALS = [3, 7, 14];           // ripasso dopo 3, 7, 14 giorni
  const LVL = ["lacune", "struct e firme", "foglio bianco"];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => [...(root || document).querySelectorAll(sel)];
  const FN = new Map((window.LAB_FUNZIONI || []).map(f => [f.id, f]));
  const GROUPS = new Map(window.LAB_GRUPPI || []);
  const KATA = window.LAB_KATA || [];
  let mounted = false, tab = "kata", cur = null, group = "", query = "";
  const failedL3 = new Set();                              // kata con un confronto fallito al livello 3 in questa sessione
  const timer = { t0: 0, id: null };

  // ---- progressi (store.lab in so_trainer_v2, separati dalle statistiche di teoria)
  const store = () => { const s = window.APP.labStore(); s.kata = s.kata || {}; return s; };
  const ks = id => { const s = store(); return s.kata[id] || (s.kata[id] = { unlocked: 1, pass: {}, tries: {}, box: 0, due: null }); };
  const save = () => window.APP.labSave();
  const isDue = k => { const s = store().kata[k.id]; return !!(s && s.due && s.due <= Date.now()); };
  const fmtDate = t => new Date(t).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" });
  function schedule(box) {
    const now = Date.now(), cap = EXAM - DAY;
    let t = now + INTERVALS[box - 1] * DAY;
    if (now < cap && t > cap) t = cap;                     // l'ultimo ripasso cade prima dell'appello
    return t;
  }

  // ---- utilità: copia e download
  function copy(text, what) {
    const done = () => window.APP.toast(`${what || "testo"} copiato`);
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
    function fallback() {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { window.APP.toast("copia non riuscita"); }
      ta.remove();
    }
  }
  function download(name, data, type) {
    const blob = new Blob([data], { type: type || "application/octet-stream" });
    const url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  // ---- schede del manuale
  const ERRB = { codice: "errore: codice restituito", errno: "errore: -1 / NULL + errno" };
  const fnLink = id => FN.has(id) ? `<button class="fnlink" data-fn="${id}">${FN.get(id).nome}</button>` : "";
  function fnCard(f) {
    const kata = KATA.filter(k => k.funzioni.includes(f.id));
    return `<article class="fncard" data-id="${f.id}">
      <div class="fn-head"><h3>${f.nome}</h3><span class="badge">${esc(f.header)}</span>${ERRB[f.errore] ? `<span class="badge ${f.errore === "codice" ? "acc" : "amb"}">${ERRB[f.errore]}</span>` : ""}</div>
      <pre class="fn-sig"><code>${f.firma}</code></pre>
      <p>${f.cosa}</p>
      <p class="fn-ret"><b>ritorno:</b> ${f.ritorno}</p>
      <div class="note"><span class="note-k">trappola d'esame</span>${f.trappola}</div>
      <pre><code>${f.esempio}</code></pre>
      ${f.vedi && f.vedi.length ? `<div class="fn-links"><span>vedi:</span> ${f.vedi.map(fnLink).join(" ")}</div>` : ""}
      ${kata.length ? `<div class="fn-links"><span>nei kata:</span> ${kata.map(k => `<button class="katalink" data-kata="${k.id}">${k.titolo}</button>`).join(" ")}</div>` : ""}
    </article>`;
  }
  function showFn(id) {
    const f = FN.get(id); if (!f) return;
    const d = $("#labDrawer");
    d.innerHTML = `<div class="drawer-top"><span class="qty-label">manuale</span><button class="btn secondary small" id="drawerClose">chiudi ✕</button></div>${fnCard(f)}`;
    d.classList.add("open"); d.scrollTop = 0;
    $("#drawerClose").addEventListener("click", closeFn);
    $("#drawerClose").focus();
  }
  function closeFn() { const d = $("#labDrawer"); if (d) d.classList.remove("open"); }

  const plain = h => String(h).replace(/<[^>]+>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").toLowerCase();
  function renderManuale() {
    const box = $("#labManuale");
    if (!box.dataset.built) {
      box.dataset.built = "1";
      box.innerHTML = `<p class="lead">Una scheda per funzione: firma, cosa fa, come si controlla l'errore, la trappola d'esame e un esempio. Nel laboratorio si usano i nomi reali delle API POSIX.</p>
        <input id="fnSearch" class="map-search lab-search" type="search" placeholder="cerca (es. MAP_FAILED, newline, broadcast, errno)…" autocomplete="off" spellcheck="false" aria-label="cerca nel manuale">
        <div class="chips" id="fnChips"></div>
        <p class="sim-hint" id="fnCount"></p>
        <div class="fngrid" id="fnGrid"></div>`;
      const chips = $("#fnChips");
      [["", "tutte"]].concat(window.LAB_GRUPPI || []).forEach(([k, label]) => {
        const b = document.createElement("button");
        b.className = "chip" + (k === group ? " on" : ""); b.textContent = label; b.dataset.g = k;
        b.addEventListener("click", () => { group = k; $$(".chip", chips).forEach(c => c.classList.toggle("on", c.dataset.g === k)); drawManuale(); });
        chips.appendChild(b);
      });
      $("#fnSearch").addEventListener("input", e => { query = e.target.value.trim().toLowerCase(); drawManuale(); });
    }
    drawManuale();
  }
  function drawManuale() {
    const words = query.split(/\s+/).filter(Boolean);
    const list = (window.LAB_FUNZIONI || []).filter(f => (!group || f.gruppo === group) &&
      words.every(w => plain([f.id, f.nome, f.firma, f.header, f.cosa, f.ritorno, f.trappola, f.esempio].join(" ")).includes(w)));
    $("#fnCount").textContent = `${list.length} schede`;
    $("#fnGrid").innerHTML = list.length ? list.map(fnCard).join("") : `<p class="sim-hint">nessuna scheda trovata</p>`;
  }

  // ---- elenco dei kata
  function statusOf(k) {
    const s = store().kata[k.id];
    if (isDue(k)) return `<span class="badge amb">ripasso: livello 3</span>`;
    if (s && s.pass && s.pass[3]) return `<span class="badge acc">superato · torna il ${fmtDate(s.due)}</span>`;
    return `<span class="badge">livello ${s ? s.unlocked : 1}/3</span>`;
  }
  function renderList() {
    const due = KATA.filter(isDue);
    $("#labKata").innerHTML = `<div id="kataMenu">
      <p class="lead">Un kata = un pattern della prova pratica. Tre livelli in ordine: lacune, struct e firme, foglio bianco a tempo. Ogni variante ha parametri casuali e l'output atteso calcolato qui: compila, esegui, incolla l'output e confronta.</p>
      ${due.length ? `<div class="note">da riscrivere oggi a foglio bianco: ${due.map(k => `<b>${k.titolo}</b>`).join(", ")}</div>` : ""}
      <div class="simgrid">${KATA.map(k => `<button class="simtile" data-kata="${k.id}">
        <span class="simtile-icon">${k.icon}</span>
        <span class="simtile-body">
          <span class="simtile-title">${k.titolo}</span>
          <span class="simtile-desc">${k.obiettivo}</span>
          <span class="kt-badges"><span class="badge">~${k.tempi.join("/")} min</span>${statusOf(k)}${k.sem ? `<span class="badge">Linux</span>` : ""}</span>
        </span></button>`).join("")}</div>
      <div class="quiz-controls"><button class="btn danger small" id="labReset">azzera i progressi del laboratorio</button></div>
    </div><div id="kataDetail" class="hidden"></div>`;
    $("#labReset").addEventListener("click", async () => {
      if (await window.APP.confirm("Azzerare i progressi dei kata (livelli sbloccati e ripassi)? Le statistiche di teoria restano.")) {
        store().kata = {}; save(); renderList(); window.APP.toast("Progressi del laboratorio azzerati.");
      }
    });
  }

  // ---- dettaglio di un kata
  function openKata(id) {
    const k = KATA.find(x => x.id === id); if (!k) return;
    if (tab !== "kata") setTab("kata");
    const s = ks(k.id);
    if (!s.seed) { s.seed = 1 + Math.floor(Math.random() * 99999); save(); }
    cur = { k, inst: k.gen(s.seed), level: isDue(k) ? 3 : s.unlocked, passed: {} };
    closeFn(); stopTimer();
    $("#kataMenu").classList.add("hidden");
    $("#kataDetail").classList.remove("hidden");
    renderDetail();
    window.scrollTo(0, 0);
  }
  function closeKata() {
    stopTimer(); cur = null;
    renderList();
  }
  function cmdBlock(label, cmd, extra) {
    return `<div class="cmd"><div class="cmd-h"><span>${label}</span><span class="cmd-btns">${extra || ""}<button class="btn secondary small" data-copy="${esc(cmd)}" data-what="comando">copia</button></span></div><pre><code>${esc(cmd)}</code></pre></div>`;
  }
  function commands(k, inst) {
    const run = "./kata" + (inst.args ? " " + inst.args : "");
    const tsanArgs = inst.args ? " " + inst.args : "";
    const docker = `docker run --rm -v "$PWD":/w -w /w gcc:14 bash -c`;
    let h = cmdBlock("compila", "gcc -std=c99 -Wall -Wextra -pthread kata.c -o kata") +
      cmdBlock("esegui", run) +
      cmdBlock("ciclo di 100 esecuzioni (blocchi e output diversi)", "bash ciclo.sh",
        `<button class="btn secondary small" id="kCiclo">scarica ciclo.sh</button>`);
    if (k.sem) {
      h += `<p class="sim-hint">Su macOS <code>sem_init</code> non funziona: compila ed esegui in un container Linux (serve Docker).</p>` +
        cmdBlock("Docker: compila, esegui e ciclo di 100", `${docker} 'gcc -std=c99 -Wall -Wextra -pthread kata.c -o kata && ${run} && bash ciclo.sh'`) +
        cmdBlock("Docker: ThreadSanitizer", `${docker} 'gcc -std=c99 -g -O1 -fsanitize=thread -pthread kata.c -o kata-tsan && ./kata-tsan${tsanArgs}'`);
    } else {
      h += cmdBlock("ThreadSanitizer", `clang -std=c99 -g -O1 -fsanitize=thread -pthread kata.c -o kata-tsan && ./kata-tsan${tsanArgs}`) +
        `<p class="sim-hint">Su Linux usa <code>gcc</code> al posto di <code>clang</code>. Nessuna riga <code>WARNING: ThreadSanitizer</code> = nessuna data race osservata in quell'esecuzione.</p>`;
    }
    return h;
  }
  function renderDetail() {
    const { k, inst, level } = cur, s = ks(k.id), src = inst.levels[level - 1];
    const sizeOf = f => typeof f.data === "string" ? new TextEncoder().encode(f.data).length : f.data.length;
    const regular = inst.files.filter(f => !f.dir && f.link == null);
    const inputs = inst.files.length > 6
      ? `${regular.length} file${inst.files.some(f => f.dir) ? ` in ${inst.files.filter(f => f.dir).length} cartelle` : ""}${inst.files.some(f => f.link != null) ? " e un link simbolico" : ""} (estrai con <code>unzip</code> o con Archive Utility: i link simbolici devono restare link)`
      : inst.files.map(f => `<code>${f.name}</code> (${sizeOf(f)} byte)`).join(", ");
    $("#kataDetail").innerHTML = `
      <div class="sim-topnav">
        <button class="btn secondary small" id="kBack">← tutti i kata</button>
        <span class="badge acc">pattern ${k.sezione}</span>${isDue(k) ? `<span class="badge amb">ripasso di oggi</span>` : ""}
      </div>
      <h1>${k.titolo}</h1>
      <p class="lead">${k.obiettivo}</p>
      <div class="card">
        <div class="fn-links"><span>funzioni:</span> ${k.funzioni.map(fnLink).join(" ")}</div>
        <div class="lvlbar" role="group" aria-label="livello">${[1, 2, 3].map(l => {
          const locked = l > s.unlocked && !(l === 3 && isDue(k));
          return `<button class="lvl${l === level ? " on" : ""}" data-lvl="${l}" ${locked ? "disabled" : ""}>
            <b>${l}</b> ${LVL[l - 1]} <span>~${k.tempi[l - 1]} min</span>${s.pass[l] ? ` <i title="superato">✓</i>` : locked ? ` <i>🔒</i>` : ""}</button>`;
        }).join("")}</div>
        <div class="kvar">
          <span class="badge">variante #${inst.seed}</span><span class="kvar-p">${inst.params}</span>
          <button class="btn secondary small" id="kNew">nuova variante</button>
        </div>
        <div class="ktimer"><span id="kClock">00:00</span><span class="kt-target">obiettivo ~${k.tempi[level - 1]} min</span>
          <button class="btn small${level === 3 ? "" : " secondary"}" id="kTimer">avvia il timer</button></div>
      </div>

      <h2>file</h2>
      <div class="card">
        <div class="quiz-controls kfile-btns">
          <button class="btn small" id="kCopy">copia kata.c</button>
          <button class="btn secondary small" id="kDl">scarica kata.c</button>
          <button class="btn secondary small" id="kZip">scarica tutto (.zip)</button>
        </div>
        ${inst.files.length ? `<p class="sim-hint">Nello zip, oltre a <code>kata.c</code> e <code>ciclo.sh</code>, ci sono i file di input generati per questa variante: ${inputs}.</p>` : ""}
        <details class="kpeek"><summary>mostra kata.c (livello ${level})</summary><pre><code>${esc(src)}</code></pre></details>
      </div>

      <h2>comandi</h2>
      <div class="card">${commands(k, inst)}</div>

      <h2>output atteso</h2>
      <div class="card">
        <pre><code>${esc(CORE.sampleOutput(inst.expected))}</code></pre>
        <p class="sim-hint">Le righe <code>[MAIN]</code> devono coincidere esattamente e in quest'ordine; le righe dei singoli thread possono uscire in qualsiasi ordine.</p>
      </div>

      <h2>incolla il tuo output</h2>
      <div class="card">
        <textarea class="answerbox mono" id="kOut" placeholder="incolla qui tutto quello che stampa ./kata…" spellcheck="false"></textarea>
        <div class="quiz-controls"><button class="btn" id="kCmpBtn">confronta</button><span class="badge" id="kTries"></span></div>
        <div id="kCmp" aria-live="polite"></div>
      </div>

      <h2>incolla il tuo codice <span class="h2-opt">(facoltativo)</span></h2>
      <div class="card">
        <textarea class="answerbox mono" id="kCode" placeholder="incolla qui il tuo kata.c…" spellcheck="false"></textarea>
        <div class="quiz-controls"><button class="btn secondary" id="kHeurBtn">controlla</button></div>
        <div id="kHeur"></div>
      </div>

      <h2>soluzione di riferimento</h2>
      <div class="card" id="kSol"></div>`;
    $("#kBack").addEventListener("click", closeKata);
    $$(".lvl", $("#kataDetail")).forEach(b => b.addEventListener("click", () => {
      cur.level = +b.dataset.lvl; stopTimer(); renderDetail();
    }));
    $("#kNew").addEventListener("click", () => {
      const s2 = ks(k.id); s2.seed = 1 + Math.floor(Math.random() * 99999); save();
      cur.inst = k.gen(s2.seed); cur.passed = {}; renderDetail();
      window.APP.toast(`nuova variante #${s2.seed}: riscarica i file`);
    });
    $("#kTimer").addEventListener("click", () => timer.id ? stopTimer() : startTimer());
    $("#kCopy").addEventListener("click", () => copy(src, "kata.c"));
    $("#kDl").addEventListener("click", () => download("kata.c", src, "text/x-c"));
    $("#kZip").addEventListener("click", () => {
      const dir = `kata-${k.id}-${inst.seed}/`;
      const files = [{ name: dir + "kata.c", data: src }, { name: dir + "ciclo.sh", data: CORE.cicloScript(inst), mode: 0o100755 }]
        .concat(inst.files.map(f => Object.assign({}, f, { name: dir + f.name })));
      download(`kata-${k.id}-${inst.seed}.zip`, CORE.zip(files), "application/zip");
    });
    $("#kCiclo").addEventListener("click", () => download("ciclo.sh", CORE.cicloScript(inst), "text/x-shellscript"));
    $("#kCmpBtn").addEventListener("click", runCompare);
    $("#kHeurBtn").addEventListener("click", runHeuristics);
    updateTries(); renderSolution();
  }
  function updateTries() {
    const n = ks(cur.k.id).tries[cur.level] || 0;
    $("#kTries").textContent = n ? `${n} confront${n === 1 ? "o" : "i"} al livello ${cur.level}` : "nessun confronto ancora";
  }

  function runCompare() {
    const { k, inst, level } = cur, s = ks(k.id);
    const res = CORE.compare(inst.expected, $("#kOut").value);
    const box = $("#kCmp");
    if (res.empty) { box.innerHTML = `<p class="sim-hint">Incolla prima l'output del programma.</p>`; return; }
    s.tries[level] = (s.tries[level] || 0) + 1;
    let head;
    if (res.ok) {
      const first = !s.pass[level];
      s.pass[level] = Date.now();
      if (level < 3) s.unlocked = Math.max(s.unlocked, level + 1);
      if (level === 3) {
        s.box = failedL3.has(k.id) ? 1 : Math.min(INTERVALS.length, (s.box || 0) + 1);
        s.due = schedule(s.box); failedL3.delete(k.id);
      }
      cur.passed[level] = true;
      head = `<div class="cmp-verdict ok">✓ output corretto: tutte le righe coincidono.</div>` +
        (level < 3 && first ? `<p>Livello ${level + 1} sbloccato.</p>` : "") +
        (level === 3 ? `<p>Kata superato a foglio bianco: torna da riscrivere il <b>${fmtDate(s.due)}</b>.</p>` : "") +
        (timer.id ? `<p>Tempo: <b>${$("#kClock").textContent}</b> (obiettivo ~${k.tempi[level - 1]} min).</p>` : "");
      stopTimer();
    } else {
      if (level === 3) failedL3.add(k.id);
      head = `<div class="cmp-verdict err">✗ l'output non coincide con quello atteso.</div>` +
        (res.noFinal ? `<div class="note"><b>manca la riga finale</b> <code>${esc(res.finalLine)}</code>: probabile problema di terminazione (un thread bloccato, un broadcast o un sem_post mancante, una join che non ritorna). Se il programma non è terminato, interrompilo con Ctrl-C e incolla quello che ha stampato.</div>` : "");
    }
    save();
    const mainDiff = res.ops.some(o => o.t !== "=");
    const mainHtml = `<div class="cmp-sec"><div class="cmp-h">righe [MAIN] (ordine esatto)${mainDiff ? "" : " ✓"}</div>
      <div class="difflines">${res.ops.map(o => `<div class="dl ${o.t === "=" ? "eq" : o.t === "-" ? "miss" : "extra"}"><span>${o.t === "=" ? " " : o.t === "-" ? "manca" : "in più"}</span><code>${esc(o.l)}</code></div>`).join("")}</div></div>`;
    const setHtml = (res.missing.length || res.extra.length)
      ? `<div class="cmp-sec"><div class="cmp-h">righe dei thread (ordine libero)</div><div class="difflines">
          ${res.missing.map(l => `<div class="dl miss"><span>manca</span><code>${esc(l)}</code></div>`).join("")}
          ${res.extra.map(l => `<div class="dl extra"><span>in più</span><code>${esc(l)}</code></div>`).join("")}</div></div>`
      : `<div class="cmp-sec"><div class="cmp-h">righe dei thread (ordine libero) ✓</div></div>`;
    box.innerHTML = head + mainHtml + setHtml;
    updateTries(); renderSolution();
    if (res.ok) {
      $$(".lvl", $("#kataDetail")).forEach(b => {
        const l = +b.dataset.lvl;
        if (l <= s.unlocked) b.disabled = false;
        if (s.pass[l] && !b.querySelector("i[title]")) { const lock = b.querySelector("i"); if (lock) lock.remove(); b.insertAdjacentHTML("beforeend", ` <i title="superato">✓</i>`); }
      });
    }
  }
  function runHeuristics() {
    const code = $("#kCode").value, box = $("#kHeur");
    if (!code.trim()) { box.innerHTML = `<p class="sim-hint">Incolla prima il codice.</p>`; return; }
    const res = CORE.heuristics(code, cur.k);
    box.innerHTML = `<ul class="heur">${res.map(r => `<li class="${r.ok ? "ok" : "warn"}"><span>${r.ok ? "✓" : "⚠"}</span><span>${r.msg}</span></li>`).join("")}</ul>
      <p class="sim-hint">Controlli euristici sul testo, non una compilazione: possono sbagliare in entrambe le direzioni. Il giudice vero è il confronto dell'output.</p>`;
  }
  function renderSolution() {
    const { k, inst, level } = cur, s = ks(k.id), box = $("#kSol");
    const tries = s.tries[level] || 0;
    if (cur.passed[level]) {
      box.innerHTML = `<p>Confronto riuscito: soluzione sbloccata.</p><button class="btn secondary small" id="kSolBtn">mostra la soluzione</button><div id="kSolCode"></div>`;
    } else if (tries > 0) {
      box.innerHTML = `<p>Dopo almeno un tentativo puoi vederla, ma prova prima a chiudere il confronto da solo.</p><button class="btn danger small" id="kSolBtn">mostra comunque la soluzione</button><div id="kSolCode"></div>`;
    } else {
      box.innerHTML = `<p class="sim-hint">Disponibile dopo un confronto riuscito, oppure su richiesta dopo il primo tentativo.</p>`;
      return;
    }
    $("#kSolBtn").addEventListener("click", async () => {
      if (!cur.passed[level] && !(await window.APP.confirm("Non hai ancora superato il confronto. Vuoi vedere la soluzione di riferimento?"))) return;
      $("#kSolCode").innerHTML = `<div class="quiz-controls"><button class="btn secondary small" id="kSolCopy">copia</button></div><pre><code>${esc(inst.solution)}</code></pre>`;
      $("#kSolCopy").addEventListener("click", () => copy(inst.solution, "soluzione"));
      $("#kSolBtn").remove();
    });
  }

  // ---- timer per il foglio bianco
  function startTimer() {
    timer.t0 = Date.now();
    timer.id = setInterval(tick, 1000); tick();
    const b = $("#kTimer"); if (b) b.textContent = "ferma il timer";
  }
  function stopTimer() {
    if (timer.id) clearInterval(timer.id);
    timer.id = null;
    const b = $("#kTimer"); if (b) b.textContent = "avvia il timer";
  }
  function tick() {
    const el = $("#kClock"); if (!el || !cur) return stopTimer();
    const sec = Math.floor((Date.now() - timer.t0) / 1000);
    el.textContent = `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
    el.classList.toggle("over", sec > cur.k.tempi[cur.level - 1] * 60);
  }

  // ---- tab e montaggio
  function setTab(t) {
    tab = t;
    $$(".lab-tabs button").forEach(b => { const on = b.dataset.tab === t; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
    $("#labKata").classList.toggle("hidden", t !== "kata");
    $("#labManuale").classList.toggle("hidden", t !== "manuale");
    if (t === "manuale") renderManuale();
  }
  function mount() {
    if (mounted) { if (!cur) renderList(); return; }
    mounted = true;
    $$(".lab-tabs button").forEach(b => b.addEventListener("click", () => { if (b.dataset.tab === "kata" && cur) closeKata(); setTab(b.dataset.tab); }));
    // un solo listener per tutti i link (schede, kata, copia)
    $("#view-lab").addEventListener("click", e => {
      const fn = e.target.closest(".fnlink"); if (fn) { showFn(fn.dataset.fn); return; }
      const kl = e.target.closest("[data-kata]"); if (kl) { openKata(kl.dataset.kata); return; }
      const cp = e.target.closest("[data-copy]"); if (cp) copy(cp.dataset.copy, cp.dataset.what);
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeFn(); });
    renderList();
    setTab("kata");
  }
  window.LAB_UI = { mount, dueCount: () => KATA.filter(isDue).length };
})();
