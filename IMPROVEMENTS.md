# Roadmap di miglioramento — SO Trainer

Idee di miglioramento raccolte mettendosi nei panni di uno studente che usa l'app per preparare l'esame di Sistemi Operativi. Ogni sezione descrive **come funziona oggi** (con riferimenti al codice), **cosa cambiare**, **perché aiuta a studiare** e una stima di sforzo (S = ore, M = 1–2 giorni, L = più giorni).

Contenuti attuali: 278 crocette, 65 flashcard da orale, 17 domande aperte, 37 esercizi risolti, 28 generatori, 12 simulazioni interattive. Il progresso vive in `localStorage` sotto la chiave `so_trainer_v1` come contatori `{a, c}` (tentativi/corretti) per domanda.

---

## 1. Ripasso intelligente (priorità alta)

### 1.1 "Solo domande sbagliate" basato sugli ultimi tentativi — **M**
**Oggi.** Il filtro usa il cumulativo `a > c` (`quizPool()`, `js/app.js:90-97`): una domanda sbagliata *una volta* resta nel mazzo delle "sbagliate" per sempre, anche dopo dieci risposte corrette di fila. Il mazzo non si svuota mai e il ripasso degli errori diventa rumoroso proprio sotto esame.

**Proposta.** Salvare per ogni domanda anche gli **ultimi N esiti** (es. gli ultimi 3, come stringa `"010"`) e la **data dell'ultimo tentativo**. Il filtro diventa "sbagliata di recente": esce dal mazzo dopo 2–3 risposte corrette consecutive. Richiede la migrazione dello schema (`so_trainer_v1` → `so_trainer_v2`) preservando i contatori esistenti.

**Impatto.** Il pulsante "ripassa le domande sbagliate" diventa una vera coda di lavoro che si svuota: si vede il progresso, non si rifanno domande già consolidate.

### 1.2 Spaced repetition per le flashcard — **M**
**Oggi.** L'orale ordina le carte in 3 bucket senza alcuna nozione di tempo (`js/app.js:419-431`): mai viste, viste ma sbagliate, consolidate. Nessuna data, nessun intervallo: una carta "consolidata" un mese fa non torna mai in cima.

**Proposta.** Sistema tipo **Leitner semplificato**: ogni carta ha un livello (1–5) e una data `due`. "La sapevo" sale di livello e raddoppia l'intervallo (1, 3, 7, 14, 30 giorni); "da ripassare" torna al livello 1 con `due` = domani. La sessione pesca prima le carte scadute, poi le nuove. Niente algoritmi complessi (SM-2 completo non serve): bastano livello + data.

**Impatto.** È il modo con la migliore evidenza scientifica per memorizzare teoria da orale: si ripassa quando si sta per dimenticare, non a caso.

### 1.3 "Ripasso del giorno" in home — **S**
**Oggi.** La home è solo un menu; per decidere cosa fare bisogna già saperlo. I dati per argomento esistono già (`renderStats()`, `js/app.js:600-630`).

**Proposta.** Un blocco in home (anche come output del terminale, es. comando `today`) che propone un mix automatico: le flashcard scadute (dal punto 1.2), le crocette sbagliate di recente (1.1) e 5–10 crocette pescate pesando gli argomenti con la percentuale più bassa.

**Impatto.** Si apre l'app e si inizia a studiare in un click, senza dover pianificare la sessione.

---

## 2. Revisione errori e storico (priorità alta)

### 2.1 Schermata di revisione a fine quiz ed esame — **M**
**Oggi.** A fine quiz si vede solo il punteggio e una frase di giudizio (`nextQuizQ()`, `js/app.js:158-167`); a fine esame la correzione è visibile ma sparisce per sempre con "nuova simulazione". Le domande sbagliate — la parte più preziosa della sessione — non sono rivedibili.

**Proposta.** Alla fine di quiz ed esame, un elenco delle domande sbagliate (testo, risposta data, risposta giusta, spiegazione) con un pulsante "rifai solo queste".

**Impatto.** L'errore appena commesso è il momento di massimo apprendimento: va sfruttato subito, non buttato.

