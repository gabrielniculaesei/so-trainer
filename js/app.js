// Logica dell'app: navigazione, quiz, esercizi, esame, orale, aperte, statistiche
(function () {
  "use strict";
  const $ = sel => document.querySelector(sel);
  const $$ = sel => [...document.querySelectorAll(sel)];
  const LETTERS = ["A", "B", "C", "D", "E", "F"];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // salvataggio in localStorage
  const KEY = "so_trainer_v2", OLD_KEY = "so_trainer_v1", SKEY = "so_trainer_session";
  const DAY = 86400000;
  // Leitner: box 1..5 → giorni al prossimo ripasso
  const SRS_DAYS = [1, 1, 3, 7, 14, 30];
  let store = { mcq: {}, oral: {}, exams: [], exQ: {}, theme: null };
  let migratedV1 = false;
  (function loadStore() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { store = Object.assign(store, JSON.parse(raw)); return; }
      // migrazione dallo schema v1 (preserva i contatori, fonde "aperte" nell'orale)
      const old = localStorage.getItem(OLD_KEY);
      if (old) {
        const o = JSON.parse(old);
        store.mcq = o.mcq || {};
        store.oral = Object.assign({}, o.oral || {}, o.aperte || {});
        store.theme = o.theme || null;
        migratedV1 = true;
      }
    } catch (e) { }
  })();
  store.mcq = store.mcq || {}; store.oral = store.oral || {};
  store.exams = store.exams || []; store.exQ = store.exQ || {};
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { } };
  if (migratedV1) save(); // rendi durevole la migrazione fin dal primo avvio

  function recordMcq(id, ok) {
    const s = store.mcq[id] || { a: 0, c: 0 };
    s.a++; if (ok) s.c++;
    s.last = ok ? 1 : 0; s.ts = Date.now();
    store.mcq[id] = s; save();
  }
  // flashcard (deck orale unificato) con ripetizione dilazionata tipo Leitner
  function recordCard(id, ok) {
    const s = store.oral[id] || { a: 0, c: 0, box: 0 };
    s.a++; if (ok) s.c++;
    s.box = ok ? Math.min(5, (s.box || 0) + 1) : 1;
    s.due = Date.now() + SRS_DAYS[s.box] * DAY;
    s.last = ok ? 1 : 0; s.ts = Date.now();
    store.oral[id] = s; save();
  }
  function recordExItem(id, ok) {
    const s = store.exQ[id] || { a: 0, c: 0 };
    s.a++; if (ok) s.c++; s.ts = Date.now();
    store.exQ[id] = s; save();
  }

  // tema chiaro/scuro
  function applyTheme() {
    const pref = store.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = pref;
    const t = $("#themeToggle");
    t.textContent = pref === "dark" ? "light" : "dark";
    t.setAttribute("aria-label", pref === "dark" ? "passa al tema chiaro" : "passa al tema scuro");
  }
  $("#themeToggle").addEventListener("click", () => {
    store.theme = (document.documentElement.dataset.theme === "dark") ? "light" : "dark";
    save(); applyTheme();
  });

  // navigazione tra le sezioni
  const views = ["home", "quiz", "esercizi", "sim", "esame", "orale", "stats"];
  async function show(name) {
    // conferma prima di abbandonare un esame in corso
    if (exam && !exam.done && name !== "esame") {
      const ok = await confirmDialog("Hai un esame in corso. Vuoi davvero uscire? Il compito verrà interrotto.");
      if (!ok) return;
      if (exam.timer) clearInterval(exam.timer);
      exam = null; clearSession();
      $("#examSetup").classList.remove("hidden");
      $("#examPlay").classList.add("hidden");
      $("#examSubmitBtn").classList.remove("hidden");
    }
    views.forEach(v => { $("#view-" + v).classList.toggle("active", v === name); });
    $$("nav button").forEach(b => b.classList.toggle("active", b.dataset.view === name));
    if (name !== "sim" && window.SIMKIT) window.SIMKIT.stopAll(); // niente autoplay in background
    window.scrollTo(0, 0);
    if (name === "home") { focusTerm(); renderToday(); }
    if (name === "stats") renderStats();
  }
  $$("nav button").forEach(b => b.addEventListener("click", () => show(b.dataset.view)));
  $$(".app").forEach(c => c.addEventListener("click", () => show(c.dataset.view)));

  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };

  // chip per filtrare per argomento (bottoni accessibili da tastiera).
  // Con macro=true i chip sono i 4 macro-argomenti (window.MACRO) invece dei 9 topic.
  function buildChips(containerId, onChange, macro) {
    const cont = $(containerId);
    cont.innerHTML = "";
    const mkChip = (label, topic, on) => {
      const c = document.createElement("button");
      c.type = "button";
      c.className = "chip" + (on ? " on" : "");
      c.textContent = label; c.dataset.topic = topic;
      c.setAttribute("aria-pressed", on ? "true" : "false");
      return c;
    };
    const all = mkChip("Tutti", "*", true);
    cont.appendChild(all);
    const entries = macro
      ? Object.entries(window.MACRO).map(([k, v]) => [k, v.label])
      : Object.entries(window.TOPICS);
    entries.forEach(([k, label]) => cont.appendChild(mkChip(label, k, false)));
    const syncAria = () => $$(containerId + " .chip").forEach(c => c.setAttribute("aria-pressed", c.classList.contains("on") ? "true" : "false"));
    cont.addEventListener("click", e => {
      const chip = e.target.closest(".chip"); if (!chip) return;
      if (chip.dataset.topic === "*") {
        $$(containerId + " .chip").forEach(c => c.classList.remove("on"));
        chip.classList.add("on");
      } else {
        chip.classList.toggle("on");
        all.classList.remove("on");
        if (!$$(containerId + " .chip.on").length) all.classList.add("on");
      }
      syncAria();
      onChange && onChange();
    });
  }
  function selectedTopics(containerId) {
    const on = $$(containerId + " .chip.on").map(c => c.dataset.topic);
    if (on.includes("*") || !on.length) return null; // tutti
    // espande gli eventuali macro-argomenti nei topic di dettaglio che contengono
    const set = new Set();
    on.forEach(t => {
      if (window.MACRO && window.MACRO[t]) window.MACRO[t].topics.forEach(x => set.add(x));
      else set.add(t);
    });
    return set;
  }

  // Quiz a risposta multipla
  let quiz = null; // {pool, idx, score, answered}

  function quizPool() {
    const topics = selectedTopics("#quizChips");
    let pool = window.MCQ.filter(q => !topics || topics.has(q.topic));
    if ($("#quizOnlyWrong").checked) {
      // "sbagliate di recente": conta l'ultimo esito, così il mazzo si svuota consolidando
      pool = pool.filter(q => { const s = store.mcq[q.id]; return s && s.last === 0; });
    }
    return pool;
  }
  // scelta di quante domande fare (0 = tutte quelle disponibili)
  let quizWanted = 20;
  (function buildQtyChips() {
    const cont = $("#quizQty");
    [["10", 10], ["20", 20], ["30", 30], ["50", 50], ["tutte", 0]].forEach(([label, n]) => {
      const c = document.createElement("button");
      c.type = "button";
      c.className = "chip" + (n === quizWanted ? " on" : "");
      c.textContent = label; c.dataset.n = n;
      c.setAttribute("aria-pressed", n === quizWanted ? "true" : "false");
      cont.appendChild(c);
    });
    cont.addEventListener("click", e => {
      const chip = e.target.closest(".chip"); if (!chip) return;
      $$("#quizQty .chip").forEach(c => { c.classList.remove("on"); c.setAttribute("aria-pressed", "false"); });
      chip.classList.add("on"); chip.setAttribute("aria-pressed", "true");
      quizWanted = +chip.dataset.n;
      updateQuizCount();
    });
  })();
  function quizTake() {
    const avail = quizPool().length;
    return quizWanted === 0 ? avail : Math.min(quizWanted, avail);
  }
  function updateQuizCount() {
    const avail = quizPool().length;
    const take = quizTake();
    $("#quizCount").textContent = avail === 0
      ? "nessuna domanda disponibile"
      : `${take} domande su ${avail} disponibili`;
    $("#quizStartBtn").disabled = avail === 0;
  }
  buildChips("#quizChips", updateQuizCount, true);
  $("#quizOnlyWrong").addEventListener("change", updateQuizCount);

  function startQuiz(pool) {
    if (!pool.length) return;
    quiz = { pool, idx: 0, score: 0, answered: false, wrong: [] };
    $("#quizSetup").classList.add("hidden");
    $("#quizPlay").classList.remove("hidden");
    $("#quizEnd").classList.add("hidden");
    renderQuizQ();
    saveSession();
  }
  $("#quizStartBtn").addEventListener("click", () => startQuiz(shuffle(quizPool()).slice(0, quizTake())));

  function renderQuizQ() {
    const q = quiz.pool[quiz.idx];
    quiz.answered = false;
    quiz.order = shuffle(q.options.map((_, i) => i));
    $("#quizProgress > div").style.width = (100 * quiz.idx / quiz.pool.length) + "%";
    $("#quizMeta").innerHTML = `<span class="badge acc">${window.TOPICS[q.topic]}</span>
      <span class="badge">Domanda ${quiz.idx + 1} / ${quiz.pool.length}</span>
      <span class="badge">Punteggio: ${quiz.score}</span>`;
    $("#quizQText").innerHTML = q.q;
    const box = $("#quizOptions"); box.innerHTML = "";
    quiz.order.forEach((orig, i) => {
      const b = document.createElement("button");
      b.className = "opt";
      b.innerHTML = `<span class="letter">${LETTERS[i]}</span><span>${q.options[orig]}</span>`;
      b.addEventListener("click", () => answerQuiz(orig, b));
      box.appendChild(b);
    });
    $("#quizExpl").classList.add("hidden");
    $("#quizNextBtn").classList.add("hidden");
  }

  function answerQuiz(orig, btn) {
    if (quiz.answered) return;
    quiz.answered = true;
    const q = quiz.pool[quiz.idx];
    const ok = orig === q.correct;
    if (ok) quiz.score++;
    else quiz.wrong.push({ q, chosen: orig });
    recordMcq(q.id, ok);
    saveSession();
    $$("#quizOptions .opt").forEach((b, i) => {
      b.disabled = true;
      const o = quiz.order[i];
      if (o === q.correct) b.classList.add("correct");
      else if (b === btn) b.classList.add("wrong");
      else b.classList.add("faded");
    });
    $("#quizExpl").innerHTML = `<b>${ok ? "Corretto." : "Sbagliato."}</b> ${q.expl}`;
    $("#quizExpl").classList.remove("hidden");
    $("#quizNextBtn").classList.remove("hidden");
    $("#quizNextBtn").focus();
  }

  $("#quizNextBtn").addEventListener("click", nextQuizQ);
  function nextQuizQ() {
    quiz.idx++;
    if (quiz.idx >= quiz.pool.length) {
      $("#quizPlay").classList.add("hidden");
      $("#quizEnd").classList.remove("hidden");
      clearSession();
      const pct = Math.round(100 * quiz.score / quiz.pool.length);
      const band = pct >= 90 ? "Eccellente: da 28-30 e lode."
        : pct >= 75 ? "Molto bene, sei sulla buona strada (25-27)."
          : pct >= 60 ? "Sufficiente, ma ripassa gli argomenti dove hai sbagliato (18-24)."
            : "Sotto il 60%: ripassa la teoria e riprova.";
      let html = `<div class="result-big">${quiz.score} / ${quiz.pool.length} (${pct}%)</div><p>${band}</p>`;
      if (quiz.wrong.length) {
        html += `<div class="review"><h3 class="review-h">da rivedere — ${quiz.wrong.length} ${quiz.wrong.length === 1 ? "errore" : "errori"}</h3>`;
        quiz.wrong.forEach(w => {
          html += `<div class="review-item">
            <div class="review-q">${w.q.q}</div>
            <div class="review-line err"><span class="review-tag">tua risposta</span> ${w.chosen == null ? "—" : w.q.options[w.chosen]}</div>
            <div class="review-line ok"><span class="review-tag">corretta</span> ${w.q.options[w.q.correct]}</div>
            <div class="review-expl">${w.q.expl}</div>
          </div>`;
        });
        html += `<button class="btn small" id="quizRedoWrong">rifai solo queste</button></div>`;
      } else {
        html += `<p class="note">Nessun errore in questa sessione. Ottimo lavoro.</p>`;
      }
      $("#quizEndText").innerHTML = html;
      const rb = $("#quizRedoWrong");
      if (rb) rb.addEventListener("click", () => startQuiz(shuffle(quiz.wrong.map(w => w.q))));
    } else { renderQuizQ(); saveSession(); }
  }
  $("#quizRestartBtn").addEventListener("click", () => { $("#quizSetup").classList.remove("hidden"); $("#quizEnd").classList.add("hidden"); updateQuizCount(); });
  $("#quizAbortBtn").addEventListener("click", () => { clearSession(); $("#quizSetup").classList.remove("hidden"); $("#quizPlay").classList.add("hidden"); updateQuizCount(); });

  // scorciatoie tastiera per il quiz
  document.addEventListener("keydown", e => {
    if (!$("#view-quiz").classList.contains("active") || $("#quizPlay").classList.contains("hidden")) return;
    if (!quiz) return;
    if (!quiz.answered && e.key >= "1" && e.key <= "6") {
      const i = +e.key - 1;
      const btns = $$("#quizOptions .opt");
      if (btns[i]) btns[i].click();
    } else if (quiz.answered && (e.key === "Enter" || e.key === "n")) nextQuizQ();
  });

  // Esercizi risolti e generatori
  buildChips("#exChips", renderEsercizi);
  function renderEsercizi() {
    const topics = selectedTopics("#exChips");
    // generatori
    const gbox = $("#genList"); gbox.innerHTML = "";
    window.GENERATORS.filter(g => !topics || topics.has(g.topic)).forEach(g => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<div class="qmeta"><span class="badge acc">${window.TOPICS[g.topic]}</span><span class="badge">parametri casuali</span></div>
        <h3>${g.title}</h3>
        <div class="extext"></div>
        <div class="sol hidden"></div>
        <div class="quiz-controls">
          <button class="btn small gen">Genera esercizio</button>
          <button class="btn small secondary showsol hidden">Mostra soluzione</button>
        </div>`;
      const tx = card.querySelector(".extext"), so = card.querySelector(".sol");
      const genBtn = card.querySelector(".gen"), solBtn = card.querySelector(".showsol");
      genBtn.addEventListener("click", () => {
        const inst = g.gen();
        tx.innerHTML = inst.text;
        so.innerHTML = "<h4>Soluzione</h4>" + inst.sol;
        so.classList.add("hidden");
        solBtn.classList.remove("hidden");
        solBtn.textContent = "Mostra soluzione";
        genBtn.textContent = "Nuovo esercizio";
      });
      solBtn.addEventListener("click", () => {
        so.classList.toggle("hidden");
        solBtn.textContent = so.classList.contains("hidden") ? "Mostra soluzione" : "Nascondi soluzione";
      });
      gbox.appendChild(card);
    });
    // statici
    const sbox = $("#exList"); sbox.innerHTML = "";
    window.ESERCIZI.filter(x => !topics || topics.has(x.topic)).forEach(x => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<div class="qmeta"><span class="badge acc">${window.TOPICS[x.topic]}</span></div>
        <h3>${x.title}</h3>
        <div class="extext">${x.text}</div>
        <div class="sol hidden"><h4>Soluzione</h4>${x.sol}</div>
        <div class="quiz-controls"><button class="btn small secondary showsol">Mostra soluzione</button></div>`;
      const so = card.querySelector(".sol"), btn = card.querySelector(".showsol");
      btn.addEventListener("click", () => {
        so.classList.toggle("hidden");
        btn.textContent = so.classList.contains("hidden") ? "Mostra soluzione" : "Nascondi soluzione";
      });
      sbox.appendChild(card);
    });
  }
  renderEsercizi();

  // Simulazioni interattive degli algoritmi (definite in js/sims*.js):
  // menu a griglia → pagina dedicata con player, confronti e guida
  buildChips("#simChips", renderSimMenu);
  function renderSimMenu() {
    const topics = selectedTopics("#simChips");
    const box = $("#simList"); box.innerHTML = "";
    window.SIMS.filter(s => !topics || topics.has(s.topic)).forEach(s => {
      const t = document.createElement("button");
      t.className = "simtile";
      t.innerHTML = `<span class="simtile-icon">${s.icon || "SIM"}</span>
        <span class="simtile-body">
          <span class="simtile-title">${s.name || s.title}</span>
          <span class="simtile-desc">${s.desc}</span>
          <span class="badge acc">${window.TOPICS[s.topic]}</span>
        </span>`;
      t.addEventListener("click", () => openSim(s));
      box.appendChild(t);
    });
  }
  function closeSimDetail() {
    if (window.SIMKIT) window.SIMKIT.stopAll();
    $("#simMount").innerHTML = "";
    $("#simDetail").classList.add("hidden");
    $("#simMenu").classList.remove("hidden");
  }
  function openSim(s) {
    if (window.SIMKIT) window.SIMKIT.stopAll();
    $("#simMenu").classList.add("hidden");
    $("#simDetail").classList.remove("hidden");
    $("#simTopic").textContent = window.TOPICS[s.topic];
    $("#simTitle").textContent = s.name || s.title;
    $("#simLead").innerHTML = s.desc;
    const m = $("#simMount"); m.innerHTML = "";
    s.mount(m);
    $("#simInfo").innerHTML = s.info ? `<h3 class="siminfo-h">guida — cosa stai guardando</h3>${s.info}` : "";
    $("#simInfo").classList.toggle("hidden", !s.info);
    window.scrollTo(0, 0);
  }
  $("#simBackBtn").addEventListener("click", closeSimDetail);
  renderSimMenu();

  // Simulazione d'esame con timer
  let exam = null; // {mcqs:[{q, order, chosen}], exs:[{gen, inst, self}], timer, deadline}
  $("#examStartBtn").addEventListener("click", startExam);

  function startExam() {
    const nM = +$("#examNumMcq").value, nE = +$("#examNumEx").value, mins = +$("#examTimer0").value;
    const mcqs = shuffle(window.MCQ).slice(0, nM).map(q => ({ q, order: shuffle(q.options.map((_, i) => i)), chosen: null }));
    const gens = shuffle(window.GENERATORS).slice(0, nE).map(g => ({ g, inst: g.gen(), self: null }));
    exam = { mcqs, exs: gens, mins, done: false };
    if (mins > 0) exam.deadline = Date.now() + mins * 60000;
    launchExam();
    saveSession();
  }
  // avvia la UI dell'esame dallo stato corrente di `exam` (usato anche dal ripristino sessione)
  function launchExam() {
    $("#examSetup").classList.add("hidden");
    $("#examPlay").classList.remove("hidden");
    $("#examResult").classList.add("hidden");
    $("#examSubmitBtn").classList.remove("hidden");
    renderExam();
    if (exam.mins > 0 && exam.deadline) {
      $("#examTimer").classList.remove("hidden");
      exam.timer = setInterval(tickExam, 500);
      tickExam();
    } else $("#examTimer").classList.add("hidden");
  }
  function tickExam() {
    const left = Math.max(0, exam.deadline - Date.now());
    const m = Math.floor(left / 60000), s = Math.floor(left % 60000 / 1000);
    $("#examTimer").textContent = `${m}:${String(s).padStart(2, "0")}`;
    $("#examTimer").classList.toggle("low", left < 5 * 60000);
    if (left <= 0) { clearInterval(exam.timer); gradeExam(); }
  }

  function renderExam() {
    const box = $("#examQuestions"); box.innerHTML = "";
    exam.mcqs.forEach((m, qi) => {
      const card = document.createElement("div");
      card.className = "card exam-q";
      card.innerHTML = `<div class="qmeta"><span class="badge">Domanda ${qi + 1}</span><span class="badge acc">${window.TOPICS[m.q.topic]}</span></div>
        <div class="qtext">${m.q.q}</div><div class="options"></div>
        <div class="expl hidden"></div>`;
      const opts = card.querySelector(".options");
      m.order.forEach((orig, i) => {
        const b = document.createElement("button");
        b.className = "opt";
        b.innerHTML = `<span class="letter">${LETTERS[i]}</span><span>${m.q.options[orig]}</span>`;
        b.addEventListener("click", () => {
          if (exam.done) return;
          m.chosen = orig;
          [...opts.children].forEach(x => x.classList.remove("correct"));
          b.classList.add("correct");
          saveSession();
        });
        opts.appendChild(b);
      });
      box.appendChild(card);
      m.card = card;
    });
    exam.exs.forEach((x, xi) => {
      const card = document.createElement("div");
      card.className = "card exam-q";
      card.innerHTML = `<div class="qmeta"><span class="badge">Esercizio ${xi + 1}</span><span class="badge acc">${window.TOPICS[x.g.topic]}</span></div>
        <h3>${x.g.title}</h3>
        <div class="extext">${x.inst.text}</div>
        <label style="font-weight:600;font-size:.88rem;display:block;margin-top:.6rem">La tua risposta / i tuoi calcoli:</label>
        <textarea class="answerbox" placeholder="Scrivi qui il procedimento e il risultato..."></textarea>
        <div class="sol hidden"><h4>Soluzione</h4>${x.inst.sol}</div>
        <div class="selfgrade hidden"><b>Autovalutazione:</b>
          <button class="btn small ok sg-ok">corretto</button>
          <button class="btn small danger sg-no">sbagliato</button>
          <span class="sg-state badge"></span></div>`;
      box.appendChild(card);
      x.card = card;
    });
  }

  $("#examSubmitBtn").addEventListener("click", async () => {
    const missing = exam.mcqs.filter(m => m.chosen === null).length;
    if (missing && !(await confirmDialog(`Hai lasciato ${missing} domande senza risposta. Consegnare comunque?`))) return;
    if (exam.timer) clearInterval(exam.timer);
    gradeExam();
  });

  function gradeExam() {
    if (exam.done) return;
    exam.done = true;
    clearSession();
    let right = 0; const wrong = [];
    exam.mcqs.forEach(m => {
      const ok = m.chosen === m.q.correct;
      if (ok) right++; else wrong.push(m.q);
      recordMcq(m.q.id, ok);
      const opts = [...m.card.querySelectorAll(".opt")];
      opts.forEach((b, i) => {
        b.disabled = true;
        const orig = m.order[i];
        b.classList.remove("correct");
        if (orig === m.q.correct) b.classList.add("correct");
        else if (orig === m.chosen) b.classList.add("wrong");
        else b.classList.add("faded");
      });
      const ex = m.card.querySelector(".expl");
      ex.innerHTML = `<b>${ok ? "Corretto." : m.chosen === null ? "Non risposta." : "Sbagliata."}</b> ${m.q.expl}`;
      ex.classList.remove("hidden");
    });
    exam.exs.forEach(x => {
      x.card.querySelector(".sol").classList.remove("hidden");
      x.card.querySelector(".selfgrade").classList.remove("hidden");
      const okB = x.card.querySelector(".sg-ok"), noB = x.card.querySelector(".sg-no"), st = x.card.querySelector(".sg-state");
      const grade = (val) => {
        const first = x.self === null;
        x.self = val;
        st.textContent = val ? "segnato: corretto" : "segnato: sbagliato";
        if (first) recordExItem(x.g.id, val); // registra la prima autovalutazione per le statistiche
        updateExamScore();
      };
      okB.addEventListener("click", () => grade(true));
      noB.addEventListener("click", () => grade(false));
    });
    exam.right = right; exam.wrong = wrong;
    $("#examSubmitBtn").classList.add("hidden");
    $("#examResult").classList.remove("hidden");
    updateExamScore();
    $("#examResult").scrollIntoView({ behavior: "smooth" });
  }

  function updateExamScore() {
    const nM = exam.mcqs.length, nE = exam.exs.length;
    const exOk = exam.exs.filter(x => x.self === true).length;
    const graded = exam.exs.filter(x => x.self !== null).length;
    const tot = nM + nE, pts = exam.right + exOk;
    const pct = Math.round(100 * pts / tot);
    let judge = "";
    if (nE && graded < nE) judge = `<p class="note">Autovaluta gli esercizi (corretto/sbagliato) per completare il punteggio.</p>`;
    else judge = `<p>${pct >= 90 ? "Da 28-30 e lode: completo e senza errori di rilievo." : pct >= 75 ? "Buona padronanza: fascia 25-27." : pct >= 60 ? "Sufficiente: fascia 18-24. Consolida i punti deboli." : "Sotto la soglia del 60%: allo scritto reale non basterebbe. Ripassa e riprova."}</p>`;
    // pulsante per ripassare subito le crocette sbagliate
    const redo = (exam.wrong && exam.wrong.length)
      ? `<div class="quiz-controls" style="justify-content:center"><button class="btn small secondary" id="examRedoWrong">ripassa le ${exam.wrong.length} crocette sbagliate</button></div>` : "";
    $("#examResultText").innerHTML = `<div class="result-big">${pts} / ${tot} (${pct}%)</div>
      <p>Risposte multiple: <b>${exam.right}/${nM}</b>${nE ? ` — Esercizi corretti (autovalutati): <b>${exOk}/${nE}</b>` : ""}</p>${judge}${redo}`;
    const rb = $("#examRedoWrong");
    if (rb) rb.addEventListener("click", () => { const w = exam.wrong.slice(); show("quiz").then(() => startQuiz(shuffle(w))); });
    // salva l'esame nello storico una volta sola, quando è tutto valutato
    if (!exam.saved && (!nE || graded === nE)) {
      exam.saved = true;
      store.exams.push({ ts: Date.now(), nM, nE, mins: exam.mins, right: exam.right, exOk, pct });
      if (store.exams.length > 50) store.exams = store.exams.slice(-50);
      save();
    }
  }
  $("#examNewBtn").addEventListener("click", () => {
    $("#examSetup").classList.remove("hidden");
    $("#examPlay").classList.add("hidden");
    $("#examSubmitBtn").classList.remove("hidden");
    if (exam && exam.timer) clearInterval(exam.timer);
    exam = null; clearSession();
  });

  // Flashcard per l'orale — deck unico (orale + domande aperte di teoria)
  const CARDS = window.ORALI.concat(window.APERTE || []);
  let oral = null;
  buildChips("#oralChips", updateOralCount);
  function oralPool() {
    const topics = selectedTopics("#oralChips");
    return CARDS.filter(q => !topics || topics.has(q.topic));
  }
  // peso per la ripetizione dilazionata: scadute prima, poi mai viste, poi il resto
  function cardWeight(id) {
    const s = store.oral[id];
    if (!s) return 1;                              // mai vista
    if (s.due && s.due <= Date.now()) return 0;    // in scadenza: massima priorità
    return 2 + (s.box || 0);                       // consolidate in fondo
  }
  function dueCount(pool) { return pool.filter(q => { const s = store.oral[q.id]; return s && s.due && s.due <= Date.now(); }).length; }
  function updateOralCount() {
    const pool = oralPool(), due = dueCount(pool), fresh = pool.filter(q => !store.oral[q.id]).length;
    $("#oralCount").textContent = `${pool.length} carte · ${due} in scadenza · ${fresh} mai viste`;
  }
  updateOralCount();

  $("#oralStartBtn").addEventListener("click", () => {
    const pool = shuffle(oralPool()).sort((a, b) => cardWeight(a.id) - cardWeight(b.id));
    if (!pool.length) return;
    oral = { pool, idx: 0, known: 0 };
    $("#oralSetup").classList.add("hidden");
    $("#oralPlay").classList.remove("hidden");
    renderOral();
  });
  function renderOral() {
    const q = oral.pool[oral.idx];
    const s = store.oral[q.id];
    const boxTag = s && s.box ? `<span class="badge">livello ${s.box}/5</span>` : `<span class="badge">nuova</span>`;
    $("#oralMeta").innerHTML = `<span class="badge acc">${window.TOPICS[q.topic]}</span>
      <span class="badge">${oral.idx + 1} / ${oral.pool.length}</span>${boxTag}`;
    $("#oralQ").innerHTML = q.q;
    $("#oralA").innerHTML = q.a;
    $("#oralA").classList.add("hidden");
    if ($("#oralAnswer")) $("#oralAnswer").value = "";
    $("#oralShowBtn").classList.remove("hidden");
    $("#oralGrade").classList.add("hidden");
  }
  $("#oralShowBtn").addEventListener("click", () => {
    $("#oralA").classList.remove("hidden");
    $("#oralShowBtn").classList.add("hidden");
    $("#oralGrade").classList.remove("hidden");
  });
  function oralNext(ok) {
    recordCard(oral.pool[oral.idx].id, ok);
    if (ok) oral.known++;
    oral.idx++;
    if (oral.idx >= oral.pool.length) {
      $("#oralPlay").classList.add("hidden");
      $("#oralSetup").classList.remove("hidden");
      updateOralCount();
      toast(`Fine ripasso: sapevi ${oral.known} carte su ${oral.pool.length}.`);
    } else renderOral();
  }
  $("#oralOkBtn").addEventListener("click", () => oralNext(true));
  $("#oralNoBtn").addEventListener("click", () => oralNext(false));
  $("#oralStopBtn").addEventListener("click", () => { $("#oralPlay").classList.add("hidden"); $("#oralSetup").classList.remove("hidden"); });

  // Terminale interattivo nella home
  const termOut = $("#termOut"), termIn = $("#termIn"), termScr = $("#termScr");
  const NAV = { home: "home", quiz: "quiz", esercizi: "esercizi", esercizio: "esercizi", sim: "sim", simulazioni: "sim", algoritmi: "sim", esame: "esame", orale: "orale", aperte: "orale", aperta: "orale", teoria: "orale", stats: "stats", statistiche: "stats" };
  const PS1 = `<span class="term-ps1">user@so-trainer<span class="term-tld">:~$</span></span>`;
  const termHist = []; let termHistI = 0;

  function focusTerm() { if (termIn) termIn.focus(); }
  function termScroll() { if (termScr) termScr.scrollTop = termScr.scrollHeight; }
  function termPrint(html, cls) {
    const row = document.createElement("div");
    row.className = "term-row" + (cls ? " " + cls : "");
    row.innerHTML = html;
    termOut.appendChild(row);
  }
  function termBoot() {
    if (!termOut) return;
    termOut.innerHTML = "";
    termPrint("SO-Trainer — preparazione teoria di Sistemi Operativi", "term-hi");
    termPrint(`${window.MCQ.length} crocette · ${CARDS.length} flashcard · ${window.ESERCIZI.length} esercizi · ${window.GENERATORS.length} generatori · ${window.SIMS.length} simulazioni`);
    termPrint("Scrivi <b>help</b> per i comandi (prova <b>today</b>), oppure clicca una voce qui sotto.", "term-dim2");
  }
  function termFetch() {
    const L = [
      "user@so-trainer",
      "──────────────────",
      "OS       : SO-Trainer 3.0 (teoria)",
      "Shell    : bash",
      "Crocette : " + window.MCQ.length,
      "Flashcard: " + CARDS.length + " (orale + teoria)",
      "Esercizi : " + window.ESERCIZI.length + " risolti + " + window.GENERATORS.length + " generatori",
      "Sim      : " + window.SIMS.length + " interattive"
    ];
    termPrint("<pre class='term-fetch'>" + L.map(esc).join("\n") + "</pre>");
  }
  function termRun(raw) {
    const input = (raw || "").trim();
    termPrint(`${PS1} ${esc(input)}`, "term-echo");
    if (!input) { termScroll(); return; }
    termHist.push(input); termHistI = termHist.length;
    const cmd = input.replace(/^(\.\/|cd\s+|open\s+|run\s+|start\s+|apri\s+)/i, "").trim();
    const parts = cmd.split(/\s+/);
    const word = (parts[0] || "").toLowerCase();
    const arg = parts.slice(1).join(" ");

    if (word === "help" || word === "?" || word === "aiuto") {
      termPrint("<b>quiz</b> · <b>esercizi</b> · <b>sim</b> · <b>esame</b> · <b>orale</b> · <b>stats</b> — apre la sezione");
      termPrint("<b>today</b> il ripasso del giorno · <b>ls</b> elenca · <b>clear</b> pulisce · <b>whoami</b> · <b>date</b> · <b>neofetch</b>");
      termPrint("puoi anche scrivere <b>./esercizi</b>", "term-dim2");
    } else if (word === "ls" || word === "ll" || word === "dir") {
      termPrint("quiz/   esercizi/   sim/   esame/   orale/   stats/");
    } else if (word === "today" || word === "oggi" || word === "ripasso") {
      termToday();
    } else if (word === "clear" || word === "cls") {
      termOut.innerHTML = ""; return;
    } else if (word === "whoami") {
      termPrint("user");
    } else if (word === "pwd") {
      termPrint("/home/user/so-trainer");
    } else if (word === "date") {
      termPrint(esc(new Date().toLocaleString("it-IT")));
    } else if (word === "echo") {
      termPrint(esc(arg));
    } else if (word === "about" || word === "info" || word === "man") {
      termPrint("Ambiente di studio per la teoria di Sistemi Operativi: crocette, esercizi, simulazione d'esame e flashcard per l'orale.");
    } else if (word === "neofetch" || word === "screenfetch") {
      termFetch();
    } else if (word === "sudo") {
      termPrint("user non è nel file sudoers. Questo incidente sarà segnalato.", "term-err");
    } else if (NAV[word]) {
      termPrint(`avvio <b>${NAV[word]}</b>…`, "term-ok");
      setTimeout(() => show(NAV[word]), 160);
    } else {
      termPrint(`comando non trovato: ${esc(word)} — scrivi <b>help</b>`, "term-err");
    }
    termScroll();
  }
  if (termIn) {
    termBoot();
    termIn.addEventListener("keydown", e => {
      if (e.key === "Enter") { termRun(termIn.value); termIn.value = ""; }
      else if (e.key === "ArrowUp") { if (termHist.length) { termHistI = Math.max(0, termHistI - 1); termIn.value = termHist[termHistI] || ""; e.preventDefault(); } }
      else if (e.key === "ArrowDown") { if (termHist.length) { termHistI = Math.min(termHist.length, termHistI + 1); termIn.value = termHist[termHistI] || ""; e.preventDefault(); } }
    });
    $("#homeTerm").addEventListener("click", e => { if (window.getSelection().toString() === "") focusTerm(); });
  }

  // ---- Ripasso del giorno (home + comando `today`) ----
  function weakestTopic() {
    let worst = null;
    Object.keys(window.TOPICS).forEach(k => {
      const qs = window.MCQ.filter(q => q.topic === k);
      let a = 0, c = 0;
      qs.forEach(q => { const s = store.mcq[q.id]; if (s) { a += s.a; c += s.c; } });
      if (a >= 3) { const pct = c / a; if (!worst || pct < worst.pct) worst = { k, pct }; }
    });
    return worst;
  }
  function todayData() {
    const due = dueCount(CARDS);
    const fresh = CARDS.filter(q => !store.oral[q.id]).length;
    const wrong = window.MCQ.filter(q => { const s = store.mcq[q.id]; return s && s.last === 0; }).length;
    const weak = weakestTopic();
    return { due, fresh, wrong, weak };
  }
  function renderToday() {
    const box = $("#todayBox"); if (!box) return;
    const d = todayData();
    const parts = [];
    if (d.due) parts.push(`<b>${d.due}</b> flashcard in scadenza`);
    if (d.wrong) parts.push(`<b>${d.wrong}</b> crocette sbagliate di recente`);
    if (d.weak) parts.push(`argomento più debole: <b>${window.TOPICS[d.weak.k]}</b> (${Math.round(d.weak.pct * 100)}%)`);
    box.innerHTML = `<div class="today-h">ripasso del giorno</div>
      <p>${parts.length ? parts.join(" · ") : "Nessuno scadenzario ancora: fai un giro di quiz o di flashcard per iniziare."}</p>
      <div class="quiz-controls">
        <button class="btn small" id="todayCards">flashcard in scadenza</button>
        <button class="btn small secondary" id="todayWrong">crocette da rivedere</button>
      </div>`;
    $("#todayCards").addEventListener("click", () => show("orale"));
    $("#todayWrong").addEventListener("click", () => { show("quiz").then(() => { $("#quizOnlyWrong").checked = true; updateQuizCount(); }); });
  }
  function termToday() {
    const d = todayData();
    termPrint("ripasso del giorno", "term-hi");
    termPrint(`flashcard in scadenza : ${d.due}`);
    termPrint(`mai viste             : ${d.fresh}`);
    termPrint(`crocette da rivedere  : ${d.wrong}`);
    termPrint(`argomento più debole  : ${d.weak ? window.TOPICS[d.weak.k] + " (" + Math.round(d.weak.pct * 100) + "%)" : "—"}`);
    termPrint("apri <b>orale</b> per le flashcard o <b>quiz</b> per le crocette.", "term-dim2");
  }

  // ---- Toast e dialogo di conferma (al posto di alert/confirm) ----
  function toast(msg) {
    let t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 3200);
  }
  function confirmDialog(msg) {
    return new Promise(resolve => {
      const back = document.createElement("div");
      back.className = "modal-back";
      back.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
        <p>${esc(msg)}</p>
        <div class="quiz-controls" style="justify-content:flex-end">
          <button class="btn secondary small md-no">annulla</button>
          <button class="btn small md-yes">conferma</button>
        </div></div>`;
      document.body.appendChild(back);
      const done = v => { back.remove(); document.removeEventListener("keydown", onKey); resolve(v); };
      const onKey = e => { if (e.key === "Escape") done(false); else if (e.key === "Enter") done(true); };
      back.querySelector(".md-yes").addEventListener("click", () => done(true));
      back.querySelector(".md-no").addEventListener("click", () => done(false));
      back.addEventListener("click", e => { if (e.target === back) done(false); });
      document.addEventListener("keydown", onKey);
      back.querySelector(".md-yes").focus();
    });
  }

  // ---- Persistenza della sessione in corso (quiz / esame) ----
  function saveSession() {
    try {
      let snap = null;
      if (quiz) snap = { type: "quiz", poolIds: quiz.pool.map(q => q.id), idx: quiz.idx, score: quiz.score, wrong: quiz.wrong.map(w => ({ id: w.q.id, chosen: w.chosen })) };
      else if (exam && !exam.done) snap = {
        type: "exam", mins: exam.mins, deadline: exam.deadline || 0,
        mcqs: exam.mcqs.map(m => ({ id: m.q.id, order: m.order, chosen: m.chosen })),
        exs: exam.exs.map(x => ({ gid: x.g.id, text: x.inst.text, sol: x.inst.sol }))
      };
      if (snap) localStorage.setItem(SKEY, JSON.stringify(snap));
    } catch (e) { }
  }
  function clearSession() { try { localStorage.removeItem(SKEY); } catch (e) { } }
  function resumeQuiz(s) {
    const byId = {}; window.MCQ.forEach(q => byId[q.id] = q);
    const pool = s.poolIds.map(id => byId[id]).filter(Boolean);
    if (!pool.length) return false;
    quiz = { pool, idx: Math.min(s.idx || 0, pool.length - 1), score: s.score || 0, answered: false, wrong: (s.wrong || []).map(w => ({ q: byId[w.id], chosen: w.chosen })).filter(w => w.q) };
    show("quiz").then(() => { $("#quizSetup").classList.add("hidden"); $("#quizEnd").classList.add("hidden"); $("#quizPlay").classList.remove("hidden"); renderQuizQ(); });
    return true;
  }
  function resumeExam(s) {
    const byId = {}; window.MCQ.forEach(q => byId[q.id] = q);
    const gById = {}; window.GENERATORS.forEach(g => gById[g.id] = g);
    const mcqs = s.mcqs.map(m => byId[m.id] ? { q: byId[m.id], order: m.order, chosen: m.chosen } : null).filter(Boolean);
    const exs = s.exs.map(x => gById[x.gid] ? { g: gById[x.gid], inst: { text: x.text, sol: x.sol }, self: null } : null).filter(Boolean);
    if (!mcqs.length && !exs.length) return false;
    exam = { mcqs, exs, mins: s.mins, deadline: s.deadline || 0, done: false };
    if (exam.deadline && exam.deadline <= Date.now()) exam.deadline = 0; // scaduto: riprende senza timer
    show("esame").then(launchExam);
    return true;
  }
  function offerResume() {
    let s; try { s = JSON.parse(localStorage.getItem(SKEY) || "null"); } catch (e) { s = null; }
    if (!s) return;
    const banner = $("#resumeBanner"); if (!banner) return;
    const label = s.type === "exam" ? "un esame" : "un quiz";
    banner.querySelector(".rb-text").textContent = `Hai ${label} in corso. Riprendere da dove eri?`;
    banner.classList.remove("hidden");
    banner.querySelector(".rb-yes").onclick = () => { banner.classList.add("hidden"); const ok = s.type === "exam" ? resumeExam(s) : resumeQuiz(s); if (!ok) clearSession(); };
    banner.querySelector(".rb-no").onclick = () => { banner.classList.add("hidden"); clearSession(); };
  }

  // ---- Export / import del progresso ----
  function exportProgress() {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "so-trainer-progresso.json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Progresso esportato.");
  }
  function importProgress(file) {
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const d = JSON.parse(rd.result);
        if (d.mcq) Object.assign(store.mcq, d.mcq);
        if (d.oral) Object.assign(store.oral, d.oral);
        if (d.aperte) Object.assign(store.oral, d.aperte); // vecchio formato
        if (d.exQ) Object.assign(store.exQ, d.exQ);
        if (Array.isArray(d.exams)) store.exams = d.exams;
        save(); renderStats(); updateQuizCount(); updateOralCount();
        toast("Progresso importato.");
      } catch (e) { toast("File non valido."); }
    };
    rd.readAsText(file);
  }

  // Statistiche
  function renderStats() {
    const box = $("#statsBox"); box.innerHTML = "";
    let totA = 0, totC = 0, wrongNow = 0;
    Object.entries(window.TOPICS).forEach(([k, label]) => {
      const qs = window.MCQ.filter(q => q.topic === k);
      let a = 0, c = 0, seen = 0;
      qs.forEach(q => {
        const s = store.mcq[q.id];
        if (s) { a += s.a; c += s.c; seen++; if (s.last === 0) wrongNow++; }
      });
      totA += a; totC += c;
      const pct = a ? Math.round(100 * c / a) : 0;
      const row = document.createElement("div");
      row.className = "statrow";
      row.innerHTML = `<div class="lbl">${label}</div>
        <div class="statbar"><div class="okpart" style="width:${a ? 100 * c / a : 0}%"></div><div class="errpart" style="width:${a ? 100 * (a - c) / a : 0}%"></div></div>
        <div class="num">${c}/${a} (${pct}%) · ${seen}/${qs.length} viste</div>`;
      box.appendChild(row);
    });
    $("#statsTotal").innerHTML = totA
      ? `Totale risposte: <b>${totC}/${totA}</b> corrette (${Math.round(100 * totC / totA)}%). Crocette da rivedere: <b>${wrongNow}</b>.`
      : "Nessuna risposta registrata ancora: inizia un quiz!";
    // flashcard (deck unico) + scadenzario
    const oA = Object.values(store.oral).reduce((x, s) => x + s.a, 0);
    const oC = Object.values(store.oral).reduce((x, s) => x + s.c, 0);
    const due = dueCount(CARDS);
    $("#statsOral").innerHTML = oA
      ? `Flashcard: <b>${oC}/${oA}</b> "le sapevo" (${Math.round(100 * oC / oA)}%) · <b>${due}</b> in scadenza oggi.`
      : "Flashcard: ancora nessun ripasso.";
    // esercizi autovalutati
    const eA = Object.values(store.exQ).reduce((x, s) => x + s.a, 0);
    const eC = Object.values(store.exQ).reduce((x, s) => x + s.c, 0);
    $("#statsOpen").innerHTML = eA
      ? `Esercizi autovalutati: <b>${eC}/${eA}</b> corretti (${Math.round(100 * eC / eA)}%).`
      : "Esercizi: nessuna autovalutazione registrata.";
    renderExamHistory();
  }
  function renderExamHistory() {
    const box = $("#statsExams"); if (!box) return;
    const ex = store.exams || [];
    if (!ex.length) { box.innerHTML = ""; return; }
    const rows = ex.slice(-8).reverse().map(e => {
      const d = new Date(e.ts).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "2-digit" });
      return `<tr><td>${d}</td><td>${e.nM}+${e.nE}</td><td>${e.right}/${e.nM}</td><td><b>${e.pct}%</b></td></tr>`;
    }).join("");
    box.innerHTML = `<h3 class="siminfo-h">storico esami</h3>
      <div class="tablewrap"><table><tr><th>data</th><th>crocette+es.</th><th>crocette ok</th><th>voto</th></tr>${rows}</table></div>`;
  }
  $("#statsResetBtn").addEventListener("click", async () => {
    if (await confirmDialog("Azzerare tutte le statistiche e lo storico? L'operazione non è reversibile.")) {
      store.mcq = {}; store.oral = {}; store.exQ = {}; store.exams = [];
      save(); renderStats(); updateQuizCount(); updateOralCount();
      toast("Statistiche azzerate.");
    }
  });
  $("#statsWrongBtn").addEventListener("click", () => {
    show("quiz").then(() => { $("#quizOnlyWrong").checked = true; updateQuizCount(); });
  });
  const statsExportBtn = $("#statsExportBtn"); if (statsExportBtn) statsExportBtn.addEventListener("click", exportProgress);
  const statsImportBtn = $("#statsImportBtn"), statsImportFile = $("#statsImportFile");
  if (statsImportBtn && statsImportFile) {
    statsImportBtn.addEventListener("click", () => statsImportFile.click());
    statsImportFile.addEventListener("change", () => { if (statsImportFile.files[0]) importProgress(statsImportFile.files[0]); statsImportFile.value = ""; });
  }

  // avvio
  applyTheme();
  updateQuizCount();
  renderToday();
  focusTerm();
  offerResume();
})();
