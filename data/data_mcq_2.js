/* BANCA DOMANDE 2: sincronizzazione/scheduling */
window.MCQ.push(
{ id: "sy01", topic: "sync",
  q: "Con riferimento alle <b>corse critiche</b> (race conditions), individuare l'affermazione <b>errata</b>.",
  options: [
    "Si verificano quando più processi accedono a dati condivisi e il risultato dipende dall'ordine di esecuzione",
    "Possono verificarsi anche a livello kernel, ad esempio sulla tabella dei processi o sulla coda dei pronti",
    "La prelazione può interrompere un processo tra la lettura e la scrittura di una variabile condivisa",
    "Si risolvono garantendo la mutua esclusione sulle sezioni critiche",
    "Si verificano soltanto su sistemi con una sola CPU, mai su sistemi multicore"
  ],
  correct: 4,
  expl: "È il contrario: sui sistemi multicore le corse critiche sono ancora più insidiose, perché i processi girano davvero in parallelo (e non basta disabilitare gli interrupt su una CPU per evitarle)." },

{ id: "sy02", topic: "sync",
  q: "Che cos'è una <b>sezione critica</b>?",
  options: [
    "La parte di codice che accede a dati condivisi e che va eseguita in mutua esclusione",
    "La parte di codice che il processo esegue in modalità kernel per conto dell'utente",
    "La sequenza di istruzioni che il kernel esegue con gli interrupt disabilitati",
    "Il codice della routine che gestisce un page fault o un errore critico",
    "La sequenza di istruzioni compresa tra due context-switch consecutivi"
  ],
  correct: 0,
  expl: "La sezione critica è il 'pezzo' di codice che accede alla memoria condivisa: la mutua esclusione impone che un solo processo alla volta possa trovarsi nella propria sezione critica riferita a quella struttura dati." },

{ id: "sy03", topic: "sync",
  q: "Quale tra le seguenti <b>NON</b> è una delle quattro condizioni per una buona soluzione al problema delle corse critiche?",
  options: [
    "Mutua esclusione: un solo processo alla volta nella sezione critica",
    "Nessuna ipotesi sulla velocità della CPU o sul numero di core",
    "Un processo fuori dalla sua sezione critica non deve bloccare gli altri",
    "Nessun processo deve attendere all'infinito l'ingresso nella sezione critica",
    "Le sezioni critiche devono essere eseguite esclusivamente in modalità kernel"
  ],
  correct: 4,
  expl: "Le 4 condizioni sono: (1) mutua esclusione, (2) indipendenza da velocità/numero di CPU, (3) chi è fuori non blocca gli altri, (4) attesa limitata. La modalità kernel non c'entra: Peterson, ad esempio, è implementabile interamente a livello utente." },

{ id: "sy04", topic: "sync",
  q: "Perché la <b>disattivazione degli interrupt</b> non è una soluzione generale per la mutua esclusione?",
  options: [
    "Perché la disabilitazione richiede una syscall che può a sua volta subire prelazione",
    "Gli interrupt si disattivano solo sulla CPU corrente: gli altri core procedono",
    "Perché il timer della prelazione non è un vero interrupt e non viene bloccato",
    "Perché gli interrupt disabilitati vengono comunque accodati ed eseguiti subito dopo",
    "Perché funziona soltanto per i processi utente e mai per il codice del kernel"
  ],
  correct: 1,
  expl: "Disabilitare gli interrupt blocca la prelazione solo sulla CPU locale: sui multicore le altre CPU procedono. Inoltre è pericolosa se prolungata (interrupt persi) ed è riservata a brevi operazioni del kernel — il contrario dell'opzione E." },

{ id: "sy05", topic: "sync",
  q: "Perché la soluzione con una semplice <b>variabile di lock</b> (testata e poi impostata con istruzioni ordinarie) è errata?",
  options: [
    "Test e assegnamento non sono atomici: due processi possono leggere 0 'insieme'",
    "La variabile di lock può essere letta ma non scritta quando si è in modalità utente",
    "Il busy waiting impedisce al processo che detiene il lock di aggiornare la variabile",
    "Il valore della variabile viene perso ad ogni context-switch, sbloccando processi in attesa",
    "La variabile resta nella cache di un solo core e gli altri non ne vedono gli aggiornamenti"
  ],
  correct: 0,
  expl: "Il problema delle corse critiche si sposta sulla variabile di lock stessa: tra il controllo (lettura di 0) e l'aggiornamento (scrittura di 1) può scattare la prelazione, e due processi entrano entrambi nella sezione critica." },

{ id: "sy06", topic: "sync",
  q: "Qual è il difetto principale dell'<b>alternanza stretta</b> (variabile turn)?",
  options: [
    "Non garantisce la mutua esclusione se i due processi hanno velocità molto diverse",
    "Un processo può restare bloccato perché il turno è dell'altro, che però non intende entrare",
    "La variabile turn è soggetta a race condition perché i due processi possono scriverla insieme",
    "Funziona esclusivamente con due processi e non è generalizzabile a N",
    "Richiede l'istruzione TSL, non disponibile su tutte le architetture"
  ],
  correct: 1,
  expl: "Con l'alternanza stretta le turnazioni sono rigide: se tocca a P1 ma P1 sta facendo altro, P0 non può rientrare anche se la sezione è libera. Viola la condizione 3 ('chi è fuori non blocca gli altri'). La mutua esclusione invece è garantita, ed è generalizzabile a N processi." },

{ id: "sy07", topic: "sync",
  q: "Con riferimento alla <b>soluzione di Peterson</b>, individuare l'affermazione <b>falsa</b>.",
  options: [
    "È una soluzione interamente software, senza bisogno di hardware dedicato",
    "Usa una variabile turn e un array booleano interested[]",
    "In caso di chiamata contemporanea, entra per primo il processo che ha aggiornato turn per primo",
    "Funziona correttamente anche sui moderni sistemi multicore senza alcun accorgimento",
    "Fa uso di busy waiting nell'attesa di entrare nella sezione critica"
  ],
  correct: 3,
  expl: "Sui multicore il riordino delle istruzioni (ottimizzazioni hardware su FETCH/STORE di variabili diverse) può rompere Peterson, causando anche deadlock; servono istruzioni 'barriera'. Peterson è corretta sui single core." },

{ id: "sy08", topic: "sync",
  q: "Che cosa fa esattamente l'istruzione <b>TSL</b> (Test and Set Lock)?",
  options: [
    "Copia il vecchio valore di LOCK in un registro e scrive un valore diverso da 0 in LOCK, atomicamente",
    "Confronta LOCK con 0 e, solo se il confronto riesce, scrive 1 in LOCK con una seconda istruzione",
    "Scambia il contenuto di due locazioni di memoria dopo aver invalidato le cache degli altri core",
    "Decrementa LOCK e blocca il processo chiamante se il risultato è negativo, come una down",
    "Disabilita la prelazione sul core corrente finché il lock non viene rilasciato"
  ],
  correct: 0,
  expl: "TSL Registro,LOCK esegue atomicamente FETCH del vecchio valore e STORE di un valore ≠ 0 (come due MOV fuse in un'istruzione indivisibile). Su Intel l'equivalente è XCHG, che scambia registro e locazione." },

{ id: "sy09", topic: "sync",
  q: "Perché TSL/XCHG funziona anche sui sistemi <b>multicore</b>, dove Peterson fallisce?",
  options: [
    "Perché viene eseguita in una modalità speciale che sospende temporaneamente gli altri core",
    "Perché l'hardware blocca il bus della memoria fino al completamento dell'istruzione",
    "Perché invalida la voce di LOCK in tutte le cache L1 prima di effettuare la scrittura",
    "Perché il compilatore inserisce automaticamente barriere di memoria attorno ad essa",
    "Perché la MMU serializza tutti gli accessi alla pagina che contiene la variabile LOCK"
  ],
  correct: 1,
  expl: "Il punto chiave è il lock del bus di memoria: nessun'altra CPU può accedere alla locazione LOCK durante la TSL, quindi l'atomicità vale tra tutti i core. Il busy waiting però rimane." },

{ id: "sy10", topic: "sync",
  q: "Che cos'è il problema dell'<b>inversione di priorità</b> legato al busy waiting?",
  options: [
    "Il processo ad alta priorità fa busy waiting sul lock del processo a bassa priorità, che non viene mai schedulato",
    "Lo scheduler scambia per errore le priorità di due processi durante il context-switch",
    "Il processo a bassa priorità fa busy waiting e impedisce a quello ad alta priorità di completare la sezione critica",
    "Due processi ad alta priorità si scambiano il lock all'infinito escludendo quelli a bassa priorità",
    "Il lock viene rilasciato da un processo diverso da quello che lo aveva acquisito"
  ],
  correct: 0,
  expl: "Esempio classico: PL (bassa priorità) è nella sezione critica; PH (alta) si sveglia e fa busy waiting sul lock; lo scheduler dà sempre la CPU a PH, quindi PL non esegue mai e non rilascia mai il lock: attesa infinita. Serve un'attesa passiva (sleep/wakeup)." },

{ id: "sy11", topic: "sync",
  q: "Nel produttore-consumatore risolto con <b>sleep e wakeup</b> (senza semafori), qual è il difetto fatale?",
  options: [
    "Il buffer condiviso non è protetto da mutua esclusione e il contatore si corrompe",
    "Interrotto tra il test e la sleep(), il consumatore è ancora sveglio: la wakeup si perde",
    "La sleep() può essere chiamata soltanto dal produttore e mai dal consumatore",
    "La wakeup() risveglia sempre entrambi i processi, causando due estrazioni dello stesso item",
    "Il contatore degli item può diventare negativo se il consumatore è più veloce del produttore"
  ],
  correct: 1,
  expl: "Il test della condizione e l'addormentamento non sono atomici: la wakeup inviata a un processo ancora sveglio si perde ('sveglia persa'); il consumatore poi si addormenta per sempre e infine anche il produttore. Il semaforo nasce per contare le sveglie e rendere atomiche queste operazioni." },

{ id: "sy12", topic: "sync",
  q: "Con riferimento ai <b>semafori</b>, individuare l'affermazione <b>falsa</b>.",
  options: [
    "Il contatore di un semaforo non assume mai valori negativi",
    "La down (wait) decrementa il contatore e diventa bloccante se il contatore è 0",
    "La up (signal) incrementa il contatore e può risvegliare un processo bloccato",
    "Le operazioni down e up devono essere atomiche",
    "La down è l'equivalente di una wakeup e la up di una sleep"
  ],
  correct: 4,
  expl: "È il contrario: la down/wait corrisponde alla sleep (può addormentare), la up/signal corrisponde alla wakeup (risveglia). Nomenclatura del corso: down = wait, up = signal." },

{ id: "sy13", topic: "sync",
  q: "A quale valore va inizializzato un semaforo usato come <b>mutex</b>, e perché?",
  options: [
    "0: nessun processo deve poter entrare finché il proprietario non esegue la prima up",
    "1: il valore iniziale indica quanti processi possono stare insieme nella sezione critica",
    "1: serve a contare la prima sveglia persa dal consumatore nella fase di avvio",
    "N: il semaforo deve contare gli slot liberi della struttura dati protetta",
    "2: un'unità per il produttore e una per il consumatore"
  ],
  correct: 1,
  expl: "Il valore iniziale = numero di processi ammessi in contemporanea. Per la mutua esclusione serve 1: la prima down lo porta a 0 (occupato), le successive bloccano; la up lo riporta a 1 (libero)." },

{ id: "sy14", topic: "sync",
  q: "Nella soluzione del produttore-consumatore con semafori (buffer da N slot), quali sono i valori iniziali corretti?",
  options: [
    "full = 0, empty = N, mutex = 1",
    "full = N, empty = 0, mutex = 1",
    "full = 0, empty = N, mutex = 0",
    "full = 1, empty = N−1, mutex = 1",
    "full = N, empty = N, mutex = 0"
  ],
  correct: 0,
  expl: "empty conta gli slot liberi (all'inizio N: buffer vuoto), full conta gli slot occupati (all'inizio 0), mutex = 1 protegge la sezione critica sul buffer." },

{ id: "sy15", topic: "sync",
  q: "Nel produttore-consumatore con semafori, il semaforo <b>full</b>:",
  options: [
    "conta gli slot occupati: down(full) dal consumatore (blocca se 0), up(full) dal produttore",
    "conta gli slot liberi: il produttore fa down(full) prima di inserire e si blocca se è 0",
    "vale 1 se il buffer contiene almeno un item e 0 altrimenti: è un semaforo binario",
    "conta i processi bloccati in attesa che il buffer torni completamente vuoto",
    "viene inizializzato a N e decrementato dal produttore ad ogni inserimento"
  ],
  correct: 0,
  expl: "full = numero di item presenti (init 0). Consumatore: down(full) prima di estrarre (se 0, buffer vuoto → si blocca). Produttore: up(full) dopo l'inserimento. Gli slot liberi li conta empty (init N). Domanda apparsa all'esame: attenzione alla nomenclatura!" },

{ id: "sy16", topic: "sync",
  q: "Nel produttore-consumatore con semafori, cosa succede se il produttore chiama down(mutex) <b>prima</b> di down(empty)?",
  options: [
    "Il produttore inserisce due volte lo stesso item, perché il mutex non viene rilasciato tra i cicli",
    "A buffer pieno il produttore si blocca su down(empty) dentro la sezione critica: stallo col consumatore",
    "Il consumatore estrae da un buffer vuoto, perché full viene incrementato in anticipo",
    "Nessuna conseguenza: l'ordine delle due down è indifferente ai fini della correttezza",
    "Il semaforo empty assume valori negativi e la sincronizzazione riparte al giro successivo"
  ],
  correct: 1,
  expl: "Se il buffer è pieno, il produttore entra nella sezione critica (mutex = 0) e poi si blocca su down(empty). Il consumatore, per estrarre, deve entrare nella sezione critica ma il mutex è occupato: si blocca anche lui. Deadlock. Regola: mai chiamate potenzialmente bloccanti dentro una sezione critica." },

{ id: "sy17", topic: "sync",
  q: "Che cos'è un <b>futex</b> in Linux?",
  options: [
    "Mutex ibrido: user space senza syscall a bassa contesa, blocco nel kernel ad alta contesa",
    "Un semaforo implementato interamente nel kernel e ottimizzato per i processi real-time",
    "Una variante dell'istruzione TSL che non richiede il blocco del bus di memoria",
    "Un lock lettori/scrittori riservato al file system e gestito dal Virtual File System",
    "Un mutex che usa il busy waiting in spazio kernel per evitare i context-switch"
  ],
  correct: 0,
  expl: "Futex = Fast User space muTEX: componente user space (variabile di lock con TSL, niente syscall se c'è poca contesa) + componente kernel (coda di thread bloccati passivamente in caso di alta contesa). Unisce i pregi dei due mondi." },

{ id: "sy18", topic: "sync",
  q: "Con riferimento ai <b>monitor</b>, individuare l'affermazione <b>falsa</b>.",
  options: [
    "Il monitor garantisce la mutua esclusione sul codice dei propri metodi",
    "È un costrutto ad alto livello implementato dal compilatore usando semafori e mutex",
    "Le variabili di condizione contengono un contatore delle sveglie perse",
    "In Java un metodo può essere protetto da monitor con la parola chiave synchronized",
    "Ad ogni variabile di condizione è associata una coda di thread bloccati"
  ],
  correct: 2,
  expl: "A differenza dei semafori, le variabili di condizione NON hanno memoria/valore: non serve contare le sveglie perché il monitor garantisce che un solo thread alla volta operi al suo interno. Una signal su una condizione senza thread in attesa si perde (senza danni)." },

{ id: "sy19", topic: "sync",
  q: "Quale semantica della signal nei monitor è quella di tipo <b>signal & continue</b> (usata realmente in Java)?",
  options: [
    "Monitor di Hoare: chi segnala si blocca subito e il thread risvegliato riparte immediatamente",
    "Monitor Mesa: il thread risvegliato riprende solo dopo che il segnalante ha completato il metodo",
    "Signal & return: la signal è necessariamente l'ultima istruzione del metodo prima del return",
    "Signal & yield: chi segnala cede la CPU al risvegliato ma resta dentro il monitor",
    "Signal & restart: il thread risvegliato riparte dall'inizio del metodo in cui si era bloccato"
  ],
  correct: 1,
  expl: "Mesa = signal & continue (Java): il segnalante continua fino alla fine del metodo, il risvegliato attende. Hoare = signal & wait (teorico). Signal & return è usato nel concurrent Pascal e negli pseudocodici del corso." },

{ id: "sy20", topic: "sync",
  q: "Nel problema dei <b>5 filosofi</b>, perché la soluzione 'un lock per forchetta, si prende prima la destra e poi la sinistra' è sbagliata?",
  options: [
    "Perché due filosofi non adiacenti finirebbero per contendersi la stessa forchetta",
    "Perché tutti e 5 possono afferrare insieme la forchetta destra, restando in attesa della sinistra",
    "Perché il lock sulle forchette può essere acquisito solo in ordine crescente di indice",
    "Perché le take_fork non sono atomiche e due filosofi adiacenti possono impugnare la stessa forchetta",
    "Perché un filosofo affamato può rubare la forchetta a un vicino che sta già mangiando"
  ],
  correct: 1,
  expl: "Con la presa 'una alla volta' tutti possono afferrare la destra nello stesso istante: ognuno resta in attesa della sinistra, che è la destra del vicino. Stallo circolare classico (deadlock). Il lock per forchetta garantisce invece che una forchetta non venga presa da due filosofi." },

{ id: "sy21", topic: "sync",
  q: "Nella soluzione dei 5 filosofi con semafori (stati THINKING/HUNGRY/EATING), che cosa fa la funzione <b>test(i)</b>?",
  options: [
    "Verifica che il filosofo i sia HUNGRY e i vicini non EATING: se sì, lo mette EATING e fa up(s[i])",
    "Verifica che entrambe le forchette siano libere controllando le variabili di lock ad esse associate",
    "Controlla se il filosofo i ha atteso oltre il timeout e in tal caso gli fa rilasciare le forchette",
    "Verifica che nessun altro filosofo sia HUNGRY prima di concedere le forchette al filosofo i",
    "Aggiorna lo stato del filosofo i e risveglia tutti i filosofi attualmente in attesa"
  ],
  correct: 0,
  expl: "test(i) verifica: state[i] == HUNGRY e i vicini non EATING. Se passa, state[i] = EATING e up(s[i]). Viene chiamata dal filosofo stesso in take_forks e dai vicini in put_forks: ecco perché serve la condizione HUNGRY (per risvegliare solo chi vuole mangiare)." },

{ id: "sy22", topic: "sync",
  q: "Nei 5 filosofi con semafori, perché la down(s[i]) in take_forks è <b>fuori</b> dalla sezione critica protetta dal mutex?",
  options: [
    "Perché la down su s[i] dev'essere eseguita dal filosofo vicino e non da quello corrente",
    "Perché la down può bloccarsi: col mutex occupato nessun altro potrebbe più cambiare stato",
    "Perché il semaforo s[i] è privato del filosofo i e non richiede la mutua esclusione",
    "Perché la down dentro il mutex verrebbe eseguita due volte per la semantica signal & return",
    "Per motivi di efficienza: fuori dal mutex la down evita di effettuare la TRAP"
  ],
  correct: 1,
  expl: "Se il filosofo si bloccasse sulla down mentre detiene il mutex, nessun altro potrebbe cambiare stato né chiamare test(): stallo dell'intero sistema. Regola generale: mai bloccarsi dentro una sezione critica." },

{ id: "sy23", topic: "sync",
  q: "Quanti filosofi al massimo possono mangiare contemporaneamente con 5 filosofi e 5 forchette?",
  options: [
    "1",
    "2",
    "3",
    "4",
    "5"
  ],
  correct: 1,
  expl: "Possono mangiare insieme solo filosofi non adiacenti: ogni filosofo che mangia usa 2 forchette, quindi con 5 forchette il massimo è ⌊5/2⌋ = 2 filosofi." },

{ id: "sy24", topic: "sync",
  q: "Nel problema dei <b>lettori-scrittori</b> (soluzione con semafori), quale ruolo hanno la variabile <b>rc</b> e il semaforo <b>db</b>?",
  options: [
    "rc conta i lettori attivi: solo il primo lettore esegue down(db) e solo l'ultimo esegue up(db)",
    "rc conta gli scrittori in attesa: quando torna a 0 i lettori possono entrare nel database",
    "rc è protetta dal semaforo db, mentre il database è protetto dal semaforo mutex",
    "ogni lettore esegue down(db) all'ingresso e up(db) all'uscita, esattamente come gli scrittori",
    "rc viene incrementata dagli scrittori per segnalare la propria presenza ai lettori"
  ],
  correct: 0,
  expl: "I lettori sono visti come un gruppo: il primo 'chiude la porta' agli scrittori con down(db), l'ultimo la 'riapre' con up(db). rc (reader count) è protetta dal semaforo mutex. Gli scrittori fanno down(db)/up(db) singolarmente." },

{ id: "sy25", topic: "sync",
  q: "Qual è il problema della soluzione classica dei lettori-scrittori che privilegia i lettori?",
  options: [
    "I lettori non possono mai leggere in parallelo, perché il primo di loro blocca il database",
    "Finché arrivano lettori il gruppo non si svuota mai: lo scrittore attende indefinitamente",
    "Gli scrittori possono entrare in due se il gruppo dei lettori si svuota nell'istante sbagliato",
    "L'ultimo lettore salta la up(db) se il decremento di rc avviene fuori dal mutex",
    "I lettori subiscono starvation perché gli scrittori hanno la precedenza sul semaforo db"
  ],
  correct: 1,
  expl: "Finché continuano ad arrivare lettori, il gruppo non si svuota mai e lo scrittore resta bloccato senza garanzie: starvation degli scrittori. Le varianti (es. lettore che controlla se ci sono scrittori in attesa) riequilibrano la situazione." },

{ id: "sy26", topic: "sync",
  q: "Due processi condividono x (valore iniziale 5) e i semafori S=1, T=0.<br><pre>P1:            P2:\nwait(S)        wait(T)\nx = x + 3      x = x * 2\nsignal(T)      signal(S)</pre>Quale valore finale assume x dopo che entrambi hanno completato l'esecuzione?",
  options: [
    "16",
    "13",
    "10",
    "8",
    "11"
  ],
  correct: 0,
  expl: "S=1 quindi P1 procede subito: x = 5+3 = 8, poi signal(T) sblocca P2: x = 8·2 = 16. I semafori impongono l'ordine P1 → P2. Risultato: 16." },

{ id: "sy27", topic: "sync",
  q: "Con riferimento allo scambio di <b>messaggi</b> tra processi (send/receive), individuare l'affermazione <b>falsa</b>.",
  options: [
    "Permette la comunicazione in assenza di memoria condivisa",
    "La receive è bloccante se non ci sono messaggi in coda",
    "La send diventa bloccante quando la coda dei messaggi si satura",
    "Con N sender e M receiver si può usare l'indirizzamento a mailbox",
    "È il metodo di comunicazione più efficiente perché non richiede syscall"
  ],
  correct: 4,
  expl: "Il modello a messaggi richiede syscall per inviare/prelevare (con ricerca nella mailbox): è proprio la sua scarsa efficienza il difetto principale. Il kernel fa da 'postino'." },

{ id: "sc01", topic: "sched",
  q: "Qual è la differenza tra <b>scheduler</b> e <b>dispatcher</b>?",
  options: [
    "Lo scheduler ripristina i registri del processo scelto; il dispatcher applica l'algoritmo di scelta",
    "Lo scheduler sceglie il processo con l'algoritmo; il dispatcher effettua il cambio di contesto",
    "Lo scheduler gestisce i processi batch, il dispatcher quelli interattivi",
    "Il dispatcher stabilisce le priorità; lo scheduler le applica ordinando le code",
    "Lo scheduler agisce a livello kernel, il dispatcher a livello utente nel runtime system"
  ],
  correct: 1,
  expl: "Scheduler = decisione (algoritmo di scelta tra i processi pronti); dispatcher = attuazione (context-switch, ripristino dello stato). Il costo del dispatcher è la latenza di dispatch." },

{ id: "sc02", topic: "sched",
  q: "Come si distinguono i processi <b>CPU-bound</b> da quelli <b>I/O-bound</b>?",
  options: [
    "CPU-bound: burst lunghi; I/O-bound: burst brevi e molte richieste di I/O",
    "I CPU-bound effettuano molte chiamate bloccanti; gli I/O-bound quasi nessuna",
    "Gli I/O-bound ricevono dal kernel una priorità statica maggiore al momento della creazione",
    "I CPU-bound sono tipicamente processi di sistema, gli I/O-bound processi utente",
    "La distinzione dipende dalla dimensione dell'eseguibile, non dal comportamento a runtime"
  ],
  correct: 0,
  expl: "Il criterio è la durata dei CPU burst. Allo scheduler conviene privilegiare gli I/O-bound: rilasciano presto la CPU e tengono occupato il comparto I/O. Col tempo i processi diventano mediamente sempre più I/O-bound (le CPU si velocizzano)." },

{ id: "sc03", topic: "sched",
  q: "Quale delle seguenti è la definizione corretta di <b>tempo di turnaround</b>?",
  options: [
    "Il tempo tra l'inserimento del processo tra i pronti e il suo completamento",
    "Il tempo in cui il processo usa effettivamente la CPU, esclusi i periodi di attesa",
    "Il tempo trascorso nella coda dei pronti senza essere eseguito",
    "Il numero di processi completati nell'unità di tempo",
    "Il tempo che intercorre tra due schedulazioni consecutive dello stesso processo"
  ],
  correct: 0,
  expl: "Turnaround = completamento − arrivo. Il tempo di attesa (opzione C) ne è la parte passata in coda senza esecuzione ed è la metrica che dipende di più dall'algoritmo; il throughput (opzione D) conta i completamenti per unità di tempo." },

{ id: "sc04", topic: "sched",
  q: "Perché massimizzare solo il <b>throughput</b> non è un buon obiettivo per uno scheduler batch?",
  options: [
    "Perché il throughput dipende solo dall'hardware e lo scheduler non può influenzarlo",
    "Perché privilegerebbe sistematicamente i task brevi, facendo esplodere l'attesa di quelli lunghi",
    "Perché massimizzare il throughput equivale a minimizzare il turnaround, rendendolo ridondante",
    "Perché il throughput non è misurabile senza conoscere in anticipo la durata dei processi",
    "Perché il throughput cresce al crescere del numero di context-switch effettuati"
  ],
  correct: 1,
  expl: "Con il solo throughput come metrica, i task piccoli passerebbero sempre davanti: tanti completamenti ma tempi di attesa pessimi per i task grandi. Serve considerare anche turnaround e soprattutto tempo di attesa medio." },

{ id: "sc05", topic: "sched",
  q: "Quale tra i seguenti è un algoritmo di <b>scheduling della CPU</b>?",
  options: [
    "Shortest Remaining Time Next (SRTN)",
    "Least Recently Used (LRU)",
    "Second Chance",
    "C-LOOK",
    "Aging con shift a destra del contatore"
  ],
  correct: 0,
  expl: "SRTN è scheduling della CPU (SJF con prelazione). LRU, Second Chance e Aging sono algoritmi di sostituzione delle pagine; C-LOOK è scheduling del disco. Attenzione: domanda tipica del compito!" },

{ id: "sc06", topic: "sched",
  q: "Con riferimento all'algoritmo <b>FCFS</b> per sistemi batch, individuare l'affermazione <b>falsa</b>.",
  options: [
    "I processi vengono eseguiti nell'ordine di inserimento in coda",
    "Non fa uso di prelazione",
    "È equo nel senso che nessuna richiesta viene scavalcata",
    "Garantisce sempre il tempo di attesa medio minimo",
    "Un processo lungo in testa può far attendere a lungo tutti gli altri"
  ],
  correct: 3,
  expl: "FCFS non ottimizza nulla: se un processo lungo arriva per primo, i successivi (anche brevissimi) aspettano molto. Il tempo di attesa medio minimo (ad arrivi simultanei) lo dà SJF." },

{ id: "sc07", topic: "sched",
  q: "In quali condizioni l'algoritmo <b>SJF</b> è ottimale rispetto al tempo di attesa medio?",
  options: [
    "Sempre, purché le durate dei processi siano note con precisione",
    "Quando tutti i processi sono in coda allo stesso istante (e le durate sono note)",
    "Solo quando i processi hanno durate tutte diverse tra loro",
    "Quando gli arrivi sono scaglionati nel tempo e non è possibile la prelazione",
    "Solo in presenza di più CPU che eseguono i processi in parallelo"
  ],
  correct: 1,
  expl: "SJF è ottimale se tutti i processi arrivano insieme: scambiare un processo corto con uno lungo migliora l'attesa del corto più di quanto peggiori quella del lungo. Con arrivi in istanti diversi SJF può non essere ottimale (esempio del corso: ordinare al contrario migliora la media)." },

{ id: "sc08", topic: "sched",
  q: "Che cos'è l'algoritmo <b>SRTN</b> (Shortest Remaining Time Next)?",
  options: [
    "SJF con prelazione: chi arriva con durata inferiore al residuo del processo corrente lo prelaziona",
    "SJF con prelazione periodica: ogni quanto di tempo si rischedula il processo con durata totale minima",
    "FCFS in cui i processi brevi possono scavalcare in coda quelli lunghi appena arrivano",
    "Una variante di Round-Robin in cui il quanto è proporzionale al tempo residuo del processo",
    "L'algoritmo che stima il prossimo CPU burst con la media esponenziale delle durate passate"
  ],
  correct: 0,
  expl: "SRTN rivaluta la scelta ad ogni nuovo arrivo: se il nuovo processo dura meno del tempo RESIDUO del processo corrente, scatta la prelazione. Il processo espulso torna in coda con durata pari al residuo. L'opzione E descrive lo Shortest Process Next." },

{ id: "sc09", topic: "sched",
  q: "Come si conoscono le durate dei processi in un sistema <b>batch</b>, necessarie per SJF/SRTN?",
  options: [
    "Si misura la durata alla prima esecuzione e la si considera costante per sempre",
    "I job batch sono ricorrenti: le durate si prevedono bene dalle esecuzioni passate",
    "Il compilatore inserisce la durata stimata nell'header del file eseguibile",
    "Si usa la media esponenziale dei CPU burst, come nei sistemi interattivi",
    "Si ordinano i job per dimensione dell'eseguibile, proporzionale alla durata"
  ],
  correct: 1,
  expl: "Un sistema batch è chiuso e ripetitivo: i job si ripresentano di continuo e la loro durata è prevedibile dalle esecuzioni passate. Se le durate non fossero stimabili, SJF non sarebbe applicabile. La media esponenziale serve invece allo SPN nei sistemi interattivi." },

{ id: "sc10", topic: "sched",
  q: "Nel <b>Round-Robin</b>, cosa succede al processo quando scade il suo quanto di tempo?",
  options: [
    "Viene messo in stato blocked fino al prossimo giro di scheduling",
    "Torna in fondo alla coda dei pronti e la CPU passa al processo in testa",
    "Resta in testa alla coda dei pronti ma con priorità dimezzata",
    "Viene spostato nella coda dei processi I/O-bound",
    "Completa comunque il CPU burst corrente e poi rilascia la CPU"
  ],
  correct: 1,
  expl: "RR = FCFS + prelazione: allo scadere del quanto il processo torna in fondo alla coda dei pronti. Se invece si blocca prima della scadenza, va nella coda dei bloccati e al risveglio riceverà un quanto nuovo pieno." },

{ id: "sc11", topic: "sched",
  q: "Round-Robin: quali sono le conseguenze della scelta della dimensione del <b>quanto</b>?",
  options: [
    "Piccolo: più reattività ma più context-switch; più grande di ogni burst: degenera in FCFS",
    "Piccolo: meno context-switch e meno overhead; grande: più reattività del sistema",
    "Il quanto influenza solo i processi CPU-bound: quelli I/O-bound non lo esauriscono comunque mai",
    "Grande: il sistema diventa più equo perché ogni processo lavora più a lungo di seguito",
    "Piccolo: aumenta il rischio di starvation per i processi in fondo alla coda dei pronti"
  ],
  correct: 0,
  expl: "Tradeoff classico: quanti piccoli → reattività ma tanti context-switch (ognuno con overhead); quanti più grandi di ogni CPU burst → la prelazione non scatta mai e RR si comporta come FCFS. La starvation in RR non esiste comunque (attesa massima (n−1)·q)." },

{ id: "sc12", topic: "sched",
  q: "Round-Robin con n processi e quanto q: qual è il tempo massimo che un processo attende prima di riavere la CPU?",
  options: [
    "(n − 1) · q",
    "n · q",
    "(n − 1) · q / 2",
    "n · (q − 1)",
    "q · log₂(n)"
  ],
  correct: 0,
  expl: "Nel caso peggiore (appena prelazionato) ha davanti n−1 processi, ognuno dei quali usa al più un quanto q: attesa massima (n−1)·q. Per questo RR non soffre di starvation e permette di dare garanzie." },

{ id: "sc13", topic: "sched",
  q: "Nello <b>scheduling con priorità</b> dinamiche, come si contrasta la starvation dei processi a bassa priorità?",
  options: [
    "Con l'aging: la priorità dei processi che attendono da più tempo viene gradualmente aumentata",
    "Riducendo il quanto dei processi ad alta priorità finché non rilasciano la CPU",
    "Spostando i processi a bassa priorità su un core dedicato esclusivamente a loro",
    "Assegnando ai processi a bassa priorità un numero doppio di quanti consecutivi",
    "Prelazionando il processo in esecuzione ogni volta che un processo a bassa priorità entra in coda"
  ],
  correct: 0,
  expl: "L'aging (invecchiamento) aumenta gradualmente la priorità dei processi in attesa: prima o poi anche un processo a bassa priorità verrà schedulato. (Da non confondere con l'algoritmo di Aging per la sostituzione delle pagine!)" },

{ id: "sc14", topic: "sched",
  q: "Nello scheduling a <b>code multiple</b> (una coda per priorità), individuare l'affermazione <b>falsa</b>.",
  options: [
    "Si serve la coda a priorità più alta non vuota",
    "Ad ogni coda si può applicare Round-Robin con quanti diversi",
    "Alle code a priorità più alta si assegnano quanti più piccoli, per aumentare la reattività",
    "Alla coda a priorità più bassa si può applicare FCFS",
    "Alle code a priorità più alta si assegnano quanti più grandi"
  ],
  correct: 4,
  expl: "È il contrario: più alta è la priorità della coda, più piccolo è il quanto (più reattività per i processi interattivi). L'ultima coda (CPU-bound) può usare FCFS. La starvation si risolve spartendo il tempo di CPU tra TUTTE le code in percentuali prefissate." },

{ id: "sc15", topic: "sched",
  q: "Che cos'è la <b>retroazione</b> (feedback) nello scheduling a code multiple?",
  options: [
    "I processi cambiano coda in base all'uso del quanto: chi lo esaurisce scende di priorità",
    "Le code si scambiano periodicamente le priorità per garantire l'equità complessiva",
    "Un processo che usa poco il proprio quanto viene penalizzato scendendo di coda",
    "La coda a priorità minima viene riversata in quella massima a intervalli regolari",
    "Il numero di code viene adattato dinamicamente al numero di processi presenti"
  ],
  correct: 0,
  expl: "Con la retroazione le priorità non sono più fisse: un processo che consuma per intero i suoi quanti rivela CPU burst lunghi (è CPU-bound) e viene 'scalato' verso code a priorità più bassa, con quanti più grandi. Windows usa code multiple con retroazione." },

{ id: "sc16", topic: "sched",
  q: "Shortest Process Next: la stima del prossimo CPU burst si aggiorna con S<sub>n+1</sub> = a·T<sub>n</sub> + (1−a)·S<sub>n</sub>. Cosa accade con a = 0 e con a = 1?",
  options: [
    "Con a = 0 conta solo la stima precedente; con a = 1 solo l'ultimo burst reale",
    "Con a = 0 conta solo l'ultimo burst reale; con a = 1 solo la stima precedente",
    "Con a = 0 la stima cresce senza limite; con a = 1 si azzera ad ogni burst",
    "Con a = 0 la stima coincide con la media aritmetica di tutti i burst passati",
    "Con a = 1 la stima converge alla metà del burst più lungo osservato"
  ],
  correct: 0,
  expl: "a pesa la misurazione reale: a=0 ⇒ S(n+1)=S(n) (si ignora la realtà), a=1 ⇒ S(n+1)=T(n) (si ignora la storia). Valore consigliato: 1/2, per bilanciare storia e ultima misura senza rendere la stima instabile." },

{ id: "sc17", topic: "sched",
  q: "Nello <b>scheduling garantito</b>:",
  options: [
    "si promette una quota di CPU e si schedula chi è più indietro sulla promessa",
    "si garantisce a ogni processo un numero minimo di context-switch al secondo",
    "ogni processo riceve la CPU per un tempo proporzionale alla sua priorità statica",
    "i processi vengono estratti a sorte con probabilità proporzionale ai ticket posseduti",
    "la CPU viene divisa in parti uguali tra gli utenti, indipendentemente dai loro processi"
  ],
  correct: 0,
  expl: "Lo scheduling garantito promette a ogni processo una quota di CPU e schedula chi è rimasto più indietro rispetto alla promessa: risolve la starvation in modo strutturale. Il CFS di Linux segue questa idea. Le opzioni D ed E descrivono lotteria e fair-share." },

{ id: "sc18", topic: "sched",
  q: "Con riferimento allo scheduling <b>a lotteria</b>, individuare l'affermazione <b>falsa</b>.",
  options: [
    "Ad ogni quanto di tempo corrisponde un ticket e si effettuano estrazioni casuali",
    "Più ticket possiede un processo, più probabilmente userà la CPU",
    "I processi possono scambiarsi i ticket (es. un padre che li cede ai figli)",
    "I processi I/O-bound risultano avvantaggiati",
    "Ogni processo deve possedere esattamente lo stesso numero di ticket"
  ],
  correct: 4,
  expl: "Il numero di ticket può essere diverso: è proprio così che si realizzano le priorità. Con ticket uguali per tutti si otterrebbe equità totale, ma non è un obbligo." },

{ id: "sc19", topic: "sched",
  q: "Qual è l'idea dello scheduling <b>fair-share</b>?",
  options: [
    "La CPU si divide tra utenti: chi ha 9 processi e chi ne ha 1 ricevono il 50% a testa",
    "La CPU si ripartisce tra i processi in parti uguali, indipendentemente dal proprietario",
    "Ogni utente riceve CPU in proporzione al numero dei propri processi attivi",
    "I processi degli utenti amministratori hanno sempre la precedenza sugli altri",
    "Il tempo di CPU viene assegnato in proporzione alla memoria occupata da ciascun utente"
  ],
  correct: 0,
  expl: "Fair-share ragiona a livello di utenza: la CPU si divide tra utenti indipendentemente dal numero di processi di ciascuno (l'opzione C è esattamente ciò che fair-share evita). Idea simile si applica ai container (es. Docker)." },

{ id: "sc20", topic: "sched",
  q: "Con riferimento al <b>CFS</b> (Completely Fair Scheduler) di Linux, individuare l'affermazione <b>falsa</b>.",
  options: [
    "Ogni processo ha un Virtual Run-Time (VRT) che misura quanto ha usato la CPU",
    "La coda dei processi pronti è basata su un albero red-black",
    "Viene schedulato il processo con il VRT più piccolo",
    "Le priorità agiscono come fattori che rallentano o accelerano la crescita del VRT",
    "Si basa su quanti di tempo fissi, uguali per tutti i processi"
  ],
  correct: 4,
  expl: "Nel CFS non ci sono quanti di tempo: c'è prelazione quando il VRT del processo in esecuzione non è più il minimo. I processi I/O-bound, accumulando poco VRT, hanno un boost naturale; non c'è starvation perché il VRT di chi aspetta non cresce." },

{ id: "sc21", topic: "sched",
  q: "Scheduling su sistemi <b>multiprocessore</b> con una singola coda condivisa: qual è il problema principale?",
  options: [
    "L'accesso concorrente richiede un lock: con molti core la contesa fa da collo di bottiglia",
    "I processi non possono migrare tra i core, causando squilibri di carico permanenti",
    "La coda unica è incompatibile con gli algoritmi basati sulla prelazione",
    "Ogni core deve mantenere una copia sincronizzata della coda, sprecando memoria",
    "La coda unica funziona solo se la predilezione forte è attivata su tutti i processi"
  ],
  correct: 0,
  expl: "La coda unica va protetta da race condition: all'aumentare dei core aumenta la contesa sul lock (bottleneck). La soluzione è una coda per core, che però introduce il problema del bilanciamento (risolto con la migrazione push/pull)." },

{ id: "sc22", topic: "sched",
  q: "Che cos'è la migrazione <b>guidata (push)</b> nello scheduling multiprocessore con code multiple?",
  options: [
    "Una routine kernel periodica sposta processi dalla coda più carica a quella più scarica",
    "Una CPU rimasta con la coda vuota preleva processi dalla coda più ricca",
    "Un processo chiede esplicitamente di migrare quando rileva contesa sulla propria coda",
    "I processi appena creati vengono assegnati alla coda del core 0, che li smista agli altri",
    "Le code vengono fuse in una sola quando il carico supera una soglia critica"
  ],
  correct: 0,
  expl: "Push migration = routine periodica che ribilancia 'alla Robin Hood' (dalla coda più piena alla più vuota). La migrazione spontanea (pull, opzione B) avviene quando una CPU resta a coda vuota e va a 'rubare' processi. Linux usa un ibrido." },

{ id: "sc23", topic: "sched",
  q: "Che cos'è la <b>predilezione forte</b> (strong affinity) nello scheduling multiprocessore?",
  options: [
    "Il vincolo per cui un processo può essere eseguito soltanto su un core specifico",
    "La preferenza a rischedulare il processo sull'ultimo core usato, senza obblighi",
    "L'obbligo per i thread fratelli di essere distribuiti su core tutti diversi",
    "La precedenza garantita ai processi che non hanno mai subito migrazioni",
    "Il legame tra un processo e la porzione di RAM fisicamente più vicina al suo core"
  ],
  correct: 0,
  expl: "Predilezione (affinità) forte = il processo è vincolato a un certo core (inserito solo nella sua coda); può essere violata solo in casi eccezionali. Quella debole (opzione B) è una preferenza senza vincoli. Di default la predilezione è disattivata." },

{ id: "sc24", topic: "sched",
  q: "Perché lo scheduler tende a preferire, quando possibile, un thread <b>fratello</b> di quello appena eseguito?",
  options: [
    "I fratelli condividono lo spazio di indirizzamento: non va riprogrammata la MMU",
    "I thread fratelli condividono lo stack, quindi il cambio di contesto non deve salvarne lo stato",
    "Lo scheduler può saltare il salvataggio dei registri se i thread appartengono allo stesso processo",
    "I thread fratelli girano sempre sullo stesso core, evitando la migrazione tra le code",
    "La coda dei pronti mantiene i fratelli in posizioni adiacenti, rendendo l'estrazione immediata"
  ],
  correct: 0,
  expl: "Restando nello stesso processo si evita il cambio di spazio di indirizzamento (riprogrammazione MMU, flush del TLB): il context-switch tra fratelli costa meno. Registri e stack vanno comunque salvati (sono privati di ogni thread)." }
);
