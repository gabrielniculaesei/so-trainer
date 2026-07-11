# Roadmap di miglioramento — SO Trainer (v2)

Aggiornata l'11 luglio 2026, dopo una nuova review del progetto fatta mettendosi nei panni di uno studente che prepara l'esame. La **prima ondata** della roadmap precedente è stata implementata (commit `60443a7`, `136ba5e`, `e50c9dd`); questa versione registra cosa è stato fatto, i **bug e le finiture emersi rileggendo il codice nuovo**, ciò che resta della vecchia roadmap e alcune proposte nuove. Stime di sforzo: S = ore, M = 1–2 giorni, L = più giorni.

Contenuti attuali: **278 crocette, 82 flashcard (orale + teoria, mazzo unico), 37 esercizi risolti, 31 generatori, 14 simulazioni interattive**. Progresso in `localStorage` sotto `so_trainer_v2` (`{mcq, oral, exQ, exams, theme}`), sessione attiva sotto `so_trainer_session`. Bias di lunghezza della risposta corretta: 29,5% (sotto la soglia del 40% — sano).

---

## 0. Fatto (dalla roadmap v1)

- ✅ **1.1** filtro "solo sbagliate" sull'ultimo esito (`s.last`), schema v2 con migrazione da v1
- ✅ **1.2** ripetizione dilazionata tipo Leitner sulle flashcard (`box` 1–5 + `due`)
- ✅ **1.3** "ripasso del giorno" in home + comando `today` nel terminale
- ✅ **2.1** revisione errori a fine quiz ed esame, con "rifai solo queste"
- ✅ **2.2** storico esami in `stats` (ultimi 8 in tabella, max 50 salvati)
- ✅ **2.3** autovalutazione esercizi registrata (`store.exQ`)
- ✅ **2.4** export/import del progresso in JSON
- ✅ **2.5** sessione quiz/esame persistita e riprendibile; conferma prima di abbandonare un esame
- ✅ **3** fusione orale + aperte in un mazzo unico da 82 carte, textarea opzionale
- ✅ **4.2** narrazione per-passo in tutte le sim (il `msg` di ogni frame è la "voce")
- ✅ **4.4** controlli testuali senza emoji, velocità 0.5×/1×/2×, scrubber, scorciatoie ←/→/spazio
- ✅ **5** (parziale) toast e dialoghi al posto di `alert`/`confirm`, tasto 6 nel quiz, chip = `<button>` con `aria-pressed`, `aria-live` su spiegazione e timer, focus ring, nav mobile scrollabile
- ✅ **6** (parziale) `struttura` e `intro` hanno ora sim (syscall, ciclo fetch–execute) e generatori (Amdahl, overhead interrupt, costo syscall)
- ✅ **4.1** (parziale) motion continuo **solo nella sim del disco** (testina e tratto che si disegnano, via SMIL, con fallback `prefers-reduced-motion`)

Restano aperti: 4.1 sulle altre sim, 4.3 (vedi §1.7), 4.5, parte di 5 e 6 — ripresi sotto con le nuove priorità.

---

## 1. Bug e finiture emersi dalla review (priorità alta, fare per primi)

### 1.1 Invio nel quiz rischia di saltare una domanda — **S** (bug)
Dopo la risposta il focus va su `#quizNextBtn` (`js/app.js:202`) e il listener globale su `keydown` chiama `nextQuizQ()` su Invio (`js/app.js:248`). Ma Invio su un bottone focalizzato genera **anche** il click di default → `nextQuizQ()` può scattare due volte e saltare una domanda senza che lo studente la veda. Fix: `e.preventDefault()` nel ramo Invio del listener (o ignorare Invio quando `document.activeElement` è già il bottone). Verificare a mano nel browser dopo il fix.

### 1.2 Ripresa del quiz può ricontare la domanda appena risposta — **S** (bug)
`answerQuiz()` incrementa `score`, registra l'esito e chiama `saveSession()` **con `idx` ancora fermo sulla domanda risposta** (`js/app.js:183-191`). Se lo studente ricarica dopo aver risposto ma prima di "prossima" (caso comune: legge la spiegazione e chiude il tab), al resume la stessa domanda ricompare, e rispondendo di nuovo `recordMcq` e `score` contano doppio. Fix: nello snapshot salvare anche `answered`, e al resume ripartire da `idx+1` se la domanda era già stata risposta.

