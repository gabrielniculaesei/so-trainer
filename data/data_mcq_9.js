/* BANCA DOMANDE 9: 60 crocette di RAGIONAMENTO (stile what-if dell'orale/scritto).
   ~22 includono "Nessuna tra queste"; in alcune è la risposta corretta. Prefisso "r". */
window.MCQ.push(
// ---------- INTRODUZIONE E ARCHITETTURA ----------
{ id: "r01", topic: "intro",
  q: "Un programma legge da disco un byte alla volta in <b>I/O programmato</b> (busy waiting). Se raddoppio la frequenza della CPU lasciando invariato il disco, il tempo totale di lettura:",
  options: [
    "resta quasi invariato, perché il collo di bottiglia è il disco e non la CPU",
    "si dimezza esattamente, perché la CPU esegue il doppio delle istruzioni al secondo",
    "raddoppia, a causa dell'aumento del numero di accessi al bus di sistema",
    "diventa imprevedibile e non stimabile in alcun modo"
  ],
  correct: 0,
  expl: "Con l'I/O programmato la CPU non fa che attendere il dispositivo: il limite è la velocità del disco. Una CPU più veloce fa solo busy waiting più fitto, senza accelerare il trasferimento." },

{ id: "r02", topic: "intro",
  q: "Durante un lungo trasferimento in <b>DMA</b> la CPU esegue altri processi. Cosa la rallenta comunque nel frattempo?",
  options: [
    "La contesa sul bus di memoria (cycle stealing) tra il controller DMA e la CPU stessa",
    "Un interrupt sollevato per ogni singolo byte trasferito dal controller alla RAM",
    "La copia di ogni parola dal controller alla memoria, che resta a carico della CPU",
    "Nessuna tra queste"
  ],
  correct: 0,
  expl: "Il DMA ruba cicli di bus (cycle stealing): mentre trasferisce, la CPU può trovare il bus occupato per i propri accessi. Non ci sono interrupt per byte (uno solo, finale) né copie a carico della CPU." },

{ id: "r03", topic: "intro",
  q: "Un microbenchmark fa milioni di chiamate a <code>getpid()</code> (una syscall banale) e risulta sorprendentemente lento. La causa dominante è:",
  options: [
    "l'overhead del passaggio user→kernel→user ripetuto a ogni chiamata",
    "il calcolo del PID del processo, operazione intrinsecamente costosa per il kernel",
    "un accesso al disco che ogni chiamata di sistema comporta necessariamente",
    "la crescita della tabella dei processi a ogni invocazione della syscall"
  ],
  correct: 0,
  expl: "getpid() fa pochissimo lavoro utile: il costo è il cambio di modalità (trap, salvataggio/ripristino del contesto) moltiplicato per milioni di chiamate. Per questo si riducono le syscall bufferizzando." },

{ id: "r04", topic: "intro",
  q: "Un driver difettoso <b>disabilita gli interrupt</b> ed entra in un ciclo lungo. Conseguenza più probabile su quel core?",
  options: [
    "Il sistema non risponde: nemmeno il timer riesce a prelazionare la CPU",
    "Gli altri processi proseguono del tutto normali, garantiti dall'esecuzione su un altro core",
    "Il processo colpevole viene individuato e subito terminato dallo scheduler del sistema",
    "Aumenta soltanto il consumo energetico della macchina, senza altri effetti visibili"
  ],
  correct: 0,
  expl: "Senza interrupt il timer non scatta e lo scheduler non riprende il controllo: nulla può prelazionare il ciclo su quella CPU. Per questo disabilitare gli interrupt è privilegio del kernel e per pochissime istruzioni." },

{ id: "r05", topic: "intro",
  q: "Quale metodo di I/O <b>non richiede mai</b> la CPU, dall'inizio alla fine del trasferimento di un blocco?",
  options: [
    "Il DMA",
    "L'I/O programmato con attesa attiva (busy waiting) sul registro di stato",
    "L'I/O guidato da interrupt, in cui la CPU è avvisata a fine operazione",
    "Nessuna tra queste"
  ],
  correct: 3,
  expl: "Anche il DMA richiede la CPU per avviare il trasferimento e per gestire l'interrupt finale: riduce moltissimo il coinvolgimento della CPU ma non lo annulla. Nessun metodo ne fa completamente a meno." },

{ id: "r06", topic: "intro",
  q: "In una CPU con pipeline, un salto condizionato <b>mal predetto</b> costringe a svuotare la pipeline. Cosa comporta?",
  options: [
    "La perdita di alcuni cicli (bolla): le istruzioni entrate dopo il salto vanno annullate",
    "La produzione di un risultato di calcolo errato da parte del programma in esecuzione",
    "Un raddoppio temporaneo del throughput della pipeline per recuperare il ritardo accumulato",
    "Nessuna tra queste"
  ],
  correct: 0,
  expl: "Con un branch mispredict le istruzioni speculative vengono scartate e si riparte dal target: si paga una penalità in cicli, non un errore. La predizione dei salti serve proprio a limitare queste bolle." },

// ---------- STRUTTURA SO E MACCHINE VIRTUALI ----------
{ id: "r07", topic: "struttura",
  q: "In un sistema a <b>microkernel</b> il driver di rete va in crash. Cosa succede tipicamente?",
  options: [
    "Può essere riavviato senza abbattere il kernel, perché gira isolato in spazio utente",
    "L'intero sistema va in panic e si arresta, esattamente come accadrebbe in un kernel monolitico",
    "Il crash del driver corrompe la tabella delle pagine del kernel rendendolo instabile",
    "I processi utente perdono l'accesso alla memoria condivisa in modo permanente"
  ],
  correct: 0,
  expl: "Isolando i servizi in spazio utente, il microkernel può riavviare un driver difettoso senza compromettere il kernel: è il suo vantaggio di robustezza, pagato con l'overhead dei messaggi." },

{ id: "r08", topic: "struttura",
  q: "Devo avviare in fretta centinaia di ambienti isolati che condividono lo stesso kernel Linux. Cosa conviene?",
  options: [
    "I container",
    "Le macchine virtuali complete, ciascuna con il proprio sistema operativo ospite",
    "Un hypervisor di tipo 1 dedicato installato per ciascuno degli ambienti richiesti",
    "Nessuna tra queste"
  ],
  correct: 0,
  expl: "I container condividono il kernel dell'host: avvio quasi istantaneo e poco overhead, ideali per molte istanze. Le VM complete darebbero più isolamento ma con costi e tempi di avvio ben maggiori." },

{ id: "r09", topic: "struttura",
  q: "Perché una struttura del SO <b>a strati troppo fine</b> può penalizzare le prestazioni?",
  options: [
    "Ogni operazione che attraversa molti strati accumula l'overhead dei passaggi",
    "Perché la suddivisione in strati impedisce del tutto l'uso della memoria virtuale del sistema",
    "Perché ciascuno strato raddoppia l'occupazione di RAM rispetto a quello sottostante",
    "Nessuna tra queste"
  ],
  correct: 0,
  expl: "Con molti strati sottili una singola operazione attraversa numerosi livelli, ciascuno col proprio costo di chiamata/validazione: si guadagna in chiarezza e si perde in efficienza." },

{ id: "r10", topic: "struttura",
  q: "Su hardware <b>senza supporto alla virtualizzazione</b>, come gestisce l'hypervisor le istruzioni privilegiate del SO ospite?",
  options: [
    "Le intercetta ed emula (trap-and-emulate), oppure le riscrive, con un certo overhead",
    "Le lascia eseguire direttamente sull'hardware, senza alcuna forma di mediazione o controllo",
    "Le ignora completamente, dato che un sistema operativo ospite non ne ha mai bisogno",
    "Le converte in normali chiamate di sistema dirette al kernel dell'host sottostante"
  ],
  correct: 0,
  expl: "L'ospite gira in modo non privilegiato: le sue istruzioni sensibili vanno intercettate ed emulate (o tradotte). Il supporto hardware (VT-x/AMD-V) riduce poi questo overhead." },

{ id: "r11", topic: "struttura",
  q: "Digito <code>ls | wc -l</code> nella shell. Cosa fa la shell, concettualmente?",
  options: [
    "Crea due processi collegati da una pipe, connettendo l'output di ls all'input di wc",
    "Esegue ls e wc come funzioni interne del kernel, senza creare alcun processo separato",
    "Interpreta e calcola tutto internamente, senza avviare né ls né wc come programmi",
    "Sostituisce la propria immagine con quella di wc dopo aver eseguito ls"
  ],
  correct: 0,
  expl: "La shell fa fork/exec dei due comandi come processi separati e crea una pipe tra lo stdout di ls e lo stdin di wc. La shell è un processo utente, non parte del kernel." },

// ---------- PROCESSI E THREAD ----------
{ id: "r12", topic: "processi",
  q: "Un programma esegue <code>fork()</code> dentro un ciclo che itera 3 volte (una fork per giro, nessuna exec/exit). Quanti processi esistono alla fine, incluso l'originale?",
  options: [
    "8",
    "4",
    "6",
    "3"
  ],
  correct: 0,
  expl: "Ogni fork raddoppia il numero di processi e anche i figli proseguono il ciclo eseguendo le fork rimanenti: dopo 3 iterazioni si hanno 2³ = 8 processi." },

{ id: "r13", topic: "processi",
  q: "Un padre crea molti figli con fork() ma non chiama mai wait(). Cosa si accumula nel sistema?",
  options: [
    "Processi zombie, che occupano voci nella tabella dei processi",
    "Processi orfani, che vengono immediatamente adottati dal processo init del sistema",
    "Situazioni di deadlock tra il processo padre e i suoi processi figli in attesa",
    "Nessuna tra queste"
  ],
  correct: 0,
  expl: "I figli terminati restano zombie finché il padre non ne legge lo stato con wait(): occupano voci nella tabella dei processi. Gli orfani sono un'altra cosa (padre morto prima del figlio)." },

{ id: "r14", topic: "processi",
  q: "In un processo con più <b>thread kernel</b>, un thread dereferenzia un puntatore nullo. Cosa succede più probabilmente?",
  options: [
    "Termina l'intero processo, perché i thread condividono lo spazio di indirizzi",
    "Termina solo quel singolo thread, mentre tutti gli altri proseguono in piena sicurezza",
    "Il kernel isola automaticamente il thread colpevole e ne ignora del tutto l'errore",
    "Il processo viene sospeso e messo in attesa di un segnale di ripristino esterno"
  ],
  correct: 0,
  expl: "I thread condividono lo spazio di indirizzi: l'accesso illegale genera un segnale che, di default, abbatte l'intero processo. È il prezzo della condivisione rispetto ai processi isolati." },

{ id: "r15", topic: "processi",
  q: "Un'applicazione usa <b>thread a livello utente puri</b> su una macchina a 8 core. Quanti core può sfruttare al massimo, per quel processo?",
  options: [
    "Uno solo",
    "Tutti e 8 i core, assegnando esattamente un thread a ciascun core disponibile",
    "Due core, per via del meccanismo di doppio buffering usato dalla libreria",
    "Nessuna tra queste"
  ],
  correct: 0,
  expl: "Il kernel non conosce i thread utente: schedula il processo come un'unica entità su un core. Senza thread kernel (o un modello ibrido) non si sfruttano più core in parallelo." },

{ id: "r16", topic: "processi",
  q: "Su un sistema si nota che ridurre il numero di <b>context switch</b> migliora il throughput. Perché?",
  options: [
    "Il context switch è overhead puro (registri, TLB, cache) che non fa avanzare lavoro utile",
    "Perché ogni context switch libera una porzione di memoria fisica altrimenti sprecata",
    "Perché ridurre le commutazioni aumenta la priorità di tutti i processi in coda",
    "Perché ogni context switch introduce un accesso al disco per salvare il PCB"
  ],
  correct: 0,
  expl: "Commutare costa: salvataggio/ripristino dello stato, flush della TLB, cache fredde. È tempo sottratto al lavoro utile; ridurne la frequenza aumenta il throughput." },

{ id: "r17", topic: "processi",
  q: "Due processi <b>non imparentati</b> sulla stessa macchina devono scambiarsi molti dati con la minima copia. Cosa conviene?",
  options: [
    "La memoria condivisa",
    "Una pipe anonima, collegando l'uscita di un processo all'ingresso dell'altro",
    "I segnali (signal), inviati ripetutamente per trasportare i dati un pezzo alla volta",
    "Nessuna tra queste"
  ],
  correct: 0,
  expl: "La memoria condivisa evita copie ripetute kernel/utente: i due processi mappano la stessa regione e vi accedono direttamente (serve sincronizzazione). La pipe anonima richiede parentela e copia i byte; i segnali non trasportano dati." },

{ id: "r18", topic: "processi",
  q: "Dopo una fork() il figlio non modifica quasi nulla e poi fa exec(). Perché il <b>copy-on-write</b> è vantaggioso qui?",
  options: [
    "Evita di copiare lo spazio di indirizzi del padre, che l'exec sostituirebbe subito dopo",
    "Perché raddoppia di fatto la quantità di memoria RAM disponibile per i due processi",
    "Perché elimina completamente la necessità di mantenere una tabella delle pagine",
    "Perché rende superflua la chiamata exec() successiva alla fork()"
  ],
  correct: 0,
  expl: "Con COW le pagine restano condivise finché non vengono scritte: se il figlio fa subito exec(), non si è sprecato nulla a copiare. È il caso che rende fork()+exec() economico." },

// ---------- SINCRONIZZAZIONE ----------
{ id: "r19", topic: "sync",
  q: "Per rompere la condizione di <b>attesa circolare</b> del deadlock, una tecnica classica è:",
  options: [
    "imporre un ordine globale di acquisizione delle risorse, uguale per tutti i processi",
    "aumentare progressivamente la priorità dei processi che restano in attesa più a lungo",
    "disabilitare gli interrupt per tutta la durata dell'attesa di una risorsa",
    "assegnare a ogni processo una copia privata di ciascuna risorsa condivisa"
  ],
  correct: 0,
  expl: "Acquisire le risorse sempre in un ordine prefissato impedisce i cicli di attesa (attesa circolare). L'aging riguarda la starvation, non il deadlock." },

{ id: "r20", topic: "sync",
  q: "Nel produttore-consumatore, il consumatore scrive per errore <code>down(mutex); down(full); …</code>. Cosa può accadere?",
  options: [
    "Deadlock: con buffer vuoto tiene mutex e si blocca su full, escludendo il produttore",
    "Nulla di male, perché l'ordine con cui si eseguono le due down è del tutto irrilevante",
    "Il buffer viene sovrascritto e alcuni elementi prodotti vengono persi silenziosamente",
    "Nessuna tra queste"
  ],
  correct: 0,
  expl: "Se prende mutex e poi si blocca su down(full) col buffer vuoto, il produttore non può entrare (mutex occupato) per riempire: stallo. Il semaforo di conteggio va acquisito PRIMA del mutex." },

{ id: "r21", topic: "sync",
  q: "In un monitor con semantica <b>Mesa</b>, perché la guardia di una condizione va messa in un <code>while</code> e non in un <code>if</code>?",
  options: [
    "Tra la signal e la ripresa del thread, un altro thread può cambiare di nuovo lo stato",
    "Perché il costrutto while viene compilato in codice più veloce del costrutto if",
    "Perché l'operazione wait, in un monitor, non rilascia mai la mutua esclusione",
    "Perché la signal risveglia sempre tutti i thread in attesa contemporaneamente"
  ],
  correct: 0,
  expl: "Con Mesa il segnalante prosegue e il risvegliato riprende più tardi: la condizione potrebbe non valere più e va rivalutata in un ciclo. Con l'if si proseguirebbe con condizione falsa." },

{ id: "r22", topic: "sync",
  q: "Uso uno <b>spinlock</b> per una sezione critica lunga su una macchina a un solo core. Perché è una pessima idea?",
  options: [
    "Chi gira a vuoto sul lock impedisce a chi lo detiene di essere schedulato e rilasciarlo",
    "Perché uno spinlock, di per sé, non riesce a garantire la mutua esclusione tra i processi",
    "Perché per funzionare uno spinlock richiede il supporto della MMU, spesso assente",
    "Perché lo spinlock disabilita gli interrupt del sistema per tutta la sua durata"
  ],
  correct: 0,
  expl: "Su un core solo lo spinner consuma il quanto girando a vuoto, ma il detentore del lock (stessa CPU) non avanza per rilasciarlo: spreco totale. Lo spin conviene solo con attese brevi e più core." },

{ id: "r23", topic: "sync",
  q: "Quale meccanismo, tra questi, realizza la mutua esclusione <b>senza alcun costo</b> (né attesa né overhead)?",
  options: [
    "Lo spinlock",
    "Il semaforo, con le sue operazioni atomiche di down e di up sul contatore",
    "Il monitor, con la mutua esclusione garantita automaticamente dal compilatore",
    "Nessuna tra queste"
  ],
  correct: 3,
  expl: "Ogni meccanismo di mutua esclusione ha un costo: lo spinlock spreca CPU nell'attesa, semaforo e monitor introducono blocco/risveglio e overhead. Non esiste una soluzione a costo zero." },

{ id: "r24", topic: "sync",
  q: "H (alta priorità) attende un lock tenuto da L (bassa); un processo M (media) è pronto. Senza accorgimenti, cosa accade?",
  options: [
    "M prelaziona L, che non rilascia il lock: H resta bloccato più a lungo (inversione di priorità)",
    "H ottiene comunque subito il lock, dato che ha la priorità più alta di tutti e tre",
    "L viene automaticamente terminato dal sistema pur di liberare al più presto il lock",
    "I tre processi entrano in un deadlock a tre da cui nessuno può più uscire"
  ],
  correct: 0,
  expl: "M (media) prelaziona L che detiene il lock; L non avanza e non rilascia; H, che aspetta il lock, resta bloccato indirettamente da M. È l'inversione di priorità, curata con l'ereditarietà di priorità." },

{ id: "r25", topic: "sync",
  q: "Perché per l'<b>ereditarietà di priorità</b> serve un mutex e non un semaforo binario?",
  options: [
    "Il mutex ha un proprietario, quindi si sa a quale processo elevare la priorità",
    "Perché un semaforo binario, a differenza del mutex, non può mai assumere il valore 0",
    "Perché il mutex risulta comunque più veloce del semaforo in qualsiasi situazione",
    "Nessuna tra queste"
  ],
  correct: 0,
  expl: "Elevare la priorità richiede di sapere CHI detiene il lock: il mutex ha la nozione di proprietà, il semaforo no (chiunque può fare up). Per questo l'ereditarietà si appoggia al mutex." },

// ---------- SCHEDULING ----------
{ id: "r26", topic: "sched",
  q: "In Round-Robin un processo <b>I/O-bound</b> cede spesso la CPU prima di esaurire il quanto. Come viene trattato di fatto?",
  options: [
    "Bene: torna presto in coda ed è servito appena pronto, sfruttando i tempi morti",
    "Male: è penalizzato dallo scheduler proprio perché non consuma mai tutto il suo quanto",
    "Viene automaticamente declassato alla priorità minima dopo pochi cicli di questo tipo",
    "Viene trattato come CPU-bound e riceve un quanto di tempo progressivamente più lungo"
  ],
  correct: 0,
  expl: "Cedendo presto la CPU per l'I/O, il processo interattivo rientra rapidamente in coda ed è servito appena pronto: il RR lo favorisce. Il quanto non consumato non è una penalità." },

{ id: "r27", topic: "sched",
  q: "Un sistema molto carico usa <b>SJF</b>. Un job lungo, arrivato presto, cosa rischia?",
  options: [
    "Starvation: continuano ad arrivare job più brevi che gli passano davanti",
    "Di essere eseguito comunque per primo, dato che è arrivato prima di tutti gli altri",
    "Di provocare l'effetto convoglio, bloccando dietro di sé tutti i job più brevi",
    "Di essere prelazionato a metà esecuzione e mai più rimesso in coda dallo scheduler"
  ],
  correct: 0,
  expl: "SJF/SRTN favoriscono i job brevi: se ne arrivano di continuo, il job lungo può non girare mai (starvation). L'effetto convoglio è invece un problema di FCFS." },

{ id: "r28", topic: "sched",
  q: "A insieme fissato di processi con durate note (senza prelazione), quale algoritmo minimizza il <b>tempo di attesa medio</b>?",
  options: [
    "SJF",
    "FCFS, servendo i processi rigorosamente nell'ordine in cui sono arrivati",
    "Round-Robin con un quanto scelto opportunamente in base alle durate dei job",
    "Nessuna tra queste"
  ],
  correct: 0,
  expl: "SJF è ottimo per il tempo di attesa medio a insieme fissato di job: servendo prima i brevi riduce l'attesa cumulata. FCFS e RR non offrono questa garanzia." },

{ id: "r29", topic: "sched",
  q: "Uno scheduler multiprocessore usa una <b>coda unica</b> condivisa da 16 core. Quale difetto emerge crescendo i core?",
  options: [
    "La contesa sul lock della coda e la perdita dell'affinità di cache dei processi",
    "L'impossibilità totale di bilanciare il carico di lavoro tra i diversi core disponibili",
    "Un netto aumento del numero di page fault generati da ciascun processo in esecuzione",
    "La necessità di duplicare la tabella dei processi su ognuno dei sedici core"
  ],
  correct: 0,
  expl: "La coda unica bilancia bene ma diventa un collo di bottiglia: i core competono per il suo lock e i processi migrano perdendo la cache calda. Con molti core si preferiscono code per-CPU con affinità." },

{ id: "r30", topic: "sched",
  q: "Aumentando il quanto del <b>Round-Robin</b> oltre la durata di qualunque processo, verso cosa degenera?",
  options: [
    "FCFS",
    "SJF, cioè servendo per primi i processi con la durata di burst più breve",
    "SRTN, prelazionando l'attuale processo appena ne arriva uno con residuo minore",
    "Nessuna tra queste"
  ],
  correct: 0,
  expl: "Se il quanto supera ogni burst, nessun processo viene mai prelazionato: ognuno gira fino a bloccarsi o terminare, cioè il comportamento di FCFS." },

{ id: "r31", topic: "sched",
  q: "In un <b>MLFQ</b> un processo 'furbo' fa una brevissima I/O appena prima della fine del quanto. Cosa ottiene, senza contromisure?",
  options: [
    "Resta nelle code ad alta priorità pur essendo di fatto un processo CPU-bound",
    "Viene declassato molto più in fretta verso le code a priorità più bassa del sistema",
    "Viene individuato come processo malevolo e terminato immediatamente dallo scheduler",
    "Perde ogni priorità e resta bloccato indefinitamente in fondo all'ultima coda"
  ],
  correct: 0,
  expl: "Rilasciando la CPU prima dello scadere del quanto sembra I/O-bound e non viene declassato: 'gioca' l'euristica. La contromisura è contare il tempo di CPU totale in una finestra, non il singolo quanto." },

{ id: "r32", topic: "sched",
  q: "Tra questi, quale algoritmo è <b>sia prelazionato sia privo di starvation</b> garantita?",
  options: [
    "SRTN",
    "SJF, che tra i processi pronti sceglie sempre quello dalla durata più breve",
    "FCFS, che serve i processi nell'ordine esatto in cui arrivano nel sistema",
    "Nessuna tra queste"
  ],
  correct: 3,
  expl: "Il Round-Robin sarebbe prelazionato e senza starvation, ma non è tra le opzioni. SRTN è prelazionato ma soffre starvation; SJF e FCFS non sono prelazionati. Quindi nessuno degli elencati." },

// ---------- GESTIONE MEMORIA ----------
{ id: "r33", topic: "memoria",
  q: "Raddoppio la <b>dimensione della pagina</b> a parità di spazio virtuale. Cosa succede al numero di voci della tabella delle pagine?",
  options: [
    "Si dimezza",
    "Raddoppia, perché a ogni pagina più grande corrispondono più voci nella tabella",
    "Resta identico, perché il numero di voci non dipende dalla dimensione della pagina",
    "Nessuna tra queste"
  ],
  correct: 0,
  expl: "Pagine più grandi coprono più memoria ciascuna: servono metà delle voci. In compenso cresce la frammentazione interna sull'ultima pagina di ogni processo." },

{ id: "r34", topic: "memoria",
  q: "Un ciclo attraversa un grande array con passo tale da toccare una pagina diversa a ogni accesso. Cosa osservo sulla <b>TLB</b>?",
  options: [
    "Molti TLB miss, perché ogni accesso cade su una pagina nuova (località distrutta)",
    "Molti TLB hit, garantiti dalla forte località spaziale di un accesso ad array",
    "Nessun effetto, perché la TLB non è coinvolta negli accessi ai dati ma solo al codice",
    "Un dimezzamento dei page fault grazie al prefetching automatico delle pagine"
  ],
  correct: 0,
  expl: "Saltando una pagina a ogni accesso si esaurisce subito la copertura della TLB: ogni riferimento è a una pagina diversa → miss ripetuti. Il passo di accesso distrugge la località spaziale." },

{ id: "r35", topic: "memoria",
  q: "Con una tabella delle pagine <b>a 2 livelli e senza TLB</b>, quanti accessi in memoria servono per leggere un dato?",
  options: [
    "3",
    "1",
    "2",
    "4"
  ],
  correct: 0,
  expl: "Ogni livello della tabella è in RAM: 2 accessi per attraversarli più 1 per il dato = 3. La TLB serve proprio a evitare i due accessi di traduzione quando c'è hit." },

{ id: "r36", topic: "memoria",
  q: "Con pagine da 4 KB, un processo occupa <b>esattamente 8 KB</b>. Quanta frammentazione interna ha nell'ultima pagina?",
  options: [
    "2 KB",
    "4 KB",
    "1 KB",
    "Nessuna tra queste"
  ],
  correct: 3,
  expl: "8 KB = 2 pagine piene esatte (2 × 4 KB): l'ultima pagina è completamente usata, quindi la frammentazione interna è 0 KB — valore non presente tra le opzioni numeriche." },

{ id: "r37", topic: "memoria",
  q: "Un sistema a <b>segmentazione pura</b> carica e scarica per ore segmenti di dimensioni diverse. Quale problema emerge?",
  options: [
    "Frammentazione esterna: buchi liberi non contigui difficili da riusare",
    "Frammentazione interna sempre crescente all'interno di ciascuno dei segmenti allocati",
    "Un aumento incontrollato del numero di TLB miss a ogni cambio di segmento",
    "L'impossibilità di applicare qualsiasi forma di protezione della memoria"
  ],
  correct: 0,
  expl: "Allocando blocchi contigui di taglia variabile, la memoria si spezzetta in buchi non contigui (frammentazione esterna) che richiedono compattazione. La paginazione evita questo problema." },

{ id: "r38", topic: "memoria",
  q: "Con <b>paginazione a domanda pura</b>, all'avvio di un grande programma cosa osservo nei primi istanti?",
  options: [
    "Una raffica di page fault mentre si caricano le pagine effettivamente usate",
    "Il caricamento immediato e completo dell'intero programma in memoria fisica",
    "Nessun page fault, perché all'avvio il programma si trova già interamente in cache",
    "Nessuna tra queste"
  ],
  correct: 0,
  expl: "Con demand paging le pagine si caricano solo quando servono: all'avvio si accumulano molti fault iniziali (cold start). Il prepaging tenta di mitigarli caricando in anticipo pagine probabili." },

{ id: "r39", topic: "memoria",
  q: "Dieci processi usano la stessa <b>libreria condivisa</b> (codice read-only). Come conviene gestirne le pagine in RAM?",
  options: [
    "Una sola copia fisica, mappata nello spazio di indirizzi di tutti e dieci i processi",
    "Una copia fisica privata e distinta per ciascuno dei processi che la utilizza",
    "Rileggerla da disco a ogni singolo accesso, senza mai tenerla stabilmente in RAM",
    "Copiarla nella cache della CPU una volta sola, evitando del tutto la RAM"
  ],
  correct: 0,
  expl: "Il codice read-only si condivide: una sola copia in RAM mappata da tutte le tabelle delle pagine, risparmiando memoria. È lo stesso principio delle pagine condivise finché non modificate." },

// ---------- SOSTITUZIONE PAGINE E WORKING SET ----------
{ id: "r40", topic: "sostituzione",
  q: "Passo da 3 a 4 frame con <b>FIFO</b> e osservo PIÙ page fault. È un errore di misura?",
  options: [
    "No: è l'anomalia di Belady, del tutto possibile con un algoritmo FIFO",
    "Sì di certo, perché aumentare i frame implica sempre e comunque meno page fault",
    "No, ma un fenomeno del genere può manifestarsi soltanto usando l'algoritmo LRU",
    "Sì, perché con 4 frame la tabella delle pagine non entra più nella TLB"
  ],
  correct: 0,
  expl: "FIFO non è un algoritmo a stack: aumentare i frame può aumentare i fault (anomalia di Belady). Con LRU/OPT, che sono a stack, ciò non può accadere." },

{ id: "r41", topic: "sostituzione",
  q: "Riduco troppo la finestra Δ del <b>working set</b>. Effetto principale?",
  options: [
    "Si stimano meno pagine del necessario e i page fault aumentano",
    "Si finisce per tenere in memoria troppe pagine ormai inutili, sprecando i frame",
    "Sparisce del tutto ogni rischio di thrashing anche con memoria molto scarsa",
    "Nessuna tra queste"
  ],
  correct: 0,
  expl: "Δ troppo piccola sottostima il working set: si tolgono pagine ancora nella località corrente, che verranno rireferenziate → più fault. Δ troppo grande spreca frame su pagine ormai inutili." },

{ id: "r42", topic: "sostituzione",
  q: "Il sistema è in <b>thrashing</b>: CPU quasi inattiva, disco sempre impegnato nel paging. Cosa fare?",
  options: [
    "Ridurre il grado di multiprogrammazione, sospendendo o facendo swap-out di qualche processo",
    "Aumentare la multiprogrammazione, così da tenere occupata la CPU rimasta inattiva",
    "Diminuire la dimensione dei frame per farne entrare un numero maggiore in memoria",
    "Aumentare la dimensione della TLB per ridurre il numero di traduzioni mancate"
  ],
  correct: 0,
  expl: "In thrashing i working set non entrano tutti: aggiungere processi peggiora. Sospendendone qualcuno, i working set rimasti entrano in RAM e il paging cala." },

{ id: "r43", topic: "sostituzione",
  q: "Nell'algoritmo <b>clock</b>, tutte le pagine hanno R=1 quando serve una vittima. Cosa fa la lancetta?",
  options: [
    "Azzera gli R avanzando e, dopo un giro completo, sfratta la pagina di partenza (come FIFO)",
    "Si blocca, perché in quella situazione non riesce più a individuare alcuna vittima valida",
    "Sfratta immediatamente la prima pagina che trovi con il bit di modifica M pari a 1",
    "Inverte il senso di rotazione della lancetta e riparte in direzione opposta"
  ],
  correct: 0,
  expl: "Se tutti gli R valgono 1, la lancetta compie un giro azzerandoli e torna alla prima, che ora ha R=0, e la sfratta: in quel caso il clock degenera nel FIFO." },

{ id: "r44", topic: "sostituzione",
  q: "Quale algoritmo di sostituzione è <b>implementabile in pratica</b> e dà sempre il <b>minimo assoluto</b> di page fault?",
  options: [
    "LRU",
    "FIFO, che sfratta la pagina caricata da più tempo in memoria",
    "Clock, la variante circolare della seconda chance basata sul bit R",
    "Nessuna tra queste"
  ],
  correct: 3,
  expl: "Solo OPT dà il minimo di fault, ma non è implementabile (richiederebbe di conoscere il futuro). LRU, FIFO e Clock sono implementabili ma non garantiscono il minimo: nessuno degli elencati soddisfa entrambe le condizioni." },

{ id: "r45", topic: "sostituzione",
  q: "Perché l'<b>aging</b> approssima LRU meglio dell'NFU semplice (somma dei bit R)?",
  options: [
    "Lo shift a destra fa 'invecchiare' i riferimenti vecchi, dando peso alla recenza",
    "Perché l'aging utilizza contatori di dimensione molto maggiore rispetto a NFU",
    "Perché l'aging, a differenza di NFU, non fa alcun uso del bit di riferimento R",
    "Perché l'aging conosce in anticipo i futuri riferimenti alle pagine del processo"
  ],
  correct: 0,
  expl: "NFU somma i bit R senza dimenticare: una pagina molto usata all'inizio resta 'pesante' per sempre. L'aging shifta a destra, così i riferimenti vecchi contano sempre meno: cattura la recenza come LRU." },

{ id: "r46", topic: "sostituzione",
  q: "Devo sfrattare una pagina e ho due candidate identiche tranne il bit <b>M</b>. Quale conviene sfrattare?",
  options: [
    "Quella con M=0, perché non va riscritta su disco",
    "Quella con M=1, così da liberarla al più presto dalle modifiche non salvate",
    "È del tutto indifferente, dato che entrambe verranno comunque ricaricate a breve",
    "Nessuna tra queste"
  ],
  correct: 0,
  expl: "La pagina M=0 (pulita) ha già una copia valida su disco: si scarta senza scrivere. La M=1 (dirty) richiederebbe una scrittura costosa prima dello sfratto." },

// ---------- FILE SYSTEM ----------
{ id: "r47", topic: "fs",
  q: "Un file ha 2 <b>hard link</b>. Cancello uno dei due nomi. Cosa succede ai dati?",
  options: [
    "Restano: il contatore dei link scende a 1 e l'i-node sopravvive",
    "Vengono cancellati subito, perché la rimozione di un nome libera sempre i blocchi dati",
    "Diventano inaccessibili anche dall'altro nome, che resta orfano dell'i-node",
    "Vengono spostati automaticamente nel cestino di sistema fino allo svuotamento"
  ],
  correct: 0,
  expl: "I dati esistono finché il contatore dei link dell'i-node è > 0. Rimuovere un hard link lo porta da 2 a 1: l'altro nome accede ancora al file. Si liberano solo a contatore 0." },

{ id: "r48", topic: "fs",
  q: "Creo un <b>link simbolico</b> a un file e poi cancello il file originale. Cosa ottengo aprendo il link?",
  options: [
    "Un errore: il link è 'appeso' (dangling), punta a un percorso ormai inesistente",
    "Il file originale, perché il link simbolico ne conserva internamente una copia completa",
    "La ricreazione automatica del file mancante a partire dal contenuto del link",
    "Nessuna tra queste"
  ],
  correct: 0,
  expl: "Il link simbolico contiene solo un percorso: cancellato l'originale, il percorso non risolve più e l'apertura fallisce (dangling). A differenza dell'hard link, non tiene in vita i dati." },

{ id: "r49", topic: "fs",
  q: "Perché la <b>FAT tenuta in RAM</b> rende accettabile l'accesso casuale, che nella lista concatenata su disco è lento?",
  options: [
    "Seguire la catena di puntatori avviene in memoria, senza una lettura del disco per ogni salto",
    "Perché la FAT elimina completamente i puntatori tra i blocchi che compongono il file",
    "Perché tenere la FAT in RAM rende automaticamente contigui i blocchi di ogni file",
    "Perché la FAT sostituisce gli i-node con un accesso diretto per indice"
  ],
  correct: 0,
  expl: "Nella lista concatenata classica ogni puntatore sta nel blocco su disco: raggiungere il blocco n costa n letture. Con la FAT in RAM la catena si percorre in memoria, molto più in fretta." },

{ id: "r50", topic: "fs",
  q: "Un file system ha i-node con <b>12 puntatori diretti</b> e blocchi da 4 KB. Fino a che dimensione un file usa SOLO puntatori diretti?",
  options: [
    "48 KB",
    "12 KB",
    "4 KB",
    "16 KB"
  ],
  correct: 0,
  expl: "12 puntatori diretti × 4 KB = 48 KB: entro questa dimensione il file non ricorre ai blocchi indiretti. Oltre, subentrano indiretto singolo, doppio e triplo." },

{ id: "r51", topic: "fs",
  q: "Il sistema va giù durante un'operazione sul file system. Come aiuta il <b>journaling</b> al riavvio?",
  options: [
    "Riapplica o annulla le operazioni registrate, ripristinando la consistenza senza scandire tutto il disco",
    "Ricostruisce i dati andati persi calcolando lo XOR dei blocchi rimasti sugli altri dischi",
    "Comprime l'intero file system per recuperare lo spazio occupato dai file danneggiati",
    "Nessuna tra queste"
  ],
  correct: 0,
  expl: "Il journal registra le operazioni prima di applicarle: al riavvio si riapplicano quelle confermate e si annullano le incomplete, evitando la lunga scansione di fsck. Lo XOR è cosa da RAID." },

{ id: "r52", topic: "fs",
  q: "Un file system conterrà milioni di file da poche centinaia di byte. Conviene un blocco grande (64 KB)?",
  options: [
    "No: enorme frammentazione interna, ogni file spreca gran parte del proprio blocco",
    "Sì, perché un blocco grande massimizza comunque il throughput anche su file minuscoli",
    "È del tutto indifferente, perché per file così piccoli la dimensione del blocco non conta",
    "Sì, perché blocchi grandi riducono la frammentazione interna sui file piccoli"
  ],
  correct: 0,
  expl: "Con blocchi da 64 KB un file da 300 byte ne spreca quasi tutti: per tanti file piccoli conviene un blocco piccolo. I blocchi grandi convengono per file grandi e accesso sequenziale." },

{ id: "r53", topic: "fs",
  q: "Perché in UNIX un file può avere <b>più nomi</b> in directory diverse senza duplicare i dati?",
  options: [
    "La directory mappa un nome a un numero di i-node, e più nomi possono puntare allo stesso i-node",
    "Perché il sistema copia automaticamente i dati del file in ognuna delle directory coinvolte",
    "Perché il nome del file è memorizzato dentro l'i-node, che viene condiviso tra le directory",
    "Perché ogni directory mantiene una cache dei dati dei file che elenca"
  ],
  correct: 0,
  expl: "La directory associa nomi a i-node; il nome non sta nell'i-node. Più voci (anche in directory diverse) possono riferire lo stesso i-node: sono gli hard link, che condividono dati e attributi." },

// ---------- DISCHI, RAID E SSD ----------
{ id: "r54", topic: "dischi",
  q: "Con <b>SSTF</b> arrivano di continuo richieste vicine alla testina. Cosa rischia una richiesta lontana?",
  options: [
    "Starvation: è continuamente scavalcata da richieste più vicine alla testina",
    "Di essere servita per prima, perché lo scheduler dà precedenza alle richieste lontane",
    "Di provocare l'anomalia di Belady nel meccanismo di scheduling del disco",
    "Nessuna tra queste"
  ],
  correct: 0,
  expl: "SSTF sceglie sempre il seek minimo: se arrivano molte richieste vicine, quella lontana può attendere indefinitamente (starvation). SCAN/LOOK, muovendosi in modo sistematico, evitano il problema." },

{ id: "r55", topic: "dischi",
  q: "Con <b>LOOK</b>, la testina è al cilindro 60, si muove verso l'alto e l'ultima richiesta pendente in quel verso è al cilindro 80. Dove inverte?",
  options: [
    "Al cilindro 80, cioè all'ultima richiesta, senza spingersi fino al bordo del disco",
    "Al bordo fisico del disco, indipendentemente da dove si trovi l'ultima richiesta",
    "Al cilindro 0, tornando ogni volta all'estremo opposto del disco",
    "A metà strada tra la posizione attuale e l'ultima richiesta pendente"
  ],
  correct: 0,
  expl: "LOOK inverte all'ultima richiesta pendente nel verso corrente (cilindro 80), risparmiando il tratto a vuoto fino al bordo. Arrivare al bordo fisico è invece il comportamento di SCAN." },

{ id: "r56", topic: "dischi",
  q: "Quale algoritmo di scheduling del disco garantisce <b>assenza di starvation</b> servendo però <b>sempre il seek minimo</b>?",
  options: [
    "SSTF",
    "SCAN, che percorre il disco fino al bordo servendo tutte le richieste incontrate",
    "C-SCAN, che serve in un verso e poi torna rapidamente all'inizio senza servire",
    "Nessuna tra queste"
  ],
  correct: 3,
  expl: "SSTF usa il seek minimo ma soffre starvation; SCAN e C-SCAN evitano la starvation ma NON servono sempre il seek minimo (si muovono in modo sistematico). Nessuno soddisfa entrambe le richieste." },

{ id: "r57", topic: "dischi",
  q: "In <b>RAID 5</b>, mentre ricostruisco un disco guasto se ne rompe un secondo. Cosa succede?",
  options: [
    "Perdita dei dati: RAID 5 tollera il guasto di un solo disco",
    "Nessun problema, perché la parità distribuita è in grado di coprire due guasti insieme",
    "Il sistema converte automaticamente l'array in RAID 6 per salvare i dati residui",
    "I dati restano integri ma l'array diventa di sola lettura fino alla sostituzione"
  ],
  correct: 0,
  expl: "Con una sola parità distribuita, RAID 5 recupera un disco; due guasti contemporanei superano la ridondanza → dati persi. Per tollerarne due serve RAID 6 (doppia parità)." },

{ id: "r58", topic: "dischi",
  q: "Un database con moltissime <b>scritture piccole</b>: meglio RAID 5 o RAID 1/10?",
  options: [
    "RAID 1/10: RAID 5 paga la penalità read-modify-write della parità a ogni piccola scrittura",
    "RAID 5, perché la parità distribuita lo rende comunque più veloce di sempre in scrittura",
    "È indifferente, dato che il tipo di RAID non influenza il costo delle scritture piccole",
    "Nessuna tra queste"
  ],
  correct: 0,
  expl: "Ogni piccola scrittura in RAID 5 richiede di leggere vecchio dato e vecchia parità, ricalcolare e riscrivere entrambi (read-modify-write): costoso. Il mirroring scrive due copie senza ricalcolo." },

{ id: "r59", topic: "dischi",
  q: "Su un SSD quasi pieno e <b>senza TRIM</b>, le scritture rallentano. Perché?",
  options: [
    "Il garbage collector deve spostare e cancellare blocchi prima di riscriverli (write amplification)",
    "Il tempo di ricerca (seek) della testina aumenta man mano che le celle si usurano",
    "La latenza rotazionale cresce perché il disco gira più lentamente da pieno",
    "La bitmap dei blocchi liberi non entra più nella memoria del controller"
  ],
  correct: 0,
  expl: "La flash si cancella a blocchi interi: senza TRIM l'SSD non sa quali pagine sono libere e deve spostare/cancellare dati validi prima di scrivere (write amplification). Gli SSD non hanno seek né latenza rotazionale." },

{ id: "r60", topic: "dischi",
  q: "Su un disco meccanico, per ridurre il tempo medio di accesso a richieste <b>sparse</b> conviene ottimizzare soprattutto:",
  options: [
    "il tempo di ricerca (seek), di solito la componente dominante",
    "la latenza rotazionale, che è sistematicamente maggiore del tempo di ricerca",
    "il tempo di trasferimento dei dati letti dai settori verso la memoria centrale",
    "il tempo di risposta del controller, che pesa più del movimento della testina"
  ],
  correct: 0,
  expl: "Per richieste sparse su cilindri diversi domina il seek (spostamento della testina): per questo gli algoritmi di scheduling del disco puntano a minimizzarlo. Latenza e trasferimento pesano meno." }
);