### 2.2 Storico degli esami simulati — **M**
**Oggi.** L'esame non lascia traccia: nessun punteggio salvato, nessun andamento (`gradeExam()`, `js/app.js:354-387` chiama solo `recordMcq` per le singole crocette).

**Proposta.** Salvare ogni esame consegnato (data, configurazione, punteggio crocette, autovalutazione esercizi, fascia di voto) e mostrare in `stats` una tabella/grafico dell'andamento nel tempo.

**Impatto.** "Sto migliorando? Sono pronto?" oggi non ha risposta; con lo storico sì — è la metrica che conta davvero nelle ultime due settimane prima dell'esame.

### 2.3 Esiti degli esercizi nelle statistiche — **S**
**Oggi.** Solo le crocette alimentano le statistiche: gli esercizi (risolti, generati, e quelli dell'esame autovalutati) sono invisibili. Metà dello studio non viene misurata.

**Proposta.** Registrare l'autovalutazione degli esercizi (`{a, c}` per id di esercizio/generatore, come già fatto per MCQ) e mostrarla per argomento in `stats`.

### 2.4 Export/import del progresso — **S**
**Oggi.** Tutto vive in un unico blob `localStorage`, legato a un browser: cambiare dispositivo, usare la modalità in incognito o pulire i dati del sito azzera mesi di statistiche senza preavviso.

**Proposta.** Due pulsanti in `stats`: "esporta progresso" (scarica un file JSON) e "importa progresso" (carica e fonde). Zero backend, coerente con l'app statica.

### 2.5 Sessione in corso che sopravvive al reload — **M**
**Oggi.** Quiz ed esame vivono solo in memoria: un refresh accidentale, un tab chiuso o anche solo un click sbagliato sulla nav perdono tutto, incluso il timer dell'esame (il deadline è assoluto ma non persistito, `startExam()`, `js/app.js:281-296`).

**Proposta.** Salvare lo stato della sessione attiva (domande estratte, risposte date, deadline) in `localStorage` e proporre "riprendi la sessione interrotta" al ritorno. In più, chiedere conferma prima di abbandonare un esame in corso navigando altrove.

**Impatto.** Un esame simulato dura fino a 90 minuti: perderlo per un refresh è il singolo bug di esperienza più frustrante dell'app.

---

## 3. Unificare "orale" e "aperte" (decisione presa)

**Oggi.** Le due sezioni sono flussi gemelli quasi identici (`js/app.js:410-458` vs `547-594`) su dati con gli stessi campi `{id, topic, q, a}`: 65 carte in `ORALI` e 17 in `APERTE`. Le domande aperte non escono allo scritto, quindi la sezione è di fatto una seconda pila di flashcard da orale con in più una textarea.

**Proposta — M.**
- Una sola sezione **"orale"** con 82 carte (fusione di `ORALI` + `APERTE`).
- La textarea per impostare la risposta scritta diventa un'opzione disponibile su tutte le carte (torna utile anche per fissare le idee prima di rispondere a voce).
- Un solo bucket di statistiche: in fase di migrazione, `store.aperte` viene fuso in `store.oral` (gli id sono già univoci: `or*`, `orb*`, `ap*`).
- Una sola voce nella nav e nel terminale; la sezione "aperte" sparisce da `index.html`.

**Impatto.** Meno duplicazione nel codice (circa 50 righe di flusso duplicato), una sola coda di ripasso teoria invece di due parziali, e la spaced repetition del punto 1.2 lavora su un mazzo unico.

---

## 4. Sezione "sim": stile visivo ispirato a 3blue1brown / CoreDumped (priorità alta)

L'interattività attuale resta intatta — passo-passo, cambio algoritmo e parametri, rigenerazione dei dati, confronto tra varianti sugli stessi input. Il riferimento a 3blue1brown e CoreDumped è di **stile visivo e narrativo**: movimento continuo che mostra *il cambiamento*, spiegazione sincronizzata con quello che si guarda, sobrietà grafica. Il tema terminale del sito resta; le **emoji spariscono dalla UI** delle sim (oggi: "confronta" con l'icona grafico, il dado per rigenerare, le frecce piene nei controlli del player — `SIMKIT.player`, `js/sims.js:16-25`).

