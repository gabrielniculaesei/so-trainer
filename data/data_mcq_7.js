/* BANCA DOMANDE 7: classici mancanti (Clock/Seconda Chance, TSL, filosofi, lettori-scrittori) */
window.MCQ.push(
{ id: "y01", topic: "sostituzione",
  q: "L'algoritmo di sostituzione <b>Seconda Chance</b> è una variante del FIFO. Cosa fa quando esamina la pagina più vecchia (in testa alla coda)?",
  options: [
    "Le dà una seconda occasione solo se il bit M (modifica) è 0, altrimenti la riscrive su disco",
    "Controlla il bit R: se è 0 la sfratta, se è 1 lo azzera e la rimette in coda",
    "La sfratta sempre, esattamente come il FIFO puro",
    "Scorre i timestamp di tutte le pagine per individuare quella usata meno di recente"
  ],
  correct: 1,
  expl: "Seconda Chance ispeziona il bit R della pagina più vecchia: R=0 → si sfratta; R=1 → seconda occasione, si azzera R e la si rimette in coda come appena arrivata. Se tutte hanno R=1 degenera in FIFO puro." },

{ id: "y02", topic: "sostituzione",
  q: "Nell'algoritmo <b>Clock</b>, se al momento di un page fault <b>tutti</b> i bit R valgono 1, cosa succede?",
  options: [
    "La lancetta compie un giro completo azzerando gli R e sfratta la pagina di partenza",
    "L'algoritmo solleva un errore perché nessuna pagina risulta sacrificabile in quel momento",
    "Sceglie a caso una qualunque pagina, dato che sono tutte da considerarsi equivalenti",
    "Sfratta subito la pagina indicata dalla lancetta senza modificare alcun bit"
  ],
  correct: 0,
  expl: "Con tutti gli R=1 la lancetta avanza azzerando ogni R (seconda occasione a tutti); dopo un giro di 360° ritrova la pagina di partenza, ora con R=0, e la sfratta. In questo caso Clock si comporta come FIFO puro." },

{ id: "y03", topic: "sostituzione",
  q: "Quali algoritmi di sostituzione possono soffrire l'<b>anomalia di Belady</b> (più frame → più page fault)?",
  options: [
    "Tutti gli algoritmi di sostituzione delle pagine, nessuno escluso, ne sono potenzialmente soggetti",
    "Soltanto l'algoritmo ottimale OPT, l'unico che guarda al futuro",
    "Quelli basati sul FIFO: Seconda Chance, Clock, NRU",
    "Quelli che approssimano l'LRU, cioè NFU e Aging"
  ],
  correct: 2,
  expl: "L'anomalia colpisce gli algoritmi di tipo FIFO (FIFO, Seconda Chance, Clock, NRU). Gli algoritmi 'a stack' che approssimano l'LRU (NFU, Aging) godono della proprietà di inclusione: aggiungere frame non può far aumentare i fault." },

{ id: "y04", topic: "sync",
  q: "Cosa garantisce l'istruzione hardware <b>TSL</b> (Test and Set Lock)?",
  options: [
    "Legge una parola in un registro e vi scrive 1 come unica operazione atomica",
    "Sospende il processo mettendolo in stato bloccato se trova il lock già occupato da altri",
    "Disabilita tutti gli interrupt della macchina fino al rilascio del lock",
    "Assicura che nessun processo in attesa del lock possa subire starvation"
  ],
  correct: 0,
  expl: "TSL (come XCHG su x86) legge una parola di memoria in un registro e vi scrive 1 in un unico blocco atomico: durante l'operazione la CPU blocca il bus, così nessun altro core interferisce. È il mattone dei lock; da sola però comporta busy waiting." },

{ id: "y05", topic: "sync",
  q: "Individua l'affermazione <b>corretta</b> sul <b>busy waiting</b> (spin lock).",
  options: [
    "È sempre da preferire al blocco del processo, perché molto più semplice da implementare",
    "Spreca cicli di CPU e può provocare inversione di priorità",
    "Non consuma CPU, dato che il processo resta comunque fermo in attesa",
    "Ha senso solo sulle macchine monoprocessore"
  ],
  correct: 1,
  expl: "Nel busy waiting il processo testa in ciclo una variabile finché non cambia: consuma CPU, quindi conviene solo se l'attesa è brevissima. Un lock così è uno spin lock; su un sistema a priorità può causare inversione di priorità (un processo a bassa priorità tiene il lock mentre uno ad alta gira a vuoto)." },

{ id: "y06", topic: "sync",
  q: "Nel problema dei <b>filosofi a cena</b>, perché la soluzione ingenua 'prendi la forchetta sinistra, poi la destra' è sbagliata?",
  options: [
    "Perché un filosofo riesce a mangiare anche con una sola forchetta in mano",
    "Perché il continuo prendere e posare le forchette genera troppo busy waiting sulla CPU",
    "Se tutti prendono la sinistra nello stesso momento, nessuno avrà la destra: deadlock",
    "Perché impedisce a due filosofi non adiacenti di mangiare insieme"
  ],
  correct: 2,
  expl: "Se i cinque prendono contemporaneamente la forchetta sinistra, ognuno attende all'infinito la destra (tenuta dal vicino): stallo circolare (deadlock). La variante 'posa la sinistra e riprova' evita il deadlock ma può dare starvation/livelock." },

{ id: "y07", topic: "sync",
  q: "Proteggere l'intera fase di acquisizione e uso delle forchette con un unico semaforo <b>mutex</b> elimina il deadlock dei filosofi, ma con quale svantaggio?",
  options: [
    "Reintroduce comunque il rischio di starvation per almeno uno dei filosofi",
    "In realtà non elimina affatto la possibilità di deadlock",
    "Mangia un filosofo alla volta, benché le forchette ne consentirebbero due",
    "Consuma troppa memoria per via degli array di stato e dei semafori per filosofo"
  ],
  correct: 2,
  expl: "Con un solo mutex la sezione critica è serializzata: mangia un filosofo per volta. È corretto (niente deadlock né starvation) ma spreca parallelismo — con 5 forchette potrebbero mangiarne 2 non adiacenti. La soluzione con array di stato recupera questo parallelismo." },

{ id: "y08", topic: "sync",
  q: "La soluzione dei filosofi basata sull'array <b>state[]</b> (THINKING/HUNGRY/EATING) con un semaforo per filosofo garantisce che...",
  options: [
    "un filosofo mangi solo se nessun vicino sta mangiando: niente deadlock né starvation",
    "i filosofi mangino a turno secondo un ordine circolare prefissato e rigido",
    "al massimo un filosofo per volta possa mangiare",
    "non serva più alcun semaforo"
  ],
  correct: 0,
  expl: "Un filosofo passa a EATING solo se entrambi i vicini non lo sono (regola del vicino); il semaforo personale lo blocca finché non è il suo turno. Risultato: niente deadlock, niente starvation e massimo parallelismo (fino a 2 filosofi insieme)." },

{ id: "y09", topic: "sync",
  q: "Nel problema dei <b>lettori-scrittori</b>, qual è il difetto della classica soluzione a semafori con <b>priorità ai lettori</b>?",
  options: [
    "Impedisce a due lettori di leggere contemporaneamente la base di dati",
    "Uno scrittore può restare in attesa per un tempo indefinito (starvation)",
    "Permette a più scrittori di modificare insieme i dati, corrompendoli",
    "Richiede necessariamente un monitor: con i soli semafori non è realizzabile"
  ],
  correct: 1,
  expl: "Il primo lettore blocca il DB agli scrittori e l'ultimo lo libera; finché arriva un nuovo lettore prima che l'ultimo esca, il contatore rc non torna mai a 0 e lo scrittore non entra → starvation. Le soluzioni a monitor che frenano i nuovi lettori quando c'è uno scrittore in attesa risolvono il problema." },

{ id: "y10", topic: "sync",
  q: "Il problema dei <b>lettori-scrittori</b> modella l'accesso a una base di dati. Quale regola di accesso impone?",
  options: [
    "Un solo processo per volta può accedere alla base di dati, sia esso lettore o scrittore",
    "Lettori e scrittori possono sempre operare insieme senza alcun vincolo",
    "Più lettori insieme sono ammessi, ma lo scrittore richiede accesso esclusivo",
    "Gli scrittori hanno comunque sempre la precedenza assoluta sui lettori"
  ],
  correct: 2,
  expl: "Più lettori possono leggere insieme (non modificano i dati); uno scrittore invece deve avere accesso esclusivo — nessun altro scrittore e nessun lettore. Le varie soluzioni a semafori/monitor differiscono su chi ha la priorità e sul rischio di starvation." }
);
