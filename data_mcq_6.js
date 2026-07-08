/* BANCA DOMANDE 6: crocette aggiuntive (difficili, opzioni bilanciate) */
window.MCQ.push(
{ id: "x01", topic: "intro",
  q: "Individua l'affermazione ERRATA sul DMA (Direct Memory Access).",
  options: [
    "Il controller DMA accede alla memoria centrale in autonomia, sottraendo cicli di bus alla CPU",
    "Con il DMA la CPU esegue polling sulla porta del controller fino al termine del trasferimento",
    "Al termine dell'intero blocco il controller solleva un solo interrupt verso la CPU",
    "Riduce il numero di interrupt rispetto all'I/O guidato da interrupt puro"
  ],
  correct: 1,
  expl: "Il senso del DMA è liberare la CPU: un chip dedicato trasferisce il blocco tra controller e RAM e avvisa con UN solo interrupt finale. Il polling continuo è invece l'I/O programmato (busy waiting)." },

{ id: "x02", topic: "intro",
  q: "Quale affermazione su pipeline e CPU superscalari è corretta?",
  options: [
    "La pipeline riduce la latenza della singola istruzione suddividendola tra gli stadi",
    "In una CPU superscalare le istruzioni terminano sempre nell'ordine del programma",
    "Una CPU superscalare può avviare più istruzioni nello stesso ciclo di clock",
    "Il pipelining è sempre del tutto trasparente al sistema operativo"
  ],
  correct: 2,
  expl: "La pipeline aumenta il throughput (a regime un'istruzione per ciclo di stadio), non riduce la latenza della singola istruzione. Le superscalari hanno più unità e avviano/eseguono più istruzioni per ciclo, anche fuori ordine, e non sono del tutto trasparenti al SO." },

{ id: "x03", topic: "struttura",
  q: "Individua l'affermazione ERRATA su kernel monolitico e microkernel.",
  options: [
    "In un microkernel i driver di dispositivo girano in modalità kernel per andare più veloci",
    "Un kernel monolitico esegue tutti i suoi componenti nello stesso spazio di indirizzamento",
    "Il microkernel affida driver e file system a processi utente che comunicano a messaggi",
    "L'approccio a moduli di Linux resta monolitico in esecuzione ma carica i componenti a runtime"
  ],
  correct: 0,
  expl: "Nel microkernel driver e file system stanno FUORI dal kernel, come processi utente isolati: è questo che dà robustezza (un driver che crasha non abbatte il sistema), al prezzo dell'overhead dei messaggi. Nel kernel restano solo scheduling, memoria, IPC e interrupt." },

{ id: "x04", topic: "struttura",
  q: "Qual è la differenza corretta tra hypervisor di tipo 1 e di tipo 2?",
  options: [
    "Il tipo 1 gira sul bare metal, il tipo 2 come processo su un sistema operativo host",
    "Il tipo 1 gira come applicazione utente, il tipo 2 direttamente sull'hardware fisico",
    "Il tipo 1 emula la CPU istruzione per istruzione, il tipo 2 la esegue in modo nativo",
    "Solo il tipo 2 permette di eseguire più sistemi operativi guest sulla stessa macchina"
  ],
  correct: 0,
  expl: "Tipo 1 = bare metal (uso professionale, es. datacenter); tipo 2 = processo sopra l'OS host (es. VirtualBox). Entrambi ospitano più guest; l'hypervisor intercetta le operazioni privilegiate della VM e ne simula la modalità kernel virtuale." },

{ id: "x05", topic: "processi",
  q: "Individua la transizione di stato IMPOSSIBILE per un processo.",
  options: [
    "Da pronto a in esecuzione, quando lo scheduler lo seleziona",
    "Da in esecuzione a bloccato, per una chiamata di sistema bloccante",
    "Da bloccato a in esecuzione, non appena l'evento atteso si verifica",
    "Da in esecuzione a pronto, per prelazione allo scadere del quanto"
  ],
  correct: 2,
  expl: "Un processo che si sblocca torna PRONTO, non direttamente in esecuzione: deve prima essere ri-selezionato dallo scheduler. Impossibile anche pronto→bloccato (non sta eseguendo, non può bloccarsi)." },

{ id: "x06", topic: "processi",
  q: "Individua l'affermazione ERRATA sulla fork() in UNIX.",
  options: [
    "Restituisce 0 al figlio e il PID del figlio al padre",
    "Il figlio creato condivide con il padre lo stesso spazio di indirizzi modificabile",
    "Con il copy-on-write le pagine vengono duplicate solo quando uno dei due prova a scriverle",
    "Il figlio eredita i descrittori dei file già aperti dal padre"
  ],
  correct: 1,
  expl: "La fork crea un processo con spazio di indirizzi SEPARATO (una copia ottimizzata con copy-on-write): a condividere la memoria modificabile sono i thread, non i processi. Padre e figlio proseguono dallo stesso punto, distinti dal valore di ritorno." },

{ id: "x07", topic: "processi",
  q: "Qual è lo svantaggio tipico dei thread a livello utente (modello molti-a-uno)?",
  options: [
    "Una singola chiamata bloccante sospende l'intero processo",
    "Ogni cambio di thread richiede una TRAP nel kernel",
    "I thread non possono condividere le variabili globali del processo",
    "Il kernel deve schedulare separatamente ciascun thread utente"
  ],
  correct: 0,
  expl: "A livello utente il kernel vede un solo thread: se uno si blocca (o causa un page fault) l'intero processo si ferma e non si sfruttano i core multipli. In compenso lo switch è velocissimo, senza TRAP." },

{ id: "x08", topic: "sync",
  q: "Nel produttore-consumatore con semafori, perché down(mutex) deve venire DOPO down(empty)?",
  options: [
    "Perché mutex va inizializzato a 0, come il semaforo full",
    "Perché altrimenti, a buffer pieno, il produttore si bloccherebbe dentro la sezione critica",
    "Perché invertendole la up(full) sbloccherebbe due consumatori insieme",
    "Perché l'ordine delle down non conta davvero, basta invertire le up"
  ],
  correct: 1,
  expl: "Se il produttore prendesse prima il mutex e poi si bloccasse sulla down(empty) a buffer pieno, terrebbe chiusa la sezione critica: il consumatore non potrebbe entrare a liberare uno slot → deadlock. Regola: mai una down bloccante dentro la sezione critica." },

{ id: "x09", topic: "sync",
  q: "In un MONITOR, il produttore che trova il buffer pieno esegue:",
  options: [
    "down sul semaforo empty",
    "wait sulla variabile di condizione full",
    "up sul semaforo full",
    "signal sulla variabile di condizione empty"
  ],
  correct: 1,
  expl: "Nel monitor si usano wait/signal sulle VARIABILI DI CONDIZIONE (senza valore); down/up sono le operazioni sui SEMAFORI. Buffer pieno nel monitor → wait(full); con i semafori sarebbe invece down(empty). Il prof bada a questa distinzione." },

{ id: "x10", topic: "sync",
  q: "Individua il requisito che NON fa parte di una buona soluzione di mutua esclusione.",
  options: [
    "Due processi non devono stare insieme nella stessa sezione critica",
    "Si può assumere che tutte le CPU procedano alla stessa velocità",
    "Un processo fuori dalla sezione critica non deve bloccare gli altri",
    "Nessun processo deve attendere all'infinito per entrare"
  ],
  correct: 1,
  expl: "Una delle quattro condizioni è proprio NON fare ipotesi su numero e velocità delle CPU: una soluzione che si affida a un certo timing (come l'alternanza stretta) è sbagliata." },

{ id: "x11", topic: "sched",
  q: "Rispetto a SJF, lo scheduling SRTN (Shortest Remaining Time Next):",
  options: [
    "ordina la coda dei pronti in base al tempo di arrivo, non alla durata stimata",
    "prelaziona il processo attivo se arriva un job con residuo minore",
    "elimina ogni possibilità di starvation dei processi lunghi",
    "richiede che tutti i processi arrivino all'istante zero"
  ],
  correct: 1,
  expl: "SRTN è la versione con prelazione di SJF: a ogni arrivo confronta il tempo residuo del processo in esecuzione con la durata del nuovo. I processi lunghi possono comunque soffrire starvation." },

{ id: "x12", topic: "sched",
  q: "Nel Round-Robin, se il quanto diventa molto più grande dei CPU burst, l'algoritmo:",
  options: [
    "aumenta drasticamente il numero di cambi di contesto",
    "degenera nel comportamento del FCFS",
    "assicura il minimo tempo di risposta ai processi interattivi",
    "diventa equivalente a SJF con prelazione"
  ],
  correct: 1,
  expl: "Se il quanto supera la durata dei burst, quasi nessuno viene prelazionato: i processi girano fino a bloccarsi o finire, come in FCFS. Un quanto troppo piccolo fa l'opposto: tanti context switch e overhead." },

{ id: "x13", topic: "sched",
  q: "Su quale criterio lo scheduler CFS di Linux sceglie il prossimo processo?",
  options: [
    "La priorità statica più alta presente in coda",
    "Il minor Virtual Run-Time accumulato",
    "Il maggior tempo trascorso in attesa nella coda",
    "Il quanto di tempo residuo più grande"
  ],
  correct: 1,
  expl: "CFS tiene i pronti in un albero red-black ordinato per Virtual Run-Time (tempo di CPU consumato, pesato dalla priorità) e sceglie sempre il minimo: gli I/O-bound accumulano poco VRT e ricevono un boost naturale, senza quanti fissi." },

{ id: "x14", topic: "memoria",
  q: "Con la rilocazione dinamica a registro base e registro limite, per ogni indirizzo la MMU:",
  options: [
    "somma la base all'indirizzo e non effettua alcun controllo di protezione",
    "verifica che sia entro il limite, poi vi somma la base",
    "traduce gli indirizzi una sola volta, al caricamento del processo",
    "confronta l'indirizzo fisico ottenuto con il registro limite"
  ],
  correct: 1,
  expl: "La MMU controlla PRIMA che l'indirizzo logico sia ≤ limite (altrimenti trap e terminazione) e POI somma la base: la traduzione avviene a ogni accesso, a run-time. Tradurre una volta sola al caricamento è la rilocazione statica." },

{ id: "x15", topic: "memoria",
  q: "Con indirizzi virtuali a 32 bit e pagine da 4 KB, una tabella delle pagine a un livello ha:",
  options: [
    "2^12 voci",
    "2^20 voci",
    "2^32 voci",
    "2^10 voci"
  ],
  correct: 1,
  expl: "4 KB = 2^12 → offset di 12 bit; restano 32 − 12 = 20 bit di numero di pagina, quindi 2^20 voci. Ecco perché con spazi grandi si usano tabelle multilivello: una piatta sarebbe enorme." },

{ id: "x16", topic: "memoria",
  q: "A che cosa serve la TLB (Translation Lookaside Buffer)?",
  options: [
    "A contenere le pagine di dati accedute più di recente dal processo",
    "A conservare le traduzioni pagina→frame più recenti, saltando la tabella",
    "A tradurre gli indirizzi fisici in indirizzi virtuali per la MMU",
    "A registrare quali pagine sono state modificate, così da riscriverle su disco"
  ],
  correct: 1,
  expl: "La TLB è una piccola cache associativa di traduzioni pagina→frame: su un hit si evita di leggere la tabella delle pagine in RAM. Non memorizza dati (quella è la cache), non fa la traduzione inversa, non è il bit dirty." },

{ id: "x17", topic: "sostituzione",
  q: "Quale affermazione sugli algoritmi di sostituzione delle pagine è corretta?",
  options: [
    "LRU sostituisce la pagina caricata in memoria da più tempo",
    "FIFO può soffrire l'anomalia di Belady, LRU no",
    "L'algoritmo ottimale (OPT) si implementa conoscendo solo il passato",
    "Nell'algoritmo dell'orologio il bit di riferimento non viene mai azzerato"
  ],
  correct: 1,
  expl: "FIFO (e algoritmi mal comportati) può peggiorare aumentando i frame: è l'anomalia di Belady, che LRU/OPT non hanno. OPT userebbe il FUTURO (irrealizzabile); LRU lo approssima col passato. L'orologio azzera R al passaggio della lancetta." },

{ id: "x18", topic: "sostituzione",
  q: "Quando si verifica il thrashing (o trashing)?",
  options: [
    "Quando un processo accede ripetutamente a un piccolo insieme di pagine già residenti",
    "Quando i frame non bastano ai working set e il sistema pagina in continuazione",
    "Quando la TLB viene svuotata ad ogni cambio di contesto",
    "Quando il disco supera la RAM nella velocità di accesso casuale"
  ],
  correct: 1,
  expl: "Il thrashing è la paginazione continua che si ha quando la memoria non basta a tenere i working set dei processi: la CPU passa il tempo ad attendere il disco. Il modello del working set serve proprio a prevenirlo." },

{ id: "x19", topic: "sostituzione",
  q: "Accesso in RAM 100 ns, probabilità di page fault 0,001, servizio del fault 8 ms. Il tempo di accesso effettivo è circa:",
  options: [
    "100 ns",
    "8,1 µs",
    "8 ms",
    "800 ns"
  ],
  correct: 1,
  expl: "EAT = (1 − p)·100 ns + p·8 ms ≈ 100 ns + 0,001·8·10^6 ns = 100 + 8000 = 8100 ns ≈ 8,1 µs. Basta una frequenza di fault piccolissima per dominare il tempo medio: per questo la località è cruciale." },

{ id: "x20", topic: "fs",
  q: "Individua l'affermazione ERRATA su i-node e FAT.",
  options: [
    "L'i-node di un file viene caricato in memoria solo all'apertura del file",
    "Con gli i-node l'intera tabella di allocazione del disco sta sempre in RAM",
    "Nella FAT ogni voce corrisponde a un blocco del volume e punta al successivo",
    "Gli i-node usano puntatori indiretti per indirizzare i file grandi"
  ],
  correct: 1,
  expl: "È la FAT a dover stare tutta in memoria (una voce per blocco dell'intero volume): con dischi grandi diventa ingombrante. L'i-node invece si carica solo per i file aperti e usa blocchi indiretti per i file grandi." },

{ id: "x21", topic: "fs",
  q: "Creando un hard link a un file, il contatore dei riferimenti del suo i-node:",
  options: [
    "resta invariato, perché ogni hard link duplica l'i-node originale del file",
    "aumenta di uno; il file esiste finché il contatore non è zero",
    "aumenta di uno, ma il file sparisce alla prima unlink",
    "non cambia, perché l'hard link crea un i-node distinto"
  ],
  correct: 1,
  expl: "Un hard link è una nuova voce di directory che punta allo STESSO i-node: il contatore sale. La unlink lo decrementa; il file è liberato solo quando arriva a zero (nessun nome più lo referenzia)." },

{ id: "x22", topic: "fs",
  q: "Nel modello a i-node, che cosa contiene una voce di directory di UNIX?",
  options: [
    "Il nome del file e il numero del suo i-node",
    "Il nome del file e la lista completa dei suoi blocchi dati",
    "Il nome del file e i suoi attributi (permessi, dimensione, date)",
    "Soltanto il primo blocco del file, come nell'allocazione contigua"
  ],
  correct: 0,
  expl: "La directory mappa solo nome → numero di i-node; attributi e localizzazione dei blocchi stanno nell'i-node. Questo rende immediati gli hard link: più nomi possono puntare allo stesso i-node." },

{ id: "x23", topic: "dischi",
  q: "In che cosa LOOK si distingue da SCAN (algoritmo dell'ascensore)?",
  options: [
    "Serve sempre per prima la richiesta a minima distanza dalla testina corrente",
    "Inverte la direzione all'ultima richiesta pendente, senza arrivare all'estremo",
    "Va in una sola direzione e poi torna all'inizio senza servire",
    "Serve le richieste nell'ordine di arrivo nella coda"
  ],
  correct: 1,
  expl: "SCAN (ascensore) arriva fino all'estremo del disco anche senza richieste in quel verso; LOOK 'guarda avanti' e inverte appena servita l'ultima richiesta pendente. La convenzione d'esame del corso è quella LOOK." },

{ id: "x24", topic: "dischi",
  q: "Individua l'affermazione ERRATA sui livelli RAID.",
  options: [
    "RAID 1 replica per intero i dati su un secondo disco che fa da specchio",
    "RAID 0 tollera il guasto di un disco grazie alla parità distribuita",
    "In RAID 5 la parità di uno stripe è lo XOR dei blocchi dati",
    "RAID 5 distribuisce i blocchi di parità su tutti i dischi"
  ],
  correct: 1,
  expl: "RAID 0 è solo striping: NESSUNA ridondanza, anzi raddoppia il rischio (basta un disco a perdere tutto). La tolleranza a un guasto la danno RAID 1 (mirror) e RAID 5 (parità XOR distribuita, capacità utile (n−1)·S)." }
);