### 4.1 Motion continuo tra i passi — **L**
**Oggi.** Ogni passo ridisegna da zero l'intero SVG (`opts.render(frame)`): lo stato "salta" e l'occhio deve ricostruire cosa è cambiato.

**Proposta.** Interpolare tra uno stato e il successivo con transizioni CSS/SVG o `requestAnimationFrame`: la testina del disco che *si sposta* verso il cilindro scelto, la pagina vittima che *esce* dal frame mentre la nuova *entra*, la lancetta del Clock che *ruota* fino alla pagina candidata, i token del produttore-consumatore che *scorrono* nel buffer. Elementi persistenti con chiave stabile (diff del frame) invece di full re-render. Rispettare `prefers-reduced-motion` tornando al comportamento a scatti.

**Impatto.** Il movimento è l'informazione: vedere la testina percorrere 80 cilindri per FCFS e 12 per SSTF *insegna* la differenza prima ancora di leggere i numeri. È esattamente il motivo per cui i video di 3b1b funzionano.

### 4.2 Narrazione sincronizzata per passo — **M**
**Oggi.** Il player mostra lo stato e il numero del passo; la spiegazione (`info`) è un testo statico in fondo alla pagina, scollegato da ciò che sta succedendo.

**Proposta.** Un pannello di narrazione accanto alla scena che a ogni passo dice **cosa sta succedendo e perché**, con i numeri del passo corrente: "SSTF sceglie il cilindro 37: è la richiesta più vicina alla testina (|53 − 37| = 16, contro 45 per la 98)". Ogni frame del builder produce anche la sua frase di spiegazione. È il cuore dello stile CoreDumped: la voce che accompagna l'animazione.

**Impatto.** La sim smette di essere "guarda l'algoritmo andare" e diventa "capisci ogni singola decisione" — che è ciò che l'esame chiede di saper riprodurre su carta.

### 4.3 Semantica dei colori unificata — **S**
**Oggi.** Ogni sim sceglie i propri colori; hit/miss, elemento attivo e vittima non sono coerenti tra le 12 simulazioni.

