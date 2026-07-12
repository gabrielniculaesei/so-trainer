/* BANCA DOMANDE 8: 85 domande aggiuntive (topic misti, prefisso "w") */
window.MCQ.push(
// ---------- INTRODUZIONE E ARCHITETTURA ----------
{ id: "w01", topic: "intro",
  q: "Perché le <b>istruzioni privilegiate</b> possono essere eseguite solo in modalità kernel?",
  options: [
    "Per impedire a un processo utente di eseguire operazioni che potrebbero compromettere il sistema o danneggiare gli altri processi",
    "Perché la CPU in modalità utente è più lenta",
    "Perché in modalità utente la RAM è inaccessibile",
    "Perché non esistono nel set d'istruzioni utente"
  ],
  correct: 0,
  expl: "Istruzioni come I/O diretto, gestione della MMU o disabilitazione degli interrupt potrebbero compromettere l'intero sistema: la CPU le consente solo in modo kernel e un tentativo in modo utente genera una trap." },

{ id: "w02", topic: "intro",
  q: "Nel trasferimento tramite <b>DMA</b>, quante volte (in genere) la CPU viene interrotta per un blocco?",
  options: [
    "Una sola volta, alla fine",
    "Una volta per ogni parola trasferita, esattamente come accade con l'I/O guidato da interrupt",
    "Mai, perché il DMA è del tutto trasparente e asincrono rispetto al processo in esecuzione",
    "Due volte, all'inizio e circa a metà del trasferimento del blocco"
  ],
  correct: 0,
  expl: "Il controller DMA sposta l'intero blocco tra dispositivo e RAM da solo, sottraendo cicli di bus; solleva un unico interrupt finale per avvisare la CPU. È l'I/O guidato da interrupt (senza DMA) a interrompere una volta per parola." },

{ id: "w03", topic: "intro",
  q: "Con quale meccanismo hardware un programma utente entra nel kernel per una <b>system call</b>?",
  options: [
    "Una trap verso un punto d'ingresso fisso del kernel",
    "Un jump diretto",
    "Un interrupt hardware sollevato dal controller del dispositivo di I/O coinvolto nella richiesta",
    "La disabilitazione degli interrupt seguita da un accesso diretto"
  ],
  correct: 0,
  expl: "La syscall usa una TRAP: il programma mette indice e parametri nei registri ed esegue l'istruzione di trap, che passa in modo kernel e salta a un entry point fisso; il gestore indicizza la tabella delle system call. Un jump diretto violerebbe la protezione." },

{ id: "w04", topic: "intro",
  q: "A cosa serve il <b>vettore degli interrupt</b>?",
  options: [
    "A trovare l'indirizzo della routine di servizio di ciascun interrupt",
    "A conservare i dati in transito",
    "A contare quante volte ciascun dispositivo di I/O ha interrotto la CPU nel corso del tempo",
    "A stabilire la priorità dei processi pronti"
  ],
  correct: 0,
  expl: "È una tabella che associa a ogni tipo di interrupt l'indirizzo della relativa ISR: quando arriva un interrupt la CPU usa il suo numero come indice per saltare alla routine giusta." },

{ id: "w05", topic: "intro",
  q: "Qual è lo scopo principale della <b>multiprogrammazione</b>?",
  options: [
    "Tenere la CPU occupata facendola lavorare su altri processi mentre uno di essi è bloccato in attesa dell'I/O",
    "Eseguire più processi nello stesso istante su un core",
    "Ridurre l'occupazione di memoria dei programmi",
    "Rendere superfluo lo scheduler"
  ],
  correct: 0,
  expl: "Con più processi in memoria, quando uno si blocca su I/O la CPU passa a un altro, aumentando l'utilizzo. Su un solo core i processi non sono davvero simultanei (concorrenza, non parallelismo)." },

{ id: "w06", topic: "intro",
  q: "Nella gerarchia di memoria, spostandosi dai registri verso il disco:",
  options: [
    "la capacità cresce, mentre latenza e costo per byte, rispettivamente, peggiorano e calano",
    "sia la capacità sia la velocità aumentano",
    "la velocità aumenta e la capacità diminuisce, dato che i supporti più veloci sono anche più ampi",
    "il costo per byte cresce insieme alla capacità"
  ],
  correct: 0,
  expl: "Registri → cache → RAM → disco: scendendo aumenta la capacità e diminuisce il costo per byte, ma cresce la latenza di accesso. È il compromesso che giustifica le cache." },

{ id: "w07", topic: "intro",
  q: "A cosa serve l'<b>interrupt del timer</b> (clock) in un sistema time-sharing?",
  options: [
    "A far riprendere periodicamente il controllo al kernel per eseguire lo scheduler",
    "A sincronizzare gli orologi dei dischi",
    "A misurare con precisione il tempo impiegato da ciascuna system call per completarsi",
    "A generare i numeri casuali usati dal kernel"
  ],
  correct: 0,
  expl: "Il timer solleva interrupt a intervalli regolari (tick): permette al kernel di riprendere il controllo, far scadere il quanto di tempo e prelazionare il processo in esecuzione. Senza, un processo potrebbe monopolizzare la CPU." },

{ id: "w08", topic: "intro",
  q: "Che cosa fa il <b>bootstrap</b> all'accensione del calcolatore?",
  options: [
    "Carica in RAM il kernel e gli cede il controllo",
    "Il sistema operativo copia interamente se stesso su disco in vista del successivo riavvio",
    "La CPU manda subito in esecuzione il primo processo utente che risulta disponibile",
    "Il BIOS traduce in linguaggio macchina tutti i programmi utente"
  ],
  correct: 0,
  expl: "All'avvio la CPU esegue un programma in ROM/firmware (BIOS/UEFI) che individua il dispositivo di avvio, carica il kernel in RAM e gli trasferisce il controllo. Solo dopo il SO avvia i processi." },

// ---------- STRUTTURA SO E MACCHINE VIRTUALI ----------
{ id: "w09", topic: "struttura",
  q: "Qual è lo svantaggio principale di un <b>microkernel</b> rispetto a un kernel monolitico?",
  options: [
    "L'overhead dei messaggi tra i servizi in spazio utente riduce le prestazioni",
    "Il guasto di un servizio blocca tutto",
    "Non funziona su hardware dotato di unità di gestione della memoria (MMU) come quelli attuali",
    "Non consente di aggiungere nuovi driver"
  ],
  correct: 0,
  expl: "Nel microkernel i servizi (driver, file system) girano in spazio utente e comunicano via messaggi: guadagni robustezza e modularità, ma i continui passaggi kernel/utente per lo scambio di messaggi costano prestazioni." },

{ id: "w10", topic: "struttura",
  q: "Che cosa distingue un hypervisor di <b>tipo 1</b> da uno di <b>tipo 2</b>?",
  options: [
    "Il tipo 1 gira direttamente sull'hardware nudo, mentre il tipo 2 è eseguito come processo sopra un sistema operativo host",
    "Il tipo 1 emula la CPU via software",
    "Il tipo 2 è più veloce del tipo 1",
    "Il tipo 1 gestisce una sola VM per volta"
  ],
  correct: 0,
  expl: "L'hypervisor di tipo 1 (bare-metal) sta direttamente sull'hardware; quello di tipo 2 è un processo dentro un SO host (es. VirtualBox). Il tipo 1 tende a essere più efficiente perché non passa da un host." },

{ id: "w11", topic: "struttura",
  q: "In una struttura a <b>livelli</b> (layered), come sono organizzate le funzioni del SO?",
  options: [
    "In strati, ognuno dei quali usa solo lo strato immediatamente inferiore",
    "In processi utente indipendenti",
    "In un unico grande blocco privo di qualunque separazione tra le diverse responsabilità",
    "In moduli caricati dinamicamente e scambiabili a runtime"
  ],
  correct: 0,
  expl: "Il sistema è diviso in strati gerarchici: ogni livello offre servizi a quello superiore e usa solo quello inferiore. Facilita progettazione e verifica, ma può irrigidire e rallentare le chiamate che attraversano molti strati." },

{ id: "w12", topic: "struttura",
  q: "Che cos'è la <b>shell</b> di un sistema operativo?",
  options: [
    "Un interprete di comandi, eseguito come processo utente",
    "La componente del kernel che ha il compito di gestire tutte le richieste di interruzione",
    "Il modulo hardware che traduce gli indirizzi virtuali in indirizzi fisici durante gli accessi",
    "Il primo livello del microkernel a contatto con l'hardware"
  ],
  correct: 0,
  expl: "La shell è un programma utente (non parte del kernel) che legge comandi, li interpreta e avvia i relativi processi tramite system call come fork/exec. Ne esistono molte varianti intercambiabili." },

{ id: "w13", topic: "struttura",
  q: "Quale vantaggio offre l'esecuzione di più <b>macchine virtuali</b> sullo stesso hardware?",
  options: [
    "Isolamento tra ambienti diversi e miglior uso dell'hardware fisico",
    "L'eliminazione della necessità di un SO negli ospiti",
    "L'accesso diretto e privo di qualunque mediazione ai dispositivi fisici da parte degli ospiti",
    "Prestazioni sempre superiori a quelle native"
  ],
  correct: 0,
  expl: "La virtualizzazione consente di far convivere SO/ambienti diversi isolati sulla stessa macchina, consolidando i carichi e sfruttando meglio l'hardware. Ha però un overhead rispetto all'esecuzione nativa." },

{ id: "w14", topic: "struttura",
  q: "Che cos'è un <b>modulo kernel caricabile</b> (loadable module) tipico di Linux?",
  options: [
    "Codice di kernel aggiungibile o rimovibile a runtime senza ricompilare tutto",
    "Un processo utente con privilegi di root",
    "Una macchina virtuale leggera che non dispone di un proprio kernel dedicato separato",
    "Un file di configurazione letto solo all'avvio"
  ],
  correct: 0,
  expl: "I moduli (es. driver) si caricano/scaricano dinamicamente nel kernel a esecuzione, unendo la flessibilità dell'approccio a moduli alla velocità del monolitico (girano in spazio kernel)." },

{ id: "w15", topic: "struttura",
  q: "Nel modello <b>client-server</b> tipico del microkernel, come chiede un servizio un processo utente?",
  options: [
    "Inviando un messaggio al processo server, con il kernel che fa da tramite instradando la comunicazione",
    "Chiamando direttamente la funzione del server",
    "Scrivendo la richiesta in un registro della CPU",
    "Modificando la tabella delle pagine del server"
  ],
  correct: 0,
  expl: "Client e server sono processi in spazio utente; il microkernel si limita a instradare i messaggi tra loro (message passing). Questo isola i servizi, al costo dell'overhead di comunicazione." },

{ id: "w16", topic: "struttura",
  q: "In cosa differisce un <b>container</b> da una macchina virtuale completa?",
  options: [
    "Condivide il kernel dell'host",
    "Il container emula l'intero hardware sottostante, cosa che invece una macchina virtuale non fa",
    "È la VM a condividere il kernel dell'host, mentre il container ne usa uno tutto suo",
    "Il container non fornisce alcun isolamento tra i processi"
  ],
  correct: 0,
  expl: "I container isolano i processi (namespace, cgroup) ma condividono il kernel dell'host: più leggeri e veloci da avviare. Una VM porta con sé un intero SO ospite sopra l'hypervisor, con isolamento maggiore ma più pesante." },

// ---------- PROCESSI E THREAD ----------
{ id: "w17", topic: "processi",
  q: "Qual è la differenza tra <b>programma</b> e <b>processo</b>?",
  options: [
    "Il programma è codice passivo su disco, il processo è la sua esecuzione con stato",
    "Il processo è il sorgente, il programma l'eseguibile",
    "Sono sinonimi, cambia solo il contesto d'uso del termine tra un ambito e l'altro",
    "Il programma sta in memoria, il processo su disco"
  ],
  correct: 0,
  expl: "Il programma è un'entità statica (istruzioni memorizzate); il processo è un'entità dinamica: un programma in esecuzione con il suo contatore di programma, registri, stack e stato. Lo stesso programma può dare origine a più processi." },

{ id: "w18", topic: "processi",
  q: "Quale informazione <b>NON</b> è tipicamente contenuta nel <b>PCB</b> (Process Control Block)?",
  options: [
    "Il codice sorgente del programma in un linguaggio ad alto livello",
    "Il valore salvato dei registri e del PC",
    "Lo stato del processo insieme a tutte le relative informazioni utili allo scheduling",
    "La memoria assegnata e i file aperti"
  ],
  correct: 0,
  expl: "Il PCB conserva ciò che serve a riprendere il processo: stato, PC e registri, dati di scheduling, memoria, file aperti, ecc. Il codice sorgente non c'entra: al più c'è il riferimento all'immagine eseguibile in memoria." },

{ id: "w19", topic: "processi",
  q: "Cosa restituisce la <b>fork()</b> al processo figlio appena creato in UNIX?",
  options: [
    "Il valore 0",
    "Il PID del processo padre",
    "Il proprio PID di figlio",
    "Il valore -1 (successo)"
  ],
  correct: 0,
  expl: "fork() ritorna 0 al figlio e il PID del figlio al padre (così ciascuno sa chi è). Restituisce -1 solo in caso di errore. Il figlio è una copia dello spazio di indirizzi del padre (con copy-on-write)." },

{ id: "w20", topic: "processi",
  q: "Quale transizione tra stati di un processo è provocata dallo <b>scheduler</b>?",
  options: [
    "Da pronto a in esecuzione",
    "Da in esecuzione a bloccato",
    "Da bloccato a pronto",
    "Da nuovo a pronto"
  ],
  correct: 0,
  expl: "È lo scheduler a scegliere quale processo pronto mandare in esecuzione (pronto→esecuzione). Esecuzione→bloccato la causa il processo stesso (richiesta di I/O); bloccato→pronto la causa il completamento dell'I/O." },

{ id: "w21", topic: "processi",
  q: "Che cos'è un processo <b>zombie</b> in UNIX?",
  options: [
    "Un figlio terminato del quale il processo padre non ha ancora letto lo stato d'uscita con la wait()",
    "Un processo bloccato per sempre su un semaforo",
    "Un processo che consuma il 100% della CPU",
    "Un figlio il cui padre è terminato prima di lui"
  ],
  correct: 0,
  expl: "Uno zombie ha finito l'esecuzione ma resta nella tabella dei processi finché il padre non ne raccoglie lo stato con wait(). Il figlio rimasto senza padre (orfano) viene invece adottato da init." },

{ id: "w22", topic: "processi",
  q: "Perché il <b>context switch</b> tra due thread dello stesso processo è più leggero che tra due processi?",
  options: [
    "Non cambia lo spazio di indirizzi, quindi si evita il flush della TLB",
    "I thread non hanno registri propri da salvare",
    "I thread non vengono mai prelazionati dallo scheduler del sistema in alcuna circostanza",
    "Il kernel non viene mai coinvolto"
  ],
  correct: 0,
  expl: "Thread fratelli condividono spazio di indirizzi e tabella delle pagine: commutare tra loro non richiede di cambiare la MMU né svuotare la TLB. Tra processi diversi sì, con conseguenti cache/TLB miss." },

{ id: "w23", topic: "processi",
  q: "Qual è un limite dei <b>thread a livello utente</b> puri (senza supporto del kernel)?",
  options: [
    "Una chiamata bloccante di un thread blocca l'intero processo",
    "Il cambio di thread richiede sempre una syscall",
    "Thread diversi dello stesso processo non riescono a condividere tra loro le variabili globali",
    "Consumano più memoria dei thread kernel"
  ],
  correct: 0,
  expl: "Il kernel vede un solo processo e ne ignora i thread: se un thread fa una chiamata bloccante, tutto il processo si ferma e non si sfruttano più core. In cambio, il cambio di thread è velocissimo (in spazio utente, senza syscall)." },

{ id: "w24", topic: "processi",
  q: "Quale risorsa è <b>privata</b> di ciascun thread e non condivisa con i fratelli?",
  options: [
    "Lo stack e i registri",
    "Lo spazio di indirizzi, cioè il codice e i dati globali dell'intero processo di appartenenza",
    "L'insieme dei file che sono stati aperti dal processo",
    "Le variabili allocate nello heap"
  ],
  correct: 0,
  expl: "I thread di un processo condividono codice, dati globali, heap e file aperti; ciascuno ha però il proprio stack, i registri e il PC, perché eseguono flussi di controllo distinti." },

{ id: "w25", topic: "processi",
  q: "Cosa fa la <b>exec()</b> in UNIX dopo una fork()?",
  options: [
    "Sostituisce l'immagine del processo corrente con un nuovo programma, pur mantenendo lo stesso PID",
    "Crea un ulteriore figlio identico",
    "Termina il processo restituendo lo stato al padre",
    "Sospende il processo fino a un segnale"
  ],
  correct: 0,
  expl: "exec() rimpiazza il codice e i dati del processo con quelli di un nuovo eseguibile, mantenendo il PID. Il pattern classico è fork() (per creare il figlio) seguito da exec() nel figlio (per eseguire un altro programma)." },

{ id: "w26", topic: "processi",
  q: "Quale meccanismo di IPC realizza una comunicazione <b>unidirezionale</b> tra processi imparentati, come flusso di byte?",
  options: [
    "La pipe",
    "Il semaforo, che coordina gli accessi concorrenti a una risorsa condivisa tra più processi",
    "Il segnale (signal), inviato per notificare a un processo un evento asincrono",
    "La memoria condivisa mappata dai processi"
  ],
  correct: 0,
  expl: "La pipe collega l'output di un processo all'input di un altro come flusso di byte unidirezionale (tipico dei processi imparentati). Il semaforo serve a sincronizzare, i segnali a notificare eventi, la memoria condivisa è bidirezionale." },

// ---------- SINCRONIZZAZIONE ----------
{ id: "w27", topic: "sync",
  q: "Che cos'è una <b>race condition</b>?",
  options: [
    "Un esito che dipende dall'ordine con cui più processi accedono a dati condivisi",
    "Un processo più veloce che supera gli altri",
    "Un ciclo infinito dovuto a un errore commesso in fase di programmazione del codice",
    "Due processi che si bloccano a vicenda"
  ],
  correct: 0,
  expl: "Si ha race condition quando il risultato dipende dall'ordine di interleaving degli accessi a una risorsa condivisa. Si previene garantendo la mutua esclusione sulla sezione critica. Il blocco reciproco è invece il deadlock." },

{ id: "w28", topic: "sync",
  q: "Quale <b>NON</b> è una delle condizioni per una buona soluzione della mutua esclusione?",
  options: [
    "Un processo può restare nella sezione critica per un tempo illimitato",
    "Due processi non stanno mai insieme nella sezione critica",
    "Nessun processo fuori dalla sezione critica può bloccare l'ingresso di un altro processo",
    "Nessun processo attende all'infinito per entrare"
  ],
  correct: 0,
  expl: "Le condizioni richiedono mutua esclusione, nessun blocco da parte di chi è fuori dalla sezione critica, assenza di attesa infinita e nessuna assunzione su velocità/numero di CPU. Restare illimitatamente nella sezione critica è proprio ciò che si vuole evitare." },

{ id: "w29", topic: "sync",
  q: "Cosa fa l'operazione <b>down</b> (P) su un semaforo il cui valore è già 0?",
  options: [
    "Blocca il processo chiamante finché il valore non torna positivo",
    "Rende il valore negativo e prosegue",
    "Restituisce un errore al chiamante, il quale però continua ugualmente la sua esecuzione",
    "Porta il valore a 1 e prosegue"
  ],
  correct: 0,
  expl: "down decrementa il semaforo; se era 0 il processo si blocca in attesa. Una up successiva (fatta da un altro processo) lo risveglia. È il meccanismo che evita il busy waiting." },

{ id: "w30", topic: "sync",
  q: "Nel produttore-consumatore a semafori, perché il produttore deve fare <b>down(empty)</b> prima di <b>down(mutex)</b> e non dopo?",
  options: [
    "Invertendo l'ordine, con il buffer pieno il produttore terrebbe il mutex bloccandosi su empty: il consumatore non potrebbe entrare e si avrebbe deadlock",
    "Perché mutex deve valere 0 all'inizio",
    "Per rendere più veloce l'accesso al buffer",
    "Perché empty e mutex sono lo stesso semaforo"
  ],
  correct: 0,
  expl: "Se il produttore prendesse prima mutex e poi si bloccasse su down(empty) col buffer pieno, terrebbe la mutua esclusione mentre attende: il consumatore non potrebbe entrare per svuotare → deadlock. Il semaforo di conteggio va acquisito prima del mutex." },

{ id: "w31", topic: "sync",
  q: "Qual è la differenza chiave tra un <b>mutex</b> e un <b>semaforo contatore</b>?",
  options: [
    "Il mutex ha un proprietario: solo chi lo ha acquisito può rilasciarlo",
    "Il mutex protegge più processi insieme",
    "Il mutex può assumere qualunque valore intero, mentre il semaforo può valere solo 0 oppure 1",
    "Il semaforo non è in grado di bloccare i processi"
  ],
  correct: 0,
  expl: "Il mutex è un lock binario con nozione di proprietà (lo rilascia solo chi lo ha preso, utile per l'ereditarietà di priorità). Il semaforo contatore conta risorse e può essere 'up-ato' da un processo diverso da chi ha fatto la down." },

{ id: "w32", topic: "sync",
  q: "In un <b>monitor</b>, cosa fa l'operazione <b>wait</b> su una variabile condizione?",
  options: [
    "Sospende il processo e rilascia il monitor",
    "Incrementa un contatore interno come farebbe l'operazione up eseguita su un semaforo classico",
    "Impedisce a chiunque altro di entrare nel monitor fino a nuovo ordine esplicito",
    "Termina definitivamente il processo chiamante"
  ],
  correct: 0,
  expl: "wait sospende il processo su una variabile condizione e libera il monitor, così un altro può entrarvi (magari per rendere vera la condizione e fare signal). A differenza del semaforo, wait blocca sempre; signal senza attese in coda non ha effetto." },

{ id: "w33", topic: "sync",
  q: "Quale delle seguenti <b>NON</b> è una delle quattro condizioni necessarie per il <b>deadlock</b>?",
  options: [
    "La prelazione delle risorse già assegnate ai processi",
    "La mutua esclusione sulle risorse",
    "Il possesso di una risorsa con la contemporanea attesa di un'altra (condizione di hold and wait)",
    "L'attesa circolare tra i processi coinvolti"
  ],
  correct: 0,
  expl: "Le quattro condizioni di Coffman sono: mutua esclusione, possesso e attesa, assenza di prelazione e attesa circolare. La prelazione, se possibile, romperebbe il deadlock: quindi è la sua assenza (non la prelazione) a essere necessaria." },

{ id: "w34", topic: "sync",
  q: "Perché l'istruzione <b>TSL</b> funziona per la mutua esclusione anche su un multiprocessore?",
  options: [
    "Legge e scrive la parola in modo atomico, bloccando il bus",
    "Disabilita gli interrupt su tutti i core",
    "Viene eseguita solo dal core che in quell'istante possiede la priorità più elevata di tutte",
    "Impedisce agli altri core di usare la propria cache"
  ],
  correct: 0,
  expl: "TSL (Test and Set Lock) esegue lettura+scrittura in un'unica azione atomica, bloccando il bus di memoria: nessun altro core può interporsi. Disabilitare gli interrupt proteggerebbe solo la CPU corrente, non basterebbe su più core." },

{ id: "w35", topic: "sync",
  q: "Quando è accettabile usare uno <b>spin lock</b> (busy waiting)?",
  options: [
    "Quando l'attesa prevista è molto breve e ci sono più core, così che un altro core possa rilasciare il lock a breve",
    "Quando l'attesa è lunga e c'è un solo core",
    "Sempre, perché non spreca cicli di CPU",
    "Solo in modalità utente, mai nel kernel"
  ],
  correct: 0,
  expl: "Lo spin lock gira testando la variabile e consuma CPU: conviene solo se l'attesa è brevissima e un altro core può rilasciare il lock nel frattempo. Con attese lunghe (o un solo core) è meglio bloccare il processo cedendo la CPU." },

{ id: "w36", topic: "sync",
  q: "Come si può mitigare l'<b>inversione di priorità</b>?",
  options: [
    "Con l'ereditarietà di priorità: chi tiene il lock eredita la priorità di chi lo attende",
    "Dando priorità massima al processo più basso",
    "Vietando ai processi ad alta priorità di acquisire e di usare in qualunque modo i lock",
    "Disabilitando lo scheduling a priorità"
  ],
  correct: 0,
  expl: "Con l'ereditarietà di priorità, un processo a bassa priorità che detiene un lock atteso da uno ad alta priorità ne eredita temporaneamente la priorità, così finisce presto e rilascia il lock. È tipico dei sistemi real-time." },

// ---------- SCHEDULING ----------
{ id: "w37", topic: "sched",
  q: "Qual è il difetto tipico dello scheduling <b>FCFS</b>?",
  options: [
    "L'effetto convoglio: un job lungo in testa fa attendere tutti gli altri",
    "Richiede di conoscere la durata dei job",
    "Provoca troppi context switch a causa dell'uso di un quanto di tempo eccessivamente piccolo",
    "Favorisce sistematicamente i job I/O-bound"
  ],
  correct: 0,
  expl: "In FCFS (non prelazionato) un processo CPU-bound lungo davanti alla coda blocca i job brevi che gli stanno dietro: l'effetto convoglio alza il tempo di attesa medio e sottoutilizza l'I/O. Non serve conoscere le durate (quello è SJF)." },

{ id: "w38", topic: "sched",
  q: "Rispetto a quale metrica <b>SJF</b> (shortest job first) è ottimale?",
  options: [
    "Il tempo di attesa medio",
    "L'utilizzo della CPU",
    "Il tempo di risposta percepito dai processi interattivi che si aspettano una reazione rapida",
    "L'equità nella ripartizione della CPU"
  ],
  correct: 0,
  expl: "SJF minimizza il tempo di attesa medio mettendo davanti i job più brevi. Ha però due problemi: richiede di conoscere (o stimare) la durata e può causare starvation dei job lunghi." },

{ id: "w39", topic: "sched",
  q: "In cosa <b>SRTN</b> (shortest remaining time next) differisce da SJF?",
  options: [
    "È prelazionato: se arriva un job il cui tempo di esecuzione è minore del tempo residuo di quello in corso, lo interrompe",
    "Non richiede di stimare la durata dei job",
    "Serve i job in ordine di arrivo",
    "Assegna a ciascun processo un quanto fisso"
  ],
  correct: 0,
  expl: "SRTN è la versione prelazionata di SJF: se arriva un processo il cui tempo di esecuzione è minore del tempo residuo di quello in corso, quest'ultimo viene prelazionato. Migliora il tempo di attesa ma aggrava la starvation dei job lunghi." },

{ id: "w40", topic: "sched",
  q: "Nel <b>Round-Robin</b>, cosa succede se il quanto di tempo è troppo piccolo?",
  options: [
    "L'overhead dei context switch cresce e riduce il lavoro utile",
    "Lo scheduler degenera in FCFS",
    "I processi di tipo CPU-bound vengono nettamente favoriti rispetto a quelli interattivi",
    "Aumenta il rischio di deadlock"
  ],
  correct: 0,
  expl: "Un quanto troppo piccolo fa commutare di continuo: il costo del context switch (registri, flush TLB, cache miss) diventa una frazione rilevante del tempo. Un quanto troppo grande, al contrario, fa degenerare il RR in FCFS." },

{ id: "w41", topic: "sched",
  q: "Come si evita la <b>starvation</b> nello scheduling a priorità?",
  options: [
    "Con l'aging: la priorità dei processi in attesa cresce nel tempo",
    "Assegnando a tutti la stessa priorità fissa",
    "Eseguendo sempre per primi i processi che hanno la priorità più bassa di tutte quante",
    "Disabilitando la prelazione dello scheduler"
  ],
  correct: 0,
  expl: "Con priorità statiche un job a bassa priorità può non girare mai. L'aging aumenta gradualmente la priorità dei processi che attendono da tempo, garantendo che prima o poi vengano eseguiti." },

{ id: "w42", topic: "sched",
  q: "Come si comporta un processo <b>CPU-bound</b> in uno scheduler a code multiple con retroazione (MLFQ)?",
  options: [
    "Tende a scendere di livello",
    "Resta stabilmente nella coda a priorità più alta",
    "Viene individuato e terminato immediatamente dallo scheduler non appena riconosciuto come tale",
    "Si sposta a caso tra tutte le code"
  ],
  correct: 0,
  expl: "Chi consuma interamente il quanto (tipico dei CPU-bound) viene declassato verso code a priorità inferiore ma con quanto maggiore; chi cede la CPU presto per I/O resta o sale nelle code alte, favorendo l'interattività." },

{ id: "w43", topic: "sched",
  q: "Come si definisce il <b>tempo di turnaround</b> di un processo?",
  options: [
    "L'intervallo dall'arrivo del processo al suo completamento",
    "Il tempo passato solo nella coda dei pronti",
    "Il tempo che intercorre dalla richiesta iniziale fino alla prima risposta effettivamente ricevuta",
    "Il tempo di uso effettivo della CPU"
  ],
  correct: 0,
  expl: "Il turnaround è tempo di completamento − tempo di arrivo (attesa + esecuzione + eventuale I/O). Il tempo di attesa è il solo tempo nella coda dei pronti; il tempo di risposta è quello fino alla prima reazione." },

{ id: "w44", topic: "sched",
  q: "Qual è la caratteristica di uno scheduling <b>senza prelazione</b> (non-preemptive)?",
  options: [
    "Il processo tiene la CPU finché non termina o non si blocca da solo",
    "Il processo può essere interrotto in ogni istante",
    "Lo scheduler interviene puntualmente a ciascun singolo tick generato dal timer di sistema",
    "È adatto solo ai sistemi real-time hard"
  ],
  correct: 0,
  expl: "Senza prelazione lo scheduler agisce solo quando il processo rilascia la CPU (termina o si blocca). È semplice ma poco reattivo e vulnerabile all'effetto convoglio; il time-sharing richiede invece la prelazione a quanti." },

{ id: "w45", topic: "sched",
  q: "Perché nello scheduling multiprocessore è utile l'<b>affinità</b> di un processo a una CPU?",
  options: [
    "Per riusare la cache già popolata su quella CPU, evitando i cache miss che seguono a una migrazione su un altro core",
    "Perché ogni CPU esegue solo certi processi",
    "Per impedire ogni migrazione tra i core",
    "Per bilanciare da solo il carico"
  ],
  correct: 0,
  expl: "Rieseguire un processo sulla stessa CPU sfrutta i dati già presenti nella sua cache: migrare su un altro core costringe a ripopolare la cache (miss). L'affinità è un compromesso col bilanciamento del carico, che a volte richiede di migrare." },

{ id: "w46", topic: "sched",
  q: "Su cosa si basa lo scheduler <b>CFS</b> di Linux per scegliere il prossimo task?",
  options: [
    "Sul vruntime: sceglie il task con tempo virtuale minore",
    "Sull'ordine di arrivo nella coda dei pronti",
    "Su una priorità fissa che viene assegnata al task nel momento esatto della sua creazione",
    "Sulla durata stimata del prossimo burst"
  ],
  correct: 0,
  expl: "Il CFS assegna a ciascun task un vruntime (tempo di CPU consumato, pesato dal nice) e sceglie sempre quello con vruntime minore, avvicinando l'ideale di ripartizione equa. I task appena svegliati da I/O risultano favoriti." },

// ---------- GESTIONE MEMORIA ----------
{ id: "w47", topic: "memoria",
  q: "Che cos'è un <b>indirizzo logico</b> (virtuale)?",
  options: [
    "L'indirizzo generato dalla CPU, che la MMU traduce in fisico",
    "L'indirizzo della cella fisica di RAM usata",
    "Un indirizzo valido soltanto per i dati e non anche per il codice del programma eseguito",
    "L'offset all'interno del blocco su disco"
  ],
  correct: 0,
  expl: "La CPU genera indirizzi logici/virtuali; la MMU li traduce a runtime in indirizzi fisici. Questa separazione consente rilocazione, protezione e memoria virtuale, e permette a ogni processo di 'vedere' un proprio spazio di indirizzi." },

{ id: "w48", topic: "memoria",
  q: "Quale tipo di frammentazione elimina la <b>paginazione</b>?",
  options: [
    "L'esterna",
    "L'interna",
    "Entrambe del tutto",
    "Nessuna delle due"
  ],
  correct: 0,
  expl: "Con pagine/frame di dimensione fissa qualunque frame libero è utilizzabile: sparisce la frammentazione esterna. Resta un po' di frammentazione interna nell'ultima pagina di ciascun processo, non completamente piena." },

{ id: "w49", topic: "memoria",
  q: "Quale campo <b>NON</b> fa parte di una tipica voce della tabella delle pagine?",
  options: [
    "Il nome del processo proprietario",
    "Il bit di presenza/assenza",
    "Il numero del frame in cui la pagina risiede all'interno della memoria fisica del sistema",
    "I bit di protezione (lettura/scrittura)"
  ],
  correct: 0,
  expl: "Una voce contiene il frame fisico, il bit presente/assente, i bit di protezione, il bit di modifica (M) e di riferimento (R), a volte caching. Non contiene il 'nome del processo': la tabella è già per-processo." },

{ id: "w50", topic: "memoria",
  q: "A cosa serve la <b>TLB</b>?",
  options: [
    "A memorizzare in una cache associativa le traduzioni pagina→frame che sono state usate più di recente",
    "A conservare le pagine sfrattate",
    "A contenere le istruzioni in attesa di esecuzione",
    "A tradurre gli indirizzi fisici in logici"
  ],
  correct: 0,
  expl: "La TLB è una cache associativa delle traduzioni recenti: se l'indirizzo cercato è presente (hit) si evita di leggere la tabella delle pagine in RAM. Sfrutta la località; al context switch va (in genere) svuotata o gestita con ASID." },

{ id: "w51", topic: "memoria",
  q: "Qual è il vantaggio principale di una tabella delle pagine <b>a più livelli</b>?",
  options: [
    "Non occorre allocare le porzioni di tabella relative a spazi mai usati",
    "La traduzione richiede un solo accesso",
    "Rende del tutto superflua la TLB nella traduzione degli indirizzi virtuali in fisici",
    "Rende inutile il bit di presenza/assenza"
  ],
  correct: 0,
  expl: "Con la gerarchia si allocano solo la directory di primo livello e i sotto-livelli effettivamente usati: le regioni vuote dello spazio di indirizzi non consumano tabella. Il costo è più accessi per la traduzione, mitigati dalla TLB." },

{ id: "w52", topic: "memoria",
  q: "La <b>frammentazione interna</b> è lo spazio sprecato:",
  options: [
    "dentro un'unità di allocazione che il dato non riempie del tutto",
    "tra due partizioni libere non contigue",
    "nella tabella delle pagine, in corrispondenza di tutte le voci che restano inutilizzate",
    "negli slot vuoti della TLB"
  ],
  correct: 0,
  expl: "È spreco DENTRO un blocco/pagina/partizione: es. l'ultima pagina di un processo raramente è piena. Lo spazio libero spezzettato TRA le allocazioni è invece la frammentazione esterna." },

{ id: "w53", topic: "memoria",
  q: "Con pagine da 4 KB, in quanti bit di offset si divide un indirizzo virtuale?",
  options: [
    "12 bit",
    "4 bit",
    "10 bit",
    "16 bit"
  ],
  correct: 0,
  expl: "L'offset indirizza un byte dentro la pagina: 4 KB = 2^12 byte → 12 bit di offset. I bit restanti dell'indirizzo formano il numero di pagina, usato per indicizzare la tabella." },

{ id: "w54", topic: "memoria",
  q: "In cosa la <b>segmentazione</b> differisce dalla paginazione?",
  options: [
    "I segmenti hanno lunghezza variabile e riflettono la struttura logica del programma (codice, dati, stack)",
    "I segmenti hanno tutti la stessa dimensione",
    "Non richiede alcuna traduzione degli indirizzi",
    "Elimina del tutto la frammentazione esterna"
  ],
  correct: 0,
  expl: "I segmenti (codice, dati, stack…) hanno lunghezza variabile e senso logico, facilitando condivisione e protezione. Essendo blocchi contigui di taglia variabile, però, soffrono la frammentazione esterna, che la paginazione evita." },

{ id: "w55", topic: "memoria",
  q: "In cosa consiste lo <b>swapping</b>?",
  options: [
    "Nel trasferire interi processi tra memoria e disco",
    "Nel tradurre gli indirizzi logici in fisici",
    "Nello scambiare tra loro due pagine che si trovano entrambe già presenti dentro la RAM",
    "Nel copiare la cache della CPU in RAM"
  ],
  correct: 0,
  expl: "Lo swapping sposta un intero processo dalla RAM al disco (e viceversa) per liberare memoria quando i processi attivi non ci stanno tutti. È a grana grossa; la memoria virtuale a domanda opera invece a livello di singola pagina." },

{ id: "w56", topic: "memoria",
  q: "Qual è il compito della <b>MMU</b>?",
  options: [
    "Tradurre a runtime gli indirizzi virtuali in fisici",
    "Decidere quale processo mandare in esecuzione",
    "Gestire l'ordinamento delle code delle richieste che vengono inviate ai dispositivi di I/O",
    "Allocare i blocchi dei file su disco"
  ],
  correct: 0,
  expl: "La Memory Management Unit è l'unità hardware che, per ogni accesso, traduce l'indirizzo virtuale in fisico (usando tabella delle pagine e TLB) e verifica i permessi, sollevando una trap in caso di violazione o pagina assente." },

// ---------- SOSTITUZIONE PAGINE E WORKING SET ----------
{ id: "w57", topic: "sostituzione",
  q: "Cosa avvia un <b>page fault</b>?",
  options: [
    "Il riferimento a una pagina la cui voce ha il bit di presenza a 'assente'",
    "L'esaurimento dei frame liberi",
    "La scadenza del quanto di tempo del processo che si trova attualmente in esecuzione",
    "Una scrittura su una pagina non modificata"
  ],
  correct: 0,
  expl: "Quando la MMU trova la pagina marcata come non presente solleva un'eccezione (page fault): il kernel la carica da disco in un frame (sfrattandone eventualmente un'altra) e riavvia l'istruzione." },

{ id: "w58", topic: "sostituzione",
  q: "Perché l'algoritmo <b>ottimale</b> (OPT) di sostituzione non è realizzabile in pratica?",
  options: [
    "Richiede di conoscere i riferimenti futuri",
    "È troppo lento da calcolare a runtime",
    "Consuma una quantità eccessiva di memoria per mantenere aggiornati tutti i suoi contatori",
    "Soffre dell'anomalia di Belady"
  ],
  correct: 0,
  expl: "OPT sfratta la pagina che sarà riusata più in là nel futuro: darebbe il minimo di page fault, ma richiede di conoscere la sequenza futura di riferimenti, ignota. Serve come riferimento teorico per valutare gli altri algoritmi." },

{ id: "w59", topic: "sostituzione",
  q: "Quali algoritmi di sostituzione soffrono dell'<b>anomalia di Belady</b>?",
  options: [
    "Quelli basati su FIFO (FIFO, seconda chance, clock)",
    "Solo l'algoritmo ottimale OPT",
    "Gli algoritmi che approssimano l'LRU, come l'aging e l'NFU basati su contatori software",
    "Tutti gli algoritmi, senza eccezione"
  ],
  correct: 0,
  expl: "L'anomalia (più frame → più page fault) colpisce gli algoritmi FIFO-based, che non godono della proprietà di inclusione (stack). LRU, OPT e le approssimazioni tipo aging sono algoritmi a stack e ne sono immuni." },

{ id: "w60", topic: "sostituzione",
  q: "Perché <b>LRU</b> non soffre dell'anomalia di Belady?",
  options: [
    "È un algoritmo a stack: le pagine tenute con k frame sono sempre incluse in quelle tenute con k+1, quindi i fault non crescono",
    "Perché sfratta la pagina più vecchia",
    "Perché non usa il bit di riferimento R",
    "Perché conosce i riferimenti futuri"
  ],
  correct: 0,
  expl: "LRU (come OPT) gode della proprietà di inclusione: aggiungendo frame l'insieme delle pagine presenti non fa mai 'sparire' una pagina che c'era prima, quindi i fault non possono aumentare. Sfrattare la più vecchia in ingresso è invece FIFO." },

{ id: "w61", topic: "sostituzione",
  q: "Nell'algoritmo <b>clock</b> (orologio), cosa succede se la pagina puntata dalla lancetta ha il bit R = 1?",
  options: [
    "Si azzera il suo bit R e la lancetta avanza alla successiva",
    "La pagina viene subito sfrattata",
    "La pagina viene riscritta immediatamente su disco prima di essere lasciata al proprio posto",
    "La lancetta torna indietro di una posizione"
  ],
  correct: 0,
  expl: "Il clock dà una 'seconda chance': se R=1 azzera R e avanza senza sfrattare; se R=0 sfratta. Se tutte hanno R=1, dopo un giro completo torna alla prima (ora con R=0) e la sfratta, comportandosi come FIFO puro." },

{ id: "w62", topic: "sostituzione",
  q: "Su quali bit si basa l'algoritmo <b>NRU</b> per classificare le pagine in 4 classi?",
  options: [
    "Il bit R (riferimento) e il bit M (modifica)",
    "Il bit di presenza e quello di protezione",
    "Il bit di validità della voce e il bit che abilita la sua memorizzazione nella cache",
    "Solo il bit di riferimento R"
  ],
  correct: 0,
  expl: "NRU combina R e M in quattro classi (00, 01, 10, 11) e sfratta una pagina a caso dalla classe non vuota più bassa. Preferisce scartare pagine non riferite e non modificate (che non vanno riscritte su disco)." },

{ id: "w63", topic: "sostituzione",
  q: "Che cos'è il <b>working set</b> di un processo?",
  options: [
    "L'insieme delle pagine che il processo ha referenziato nell'ultima finestra di tempo o di riferimenti",
    "Tutte le pagine mai allocate al processo",
    "Le pagine modificate non ancora salvate",
    "I frame liberi riservati al processo"
  ],
  correct: 0,
  expl: "Il working set W(t,Δ) sono le pagine usate nell'ultima finestra Δ: approssima ciò che serve 'ora' per il principio di località. Tenere in memoria i working set di tutti i processi attivi evita il thrashing." },

{ id: "w64", topic: "sostituzione",
  q: "Quando si manifesta il <b>thrashing</b>?",
  options: [
    "Quando la somma dei working set supera i frame e il sistema pagina di continuo",
    "Quando la CPU è al 100% per un solo processo",
    "Quando la TLB viene svuotata completamente a ogni context switch che avviene tra due processi",
    "Quando un processo modifica troppe pagine"
  ],
  correct: 0,
  expl: "Se i frame non bastano a contenere i working set, i processi si sottraggono le pagine a vicenda e passano il tempo a paginare invece che a lavorare: l'utilizzo della CPU crolla. Si cura riducendo il grado di multiprogrammazione." },

{ id: "w65", topic: "sostituzione",
  q: "Come aggiorna i contatori l'algoritmo <b>aging</b> a ogni tick?",
  options: [
    "Shift a destra del contatore e inserimento del bit R nella posizione più significativa",
    "Somma il bit R senza fare shift",
    "Azzera completamente tutti i contatori associati alle pagine che sono presenti in memoria",
    "Incrementa di 1 ogni contatore"
  ],
  correct: 0,
  expl: "L'aging fa scorrere il contatore a destra e mette R nel bit più a sinistra: così i riferimenti recenti pesano più di quelli vecchi (che 'invecchiano' uscendo). È la migliore approssimazione software di LRU; NFU senza shift 'non dimentica' mai." },

{ id: "w66", topic: "sostituzione",
  q: "Perché conviene sfrattare una pagina con bit di modifica <b>M = 0</b> invece di una con M = 1?",
  options: [
    "Si può scartare senza riscriverla su disco",
    "Una pagina con M = 0 ha la garanzia di non essere più riutilizzata dal processo in futuro",
    "Una pagina con M = 1 non si trova in memoria",
    "Una con M = 0 occupa meno spazio in RAM"
  ],
  correct: 0,
  expl: "Se M=0 la copia su disco è ancora valida: la pagina si scarta subito. Se M=1 (dirty) va prima riscritta su disco, operazione costosa. Per questo NRU e altri preferiscono le vittime pulite." },

// ---------- FILE SYSTEM ----------
{ id: "w67", topic: "fs",
  q: "Quale informazione <b>NON</b> è contenuta nell'<b>i-node</b> di un file?",
  options: [
    "Il nome del file",
    "I permessi e il proprietario",
    "I puntatori ai blocchi che contengono i dati veri e propri del file all'interno del disco",
    "La dimensione e i timestamp"
  ],
  correct: 0,
  expl: "L'i-node contiene attributi (permessi, proprietario, dimensione, timestamp, contatore link) e i puntatori ai blocchi. Il NOME sta nella directory, che associa un nome al numero di i-node: così più nomi (hard link) possono puntare allo stesso i-node." },

{ id: "w68", topic: "fs",
  q: "Cosa distingue un <b>hard link</b> da un <b>link simbolico</b>?",
  options: [
    "L'hard link è una voce di directory verso lo stesso i-node, mentre il link simbolico è un file che contiene un percorso",
    "L'hard link contiene un percorso",
    "Solo l'hard link attraversa più file system",
    "Il link simbolico incrementa il contatore link"
  ],
  correct: 0,
  expl: "L'hard link è una voce di directory verso lo stesso i-node (stesso file, contatore link incrementato). Il link simbolico è un file che contiene un percorso: può puntare ovunque ma resta 'appeso' se l'originale è cancellato." },

{ id: "w69", topic: "fs",
  q: "Come tiene traccia dei blocchi di un file l'allocazione con <b>FAT</b>?",
  options: [
    "Con una tabella in cui ogni voce punta al blocco successivo",
    "Con puntatori diretti e indiretti in un i-node",
    "Con un intervallo di blocchi contigui il cui indirizzo di partenza è scritto nella directory",
    "Con una bitmap dei blocchi occupati"
  ],
  correct: 0,
  expl: "La FAT (File Allocation Table) è un array indicizzato per blocco: ogni voce indica il blocco successivo della catena (o un marcatore di fine). Tenuta in memoria rende veloce l'accesso casuale, ma la tabella cresce con il disco." },

{ id: "w70", topic: "fs",
  q: "Qual è il difetto principale dell'allocazione <b>contigua</b> dei file?",
  options: [
    "Provoca frammentazione esterna e complica la crescita dei file",
    "Rende lento l'accesso sequenziale",
    "Non consente in nessun modo l'accesso diretto, cioè casuale, ai blocchi che compongono il file",
    "Richiede una tabella FAT molto grande"
  ],
  correct: 0,
  expl: "L'allocazione contigua offre ottimo accesso sequenziale e diretto (basta base + offset), ma soffre di frammentazione esterna e rende difficile far crescere un file se i blocchi adiacenti sono occupati." },

{ id: "w71", topic: "fs",
  q: "Qual è lo svantaggio dell'allocazione a <b>lista concatenata</b> dei blocchi?",
  options: [
    "L'accesso diretto è lento",
    "Soffre di forte frammentazione esterna",
    "Spreca moltissimo spazio, perché richiede una tabella indicizzata di dimensioni enormi",
    "Impedisce ai file di crescere dinamicamente"
  ],
  correct: 0,
  expl: "Con la lista concatenata ogni blocco punta al successivo: niente frammentazione esterna e crescita facile, ma per raggiungere il blocco n-esimo si devono attraversare i precedenti (accesso diretto inefficiente) e un puntatore rotto perde il resto." },

{ id: "w72", topic: "fs",
  q: "Che cosa contiene fondamentalmente una <b>directory</b>?",
  options: [
    "Associazioni tra i nomi dei file e i relativi i-node o metadati",
    "I blocchi dati veri e propri dei file",
    "La bitmap che tiene traccia di tutti i blocchi liberi disponibili nel file system",
    "Le traduzioni degli indirizzi dei file mappati"
  ],
  correct: 0,
  expl: "La directory è essenzialmente una tabella che mappa nomi a i-node (in UNIX) o a strutture con i metadati. Non contiene i dati dei file, ma il modo per localizzarli: è ciò che rende possibili i link." },

{ id: "w73", topic: "fs",
  q: "A cosa serve il <b>journaling</b> in un file system?",
  options: [
    "A registrare le operazioni prima di eseguirle, così da poter ripristinare la consistenza dopo un crash senza scandire l'intero disco",
    "A comprimere i file usati raramente",
    "A tradurre più in fretta i nomi in i-node",
    "A distribuire i blocchi su più dischi"
  ],
  correct: 0,
  expl: "Il journal è un registro delle modifiche ai metadati (e talvolta ai dati): scritte prima di applicarle, permettono dopo un crash di riapplicare o annullare le operazioni incomplete, evitando la lunga scansione di fsck." },

{ id: "w74", topic: "fs",
  q: "Quale vantaggio ha la <b>bitmap</b> dei blocchi liberi rispetto alla lista concatenata dei liberi?",
  options: [
    "Facilita l'allocazione contigua trovando blocchi liberi adiacenti",
    "Occupa sempre meno spazio",
    "Non deve essere aggiornata quando un blocco viene allocato o liberato durante l'uso normale",
    "Elimina i puntatori nei blocchi dati"
  ],
  correct: 0,
  expl: "La bitmap (un bit per blocco) rende facile individuare sequenze di blocchi liberi contigui, utile per l'allocazione. La lista concatenata dei liberi occupa poco quando il disco è quasi pieno ma non aiuta a trovare blocchi adiacenti." },

{ id: "w75", topic: "fs",
  q: "Aumentando la <b>dimensione del blocco</b> del file system, cosa succede?",
  options: [
    "Cresce l'efficienza sui file grandi ma aumenta la frammentazione interna",
    "Diminuisce la frammentazione interna",
    "I file grandi finiscono per richiedere un numero maggiore di livelli di indirezione dei puntatori",
    "L'accesso diretto diventa impossibile"
  ],
  correct: 0,
  expl: "Blocchi grandi migliorano il throughput sui file grandi e riducono i puntatori necessari, ma sprecano di più sui tanti file piccoli (l'ultimo blocco è mediamente mezzo vuoto). È lo stesso compromesso della dimensione di pagina." },

{ id: "w76", topic: "fs",
  q: "Nell'i-node, a cosa servono i puntatori <b>indiretti</b> (singolo, doppio, triplo)?",
  options: [
    "A indirizzare i file grandi",
    "A duplicare i blocchi dati per ridondanza",
    "A collegare tra loro gli i-node di file diversi che risiedono sul medesimo volume del disco",
    "A memorizzare il nome del file su più blocchi"
  ],
  correct: 0,
  expl: "I file piccoli usano solo i puntatori diretti (accesso rapido); i file grandi ricorrono ai blocchi indiretti (uno, due, tre livelli di puntatori), che ampliano enormemente la dimensione massima senza gonfiare tutti gli i-node." },

// ---------- DISCHI, RAID E SSD ----------
{ id: "w77", topic: "dischi",
  q: "Come sceglie la prossima richiesta l'algoritmo di scheduling del disco <b>SSTF</b>?",
  options: [
    "Serve la richiesta col tempo di ricerca (seek) più breve rispetto alla posizione attuale della testina",
    "Serve le richieste in ordine di arrivo",
    "Serve sempre la richiesta al cilindro esterno",
    "Alterna cilindri interni ed esterni"
  ],
  correct: 0,
  expl: "SSTF (Shortest Seek Time First) sceglie la richiesta più vicina alla testina: riduce il seek medio ma può causare starvation delle richieste lontane se ne arrivano di continuo di vicine." },

{ id: "w78", topic: "dischi",
  q: "In cosa differisce <b>LOOK</b> da <b>SCAN</b> (secondo la convenzione del corso)?",
  options: [
    "LOOK inverte all'ultima richiesta pendente, SCAN al bordo fisico",
    "SCAN inverte all'ultima richiesta pendente",
    "LOOK serve le richieste esattamente nell'ordine cronologico con cui esse sono arrivate al sistema",
    "SCAN va in una sola direzione, LOOK in entrambe"
  ],
  correct: 0,
  expl: "Entrambi sono 'ad ascensore', ma SCAN arriva fino all'estremità fisica del disco prima di invertire, mentre LOOK inverte non appena non ci sono più richieste pendenti in quella direzione, risparmiando il tratto a vuoto." },

{ id: "w79", topic: "dischi",
  q: "Perché <b>C-SCAN</b> offre un tempo di attesa più <b>uniforme</b> di SCAN?",
  options: [
    "Serve in una sola direzione e poi torna all'inizio senza servire",
    "Serve due volte i cilindri centrali",
    "Riduce fino a zero il tempo di ricerca (seek) che la testina impiega tra una richiesta e l'altra",
    "Non attraversa mai i cilindri senza richieste"
  ],
  correct: 0,
  expl: "C-SCAN tratta i cilindri come una lista circolare: serve in una direzione, poi salta rapidamente all'inizio senza servire nel ritorno. Ogni cilindro viene così visitato con lo stesso 'periodo', riducendo la varianza dell'attesa rispetto a SCAN." },

{ id: "w80", topic: "dischi",
  q: "Quale caratteristica ha <b>RAID 0</b> (striping)?",
  options: [
    "Ottime prestazioni e piena capacità, ma nessuna ridondanza",
    "Ridondanza per copia identica (mirroring)",
    "Parità distribuita su tutti i dischi che consente di tollerare il guasto di un singolo disco",
    "Doppia parità che tollera due guasti"
  ],
  correct: 0,
  expl: "RAID 0 distribuisce i dati a strisce su più dischi per velocità e capacità piena, ma senza alcuna ridondanza: il guasto di un solo disco fa perdere tutto. Non è propriamente 'ridondante' nonostante il nome RAID." },

{ id: "w81", topic: "dischi",
  q: "Qual è il costo principale di <b>RAID 1</b> (mirroring)?",
  options: [
    "Dimezza la capacità utile",
    "Rende molto lente tutte le letture",
    "Non riesce a tollerare il guasto di nemmeno uno dei dischi che compongono l'array RAID",
    "Richiede il calcolo della parità a ogni scrittura"
  ],
  correct: 0,
  expl: "RAID 1 mantiene una copia identica su un secondo disco: tollera un guasto e ha letture veloci (leggibili da entrambe le copie), ma la capacità utile è la metà. Non usa parità (quello è RAID 5/6)." },

{ id: "w82", topic: "dischi",
  q: "Come si ricostruisce il contenuto di un disco guasto in <b>RAID 5</b>?",
  options: [
    "Facendo lo XOR dei blocchi corrispondenti sui dischi rimasti",
    "Copiandolo da un disco di parità dedicato",
    "Leggendo la copia speculare che è mantenuta in modo identico su un altro disco dell'array",
    "Ripartendo dall'ultimo snapshot nel journal"
  ],
  correct: 0,
  expl: "In RAID 5 la parità è lo XOR dei dati della striscia, distribuita su tutti i dischi. Poiché lo XOR è invertibile, il blocco perso si ricava come XOR di tutti gli altri (dati + parità). Tollera un solo guasto; con due, i dati sono persi." },

{ id: "w83", topic: "dischi",
  q: "A cosa serve il <b>wear leveling</b> negli SSD?",
  options: [
    "A distribuire le scritture su tutte le celle, tramite la FTL che rimappa gli indirizzi, così da non consumarne alcune troppo in fretta",
    "A comprimere i dati sulle celle flash",
    "A cifrare i dati scritti sulle celle",
    "A raddoppiare la velocità di lettura"
  ],
  correct: 0,
  expl: "Le celle flash sopportano un numero limitato di cicli di scrittura/cancellazione. Il wear leveling, tramite la FTL che rimappa gli indirizzi logici, sparge le scritture su tutte le celle così da consumarle in modo uniforme." },

{ id: "w84", topic: "dischi",
  q: "Cosa comunica il comando <b>TRIM</b> a un SSD?",
  options: [
    "Quali blocchi non contengono più dati validi",
    "Quali blocchi copiare su un disco di backup",
    "L'ordine ottimale secondo cui il dispositivo dovrebbe servire tutte le richieste pendenti",
    "La chiave di cifratura da usare per i dati"
  ],
  correct: 0,
  expl: "Il file system, cancellando un file, usa TRIM per dire all'SSD quali pagine non servono più: il garbage collector può cancellarle in anticipo, riducendo la write amplification e mantenendo le prestazioni in scrittura." },

{ id: "w85", topic: "dischi",
  q: "In un disco magnetico, cosa misura il <b>tempo di ricerca</b> (seek time)?",
  options: [
    "Il tempo per spostare la testina sul cilindro giusto",
    "Il tempo perché il settore ruoti sotto la testina",
    "Il tempo impiegato dal disco per trasferire in memoria i dati che sono stati appena letti",
    "Il ritardo introdotto dal controller del disco"
  ],
  correct: 0,
  expl: "Il seek time è il tempo per muovere il braccio/testina fino al cilindro desiderato; è di solito la componente dominante. La latenza rotazionale è l'attesa che il settore ruoti sotto la testina; poi c'è il tempo di trasferimento." }
);
