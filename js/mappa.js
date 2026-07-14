// Mappa mentale interattiva: albero espandibile con pan/zoom, ricerca e pannello di spiegazione.
// Il montaggio è differito (mount() lo chiama app.js alla prima apertura della vista),
// così qui possiamo usare window.APP, definito da app.js.
(function () {
  "use strict";
  const $ = sel => document.querySelector(sel);
  const HGAP = 38;      // distanza orizzontale fra colonne
  const VGAP = 12;      // distanza verticale fra fratelli
  const BRANCHGAP = 22; // spazio extra fra due capitoli dello stesso lato
  const PAD = 40;       // margine attorno alla mappa
  const MINK = 0.35, MAXK = 2.2;

  const N = {};       // id -> nodo
  const PARENT = {};  // id -> nodo padre
  const CHAPTER = {}; // id -> id del capitolo di appartenenza (c1..c4) → colore
  let mounted = false, collapsed = new Set(), selected = null, query = "";
  let view = { x: 0, y: 0, k: 1 };
  let stage, canvas, svg, panel, zoomLbl;

  const strip = html => String(html || "").replace(/<[^>]*>/g, " ");

  // indicizza l'albero: padri, profondità, capitolo di appartenenza, topic ereditato
  function index(node, parent, depth) {
    N[node.id] = node;
    node._depth = depth;
    if (parent) PARENT[node.id] = parent;
    if (!node.topic && parent) node.topic = parent.topic;
    CHAPTER[node.id] = depth <= 1 ? node.id : CHAPTER[parent.id];
    node._search = (node.label + " " + strip(node.desc) + " " + strip(node.tip) + " " + strip(node.code)).toLowerCase();
    (node.children || []).forEach(c => index(c, node, depth + 1));
  }
  index(window.MAPPA, null, 0);

  const ALL = Object.values(N).filter(n => n.id !== "root");
  const kids = n => n.children || [];
  const isOpen = n => !collapsed.has(n.id);
  const shownKids = n => (isOpen(n) ? kids(n) : []);
  const chapterIdx = id => ["c1", "c2", "c3", "c4"].indexOf(CHAPTER[id]) + 1;

  function ancestors(n) {
    const out = [];
    for (let p = PARENT[n.id]; p; p = PARENT[p.id]) out.unshift(p);
    return out;
  }

  // ---------- stato "ripassato" (persistito da app.js insieme al resto) ----------
  const doneMap = () => (window.APP && window.APP.mapStore()) || {};
  const isDone = id => !!doneMap()[id];

  function renderProgress() {
    const done = ALL.filter(n => isDone(n.id)).length;
    const pct = Math.round(100 * done / ALL.length);
    const bar = $("#mapProg");
    if (bar) bar.innerHTML = `<div class="mapprog-bar"><div style="width:${pct}%"></div></div>
      <span class="mapprog-num">${done}/${ALL.length} ripassati</span>`;
  }

  // ---------- layout ----------
  function visibleNodes() {
    const out = [];
    (function walk(n) { out.push(n); shownKids(n).forEach(walk); })(window.MAPPA);
    return out;
  }

  function layout(els) {
    const root = window.MAPPA;
    const size = n => ({ w: els[n.id].offsetWidth, h: els[n.id].offsetHeight });
    visibleNodes().forEach(n => { const s = size(n); n._w = s.w; n._h = s.h; });

    const chapters = kids(root);
    const half = Math.ceil(chapters.length / 2);
    const sides = { r: chapters.slice(0, half), l: chapters.slice(half) };

    root._x = -root._w / 2; root._y = 0;

    Object.keys(sides).forEach(side => {
      const roots = sides[side];
      if (!roots.length) return;

      const subtree = n => { const out = [n]; shownKids(n).forEach(c => out.push(...subtree(c))); return out; };
      const on = roots.flatMap(subtree);

      // larghezza massima per ogni colonna (profondità relativa: capitolo = 1)
      const maxW = {};
      on.forEach(n => { maxW[n._depth] = Math.max(maxW[n._depth] || 0, n._w); });

      // distanza dal centro della radice al bordo interno della colonna d
      const off = { 1: root._w / 2 + HGAP };
      for (let d = 2; maxW[d - 1] != null; d++) off[d] = off[d - 1] + maxW[d - 1] + HGAP;

      // y: le foglie si impilano, i padri si centrano sui figli
      let cursor = 0;
      const place = n => {
        const cs = shownKids(n);
        if (!cs.length) { n._y = cursor + n._h / 2; cursor += n._h + VGAP; }
        else {
          cs.forEach(place);
          n._y = (cs[0]._y + cs[cs.length - 1]._y) / 2;
          const bottom = n._y + n._h / 2 + VGAP;   // un padre alto non deve toccare il fratello successivo
          if (bottom > cursor) cursor = bottom;
        }
        n._side = side;
        n._x = side === "r" ? off[n._depth] : -(off[n._depth] + n._w);
      };
      roots.forEach(r => { place(r); cursor += BRANCHGAP; });

      // centra verticalmente il lato attorno alla radice
      const top = Math.min(...on.map(n => n._y - n._h / 2));
      const bot = Math.max(...on.map(n => n._y + n._h / 2));
      const shift = -(top + bot) / 2;
      on.forEach(n => n._y += shift);
    });

    // normalizza in coordinate positive e dimensiona lo stage
    const all = visibleNodes();
    const minX = Math.min(...all.map(n => n._x)) - PAD;
    const minY = Math.min(...all.map(n => n._y - n._h / 2)) - PAD;
    const maxX = Math.max(...all.map(n => n._x + n._w)) + PAD;
    const maxY = Math.max(...all.map(n => n._y + n._h / 2)) + PAD;
    all.forEach(n => { n._x -= minX; n._y -= minY; });
    return { w: maxX - minX, h: maxY - minY };
  }

  // ---------- disegno ----------
  function nodeEl(n) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "mapnode m" + chapterIdx(n.id) + (n._depth === 0 ? " root" : n._depth === 1 ? " lvl1" : "");
    b.dataset.id = n.id;
    const hasKids = kids(n).length;
    b.innerHTML = `<span class="mn-check" aria-hidden="true">✓</span>
      <span class="mn-label">${n.label}</span>
      ${n.code ? `<span class="mn-code" title="ha il codice">{}</span>` : ""}
      ${hasKids ? `<span class="mn-tog" role="presentation">${isOpen(n) ? "−" : "+" + kids(n).length}</span>` : ""}`;
    b.setAttribute("aria-expanded", hasKids ? String(isOpen(n)) : "");
    return b;
  }

  function render(keepView) {
    const before = { ...view };
    stage.querySelectorAll(".mapnode").forEach(e => e.remove());

    const vis = visibleNodes();
    const els = {};
    vis.forEach(n => { const e = nodeEl(n); els[n.id] = e; stage.appendChild(e); });

    const size = layout(els);
    stage.style.width = size.w + "px";
    stage.style.height = size.h + "px";
    svg.setAttribute("viewBox", `0 0 ${size.w} ${size.h}`);
    svg.setAttribute("width", size.w);
    svg.setAttribute("height", size.h);

    const q = query.trim().toLowerCase();
    const hits = q ? vis.filter(n => n.id !== "root" && n._search.includes(q)) : [];
    const hitIds = new Set(hits.map(n => n.id));

    vis.forEach(n => {
      const e = els[n.id];
      e.style.left = n._x + "px";
      e.style.top = (n._y - n._h / 2) + "px";
      e.classList.toggle("done", isDone(n.id));
      e.classList.toggle("sel", selected === n.id);
      if (q) e.classList.toggle("hit", hitIds.has(n.id));
      if (q) e.classList.toggle("dim", !hitIds.has(n.id) && n.id !== "root");
    });

    // archi
    let d = "";
    const path = (p, n) => {
      const side = n._side;
      const y1 = p._y, y2 = n._y;
      const x1 = side === "r" ? p._x + p._w : p._x;
      const x2 = side === "r" ? n._x : n._x + n._w;
      const c = (x2 - x1) * .45;
      return `<path class="maplink m${chapterIdx(n.id)}${selected && onPath(n) ? " lit" : ""}" d="M${x1},${y1} C${x1 + c},${y1} ${x2 - c},${y2} ${x2},${y2}"/>`;
    };
    vis.forEach(n => { const p = PARENT[n.id]; if (p) d += path(p, n); });
    svg.innerHTML = d;

    renderProgress();
    if (keepView) { view = before; applyView(); }
  }

  // il nodo n sta sul cammino radice → nodo selezionato?
  function onPath(n) {
    if (!selected) return false;
    const chain = new Set([selected, ...ancestors(N[selected]).map(x => x.id)]);
    return chain.has(n.id);
  }

  // ---------- pan / zoom ----------
  function applyView() {
    stage.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.k})`;
    if (zoomLbl) zoomLbl.textContent = Math.round(view.k * 100) + "%";
  }
  function clampK(k) { return Math.min(MAXK, Math.max(MINK, k)); }
  function zoomAt(cx, cy, factor) {
    const k = clampK(view.k * factor);
    const s = k / view.k;
    view.x = cx - (cx - view.x) * s;
    view.y = cy - (cy - view.y) * s;
    view.k = k;
    applyView();
  }
  function fit() {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    const sw = stage.offsetWidth, sh = stage.offsetHeight;
    if (!sw || !sh) return;
    view.k = clampK(Math.min(cw / sw, ch / sh, 1));
    view.x = (cw - sw * view.k) / 2;
    view.y = (ch - sh * view.k) / 2;
    applyView();
  }
  function centerOn(n) {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    view.x = cw / 2 - (n._x + n._w / 2) * view.k;
    view.y = ch / 2 - n._y * view.k;
    applyView();
  }

  // Aprire/chiudere un ramo rimescola il layout: teniamo il nodo su cui si è cliccato
  // fermo sullo schermo, altrimenti la mappa "salta" sotto il puntatore.
  function anchored(id, change) {
    const n = N[id];
    const bx = n._x, by = n._y;
    change();
    render(true);
    if (bx != null && n._x != null) {
      view.x += (bx - n._x) * view.k;
      view.y += (by - n._y) * view.k;
      applyView();
    }
  }

  // ---------- pannello ----------
  function select(id) {
    selected = id;
    const n = N[id];
    // aprire il ramo fa parte del click sul nodo; per chiuderlo c'è il pulsante − / +
    anchored(id, () => { if (kids(n).length && !isOpen(n)) collapsed.delete(id); });
    renderPanel();
  }

  function renderPanel() {
    if (!selected) {
      panel.innerHTML = `<div class="mp-empty">
        <p><b>Clicca un nodo</b> per leggerne la spiegazione.</p>
        <p>Il <span class="mp-key">−</span> / <span class="mp-key">+</span> sul nodo apre e chiude il ramo. Trascina per spostarti, rotellina per lo zoom.</p>
        <p>Segna come <b>ripassato</b> ciò che sai già: la barra qui sopra tiene il conto.</p></div>`;
      return;
    }
    const n = N[selected];
    const crumb = ancestors(n).map(a => `<button class="mp-crumb-a" data-goto="${a.id}">${a.label}</button>`).join('<span class="mp-crumb-s">›</span>');
    const sim = n.sim && window.SIMS && window.SIMS.some(s => s.id === n.sim) ? n.sim : null;
    const topic = n.topic && window.TOPICS[n.topic] ? window.TOPICS[n.topic] : null;

    panel.innerHTML = `
      <div class="mp-crumb">${crumb || "&nbsp;"}</div>
      <h2 class="mp-title m${chapterIdx(n.id)}">${n.label}</h2>
      ${topic ? `<span class="badge acc">${topic}</span>` : ""}
      <div class="mp-body">${n.desc || "<p class='note'>—</p>"}</div>
      ${n.code ? `<div class="mp-codewrap"><div class="mp-codeh">${n.codeTitle || "codice"}</div><pre class="mp-code">${n.code}</pre></div>` : ""}
      ${n.tip ? `<div class="mp-tip"><b>all'esame</b> ${n.tip}</div>` : ""}
      ${kids(n).length ? `<div class="mp-kids">${kids(n).map(c => `<button class="mp-kid" data-goto="${c.id}">${c.label}</button>`).join("")}</div>` : ""}
      <div class="mp-actions">
        <label class="mp-done"><input type="checkbox" id="mpDone" ${isDone(n.id) ? "checked" : ""}> ripassato</label>
        ${n.topic ? `<button class="btn small secondary" data-act="quiz">allenati col quiz</button>` : ""}
        ${n.topic ? `<button class="btn small secondary" data-act="oral">flashcard</button>` : ""}
        ${sim ? `<button class="btn small" data-act="sim">apri la simulazione</button>` : ""}
      </div>`;

    panel.querySelectorAll("[data-goto]").forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.goto;
      ancestors(N[id]).forEach(a => collapsed.delete(a.id));
      select(id);
      if (N[id]._x != null) centerOn(N[id]);
    }));
    const done = panel.querySelector("#mpDone");
    if (done) done.addEventListener("change", () => {
      window.APP.mapToggle(n.id, done.checked);
      render(true);
    });
    panel.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", () => {
      const a = b.dataset.act;
      if (a === "quiz") window.APP.quizTopic(n.topic);
      else if (a === "oral") window.APP.oralTopic(n.topic);
      else if (a === "sim") window.APP.openSimById(sim);
    }));
  }

  // ---------- montaggio ----------
  function mount() {
    if (mounted) { render(true); return; }
    mounted = true;
    canvas = $("#mapCanvas"); stage = $("#mapStage"); panel = $("#mapPanel"); zoomLbl = $("#mapZoomLbl");
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "maplinks");
    stage.appendChild(svg);

    // di default: capitoli e sezioni aperti, foglie chiuse (mappa leggibile a colpo d'occhio)
    ALL.forEach(n => { if (kids(n).length && ancestors(n).length >= 2) collapsed.add(n.id); });

    // click sui nodi (delega): il toggle apre/chiude, il resto seleziona
    stage.addEventListener("click", e => {
      const tog = e.target.closest(".mn-tog");
      const node = e.target.closest(".mapnode");
      if (!node) return;
      const id = node.dataset.id;
      if (tog) {
        anchored(id, () => { if (collapsed.has(id)) collapsed.delete(id); else collapsed.add(id); });
        return;
      }
      select(id);
    });

    // trascinamento (mouse e touch)
    let drag = null;
    canvas.addEventListener("pointerdown", e => {
      if (e.target.closest(".mapnode")) return;
      drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
      canvas.setPointerCapture(e.pointerId);
      canvas.classList.add("dragging");
    });
    canvas.addEventListener("pointermove", e => {
      if (!drag) return;
      view.x = drag.vx + (e.clientX - drag.x);
      view.y = drag.vy + (e.clientY - drag.y);
      applyView();
    });
    const endDrag = () => { drag = null; canvas.classList.remove("dragging"); };
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);

    // rotellina/trackpad: sposta la mappa; con ctrl/⌘/shift (o pinch) fa zoom sul puntatore
    canvas.addEventListener("wheel", e => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        const r = canvas.getBoundingClientRect();
        zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.12 : 1 / 1.12);
      } else { view.x -= e.deltaX; view.y -= e.deltaY; applyView(); }
    }, { passive: false });

    $("#mapIn").addEventListener("click", () => zoomAt(canvas.clientWidth / 2, canvas.clientHeight / 2, 1.2));
    $("#mapOut").addEventListener("click", () => zoomAt(canvas.clientWidth / 2, canvas.clientHeight / 2, 1 / 1.2));
    $("#mapFit").addEventListener("click", () => { render(true); fit(); });
    $("#mapExpand").addEventListener("click", () => { collapsed.clear(); render(true); fit(); });
    $("#mapCollapse").addEventListener("click", () => {
      collapsed = new Set(ALL.filter(n => kids(n).length && ancestors(n).length >= 1).map(n => n.id));
      render(true); fit();
    });

    const search = $("#mapSearch");
    search.addEventListener("input", () => {
      query = search.value;
      const q = query.trim().toLowerCase();
      if (q) ALL.forEach(n => { if (n._search.includes(q)) ancestors(n).forEach(a => collapsed.delete(a.id)); });
      render(true);
      const first = ALL.find(n => q && n._search.includes(q));
      if (first && first._x != null) centerOn(first);
    });
    search.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        const q = query.trim().toLowerCase();
        const first = ALL.find(n => q && n._search.includes(q));
        if (first) { select(first.id); centerOn(first); }
      } else if (e.key === "Escape") { search.value = ""; query = ""; render(true); }
    });

    render();
    renderPanel();
    fit();
  }

  window.MAPPA_UI = {
    mount,
    total() { return ALL.length; },
    // rilancia il fit quando la vista diventa visibile (le misure servono a elemento montato)
    refit() { if (mounted) { render(true); fit(); } }
  };
})();