### 1.3 Un reload durante l'esame perde le risposte scritte — **M**
La sessione d'esame salva crocette scelte, testi e soluzioni dei generatori, ma **non** ciò che lo studente ha scritto nelle textarea degli esercizi (`saveSession()`, `js/app.js:733-737`). In un compito da 60–90 minuti sono proprio i calcoli scritti la parte costosa da rifare. Fix: salvare `value` delle textarea (con un `input` listener debounced) e ripristinarlo in `resumeExam()`.

### 1.4 La risposta selezionata in esame sembra "corretta" — **S**
Selezionare un'opzione durante l'esame le applica la classe `.correct` (verde, `js/app.js:397`): lo stesso stile del feedback "risposta giusta" usato nel quiz. Lo studente può leggerlo come conferma. Fix: una classe neutra `.selected` (bordo accent, niente verde pieno) per la scelta pre-consegna; `.correct`/`.wrong` solo dopo la correzione.

### 1.5 "flashcard in scadenza" non filtra niente — **S**
Il bottone del ripasso del giorno apre la sezione orale e basta (`js/app.js:685`): la sessione parte comunque su **tutto** il mazzo (82 carte). Insieme al §2.1: fare in modo che il deep-link avvii direttamente una sessione "solo scadute + nuove".

### 1.6 Auto-focus del terminale fastidioso su mobile — **S**
`focusTerm()` all'avvio e a ogni ritorno in home (`js/app.js:87,869`) su Android può aprire la tastiera virtuale appena caricata la pagina. Fix: saltare l'auto-focus quando `matchMedia("(pointer: coarse)")`.

### 1.7 Palette semantica: codice morto da decidere — **S**
Le variabili `--sem-active/candidate/victim/hit/miss/wait` (punto 4.3 della v1) sono definite in `css/style.css:26-31` ma **nessuna sim le usa**: gli SVG usano direttamente `--accent`/`--amber`/`--err`, che di fatto *sono* già la semantica condivisa. Decidere: o si adottano le `--sem-*` nelle sim (rinominando i riferimenti, valore puramente documentale), o si eliminano. Consiglio: eliminarle e documentare la convenzione accent=attivo/hit, ambra=candidato/salto, rosso=vittima/miss in un commento in cima a `sims.js`.

### 1.8 Piccolezze — **S**
- Icona tile `CPU` duplicata tra "Scheduling della CPU" e "Ciclo fetch–decode–execute" (`js/sims3.js:174`): rinominare la seconda (es. `F-E`).
- "azzera statistiche" non cancella l'eventuale sessione salvata (`js/app.js:848-854`): aggiungere `clearSession()`.
- Le scorciatoie del quiz reagiscono anche al tasto `n` ma non è documentato da nessuna parte: aggiungere un hint `1–6 rispondi · Invio prossima` sotto le opzioni.

---

## 2. Ripasso: rifiniture sul lavoro fatto (priorità alta)

### 2.1 Sessione orale a taglio fisso e modalità "solo scadute" — **S/M**
**Oggi.** "Inizia il ripasso" carica sempre l'intero pool ordinato per priorità: 82 carte sono una sessione da un'ora, e non si può dire "fammi fare solo le scadute". L'ordinamento c'è già (`cardWeight()`, `js/app.js:514-519`); manca il taglio.

**Proposta.** Un selettore di sessione (10 / 20 / tutte) e un toggle "solo scadute e nuove". Con il mazzo che scade a blocchi, la sessione tipo diventa 10–15 minuti — la dose che uno studente fa davvero tutti i giorni. Collegare qui il bottone del ripasso del giorno (§1.5).

### 2.2 "Sbagliate di recente" più robusto — **S** (decidere se serve)
La v1 proponeva l'uscita dal mazzo dopo **2–3 corrette consecutive**; l'implementazione usa il solo ultimo esito (`s.last`, un singolo bit): una risposta corretta *fortunata* toglie subito la domanda dal mazzo. Se all'uso reale il mazzo si svuota troppo in fretta, salvare gli ultimi 3 esiti come stringa (`"010"`) e filtrare su "almeno un errore negli ultimi 2". Lo schema v2 lo permette senza migrazione (basta aggiungere un campo). Da valutare **dopo** un po' d'uso, non subito.

