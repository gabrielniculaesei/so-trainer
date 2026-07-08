/* BANCA DOMANDE 5: domande aggiuntive */
window.MCQ.push(
{ id: "n01", topic: "intro",
  q: "Nel metodo di I/O basato su <b>interrupt</b> (senza DMA), chi trasferisce i dati dal buffer del controller alla RAM?",
  options: [
    "La CPU, all'interno della routine di gestione dell'interrupt",
    "Il controller stesso, scrivendo direttamente in RAM al termine dell'operazione",
    "Il driver, che opera in background senza coinvolgere la CPU",
    "La MMU, durante la traduzione degli indirizzi del buffer",
    "Il disco, tramite il canale diretto previsto dallo standard SATA"
  ],
  correct: 0,
  expl: "Con gli interrupt la CPU è avvisata della fine dell'operazione, ma il trasferimento buffer→RAM resta a suo carico (nella routine di gestione). È col DMA che il trasferimento avviene senza la CPU, coinvolta solo dall'interrupt finale." },

{ id: "n02", topic: "intro",
  q: "Le istruzioni di tipo <b>IN/OUT</b> sulle porte di I/O del controller, di norma:",
  options: [
    "devono essere eseguite in modalità kernel (salvo porte specificamente 'sbloccate')",
    "devono essere eseguite in modalità utente, per non rallentare il kernel",
    "sono state sostituite dalle syscall e non esistono più nelle architetture moderne",
    "sono eseguibili in qualsiasi modalità, perché protette dal controller stesso",
    "sono riservate esclusivamente al chip DMA e non alla CPU"
  ],
  correct: 0,
  expl: "Le IN/OUT sono privilegiate: per questo i driver devono essere stabili. Alcuni OS (microkernel) le eseguono in modalità utente; i sistemi moderni adottano un ibrido sbloccando solo alcune porte. L'alternativa è la mappatura in memoria del dispositivo." },

{ id: "n03", topic: "intro",
  q: "Con riferimento al bus <b>PCIe</b>, individuare l'affermazione <b>corretta</b>.",
  options: [
    "È un bus seriale che alloca linee alle richieste, con un multiplexing nel tempo",
    "È un bus parallelo che trasferisce tutti i bit di una word contemporaneamente su linee separate",
    "È il bus che collega esclusivamente la CPU al controller delle porte di I/O",
    "È un bus riservato alla comunicazione tra i core della CPU e la cache L3",
    "È un bus a bassa velocità usato per i dispositivi legacy come tastiera e mouse"
  ],
  correct: 0,
  expl: "Il PCIe è un moderno bus seriale ad alta velocità: alloca linee alle richieste in base alla priorità (multiplexing nel tempo), con un controller piuttosto complesso. Il bus CPU↔controller I/O è il DMI." },

{ id: "n04", topic: "intro",
  q: "Che cosa contiene il <b>vettore degli interrupt</b>?",
  options: [
    "Gli indirizzi delle routine di gestione associate a ciascun tipo di interrupt",
    "L'elenco degli interrupt attualmente in attesa di essere gestiti dalla CPU",
    "I registri salvati del processo interrotto dall'ultimo interrupt",
    "Le priorità assegnate dall'OS a ciascun processo interattivo",
    "I bit che indicano quali dispositivi hanno l'interrupt abilitato"
  ],
  correct: 0,
  expl: "Il vettore degli interrupt mappa ogni interrupt sulla propria routine di gestione: alla ricezione, la CPU vi carica la routine corrispondente (dopo aver salvato PC e PSW del processo interrotto)." },

{ id: "n05", topic: "intro",
  q: "Quale parametro viene passato all'istruzione <b>TRAP</b> durante una chiamata di sistema?",
  options: [
    "L'indice che identifica l'istruzione kernel richiesta in un'apposita tabella",
    "L'indirizzo fisico della routine kernel da eseguire, calcolato dal compilatore",
    "Il PID del processo chiamante, per il controllo dei permessi",
    "Il livello di priorità con cui la routine kernel dovrà essere schedulata",
    "Il puntatore allo stack utente su cui la routine kernel scriverà il risultato"
  ],
  correct: 0,
  expl: "Alla TRAP si passa un indice: l'istruzione corrispondente viene cercata in una tabella dell'OS che ne contiene anche l'indirizzo di memoria. Dopo l'esecuzione si torna in modalità utente e i registri vengono ripristinati." },

{ id: "n06", topic: "intro",
  q: "Una pipeline a 5 stadi da 4 ns ciascuno esegue 1000 istruzioni (pipeline inizialmente vuota). Quanto tempo serve, circa?",
  options: [
    "(5 + 999) · 4 = 4016 ns",
    "1000 · 5 · 4 = 20000 ns",
    "1000 · 4 = 4000 ns esatti, perché la latenza iniziale è trascurata",
    "5 · 4 + 1000 = 1020 ns",
    "999 · 5 + 4 = 4999 ns"
  ],
  correct: 0,
  expl: "La prima istruzione esce dopo 5·4 = 20 ns (riempimento della pipeline); le altre 999 escono una ogni 4 ns: T = (5 + 1000 − 1)·4 = 4016 ns. La formula generale è (k + N − 1)·t." },

{ id: "n07", topic: "struttura",
  q: "Con riferimento alla variante a <b>anelli concentrici</b> (MULTICS) della struttura a livelli, individuare l'affermazione <b>falsa</b>.",
  options: [
    "I livelli sono separati anche fisicamente, grazie ad hardware dedicato",
    "Ogni livello gira a un diverso grado di protezione",
    "Per usare una procedura di un livello inferiore si effettua una chiamata TRAP",
    "La robustezza del codice aumenta rispetto alla struttura a livelli semplice",
    "L'overhead delle chiamate tra livelli risulta ridotto rispetto ai livelli semplici"
  ],
  correct: 4,
  expl: "È il contrario: la separazione hardware e le TRAP tra anelli AMPLIFICANO l'overhead già presente nella struttura a livelli. È uno dei motivi per cui MULTICS non ebbe il successo sperato." },

{ id: "n08", topic: "struttura",
  q: "Nel microkernel MINIX 3, qual è il compito del processo <b>reincarnation</b>?",
  options: [
    "Controllare lo stato degli altri componenti e ricreare quelli in errore",
    "Reincarnare i processi utente terminati con errore, ripristinandone lo stato dal PCB",
    "Ricaricare il microkernel senza riavviare la macchina dopo un aggiornamento",
    "Migrare i processi tra i core per bilanciare il carico del sistema",
    "Gestire la coda dei messaggi tra i componenti in modalità utente"
  ],
  correct: 0,
  expl: "Il reincarnation server monitora i componenti (che girano come processi utente isolati): se uno ha problemi viene killato e ricreato. È uno dei vantaggi di robustezza della struttura a microkernel." },

{ id: "n09", topic: "struttura",
  q: "Perché la classificazione di <b>KVM</b> (Linux) come hypervisor è dibattuta?",
  options: [
    "È nel kernel (tipo 1), ma ogni VM gira come processo utente di Linux (tipo 2)",
    "Supporta sia la virtualizzazione sia l'emulazione di architetture diverse",
    "È un hypervisor di tipo 2 che però richiede hardware dedicato per funzionare",
    "Viene distribuito sia come modulo kernel sia come applicazione standalone",
    "Esegue le VM in modalità kernel reale, violando la definizione di hypervisor"
  ],
  correct: 0,
  expl: "KVM sta nel kernel Linux (quindi 'gira sull'hardware' come un tipo 1), ma le VM sono normali processi utente di Linux (comportamento da tipo 2): per questo viene classificato in entrambi i modi." },

{ id: "n10", topic: "struttura",
  q: "Dal punto di vista della <b>sicurezza</b>, perché le aziende isolano i servizi in VM separate?",
  options: [
    "Un attacco resta confinato alla VM del servizio colpito, senza raggiungere gli altri",
    "Le VM cifrano automaticamente tutto il traffico di rete tra i servizi interni",
    "L'hypervisor blocca ogni syscall proveniente da software non firmato",
    "Le VM impediscono per costruzione l'esecuzione di codice in modalità kernel",
    "Un servizio su VM non può essere raggiunto dall'esterno della rete aziendale"
  ],
  correct: 0,
  expl: "Il processo malevolo che compromette un servizio può accedere solo a ciò che sta sulla stessa VM: gli altri servizi (su VM diverse) e l'host restano protetti. Un tempo si otteneva lo stesso effetto con macchine fisiche separate e reti DMZ." },

{ id: "n11", topic: "processi",
  q: "Durante un context-switch causato dalla prelazione, dove vengono salvati PC/PSW e gli altri registri del processo?",
  options: [
    "PC e PSW nello stack attuale; gli altri registri (e i memory limits) nel PCB del processo",
    "Tutti i registri nello stack utente del processo, che viene poi spostato su disco",
    "Tutti i registri nel vettore degli interrupt, in attesa della rischedulazione",
    "PC e PSW nel PCB; gli altri registri restano nella CPU fino al ritorno del processo",
    "Tutti i registri nella tabella delle pagine, accanto alle voci del processo"
  ],
  correct: 0,
  expl: "La prelazione è implementata con un interrupt: salvataggio di PC e PSW nello stack attuale, caricamento della routine dal vettore degli interrupt, salvataggio degli altri registri (e memory limits) nel PCB, interrogazione dello scheduler, ripristino del processo scelto." },

{ id: "n12", topic: "processi",
  q: "Dopo una fork(), come fanno padre e figlio a eseguire codice diverso pur avendo lo stesso programma?",
  options: [
    "Il codice distingue i due casi (basta un if) sul valore restituito dalla fork",
    "Il kernel carica automaticamente nel figlio la seconda metà del file eseguibile",
    "Il figlio riparte dalla prima istruzione del programma, il padre continua da dove era",
    "Il padre viene sospeso finché il figlio non chiama la exec(), poi ripartono insieme",
    "Non possono: per differenziarli è obbligatorio che il figlio chiami subito la exec()"
  ],
  correct: 0,
  expl: "Il codice dei due processi è identico, ma può essere scritto per distinguere i contesti (padre o figlio) con un semplice if sul risultato della fork. La exec() è il caso tipico ma non obbligatorio." },

{ id: "n13", topic: "processi",
  q: "Quando termina un processo <b>multithread</b>?",
  options: [
    "Quando tutti i suoi thread hanno terminato",
    "Quando termina il thread che ha effettuato la prima thread_create",
    "Quando la maggioranza dei suoi thread ha chiamato thread_exit",
    "Quando il thread principale chiama thread_yield senza altri thread pronti",
    "Quando uno qualsiasi dei suoi thread chiama thread_exit"
  ],
  correct: 0,
  expl: "Il processo termina quando terminano tutti i suoi thread: la thread_exit fa terminare solo il chiamante." },

{ id: "n14", topic: "processi",
  q: "In un'applicazione con GUI, perché si tende a dedicare all'interfaccia un thread (kernel) apposito?",
  options: [
    "Perché la GUI non deve mai 'freezarsi', anche se altri thread si bloccano su I/O",
    "Perché la GUI richiede una priorità hardware che solo i thread kernel possiedono",
    "Perché il rendering grafico è possibile esclusivamente in modalità kernel",
    "Perché i thread utente non possono ricevere gli eventi di input della tastiera",
    "Perché la GUI deve girare sullo stesso core del kernel per ridurre la latenza"
  ],
  correct: 0,
  expl: "È l'esempio classico del modello molti-a-molti: le operazioni bloccanti (I/O, correzione ortografica...) possono condividere thread kernel, ma la GUI merita un thread kernel dedicato così non si blocca mai insieme agli altri." },

{ id: "n15", topic: "processi",
  q: "Nel modello di thread a livello utente, dove risiede la <b>tabella dei thread</b> e chi fa lo scheduling?",
  options: [
    "Nella memoria del processo, dentro il runtime system, che ne cura anche lo scheduling",
    "Nel kernel, ma lo scheduling è delegato al runtime system del processo",
    "Nella memoria del processo, ma lo scheduling resta a carico dello scheduler del kernel",
    "Nel PCB del processo, gestita direttamente dal dispatcher del sistema operativo",
    "In una pagina condivisa tra tutti i processi, gestita dalla libreria Pthreads"
  ],
  correct: 0,
  expl: "Con thread utente l'OS non sa nulla dei thread: tabella e scheduler stanno nel runtime system dentro il processo. Vantaggio: scheduling personalizzabile e switch senza TRAP; svantaggi: chiamate bloccanti e page fault bloccano tutto." },

{ id: "n16", topic: "processi",
  q: "Che cos'è lo <b>pseudoparallelismo</b>?",
  options: [
    "L'illusione di parallelismo creata da context-switch molto rapidi su una sola CPU",
    "L'esecuzione simultanea di due thread su due core fisici distinti",
    "La tecnica con cui una CPU esegue due istruzioni della stessa pipeline in un ciclo",
    "La condivisione della memoria tra processi che girano su CPU diverse",
    "L'esecuzione alternata di kernel e processi utente sullo stesso core"
  ],
  correct: 0,
  expl: "Con time-sharing e context-switch rapidissimi i processi SEMBRANO paralleli, ma su una CPU l'esecuzione è sequenziale (CPU virtuali). Il parallelismo vero richiede più core/CPU." },

{ id: "n17", topic: "sync",
  q: "Un semaforo S è inizializzato a 3. Cinque processi eseguono down(S), poi un sesto processo esegue una up(S). Quanti processi risultano bloccati alla fine?",
  options: [
    "1",
    "2",
    "0",
    "3",
    "5"
  ],
  correct: 0,
  expl: "Le prime 3 down passano (S: 3→2→1→0); la 4ª e la 5ª bloccano i chiamanti (2 bloccati). La up risveglia uno dei bloccati: ne resta 1. Il valore 'concettuale' 3−5+1 = −1 conferma: un processo in attesa." },

{ id: "n18", topic: "sync",
  q: "Quale regola va rispettata nel progettare una <b>sezione critica</b>?",
  options: [
    "Deve essere il più piccola possibile e non contenere chiamate potenzialmente bloccanti",
    "Deve contenere tutte le chiamate bloccanti del processo, per proteggerle dalle race condition",
    "Deve essere eseguita con gli interrupt abilitati, per non ritardare la prelazione",
    "Deve includere le operazioni down sui semafori contatori di risorse",
    "Deve essere delimitata da due chiamate a thread_yield, per favorire l'alternanza"
  ],
  correct: 0,
  expl: "Sezione critica minimale e MAI chiamate bloccanti al suo interno (il caso down(mutex) prima di down(empty) nel produttore-consumatore genera stallo). Le down sui contatori di risorse vanno FUORI dalla sezione critica." },

{ id: "n19", topic: "sync",
  q: "A cosa servono le istruzioni <b>barriera</b> nei sistemi multicore?",
  options: [
    "A impedire che il riordino delle istruzioni invalidi le soluzioni software (Peterson)",
    "A bloccare il bus della memoria durante l'esecuzione dell'istruzione TSL",
    "A sincronizzare il clock dei vari core prima di un'operazione atomica",
    "A impedire ai processi utente di eseguire istruzioni privilegiate",
    "A svuotare la pipeline prima di un context-switch tra processi"
  ],
  correct: 0,
  expl: "I multicore riordinano le istruzioni (es. FETCH/STORE su variabili diverse) per efficienza: questo rompe Peterson. Le barriere obbligano tutti i processori a 'fermarsi lì' prima di continuare, ripristinando l'ordine atteso." },

{ id: "n20", topic: "sync",
  q: "Perché le variabili di condizione di un monitor <b>non</b> hanno bisogno di memorizzare un valore?",
  options: [
    "Perché nel monitor opera un solo thread alla volta: non si possono perdere sveglie da contare",
    "Perché il compilatore sostituisce ogni variabile di condizione con un semaforo inizializzato a 1",
    "Perché il loro valore è ricavabile in ogni momento dal contatore count del monitor",
    "Perché le signal vengono memorizzate nella coda dei messaggi del kernel",
    "Perché ogni wait viene sempre eseguita prima di qualunque signal, per costruzione"
  ],
  correct: 0,
  expl: "Il monitor garantisce mutua esclusione: le sequenze test-e-blocco non possono essere interrotte a metà, quindi il problema della sveglia persa non si pone e non serve contare. Contropartita: una signal senza thread in attesa si perde (innocuamente)." },

{ id: "n21", topic: "sync",
  q: "Nel produttore-consumatore <b>con monitor</b> (nomenclatura delle slide), cosa fa il produttore quando trova il buffer pieno (count = N)?",
  options: [
    "Chiama wait(full), bloccandosi sulla variabile di condizione full",
    "Chiama wait(empty), bloccandosi sulla variabile di condizione empty",
    "Chiama down(empty), bloccandosi sul semaforo contatore degli slot liberi",
    "Chiama signal(full) per avvisare il consumatore di estrarre un item",
    "Chiama sleep() e attende la wakeup diretta del consumatore"
  ],
  correct: 0,
  expl: "Attenzione alla nomenclatura! Nel MONITOR del corso: il produttore con buffer pieno fa wait(full); se count=1 fa signal(empty). Nella soluzione con SEMAFORI invece il produttore fa down(empty). Le slide usano nomi 'incrociati' nei due schemi: il prof ci tiene." },

{ id: "n22", topic: "sync",
  q: "Nella soluzione dei lettori-scrittori con semafori, uno scrittore esce e c'è un gruppo di lettori in attesa. Cosa accade?",
  options: [
    "La up(db) risveglia UN lettore, che a catena (up(mutex)) fa entrare gli altri",
    "La up(db) risveglia contemporaneamente tutti i lettori in attesa sul semaforo",
    "La up(mutex) risveglia lo scrittore successivo, che ha la precedenza sui lettori",
    "I lettori entrano uno alla volta, ciascuno dopo una up(db) del precedente",
    "Il gruppo entra solo quando rc torna a zero per la seconda volta"
  ],
  correct: 0,
  expl: "I lettori bloccati si accodano: il primo risvegliato incrementa rc e con up(mutex) sblocca il successivo, in cascata ('in massa'). È il senso del trattare i lettori come gruppo unico." },

{ id: "n23", topic: "sync",
  q: "Nella soluzione dei 5 filosofi <b>con monitor</b>, perché al risveglio conviene ricontrollare che lo stato sia EATING?",
  options: [
    "Le variabili di condizione non hanno memoria: il risveglio da solo non autorizza a procedere",
    "Perché il monitor Mesa esegue le signal in ordine casuale tra i thread in attesa",
    "Perché il vettore degli stati è fuori dal monitor e soggetto a race condition",
    "Perché la test() viene chiamata solo dal filosofo stesso e mai dai vicini",
    "Perché il mutex del monitor viene rilasciato prima dell'aggiornamento dello stato"
  ],
  correct: 0,
  expl: "Le variabili di condizione non contengono valori: il filosofo che si risveglia deve verificare che qualcuno abbia davvero impostato il suo stato a EATING prima di procedere (altrimenti torna a bloccarsi). Il vettore degli stati sta DENTRO il monitor." },

{ id: "n24", topic: "sync",
  q: "Il 'bit di attesa' che salva una sveglia persa funziona con 1 produttore e 1 consumatore. Perché non basta nel caso generale?",
  options: [
    "Con più processi possono andare perse più sveglie: serve contarle, ed è ciò che fa il semaforo",
    "Perché il bit può essere letto da un solo processo alla volta, creando un collo di bottiglia",
    "Perché il bit va azzerato dal kernel, con una syscall troppo costosa per essere ripetuta",
    "Perché con più consumatori il bit deve diventare una matrice di bit n×n",
    "Perché il bit di attesa funziona solo se il buffer ha esattamente una posizione"
  ],
  correct: 0,
  expl: "Un solo bit memorizza al più UNA sveglia pendente: con più produttori/consumatori possono perdersene di più. Il semaforo generalizza il bit in un contatore (mai negativo) con down/up atomiche." },

{ id: "n25", topic: "sched",
  q: "Che cos'è l'effetto <b>convoglio</b> nello scheduling?",
  options: [
    "I processi I/O-bound si accodano dietro un processo CPU-bound che monopolizza la CPU",
    "I processi CPU-bound si accodano dietro i processi I/O-bound, che hanno priorità",
    "Lo scheduler raggruppa i processi simili per ridurre i context-switch",
    "Più processi bloccati sullo stesso semaforo vengono risvegliati in blocco",
    "Le richieste di I/O vengono accorpate dal controller per sfruttare la cache del disco"
  ],
  correct: 0,
  expl: "Senza prelazione, un CPU-bound con burst lunghi tiene fermi tutti gli I/O-bound (che userebbero la CPU per pochissimo e libererebbero il comparto I/O). È il motivo per cui i sistemi interattivi richiedono la prelazione." },

{ id: "n26", topic: "sched",
  q: "Shortest Process Next con a = 0,5: stima iniziale S₁ = 10 ms, burst reali T₁ = 6 ms e T₂ = 4 ms. Quanto vale la stima S₃?",
  options: [
    "6 ms",
    "8 ms",
    "5 ms",
    "7 ms",
    "4,5 ms"
  ],
  correct: 0,
  expl: "S₂ = 0,5·T₁ + 0,5·S₁ = 0,5·6 + 0,5·10 = 8. S₃ = 0,5·T₂ + 0,5·S₂ = 0,5·4 + 0,5·8 = 6 ms. La media esponenziale 'insegue' i burst reali ricordando il passato." },

{ id: "n27", topic: "sched",
  q: "Perché lo scheduling <b>a lotteria</b> avvantaggia naturalmente i processi I/O-bound?",
  options: [
    "Consumano meno ticket restando poco in coda: alle estrazioni ne hanno di più",
    "Ricevono un ticket bonus dal kernel ad ogni operazione di I/O completata",
    "I loro ticket valgono doppio nelle estrazioni successive a un blocco",
    "Possono scambiare i propri ticket con quelli dei processi CPU-bound",
    "La lotteria estrae solo tra i processi risvegliati da meno di un quanto"
  ],
  correct: 0,
  expl: "Chi sta poco in coda pronti consuma meno ticket, quindi si presenta alle estrazioni con più ticket residui: boost naturale, analogo a quello del VRT basso nel CFS." },

{ id: "n28", topic: "sched",
  q: "Nelle code multiple, come si risolve la starvation della coda a priorità più bassa (metodo 'elegante' del corso)?",
  options: [
    "Un tempo di CPU complessivo viene spartito in percentuali prefissate tra TUTTE le code",
    "Si applica l'aging spostando periodicamente tutti i processi nella coda più alta",
    "Si serve una richiesta della coda bassa ogni due richieste della coda alta",
    "Si fondono le due code più basse quando la loro lunghezza supera una soglia",
    "Si raddoppia il quanto della coda bassa ad ogni ciclo in cui non viene servita"
  ],
  correct: 0,
  expl: "Esempio del corso: su 5 secondi, 60% alla coda a priorità 4, 20% alla 3, 16% alla 2, 4% alla 1. Ogni coda spartisce internamente il suo 'spicchio': cascasse il mondo, ogni coda ha CPU garantita." },

{ id: "n29", topic: "sched",
  q: "In Round-Robin, se il quanto diventa <b>più grande di ogni CPU burst</b>:",
  options: [
    "la prelazione non scatta mai e l'algoritmo degenera in FCFS",
    "i processi vengono comunque prelazionati alla metà del quanto",
    "il sistema diventa più reattivo perché i burst finiscono prima del quanto",
    "l'algoritmo degenera in SJF, perché i burst brevi finiscono per primi",
    "la coda dei pronti si svuota e lo scheduler passa alle code multiple"
  ],
  correct: 0,
  expl: "Se ogni processo si blocca o termina prima della scadenza del quanto, la prelazione non interviene mai: RR si comporta esattamente come FCFS. All'estremo opposto, quanti piccoli = tanti context-switch (overhead)." },

{ id: "n30", topic: "sched",
  q: "Che cos'è la <b>latenza di dispatch</b>?",
  options: [
    "Il tempo che il dispatcher impiega a sospendere un processo e ripristinare l'altro",
    "Il tempo che lo scheduler impiega ad applicare l'algoritmo di scelta sulla coda",
    "L'intervallo tra l'arrivo di un processo in coda e la sua prima schedulazione",
    "Il ritardo tra la scadenza del quanto e l'effettivo interrupt del timer",
    "Il tempo di attesa medio dei processi I/O-bound nella coda del dispositivo"
  ],
  correct: 0,
  expl: "È il costo 'fisico' del cambio di contesto operato dal dispatcher (salvataggio/ripristino stato), che varia a seconda del contesto (thread fratelli vs processi diversi). Si somma all'overhead della decisione dello scheduler." },

{ id: "n31", topic: "sched",
  q: "Come avviene lo scheduling dei <b>thread a livello utente</b>?",
  options: [
    "Lo fa il runtime system dentro il processo, senza prelazione, contando sulle yield dei thread",
    "Lo fa il kernel, con la prelazione applicata a ogni singolo thread del processo",
    "Lo fa il dispatcher hardware della CPU, alternando i thread ad ogni ciclo di clock",
    "Lo fa il primo thread creato, che funge da scheduler con priorità fissa",
    "Non esiste: i thread utente vengono eseguiti nell'ordine di creazione fino al termine"
  ],
  correct: 0,
  expl: "Il runtime environment implementa scheduler e strutture dati in spazio utente: niente prelazione (non può riceverla), quindi i thread devono rilasciare la CPU volontariamente (thread_yield). Il vantaggio: scheduling personalizzabile per le esigenze del processo." },

{ id: "n32", topic: "memoria",
  q: "Registro base RB = 24000, registro limite RL = 6000. Il processo genera l'indirizzo logico 4000. Cosa fa la MMU?",
  options: [
    "Verifica 4000 ≤ 6000, poi traduce: indirizzo fisico = 24000 + 4000 = 28000",
    "Verifica 4000 ≤ 24000, poi traduce: indirizzo fisico = 6000 + 4000 = 10000",
    "Genera una TRAP: l'indirizzo 4000 è inferiore al registro base 24000",
    "Traduce direttamente in 28000 senza alcun controllo, delegato all'OS",
    "Verifica 4000 + 24000 ≤ 6000 e, fallendo il controllo, termina il processo"
  ],
  correct: 0,
  expl: "Rilocazione dinamica: prima il controllo di protezione (indirizzo logico ≤ RL: 4000 ≤ 6000 ✓), poi la somma con la base: 24000 + 4000 = 28000. Con indirizzo logico 6100 > RL sarebbe scattata la TRAP." },

{ id: "n33", topic: "memoria",
  q: "Che cos'è l'<b>ASID</b> (Address-Space IDentifier)?",
  options: [
    "L'identificativo del processo nelle voci di TLB/cache virtuali, che ne evita il flush",
    "L'indice della tabella delle pagine di primo livello nel registro PTBR",
    "Il numero progressivo assegnato a ogni spazio di indirizzamento virtuale creato dalla fork",
    "Il campo della voce di tabella che identifica il frame fisico assegnato alla pagina",
    "Il tag fisico usato dalla cache per la ricerca preliminare in parallelo alla MMU"
  ],
  correct: 0,
  expl: "Il numero di pagina è univoco solo dentro un processo: con l'ASID nelle voci, TLB e cache virtuali possono ospitare voci di più processi senza flush al context-switch (le voci del vecchio processo restano riutilizzabili)." },

{ id: "n34", topic: "memoria",
  q: "Sistema con tabella delle pagine a <b>3 livelli</b>, senza TLB. Quanti accessi in RAM servono per completare un riferimento a memoria?",
  options: [
    "4",
    "3",
    "2",
    "1",
    "6"
  ],
  correct: 0,
  expl: "Una fetch per ciascun livello di tabella (3) più l'accesso al dato: 4 accessi. In generale k livelli ⇒ k+1 accessi: ecco perché con le tabelle multilivello il TLB diventa ancora più prezioso." },

{ id: "n35", topic: "memoria",
  q: "Pagine da 4 KB, tabella: pagina 2 → frame 5 (presente). Il processo genera l'indirizzo virtuale 8196. Quale indirizzo fisico produce la MMU?",
  options: [
    "20484 (= 5·4096 + 4)",
    "8196 (l'indirizzo resta invariato se la pagina è presente)",
    "20480 (= 5·4096, l'offset si azzera nella traduzione)",
    "24580 (= 6·4096 + 4)",
    "12292 (= 3·4096 + 4)"
  ],
  correct: 0,
  expl: "8196 / 4096 = 2 con resto 4: pagina 2, offset 4. La tabella dice frame 5: indirizzo fisico = 5·4096 + 4 = 20484. In bit: si sostituisce il numero di pagina col numero di frame e si ricopia l'offset." },

{ id: "n36", topic: "memoria",
  q: "In media, quanto spazio resta inutilizzato nell'<b>ultima pagina</b> di un processo (frammentazione interna)?",
  options: [
    "Circa metà pagina",
    "Circa una pagina intera",
    "Praticamente zero, grazie allo zero-fill-on-demand",
    "Circa un quarto di pagina",
    "Dipende solo dalla dimensione del TLB"
  ],
  correct: 0,
  expl: "L'ultima pagina è piena 'a caso': in media resta vuota mezza pagina. È l'argomento a favore delle pagine piccole (meno frammentazione interna e migliore risoluzione del working set), da bilanciare coi vantaggi delle pagine grandi." },

{ id: "n37", topic: "memoria",
  q: "Perché la paginazione <b>elimina la frammentazione esterna</b>?",
  options: [
    "Perché qualunque frame libero può ospitare qualunque pagina di qualunque processo",
    "Perché le pagine vengono compattate periodicamente dal paging daemon",
    "Perché i processi ricevono sempre frame fisicamente contigui in RAM",
    "Perché la dimensione delle pagine si adatta dinamicamente ai buchi disponibili",
    "Perché lo swapping sposta su disco i processi che frammenterebbero la memoria"
  ],
  correct: 0,
  expl: "Non servono zone contigue: ogni 'buchino' (frame) è riutilizzabile da qualsiasi pagina. Resta solo la frammentazione interna (ultima pagina parzialmente usata). Nessuna compattazione necessaria." },

{ id: "n38", topic: "memoria",
  q: "Differenza tra <b>swapping</b> e <b>memoria virtuale paginata</b> nel gestire la RAM piena:",
  options: [
    "Lo swapping parcheggia su disco l'intero processo; la paginazione sposta singole pagine",
    "Lo swapping sposta singole pagine su disco; la paginazione l'intero processo con il suo PCB",
    "Lo swapping è gestito dalla MMU; la paginazione dallo scheduler di medio termine",
    "La paginazione richiede il vincolo di contiguità; lo swapping lo elimina del tutto",
    "Non c'è differenza: 'swapping' è il nome storico della paginazione su richiesta"
  ],
  correct: 0,
  expl: "Con lo swapping (scheduler di medio termine) il processo parcheggiato non è schedulabile finché non rientra. Con la memoria virtuale solo alcune pagine stanno su disco (area di swap) e il processo continua a girare con quelle in RAM." },

{ id: "n39", topic: "memoria",
  q: "Con la cache dotata di <b>tag fisici</b>, come si accelera la ricerca rispetto a una cache con indirizzi fisici?",
  options: [
    "L'offset (uguale in virtuale e fisico) filtra le voci in parallelo alla traduzione della MMU",
    "Il numero di frame viene predetto dalla cache in base agli ultimi accessi del processo",
    "Il tag fisico sostituisce l'ASID, dimezzando la dimensione di ogni voce della cache",
    "La cache interroga direttamente la tabella delle pagine senza passare dalla MMU",
    "I tag fisici ordinano le voci per frequenza d'uso, velocizzando la scansione"
  ],
  correct: 0,
  expl: "L'offset non cambia con la traduzione: si usa come 'tag fisico' per una ricerca preliminare MENTRE la MMU traduce. Se nessuna voce ha quell'offset → miss immediato; altrimenti restano poche candidate da confrontare all'arrivo dell'indirizzo fisico. Utile per l'aliasing delle pagine condivise." },

{ id: "n40", topic: "memoria",
  q: "Un processo con 2 figli (dopo fork) condivide con loro una pagina P read-only in copy-on-write. Il PADRE scrive su P. Cosa accade?",
  options: [
    "Si copia la pagina per il padre; l'originale resta condiviso (read-only) tra i figli",
    "Vengono create subito tre copie di P, una per ciascun processo coinvolto",
    "La scrittura fallisce: con più di due condivisori il copy-on-write è disabilitato",
    "I figli ricevono ciascuno una copia e il padre mantiene l'originale scrivibile",
    "La pagina P viene spostata nell'area di swap e ricaricata a domanda da ciascuno"
  ],
  correct: 0,
  expl: "Il COW copia solo per chi scrive: il padre ottiene la sua copia privata; l'originale resta in comune ai due figli e DEVE rimanere read-only (se un figlio scriverà, si copierà di nuovo). Mai copie anticipate." },

{ id: "n41", topic: "sostituzione",
  q: "Nell'algoritmo NRU, a quale classe appartiene una pagina con R = 1 e M = 0?",
  options: [
    "Classe 2",
    "Classe 1",
    "Classe 0",
    "Classe 3",
    "Dipende dal dirty bit"
  ],
  correct: 0,
  expl: "R è il bit più significativo: classe = 2·R + M = 2·1 + 0 = 2. Ordine di scarto: classe 0 (R0,M0) → 1 (R0,M1) → 2 (R1,M0) → 3 (R1,M1). M È il dirty bit." },

{ id: "n42", topic: "sostituzione",
  q: "Seconda chance: la pagina in testa ha R = 1. Cosa succede esattamente?",
  options: [
    "Va in coda con R azzerato, come appena arrivata, e si esamina la nuova testa",
    "Viene spostata in coda mantenendo R = 1, così da avere una terza possibilità",
    "Viene scartata subito: R = 1 indica che la pagina è già stata salvata su disco",
    "Resta in testa con R azzerato e si scarta la seconda pagina della coda",
    "Viene marcata dirty e riscritta su disco prima di essere scartata"
  ],
  correct: 0,
  expl: "La pagina usata di recente viene 'risparmiata': va in coda come pagina giovane, con R = 0. Se tutte hanno R = 1, si farà comunque un giro completo e la vecchia testa (ora con R = 0) verrà scartata." },

{ id: "n43", topic: "sostituzione",
  q: "LRU con matrice di bit: dopo una serie di riferimenti, le righe valgono P0=011, P1=101, P2=000. Chi viene scartata al prossimo fault?",
  options: [
    "P2, che ha il valore di riga minimo",
    "P1, che ha il valore di riga massimo",
    "P0, per la regola FIFO sulle righe uguali",
    "P1, perché il suo bit centrale è 0",
    "Impossibile stabilirlo senza i bit R"
  ],
  correct: 0,
  expl: "Nella matrice LRU la riga con valore minimo appartiene alla pagina usata meno di recente: P2 (000 = 0) < P0 (011 = 3) < P1 (101 = 5). Si scarta P2." },

{ id: "n44", topic: "sostituzione",
  q: "Perché LRU esatto è considerato troppo costoso da implementare?",
  options: [
    "Il timestamp va aggiornato dall'hardware ad ogni istruzione (contatore o matrice di bit)",
    "Richiede una scansione completa della RAM ad ogni page fault del sistema",
    "Ha bisogno di conoscere i riferimenti futuri, disponibili solo nelle simulazioni",
    "Deve mantenere una copia della tabella delle pagine per ogni processo attivo",
    "Funziona solo con l'aiuto del paging daemon, attivo nei soli periodi di idle"
  ],
  correct: 0,
  expl: "Servirebbe registrare l'istante di ogni riferimento: contatore hardware a 64 bit scritto nella voce ad ogni accesso, o matrice n×n aggiornata ad ogni riferimento. Da qui le approssimazioni software: NFU e Aging. (L'opzione C descrive OPT.)" },

{ id: "n45", topic: "sostituzione",
  q: "La PFF di un processo supera la soglia superiore. Cosa sta probabilmente accadendo e cosa fa l'OS?",
  options: [
    "Cambio di località, più ampia della precedente: l'OS assegna altri frame",
    "Il processo è diventato CPU-bound: l'OS ne riduce la priorità di scheduling",
    "Il processo sta terminando: l'OS ne recupera preventivamente i frame",
    "La RAM è quasi esaurita: l'OS attiva la compattazione della memoria",
    "Il working set si è ristretto: l'OS toglie i frame in eccesso al processo"
  ],
  correct: 0,
  expl: "I picchi di PFF segnalano i cambi di località (codice e dati nuovi da caricare): sopra la soglia superiore il processo è in sofferenza e riceve frame. Sotto la soglia inferiore (località più piccola) i frame vengono tolti." },

{ id: "n46", topic: "sostituzione",
  q: "Con il <b>demand paging</b> puro, cosa accade nei primi istanti di vita di un processo?",
  options: [
    "Molti page fault: ogni pagina viene caricata al suo primo riferimento",
    "Non si verificano page fault, perché l'eseguibile è stato precaricato dal loader",
    "Il processo resta bloccato finché il working set stimato non è tutto in RAM",
    "Il paging daemon carica le pagine in background mentre il processo attende in coda",
    "Vengono caricate solo le pagine di codice, mentre i dati arrivano alla prima STORE"
  ],
  correct: 0,
  expl: "I frame partono vuoti: ogni prima richiesta genera un fault (anche per il codice). La raffica iniziale si esaurisce quando la località del processo è in RAM." },

{ id: "n47", topic: "fs",
  q: "Disco da 1 TB con blocchi da 4 KB e FAT con voci da 4 byte: quanto occuperebbe la FAT in RAM? (Il motivo per cui la FAT non scala sui dischi grandi.)",
  options: [
    "2²⁸ voci × 4 byte = 1 GB",
    "2²⁰ voci × 4 byte = 4 MB",
    "2²⁴ voci × 4 byte = 64 MB",
    "2³⁰ voci × 4 byte = 4 GB",
    "2¹⁶ voci × 4 byte = 256 KB"
  ],
  correct: 0,
  expl: "Blocchi = 2⁴⁰/2¹² = 2²⁸ (~268 milioni). FAT = 2²⁸ × 4 B = 1 GB da tenere in RAM! Con gli i-node invece si carica in memoria solo l'i-node dei file aperti: è uno dei motivi del loro successo." },

{ id: "n48", topic: "fs",
  q: "In un file system a i-node, cosa contiene esattamente una <b>voce di directory</b>?",
  options: [
    "Solo il nome del file e il suo i-number",
    "Nome, dimensione, permessi e primo blocco del file",
    "Il nome del file e i suoi 10 puntatori diretti",
    "L'i-number e la maschera dei permessi, ma non il nome",
    "Nome, i-number e una copia di riserva dei metadati"
  ],
  correct: 0,
  expl: "Con gli i-node la directory è snella: nome + i-number. Tutti i metadati e i puntatori ai blocchi stanno nell'i-node. (Con la FAT, invece, la voce di directory contiene i metadati e il primo blocco.)" },

{ id: "n49", topic: "fs",
  q: "Qual è il vantaggio dell'i-node rispetto alla FAT dal punto di vista della <b>memoria RAM</b> occupata?",
  options: [
    "Si carica in RAM solo l'i-node dei file aperti, non una tabella per l'intero disco",
    "L'i-node è più piccolo di una voce FAT, quindi la stessa RAM traccia più blocchi",
    "Gli i-node vengono compressi in RAM, mentre la FAT deve restare in chiaro",
    "L'i-node sta interamente nei registri della MMU, senza toccare la RAM",
    "Non c'è vantaggio: entrambi caricano in RAM le stesse informazioni"
  ],
  correct: 0,
  expl: "La FAT è proporzionale alla dimensione del DISCO e serve tutta in RAM; l'i-node è proporzionale al singolo file e serve solo per i file aperti. Su dischi grandi la differenza è enorme (vedi FAT da 1 GB per un disco da 1 TB)." },

{ id: "n50", topic: "fs",
  q: "Perché nel journal si annotano le operazioni sui <b>metadati</b> e non quelle sui dati?",
  options: [
    "I metadati sono critici per la consistenza e rieseguirne le operazioni è innocuo",
    "I dati sono troppo grandi per il journal, che risiede interamente in RAM",
    "Le operazioni sui dati sono già protette dalla scrittura sincrona della cache",
    "I metadati cambiano più spesso dei dati e il journal li comprime meglio",
    "È una semplificazione storica: i file system moderni annotano anche i dati"
  ],
  correct: 0,
  expl: "La perdita di metadati corrompe la struttura del file system (ben peggio di un contenuto parziale); le sotto-operazioni annotate sono progettate per essere rieseguibili (idempotenti) senza danni. Dopo un crash si controlla solo ciò che era in corso." },

{ id: "n51", topic: "fs",
  q: "Perché con la <b>FAT</b> non si possono realizzare riferimenti multipli (hard-link) allo stesso file?",
  options: [
    "I metadati stanno nella voce di directory: un secondo riferimento dovrebbe duplicarli",
    "La FAT limita ogni blocco a un solo puntatore entrante, impedendo le condivisioni",
    "Il contatore dei riferimenti della FAT è a un solo bit e non può superare 1",
    "I nomi dei file FAT sono legati alla posizione fisica del primo blocco",
    "È possibile, ma solo tra file appartenenti alla stessa directory"
  ],
  correct: 0,
  expl: "Con la FAT non esiste un i-node 'centrale' da puntare: metadati e primo blocco stanno nella voce di directory stessa. Un riferimento dovrebbe duplicare quelle informazioni (con i problemi di coerenza che ne seguono)." },

{ id: "n52", topic: "fs",
  q: "Allocazione contigua: un file inizia al blocco 100 e i blocchi sono da 2 KB. In quale blocco si trova l'offset 5000?",
  options: [
    "Blocco 102 (= 100 + ⌊5000/2048⌋)",
    "Blocco 103 (= 100 + ⌈5000/2048⌉)",
    "Blocco 105 (= 100 + ⌊5000/1024⌋ / 2)",
    "Blocco 100: l'offset è interno al primo blocco",
    "Impossibile saperlo senza consultare la FAT"
  ],
  correct: 0,
  expl: "⌊5000/2048⌋ = 2 ⇒ terzo blocco del file ⇒ 100 + 2 = 102. L'accesso diretto O(1) senza strutture di supporto è il grande pregio dell'allocazione contigua (usabile però solo su supporti read-only)." },

{ id: "n53", topic: "fs",
  q: "Che cos'è l'<b>anomalia dell'accounting</b> legata agli hard-link?",
  options: [
    "Il file continua a pesare sulla quota del proprietario finché esistono altri link",
    "Il contatore dei riferimenti conteggia anche i soft-link, gonfiando la quota dell'utente",
    "La dimensione del file viene conteggiata una volta per ogni hard-link esistente",
    "I file con hard-link sfuggono del tutto al conteggio delle quote disco",
    "La cancellazione di un hard-link azzera la quota di tutti gli utenti coinvolti"
  ],
  correct: 0,
  expl: "L'i-node (e il contenuto) restano di proprietà dell'utente originale finché il contatore non arriva a 0: le operazioni degli altri utenti 'pesano' sulla quota di chi magari non usa più il file. È uno dei difetti degli hard-link." },

{ id: "n54", topic: "dischi",
  q: "In RAID 2, quanti dischi servono per proteggere 4 bit di dati con il codice di Hamming?",
  options: [
    "7 (4 dati + 3 ridondanza)",
    "5 (4 dati + 1 parità)",
    "8 (4 dati + 4 specchi)",
    "6 (4 dati + 2 ridondanza)",
    "9 (4 dati + 5 ridondanza)"
  ],
  correct: 0,
  expl: "Il codice di Hamming per 4 bit richiede 3 bit di controllo: codeword da 7 bit distribuita su 7 dischi (striping a livello di bit). Meglio degli 8 dischi del mirroring, ma serve il sincronismo perfetto." },

{ id: "n55", topic: "dischi",
  q: "RAID 4/5: come si aggiorna il blocco di parità quando si riscrive UNO stripe, senza rileggere tutta la riga?",
  options: [
    "P_nuova = P_vecchia ⊕ stripe_vecchio ⊕ stripe_nuovo",
    "P_nuova = P_vecchia ⊕ stripe_nuovo",
    "P_nuova = stripe_vecchio ⊕ stripe_nuovo",
    "P_nuova = NOT(P_vecchia) ⊕ stripe_nuovo",
    "P_nuova = P_vecchia AND stripe_nuovo, ricalcolata poi dal garbage collector"
  ],
  correct: 0,
  expl: "Tra vecchia e nuova parità cambia solo il contributo dello stripe modificato: XOR con il vecchio valore lo 'toglie', XOR col nuovo lo 'aggiunge'. Lo stripe vecchio è spesso ancora in cache: si risparmia pure la lettura." },

{ id: "n56", topic: "dischi",
  q: "In RAID 1 (mirroring), come cambiano le prestazioni di lettura e scrittura rispetto al RAID 0 con pari capacità utile?",
  options: [
    "Letture potenzialmente più veloci (due copie); scritture più lente perché duplicate",
    "Letture e scritture entrambe raddoppiate grazie ai dischi aggiuntivi",
    "Letture dimezzate (serve confrontare le copie); scritture invariate",
    "Letture invariate; scritture più veloci perché distribuite sulle copie",
    "Letture e scritture identiche: la ridondanza è trasparente alle prestazioni"
  ],
  correct: 0,
  expl: "In lettura si può attingere da entrambe le copie (in casi particolari fino a ×2n); in scrittura ogni stripe va scritto due volte (originale + copia), quindi le scritture rallentano rispetto al RAID 0." },

{ id: "n57", topic: "dischi",
  q: "Perché le <b>scritture</b> degradano le celle di un SSD più delle letture?",
  options: [
    "Ogni cella sopporta un numero limitato di scritture, che la garbage collection amplifica",
    "Le scritture riscaldano il controller, che riduce la frequenza delle celle vicine",
    "Ogni scrittura richiede la lettura di verifica dell'intero blocco flash",
    "Le scritture invalidano il TLB del controller, che va ricostruito ogni volta",
    "Le letture usano una tensione dimezzata che rigenera parzialmente le celle"
  ],
  correct: 0,
  expl: "Le celle NAND hanno un limite di scritture, superato il quale smettono di funzionare. La GC amplifica le scritture (write amplification) ricopiando le pagine valide: TRIM la aiuta a NON ricopiare le pagine spazzatura, riducendo il degrado." },

{ id: "n58", topic: "dischi",
  q: "Quando conviene C-SCAN rispetto a SCAN?",
  options: [
    "Ad alto carico: ripartendo sempre dallo stesso lato, le attese risultano più uniformi",
    "A basso carico: con poche richieste il salto di ritorno costa meno delle inversioni",
    "Quando le richieste si concentrano tutte attorno alla posizione della testina",
    "Quando il disco ha poche tracce e la testina raggiunge gli estremi rapidamente",
    "Mai: C-SCAN percorre sempre più tracce e serve solo per confronti teorici"
  ],
  correct: 0,
  expl: "Con molte richieste, le più 'vecchie' sono in media le più lontane: C-SCAN le raggiunge prima ripartendo dall'altro lato invece di rifare il percorso inverso servendo le nuove. A basso carico meglio SCAN o SSTF." }
);