**Proposta.** Una piccola palette semantica condivisa (variabili CSS): *attivo/in servizio*, *candidato*, *vittima/espulso*, *hit/successo*, *miss/errore*, *in attesa*. Evidenziare a ogni passo solo ciò che è cambiato (flash breve sull'elemento toccato), lasciando il resto in tono neutro.

**Impatto.** Dopo la prima sim, tutte le altre si leggono a colpo d'occhio; meno carico cognitivo, più attenzione all'algoritmo.

### 4.4 Controlli sobri e scrubber — **S**
**Oggi.** Controlli con simboli pieni ed emoji (frecce, dado, icona grafico), avanzamento solo sequenziale, velocità fissa (950 ms, `js/sims.js:33`).

**Proposta.** Controlli testuali in stile terminale (`reset`, `indietro`, `passo`, `auto`, `velocità 0.5x/1x/2x`), una **timeline/scrubber** per saltare a un passo qualsiasi, e scorciatoie tastiera (frecce = passo avanti/indietro, spazio = auto). Il confronto tra varianti resta, con etichetta testuale "confronta".

### 4.5 Approfondimenti ricchi sotto ogni sim — **M**
**Oggi.** Il campo `info` è una guida breve su cosa si sta guardando.

**Proposta.** Estendere l'approfondimento di ogni sim con: quando l'algoritmo si comporta male (casi patologici generabili con un click: "mostrami la sequenza che manda in crisi FIFO / l'anomalia di Belady"), confronto ragionato tra varianti (non solo la tabella dei numeri, ma *perché* SSTF può affamare le richieste ai bordi), e collegamenti alle crocette e agli esercizi dello stesso argomento ("ora mettiti alla prova": link a quiz filtrato e generatore correlato).

**Impatto.** Chiude il cerchio guardare → capire → esercitarsi senza uscire dalla pagina.

---

## 5. Fluidità e UX (priorità media)

- **Niente più `alert()`/`confirm()` bloccanti** — **S**. Fine ripasso orale, azzeramento statistiche e consegna esame usano dialoghi nativi del browser (`js/app.js:452, 351, 633`); sostituirli con dialoghi/toast in-page coerenti col tema.
- **Scorciatoie tastiera complete** — **S**. Oggi solo 1–5 nel quiz (con opzioni fino a 6, `js/app.js:172-180`). Aggiungere il tasto 6, spazio/enter per girare e valutare le flashcard, scorciatoie anche in esame.
- **Accessibilità** — **M**. Le chips dei filtri sono `<div>` cliccabili non raggiungibili da tastiera (`js/app.js:64-66`): renderle `<button>` con `aria-pressed`. Aggiungere `aria-live` per il feedback giusto/sbagliato e per il timer d'esame, e un focus ring visibile su tutti i controlli.
- **Mobile** — **S**. Un solo breakpoint a 640px (`css/style.css:410-414`); la nav con 8 voci va a capo in modo disordinato sugli schermi stretti e i target touch delle sim sono piccoli. Rivedere la nav (scroll orizzontale o menu compatto) e ingrandire i controlli touch.
- **Micro-transizioni tra viste** — **S**. Un fade breve al cambio sezione, coerente con il lavoro sul motion del punto 4 (e anch'esso sotto `prefers-reduced-motion`).

---

## 6. Lacune di contenuto (backlog)

Copertura per argomento (conteggi attuali):

| argomento | crocette | orale | esercizi | aperte | generatori | sim |
|---|---:|---:|---:|---:|---:|---:|
| intro | 22 | 6 | 1 | 2 | 1 | 0 |
| struttura | 15 | 3 | 0 | 0 | 0 | 0 |
| processi | 31 | 7 | 1 | 1 | 1 | 1 |
| sync | 45 | 14 | 3 | 6 | 2 | 1 |
| sched | 34 | 7 | 2 | 2 | 3 | 1 |
| memoria | 38 | 10 | 11 | 1 | 8 | 3 |
| sostituzione | 34 | 7 | 4 | 3 | 5 | 1 |
| fs | 32 | 10 | 10 | 1 | 5 | 3 |
| dischi | 27 | 6 | 5 | 1 | 3 | 2 |

- **`struttura`** è il buco più grande: 15 crocette e 3 flashcard, ma zero esercizi, generatori e sim. Idee: sim sul percorso di una syscall (user mode → trap → kernel → ritorno), flashcard su microkernel vs monolitico vs modulare, domande su macchine virtuali.
- **`intro`** non ha nessuna simulazione: una sim su interrupt e ciclo fetch-execute coprirebbe il vuoto.
- **`processi`** è sottile sul lato pratica (1 generatore, 1 sim su 31 crocette): un generatore su gerarchie di processi/PCB e una sim sul context switch aiuterebbero.

---

## Ordine di implementazione suggerito

1. **2.5 + 2.1** — sessione persistente e revisione errori: massimo impatto immediato, nessuna migrazione dati complicata.
2. **1.1 + migrazione schema v2** — il nuovo schema (ultimi esiti + date) è il prerequisito di tutto il ripasso intelligente.
3. **3** — fusione orale + aperte, così la spaced repetition nasce già sul mazzo unificato.
4. **1.2 + 1.3** — Leitner e ripasso del giorno.
5. **2.2 + 2.3 + 2.4** — storico esami, esiti esercizi, export/import.
6. **4.3 + 4.4 + 4.2** — palette semantica, controlli e scrubber, narrazione per passo (dal più economico al più ricco).
7. **4.1 + 4.5** — motion continuo e approfondimenti: il lavoro più lungo, da fare sim per sim partendo da disco, sostituzione pagine e scheduling CPU (le più usate all'esame).
8. **5** — rifiniture UX in parallelo alle altre voci.
9. **6** — contenuti nuovi, quando il resto è stabile.