### 2.3 Grafico dell'andamento esami — **S**
Lo storico c'è ma è solo una tabella (`renderExamHistory()`, `js/app.js:837-847`). Con 5+ esami salvati, una sparkline SVG inline (stessa tecnica delle sim, zero dipendenze) del `pct` nel tempo risponde a colpo d'occhio alla domanda che conta: "sto migliorando?".

---

## 3. Sezione sim: completare il lavoro iniziato (priorità media-alta)

### 3.1 Estendere il motion continuo alle altre sim — **L**
Il pattern SMIL della sim del disco (`diskSVG()`, `js/sims.js:447-492`: elemento che scorre + tratto che si disegna, `prefers-reduced-motion` rispettato) funziona ed è autonomo. Portarlo, in ordine di resa didattica:
1. **Clock** (`sim_pages`): la lancetta che *ruota* fino alla vittima è l'animazione più parlante di tutte;
2. **Gantt CPU** (`sim_sched`): la cella corrente che si estende invece di apparire;
3. **produttore–consumatore**: i token che scorrono nel buffer.
Le sim a stato semplice (RAID, fit, FAT, i-node, pathname) rendono già bene col flash del passo: non toccarle.

### 3.2 Approfondimenti "casi patologici" + link incrociati (era 4.5) — **M**
Sotto ogni sim, oltre alla guida: un bottone "caso patologico" che carica dati precotti (la stringa che mostra l'**anomalia di Belady** su FIFO, la coda che affama SSTF, il quanto RR che degenera in FCFS) e, in fondo, "ora mettiti alla prova" con link che aprono quiz/generatori già filtrati sull'argomento. Chiude il cerchio *guardare → capire → esercitarsi*. Richiede solo di passare un topic preselezionato a `show()` — le chips esistono già.

---

## 4. Proposte nuove

### 4.1 PWA: installabile e offline — **M** (alto valore per lo studente)
L'app è statica e senza dipendenze: perfetta per un service worker cache-first. Lo studente studia in treno/metro e sul telefono; oggi senza rete l'app non si apre nemmeno, e il progresso è già tutto in `localStorage` quindi funzionerebbe identica offline. Servono: `manifest.json` (nome, icone dal logo esistente, `display: standalone`), `apple-touch-icon`, e un `sw.js` che precache la decina di file con una versione da bumpare a ogni deploy. Su Vercel non serve configurazione: basta servire i file (attenzione solo a non cacheare `sw.js` stesso in modo aggressivo — Vercel di default serve gli statici con revalidation, va bene così).

### 4.2 Script di validazione dei contenuti nel repo — **S**
Il controllo del bias di lunghezza oggi vive solo come "pattern nella git history". Committare `scripts/validate.js` (Node puro, si carica i `data/*.js` con `eval` come fa il browser) che verifichi: id univoci, `correct` nell'intervallo, 3–5 opzioni, bias di lunghezza < 40% (oggi: 29,5%), topic validi, e che ogni generatore `gen()` produca `{text, sol}` senza lanciare eccezioni su 100 run. Da lanciare a mano prima di ogni commit di contenuti — è il "test suite" naturale di questo progetto, e blocca la classe di errori più probabile (refusi negli indici delle risposte).

### 4.3 Esame configurabile per argomento — **S**
La simulazione d'esame pesca da tutto il programma (`startExam()`, `js/app.js:350-358`). Sotto data d'esame va bene, ma a metà preparazione serve il compito mirato ("solo memoria + sostituzione"). Riusare `buildChips` nel setup dell'esame e filtrare `MCQ`/`GENERATORS` prima dell'estrazione. Nota nello storico: salvare anche i topic scelti.

### 4.4 Scorciatoie tastiera per le flashcard — **S** (residuo della v1)
Unico pezzo del punto 5 v1 non fatto: nell'orale, spazio/Invio per "mostra la risposta", `1`/`2` (o `s`/`n`) per "la sapevo"/"da ripassare". Stesso pattern del listener quiz, con la guardia sulla textarea attiva (come già fa il player delle sim, `js/sims.js:63-70`).

### 4.5 Data dell'esame e conto alla rovescia — **S** (opzionale)
Un campo "data dell'esame" (in `stats` o nel today box): il ripasso del giorno mostra "mancano N giorni" e nelle ultime 2 settimane suggerisce di spostare il mix verso esami simulati completi anziché quiz spot. Costo minimo, dà struttura alla fase finale della preparazione.

---

## 5. Fluidità del codice (manutenzione, priorità bassa)

- `js/app.js` è a 871 righe in un'unica IIFE: ancora leggibile, ma le prossime feature (sessione orale, esame per topic) meritano almeno **sezioni con separatori uniformi** come già fatto per toast/sessione. Non serve spezzare in moduli: senza bundler i file globali sono una scelta, non un debito.
- Il flusso quiz e il flusso esame duplicano la logica "render opzioni + correzione" (`renderQuizQ`/`answerQuiz` vs `renderExam`/`gradeExam`): se si tocca ancora quella zona, estrarre un helper `renderOptions(q, order, onPick)`. Solo se ci si passa comunque — non è un refactor da fare a freddo.
- Le tre coppie quasi identiche `p-cmp`/`refreshCmp` in `sims.js` potrebbero entrare in `SIMKIT`, ma sono 6 righe l'una: va bene così.
- Nessun problema di performance: ~8.600 righe JS totali servite statiche da Vercel con HTTP/2, first load sotto i 100 KB gzip. Analytics e Speed Insights già installati — controllare lì se emergono regressioni reali prima di ottimizzare alcunché.

---

## 6. Lacune di contenuto (backlog, aggiornato)

| argomento | crocette | flashcard | esercizi | generatori | sim |
|---|---:|---:|---:|---:|---:|
| intro | 22 | 8 | 1 | 3 | 1 |
| struttura | 15 | 3 | 0 | 1 | 1 |
| processi | 31 | 8 | 1 | 1 | 1 |
| sync | 45 | 20 | 3 | 2 | 1 |
| sched | 34 | 9 | 2 | 3 | 1 |
| memoria | 38 | 11 | 11 | 8 | 3 |
| sostituzione | 34 | 10 | 4 | 5 | 1 |
| fs | 32 | 6 | 10 | 5 | 3 |
| dischi | 27 | 7 | 5 | 3 | 2 |

- **`struttura`** resta il buco principale: 15 crocette, 3 flashcard, zero esercizi risolti. Dopo sim e generatore della prima ondata, mancano flashcard (microkernel vs monolitico vs modulare, macchine virtuali, interprete vs compilatore di syscall) e 5–10 crocette.
- **`sync`** ha 45 crocette ma un solo esercizio-tipo interattivo: un secondo generatore (es. valori di semafori dopo una sequenza di `down`/`up`, in nomenclatura del corso) coprirebbe la domanda d'esame più frequente dell'argomento.
- **`processi`**: ancora sottile sul lato pratica (1 esercizio, 1 generatore): un generatore su gerarchie `fork()`/albero dei processi sarebbe il complemento naturale della sim sugli stati.

Quando si aggiungono crocette: rilanciare la validazione del §4.2 (bias di lunghezza oggi al 29,5%, non superare il 40%; niente provenienze nei titoli salvo "(classico Tanenbaum)").

---

## Ordine di implementazione suggerito

1. **§1 (bug e finiture)** — tutti S tranne 1.3: una sessione di lavoro, e il livello di fiducia nell'app sale subito (specie 1.1–1.3 che toccano dati e sessioni).
2. **§2.1 + §4.4** — sessione orale a taglio fisso + tasti flashcard: rendono quotidiano l'uso del ripasso dilazionato appena costruito.
3. **§4.2** — script di validazione, prima della prossima ondata di contenuti.
4. **§4.1** — PWA/offline: alto valore, indipendente da tutto il resto.
5. **§4.3 + §2.3** — esame per argomento e sparkline dello storico.
6. **§3.1 + §3.2** — motion sulle sim (Clock per primo) e casi patologici con link incrociati.
7. **§6** — contenuti (`struttura` in testa), con validazione attiva.
8. **§2.2 e §4.5** — solo se l'uso reale ne mostra il bisogno.
