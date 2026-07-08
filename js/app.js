// Logica dell'app: navigazione, quiz, esercizi, esame, orale, aperte, statistiche
(function () {
  "use strict";
  const $ = sel => document.querySelector(sel);
  const $$ = sel => [...document.querySelectorAll(sel)];
  const LETTERS = ["A", "B", "C", "D", "E", "F"];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // salvataggio in localStorage
  const KEY = "so_trainer_v1";
  let store = { mcq: {}, oral: {}, aperte: {}, theme: null };
  try { const raw = localStorage.getItem(KEY); if (raw) store = Object.assign(store, JSON.parse(raw)); } catch (e) { }
  if (!store.aperte) store.aperte = {};
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { } };
  function recordMcq(id, ok) {
    const s = store.mcq[id] || { a: 0, c: 0 };
    s.a++; if (ok) s.c++;
    store.mcq[id] = s; save();
  }
  function recordOral(id, ok) {
    const s = store.oral[id] || { a: 0, c: 0 };
    s.a++; if (ok) s.c++;
    store.oral[id] = s; save();
  }
  function recordAperte(id, ok) {
    const s = store.aperte[id] || { a: 0, c: 0 };
    s.a++; if (ok) s.c++;
    store.aperte[id] = s; save();
  }

  // tema chiaro/scuro
  function applyTheme() {
    const pref = store.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = pref;
    $("#themeToggle").textContent = pref === "dark" ? "☀️" : "🌙";
  }
  $("#themeToggle").addEventListener("click", () => {
    store.theme = (document.documentElement.dataset.theme === "dark") ? "light" : "dark";
    save(); applyTheme();
  });

  // navigazione tra le sezioni
  const views = ["home", "quiz", "esercizi", "esame", "orale", "aperte", "stats"];
  function show(name) {
    views.forEach(v => { $("#view-" + v).classList.toggle("active", v === name); });
    $$("nav button").forEach(b => b.classList.toggle("active", b.dataset.view === name));
    window.scrollTo(0, 0);
    if (name === "home") focusTerm();
  }
  $$("nav button").forEach(b => b.addEventListener("click", () => show(b.dataset.view)));
  $$(".app").forEach(c => c.addEventListener("click", () => show(c.dataset.view)));

  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };

  // chip per filtrare per argomento
  function buildChips(containerId, onChange) {
    const cont = $(containerId);
    cont.innerHTML = "";
    const all = document.createElement("div");
    all.className = "chip on"; all.textContent = "Tutti"; all.dataset.topic = "*";
    cont.appendChild(all);
    Object.entries(window.TOPICS).forEach(([k, label]) => {
      const c = document.createElement("div");
      c.className = "chip"; c.textContent = label; c.dataset.topic = k;
      cont.appendChild(c);
    });
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
      onChange && onChange();
    });
  }
  function selectedTopics(containerId) {
    const on = $$(containerId + " .chip.on").map(c => c.dataset.topic);
    if (on.includes("*") || !on.length) return null; // tutti
    return new Set(on);
  }

  // Quiz a risposta multipla
  let quiz = null; // {pool, idx, score, answered}

  function quizPool() {
    const topics = selectedTopics("#quizChips");
    let pool = window.MCQ.filter(q => !topics || topics.has(q.topic));
    if ($("#quizOnlyWrong").checked) {
      pool = pool.filter(q => { const s = store.mcq[q.id]; return s && s.a > s.c; });
    }
    return pool;
  }
  function updateQuizCount() {
    const n = quizPool().length;
    $("#quizCount").textContent = n + " domande disponibili";
    $("#quizStartBtn").disabled = n === 0;
  }
  buildChips("#quizChips", updateQuizCount);
  $("#quizOnlyWrong").addEventListener("change", updateQuizCount);

  $("#quizStartBtn").addEventListener("click", () => {
    const pool = shuffle(quizPool());
    if (!pool.length) return;
    quiz = { pool, idx: 0, score: 0, answered: false };
    $("#quizSetup").classList.add("hidden");
    $("#quizPlay").classList.remove("hidden");
    $("#quizEnd").classList.add("hidden");
    renderQuizQ();
  });

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
    recordMcq(q.id, ok);
    $$("#quizOptions .opt").forEach((b, i) => {
      b.disabled = true;
      const o = quiz.order[i];
      if (o === q.correct) b.classList.add("correct");
      else if (b === btn) b.classList.add("wrong");
      else b.classList.add("faded");
    });
    $("#quizExpl").innerHTML = `<b>${ok ? "✔ Corretto!" : "✘ Sbagliato."}</b> ${q.expl}`;
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
      const pct = Math.round(100 * quiz.score / quiz.pool.length);
      $("#quizEndText").innerHTML = `<div class="result-big">${quiz.score} / ${quiz.pool.length} (${pct}%)</div>
        <p>${pct >= 90 ? "Eccellente! Da 28-30 e lode. 🏆" : pct >= 75 ? "Molto bene, sei sulla buona strada (25-27). 💪" : pct >= 60 ? "Sufficiente, ma ripassa gli argomenti dove hai sbagliato (18-24)." : "Sotto il 60%: ripassa la teoria e riprova. 📚"}</p>`;
    } else renderQuizQ();
  }
  $("#quizRestartBtn").addEventListener("click", () => { $("#quizSetup").classList.remove("hidden"); $("#quizEnd").classList.add("hidden"); updateQuizCount(); });
  $("#quizAbortBtn").addEventListener("click", () => { $("#quizSetup").classList.remove("hidden"); $("#quizPlay").classList.add("hidden"); updateQuizCount(); });

  // scorciatoie tastiera per il quiz
  document.addEventListener("keydown", e => {
    if (!$("#view-quiz").classList.contains("active") || $("#quizPlay").classList.contains("hidden")) return;
    if (!quiz) return;
    if (!quiz.answered && e.key >= "1" && e.key <= "5") {
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
      card.innerHTML = `<div class="qmeta"><span class="badge acc">${window.TOPICS[g.topic]}</span><span class="badge">♻️ parametri casuali</span></div>
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

  // Simulazione d'esame con timer
  let exam = null; // {mcqs:[{q, order, chosen}], exs:[{gen, inst, self}], timer, deadline}
  $("#examStartBtn").addEventListener("click", startExam);

  function startExam() {
    const nM = +$("#examNumMcq").value, nE = +$("#examNumEx").value, mins = +$("#examTimer0").value;
    const mcqs = shuffle(window.MCQ).slice(0, nM).map(q => ({ q, order: shuffle(q.options.map((_, i) => i)), chosen: null }));
    const gens = shuffle(window.GENERATORS).slice(0, nE).map(g => ({ g, inst: g.gen(), self: null }));
    exam = { mcqs, exs: gens, mins, done: false };
    $("#examSetup").classList.add("hidden");
    $("#examPlay").classList.remove("hidden");
    $("#examResult").classList.add("hidden");
    renderExam();
    if (mins > 0) {
      exam.deadline = Date.now() + mins * 60000;
      $("#examTimer").classList.remove("hidden");
      exam.timer = setInterval(tickExam, 500);
      tickExam();
    } else $("#examTimer").classList.add("hidden");
  }
  function tickExam() {
    const left = Math.max(0, exam.deadline - Date.now());
    const m = Math.floor(left / 60000), s = Math.floor(left % 60000 / 1000);
    $("#examTimer").textContent = `⏱ ${m}:${String(s).padStart(2, "0")}`;
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
          <button class="btn small ok sg-ok">✔ Corretto</button>
          <button class="btn small danger sg-no">✘ Sbagliato</button>
          <span class="sg-state badge"></span></div>`;
      box.appendChild(card);
      x.card = card;
    });
  }

  $("#examSubmitBtn").addEventListener("click", () => {
    const missing = exam.mcqs.filter(m => m.chosen === null).length;
    if (missing && !confirm(`Hai lasciato ${missing} domande senza risposta. Consegnare comunque?`)) return;
    if (exam.timer) clearInterval(exam.timer);
    gradeExam();
  });

  function gradeExam() {
    if (exam.done) return;
    exam.done = true;
    let right = 0;
    exam.mcqs.forEach(m => {
      const ok = m.chosen === m.q.correct;
      if (ok) right++;
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
      ex.innerHTML = `<b>${ok ? "✔ Corretto." : m.chosen === null ? "— Non risposta." : "✘ Sbagliata."}</b> ${m.q.expl}`;
      ex.classList.remove("hidden");
    });
    exam.exs.forEach(x => {
      x.card.querySelector(".sol").classList.remove("hidden");
      x.card.querySelector(".selfgrade").classList.remove("hidden");
      const okB = x.card.querySelector(".sg-ok"), noB = x.card.querySelector(".sg-no"), st = x.card.querySelector(".sg-state");
      okB.addEventListener("click", () => { x.self = true; st.textContent = "segnato: corretto"; updateExamScore(); });
      noB.addEventListener("click", () => { x.self = false; st.textContent = "segnato: sbagliato"; updateExamScore(); });
    });
    exam.right = right;
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
    if (graded < nE) judge = `<p class="note">Autovaluta gli esercizi (✔/✘) per completare il punteggio.</p>`;
    else judge = `<p>${pct >= 90 ? "🏆 Da 28-30 e lode: completo e senza errori di rilievo." : pct >= 75 ? "💪 Buona padronanza: fascia 25-27." : pct >= 60 ? "🙂 Sufficiente: fascia 18-24. Consolida i punti deboli." : "📚 Sotto la soglia del 60%: allo scritto reale non basterebbe. Ripassa e riprova!"}</p>`;
    $("#examResultText").innerHTML = `<div class="result-big">${pts} / ${tot} (${pct}%)</div>
      <p>Risposte multiple: <b>${exam.right}/${nM}</b> — Esercizi corretti (autovalutati): <b>${exOk}/${nE}</b></p>${judge}`;
  }
  $("#examNewBtn").addEventListener("click", () => {
    $("#examSetup").classList.remove("hidden");
    $("#examPlay").classList.add("hidden");
    $("#examSubmitBtn").classList.remove("hidden");
    if (exam && exam.timer) clearInterval(exam.timer);
    exam = null;
  });

  // Flashcard per l'orale
  let oral = null;
  buildChips("#oralChips", updateOralCount);
  function oralPool() {
    const topics = selectedTopics("#oralChips");
    return window.ORALI.filter(q => !topics || topics.has(q.topic));
  }
  function updateOralCount() { $("#oralCount").textContent = oralPool().length + " domande disponibili"; }
  updateOralCount();

  $("#oralStartBtn").addEventListener("click", () => {
    // priorità: mai viste o sbagliate prima
    const pool = shuffle(oralPool()).sort((a, b) => {
      const sa = store.oral[a.id], sb = store.oral[b.id];
      const wa = !sa ? 0 : (sa.c / sa.a >= 1 ? 2 : 1);
      const wb = !sb ? 0 : (sb.c / sb.a >= 1 ? 2 : 1);
      return wa - wb;
    });
    oral = { pool, idx: 0, known: 0 };
    $("#oralSetup").classList.add("hidden");
    $("#oralPlay").classList.remove("hidden");
    renderOral();
  });
  function renderOral() {
    const q = oral.pool[oral.idx];
    $("#oralMeta").innerHTML = `<span class="badge acc">${window.TOPICS[q.topic]}</span>
      <span class="badge">${oral.idx + 1} / ${oral.pool.length}</span>`;
    $("#oralQ").innerHTML = q.q;
    $("#oralA").innerHTML = q.a;
    $("#oralA").classList.add("hidden");
    $("#oralShowBtn").classList.remove("hidden");
    $("#oralGrade").classList.add("hidden");
  }
  $("#oralShowBtn").addEventListener("click", () => {
    $("#oralA").classList.remove("hidden");
    $("#oralShowBtn").classList.add("hidden");
    $("#oralGrade").classList.remove("hidden");
  });
  function oralNext(ok) {
    recordOral(oral.pool[oral.idx].id, ok);
    if (ok) oral.known++;
    oral.idx++;
    if (oral.idx >= oral.pool.length) {
      $("#oralPlay").classList.add("hidden");
      $("#oralSetup").classList.remove("hidden");
      alert(`Fine! Sapevi ${oral.known} risposte su ${oral.pool.length}.`);
    } else renderOral();
  }
  $("#oralOkBtn").addEventListener("click", () => oralNext(true));
  $("#oralNoBtn").addEventListener("click", () => oralNext(false));
  $("#oralStopBtn").addEventListener("click", () => { $("#oralPlay").classList.add("hidden"); $("#oralSetup").classList.remove("hidden"); });

  // Terminale interattivo nella home
  const termOut = $("#termOut"), termIn = $("#termIn"), termScr = $("#termScr");
  const NAV = { home: "home", quiz: "quiz", esercizi: "esercizi", esercizio: "esercizi", esame: "esame", orale: "orale", aperte: "aperte", aperta: "aperte", stats: "stats", statistiche: "stats" };
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
    termPrint(`${window.MCQ.length} crocette · ${window.ORALI.length} orale · ${window.APERTE.length} aperte · ${window.ESERCIZI.length} esercizi · ${window.GENERATORS.length} generatori`);
    termPrint("Scrivi <b>help</b> per i comandi, oppure clicca una voce qui sotto.", "term-dim2");
  }
  function termFetch() {
    const L = [
      "user@so-trainer",
      "──────────────────",
      "OS       : SO-Trainer 3.0 (teoria)",
      "Shell    : bash",
      "Crocette : " + window.MCQ.length,
      "Orale    : " + window.ORALI.length,
      "Aperte   : " + window.APERTE.length,
      "Esercizi : " + window.ESERCIZI.length + " risolti + " + window.GENERATORS.length + " generatori"
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
      termPrint("<b>quiz</b> · <b>esercizi</b> · <b>esame</b> · <b>orale</b> · <b>aperte</b> · <b>stats</b> — apre la sezione");
      termPrint("<b>ls</b> elenca · <b>clear</b> pulisce · <b>whoami</b> · <b>date</b> · <b>neofetch</b>");
      termPrint("puoi anche scrivere <b>./esercizi</b>", "term-dim2");
    } else if (word === "ls" || word === "ll" || word === "dir") {
      termPrint("quiz/   esercizi/   esame/   orale/   aperte/   stats/");
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
      termPrint("Ambiente di studio per la teoria di Sistemi Operativi: crocette, esercizi, simulazione d'esame, orale e domande aperte.");
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

  // Domande aperte a risposta discorsiva
  let aperte = null;
  buildChips("#apChips", updateAperteCount);
  function apertePool() {
    const topics = selectedTopics("#apChips");
    return window.APERTE.filter(q => !topics || topics.has(q.topic));
  }
  function updateAperteCount() { $("#apCount").textContent = apertePool().length + " domande disponibili"; }
  updateAperteCount();

  $("#apStartBtn").addEventListener("click", () => {
    const pool = shuffle(apertePool()).sort((a, b) => {
      const sa = store.aperte[a.id], sb = store.aperte[b.id];
      const wa = !sa ? 0 : (sa.c / sa.a >= 1 ? 2 : 1);
      const wb = !sb ? 0 : (sb.c / sb.a >= 1 ? 2 : 1);
      return wa - wb;
    });
    if (!pool.length) return;
    aperte = { pool, idx: 0, known: 0 };
    $("#apSetup").classList.add("hidden");
    $("#apPlay").classList.remove("hidden");
    renderAperte();
  });
  function renderAperte() {
    const q = aperte.pool[aperte.idx];
    $("#apMeta").innerHTML = `<span class="badge acc">${window.TOPICS[q.topic]}</span>
      <span class="badge">${aperte.idx + 1} / ${aperte.pool.length}</span>`;
    $("#apQ").innerHTML = q.q;
    $("#apA").innerHTML = q.a;
    $("#apA").classList.add("hidden");
    $("#apAnswer").value = "";
    $("#apShowBtn").classList.remove("hidden");
    $("#apGrade").classList.add("hidden");
  }
  $("#apShowBtn").addEventListener("click", () => {
    $("#apA").classList.remove("hidden");
    $("#apShowBtn").classList.add("hidden");
    $("#apGrade").classList.remove("hidden");
  });
  function aperteNext(ok) {
    recordAperte(aperte.pool[aperte.idx].id, ok);
    if (ok) aperte.known++;
    aperte.idx++;
    if (aperte.idx >= aperte.pool.length) {
      $("#apPlay").classList.add("hidden");
      $("#apSetup").classList.remove("hidden");
      alert(`Fine! Ti sei valutato bene su ${aperte.known} di ${aperte.pool.length}.`);
    } else renderAperte();
  }
  $("#apOkBtn").addEventListener("click", () => aperteNext(true));
  $("#apNoBtn").addEventListener("click", () => aperteNext(false));
  $("#apStopBtn").addEventListener("click", () => { $("#apPlay").classList.add("hidden"); $("#apSetup").classList.remove("hidden"); });

  // Statistiche
  function renderStats() {
    const box = $("#statsBox"); box.innerHTML = "";
    let totA = 0, totC = 0, wrongIds = [];
    Object.entries(window.TOPICS).forEach(([k, label]) => {
      const qs = window.MCQ.filter(q => q.topic === k);
      let a = 0, c = 0, seen = 0;
      qs.forEach(q => {
        const s = store.mcq[q.id];
        if (s) { a += s.a; c += s.c; seen++; if (s.a > s.c) wrongIds.push(q.id); }
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
      ? `Totale risposte: <b>${totC}/${totA}</b> corrette (${Math.round(100 * totC / totA)}%). Domande da rivedere: <b>${wrongIds.length}</b>.`
      : "Nessuna risposta registrata ancora: inizia un quiz!";
    // orale
    const oA = Object.values(store.oral).reduce((x, s) => x + s.a, 0);
    const oC = Object.values(store.oral).reduce((x, s) => x + s.c, 0);
    $("#statsOral").innerHTML = oA ? `Flashcard orale: <b>${oC}/${oA}</b> "le sapevo" (${Math.round(100 * oC / oA)}%).` : "Flashcard orale: ancora nessun ripasso.";
    // aperte
    const pA = Object.values(store.aperte || {}).reduce((x, s) => x + s.a, 0);
    const pC = Object.values(store.aperte || {}).reduce((x, s) => x + s.c, 0);
    $("#statsOpen").innerHTML = pA ? `Domande aperte: <b>${pC}/${pA}</b> "le sapevo" (${Math.round(100 * pC / pA)}%).` : "Domande aperte: ancora nessun ripasso.";
  }
  $$("nav button").forEach(b => b.addEventListener("click", () => { if (b.dataset.view === "stats") renderStats(); }));
  $("#statsResetBtn").addEventListener("click", () => {
    if (confirm("Azzerare tutte le statistiche?")) { store.mcq = {}; store.oral = {}; save(); renderStats(); }
  });
  $("#statsWrongBtn").addEventListener("click", () => {
    show("quiz");
    $("#quizOnlyWrong").checked = true;
    updateQuizCount();
  });

  // avvio
  applyTheme();
  updateQuizCount();
  focusTerm();
})();
