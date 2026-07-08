// Domande da orale (flashcard) ed esercizi risolti

window.ORALI = [
{ id:"or01", topic:"intro", q:"Che cos'è un sistema operativo e perché è necessario?",
  a:"È l'insieme di procedure e servizi che gestisce l'hardware al posto del programmatore, creando <b>astrazioni</b> (es. file, processi, CPU virtuali) che semplificano l'uso di un hardware altrimenti troppo complesso. Nota: CLI e GUI non fanno parte del SO. Il kernel moderno supera i 5 milioni di righe di codice, per cui quasi tutti gli OS riutilizzano kernel precedenti." },
{ id:"or02", topic:"intro", q:"Spiega la differenza tra modalità utente e modalità kernel e come avviene una chiamata di sistema.",
  a:"In modalità utente è eseguibile solo un set limitato di istruzioni; in modalità kernel tutto il set (I/O, interrupt...). Il flag di modalità sta nella PSW ed è modificabile solo in modalità kernel. Quando un processo utente deve eseguire un'operazione 'vietata' effettua una <b>syscall</b>: l'istruzione TRAP cambia modalità, passa un indice che identifica la routine kernel in una tabella, i registri vengono salvati nello stack del kernel, la routine viene eseguita e si torna in modalità utente ripristinando i registri." },
{ id:"or03", topic:"intro", q:"Descrivi i tre metodi di gestione delle operazioni di I/O.",
  a:"<b>Busy waiting</b>: la CPU legge in continuazione la porta di I/O (polling) fino all'esito: semplice ma spreca CPU. <b>Interrupt</b>: il controller notifica un interrupt al termine; la routine di gestione trasferisce i dati dal buffer del controller alla RAM. <b>DMA</b>: un chip dedicato accede direttamente alla RAM e trasferisce i dati; la CPU riceve un solo interrupt finale con lavoro minimo." },
{ id:"or04", topic:"intro", q:"Che cos'è la pipeline di una CPU? E una CPU superscalare?",
  a:"La pipeline sovrappone le fasi di esecuzione (fetch, decode, execute) di istruzioni consecutive per sfruttare i tempi morti: a regime completa un'istruzione per ciclo di stadio (es. stadio da 10 ns → throughput 100 milioni di istruzioni/s, mentre la latenza della singola istruzione resta 3×10 ns). Le CPU superscalari hanno più pipeline e possono eseguire istruzioni fuori ordine: l'hardware garantisce la correttezza, ma questi meccanismi non sono del tutto trasparenti al SO." },
{ id:"or05", topic:"struttura", q:"Confronta le strutture monolitica, a microkernel e a moduli.",
  a:"<b>Monolitica</b>: tutto il kernel in un unico binario, ogni componente può chiamare gli altri: veloce ma difficile da gestire e poco robusto. <b>Microkernel</b>: nel kernel restano solo scheduling, memoria, IPC e interrupt; il resto (driver, file system) gira come processi utente isolati comunicanti a messaggi; molto robusto (reincarnation server) ma con overhead da messaggi (es. MINIX 3). <b>A moduli</b> (Linux): componenti separati e caricabili ma eseguiti tutti in modalità kernel con normali chiamate: buon compromesso tra efficienza e organizzazione." },
{ id:"or06", topic:"struttura", q:"Che cos'è una macchina virtuale e quali tipi di hypervisor esistono?",
  a:"Una VM astrae un'intera macchina: hardware virtuale su hardware fisico, con OS ospite ignaro di essere virtualizzato. L'<b>hypervisor di tipo 1</b> gira direttamente sull'hardware (bare metal, uso professionale); il <b>tipo 2</b> è un processo sull'OS principale (es. VirtualBox). Le syscall della VM vengono intercettate dall'hypervisor che simula la modalità kernel virtuale: overhead soprattutto su I/O. Vantaggi: più OS sulla stessa macchina, sicurezza (isolamento), continuità del software legacy, migrazione a caldo." },
{ id:"or07", topic:"processi", q:"Che cos'è un processo? Descrivi PCB e tabella dei processi.",
  a:"Un processo è un'<b>istanza di esecuzione</b> di un programma, con il proprio spazio degli indirizzi (codice, dati, heap, stack). Il SO mantiene la <b>tabella dei processi</b>: ogni record è un <b>PCB</b> che contiene registri salvati, stato, file aperti, parentela, memory limits. L'indice della tabella è l'ID del processo. Ogni processo (tranne INIT) è figlio di un altro: i processi formano un albero." },
{ id:"or08", topic:"processi", q:"Descrivi gli stati di un processo e tutte le transizioni possibili.",
  a:"Stati principali: <b>ready</b> (pronto in coda), <b>running</b> (in esecuzione), <b>blocked</b> (attende un evento, es. I/O), più new e terminated. Transizioni: ready→running (lo scheduler lo sceglie), running→ready (prelazione), running→blocked (chiamata bloccante), blocked→ready (l'evento si completa). NON esistono ready→blocked (non sta eseguendo, non può bloccarsi) né blocked→running (deve prima tornare pronto)." },
{ id:"or09", topic:"processi", q:"Come viene creato un processo in UNIX? Confronta con Windows.",
  a:"UNIX: <b>fork()</b> crea un clone del chiamante (ID diverso, copia di codice/stack/dati — ottimizzata con copy-on-write); il figlio di solito chiama <b>exec()</b> che ne azzera lo stato e carica un altro programma; un if sul valore di ritorno della fork distingue padre e figlio. Windows: <b>CreateProcess</b> crea direttamente un processo nuovo da zero specificando il codice. La fork dà più flessibilità e con il copy-on-write costa pochissimo." },
{ id:"or10", topic:"processi", q:"Che cosa sono i thread e quali modelli di implementazione esistono?",
  a:"I thread sono flussi di esecuzione dentro un processo: condividono memoria, codice e file aperti, ma ognuno ha stack, registri, PC e stato propri. Modelli: <b>1 a molti</b> (livello utente: runtime system, switch velocissimo senza TRAP, ma una chiamata bloccante o un page fault blocca tutto il processo e niente multicore); <b>1 a 1</b> (livello kernel: tabella dei thread nel kernel, serve la TRAP, ma multicore sfruttabile; modello a worker per ridurre i costi); <b>molti a molti</b> (ibrido a discrezione del programmatore)." },
{ id:"or11", topic:"sync", q:"Che cos'è una race condition? Fai un esempio concreto.",
  a:"È il problema per cui il risultato dipende dall'ordine di esecuzione di processi che accedono a dati condivisi. Esempio del conto corrente: l'incremento non è atomico (LOAD, somma, STORE); se la prelazione interrompe P1 tra incremento e STORE, P2 esegue il suo incremento e P1 poi sovrascrive: un versamento va perso (2 incrementi ma il saldo cresce di 1). Vale anche a livello kernel (tabella dei processi, code). Soluzione: mutua esclusione sulle sezioni critiche." },
{ id:"or12", topic:"sync", q:"Quali sono le 4 condizioni per una buona soluzione di mutua esclusione?",
  a:"1) <b>Mutua esclusione</b>: un solo processo alla volta nella sezione critica riferita a una struttura dati. 2) Nessuna ipotesi su velocità della CPU o numero di core. 3) Un processo fuori dalla sezione critica non deve bloccare gli altri. 4) <b>Attesa limitata</b>: nessuno deve aspettare per sempre l'ingresso." },
{ id:"or13", topic:"sync", q:"Descrivi la soluzione di Peterson: come funziona e quando fallisce?",
  a:"Software puro per 2 processi (generalizzabile a torneo per N): array booleano <code>interested[]</code> + variabile <code>turn</code>. enter_region: interested[me]=true; turn=me; busy waiting finché (turn==me && interested[other]). In caso di chiamata simultanea, chi scrive turn per ULTIMO resta in attesa. Fallisce sui <b>multicore</b>: il riordino hardware delle istruzioni (store/load su variabili diverse) può far leggere valori vecchi, fino al deadlock; servono barriere di memoria. Fa comunque busy waiting." },
{ id:"or14", topic:"sync", q:"Che cos'è l'istruzione TSL e perché risolve la mutua esclusione anche su multicore?",
  a:"<code>TSL Reg, LOCK</code> legge il vecchio valore di LOCK nel registro e scrive un valore ≠0 in LOCK <b>atomicamente</b>. Sui multicore l'atomicità è garantita <b>bloccando il bus della memoria</b> durante l'istruzione. Dopo la TSL si confronta il registro con 0: se era 0 il lock è nostro, altrimenti busy waiting. Su Intel l'equivalente è XCHG (scambio registro↔memoria). Rimane il problema del busy waiting → inversione di priorità." },
{ id:"or15", topic:"sync", q:"Spiega il problema della 'sveglia persa' nel produttore-consumatore e come i semafori lo risolvono.",
  a:"Con sleep/wakeup: il consumatore vede il buffer vuoto e sta per addormentarsi; la prelazione lo interrompe PRIMA della sleep; il produttore inserisce e chiama wakeup — a vuoto (il consumatore è ancora sveglio); il consumatore poi si addormenta e la condizione di risveglio (count==1) non si ripresenterà: si addormentano entrambi. Il <b>semaforo</b> generalizza il bit di sveglia con un contatore mai negativo e operazioni <b>down/up atomiche</b>: le sveglie vengono 'contate' e non si perdono." },
{ id:"or16", topic:"sync", q:"Scrivi (a parole) la soluzione del produttore-consumatore con semafori e spiega perché l'ordine delle down è cruciale.",
  a:"Semafori: <code>empty=N</code> (slot liberi), <code>full=0</code> (slot occupati), <code>mutex=1</code>. Produttore: produce; <b>down(empty); down(mutex);</b> inserisce; <b>up(mutex); up(full)</b>. Consumatore: <b>down(full); down(mutex);</b> estrae; <b>up(mutex); up(empty)</b>; consuma. Se si invertisse down(empty) con down(mutex), a buffer pieno il produttore si bloccherebbe DENTRO la sezione critica e il consumatore non potrebbe più entrare a estrarre: deadlock. Regola: mai chiamate bloccanti dentro una sezione critica." },
{ id:"or17", topic:"sync", q:"Che cos'è un monitor? Quali semantiche della signal conosci?",
  a:"Tipo di dato astratto (a livello di linguaggio, es. synchronized in Java) con strutture dati e metodi: il compilatore garantisce la <b>mutua esclusione sui metodi</b> usando semafori/mutex. La sincronizzazione usa <b>variabili di condizione</b> (senza valore, con coda di thread bloccati) su cui si fanno wait e signal. Semantiche: <b>Hoare</b> (signal & wait, teorico), <b>Mesa</b> (signal & continue, Java: il risvegliato attende la fine del metodo del segnalante), <b>signal & return</b> (concurrent Pascal e pseudocodici del corso: la signal è l'ultima istruzione)." },
{ id:"or18", topic:"sync", q:"Esponi il problema dei 5 filosofi e la soluzione con semafori.",
  a:"5 filosofi alternano pensiero e cibo; per mangiare servono le 2 forchette adiacenti, condivise con i vicini. Un lock per forchetta porta al deadlock (tutti prendono la destra insieme); rilascio e retry a tempo fisso → si bloccano ciclicamente; tempo random funziona ma è inefficiente. Soluzione: stati THINKING/HUNGRY/EATING in un vettore protetto da <code>mutex</code>, un semaforo per filosofo (init 0). <b>take_forks(i)</b>: down(mutex); state[i]=HUNGRY; test(i); up(mutex); down(s[i]) — fuori dalla sezione critica perché bloccante. <b>test(i)</b>: se state[i]==HUNGRY e i vicini non EATING → state[i]=EATING; up(s[i]). <b>put_forks(i)</b>: down(mutex); state[i]=THINKING; test(sinistro); test(destro); up(mutex) — così risveglia i vicini affamati. Max 2 filosofi mangiano insieme." },
{ id:"or19", topic:"sync", q:"Esponi il problema dei lettori-scrittori e la soluzione con semafori.",
  a:"Letture simultanee ammesse; scrittura esclusiva. Variabile <code>rc</code> (numero di lettori) protetta da <code>mutex</code>; semaforo <code>db</code> protegge il database. Lettore: down(mutex); rc++; se rc==1 down(db); up(mutex); legge; down(mutex); rc--; se rc==0 up(db); up(mutex). Scrittore: down(db); scrive; up(db). I lettori agiscono come un gruppo: il primo chiude la porta agli scrittori, l'ultimo la riapre. Problema: <b>starvation degli scrittori</b>; le varianti con monitor possono far attendere i nuovi lettori se ci sono scrittori in coda." },
{ id:"or20", topic:"sched", q:"Quali metriche valuta uno scheduler batch e cosa privilegia uno interattivo?",
  a:"Batch: <b>throughput</b> (task completati/tempo, da massimizzare), <b>turnaround</b> (arrivo→completamento, da minimizzare) e soprattutto <b>tempo di attesa</b> (l'unica parte che dipende davvero dall'algoritmo). Interattivi: conta la <b>reattività</b> (tempo di risposta), quindi si privilegiano i processi I/O-bound che rilasciano presto la CPU. Real-time: scadenze rigide e prevedibilità. In generale: equità e bilanciamento tra i core." },
{ id:"or21", topic:"sched", q:"Descrivi FCFS, SJF e SRTN con i loro pregi e difetti.",
  a:"<b>FCFS</b>: estrazione in testa alla coda FIFO, senza prelazione; equo ma un processo lungo blocca tutti (effetto convoglio). <b>SJF</b>: coda ordinata per durata crescente (durate prevedibili nei sistemi batch); ottimale per il tempo di attesa medio SOLO se tutti arrivano a t=0. <b>SRTN</b>: SJF con prelazione: a ogni nuovo arrivo, se la durata del nuovo è minore del tempo residuo del corrente, si prelaziona; il processo espulso torna in coda con durata pari al residuo." },
{ id:"or22", topic:"sched", q:"Descrivi il Round-Robin e discuti la scelta del quanto.",
  a:"FCFS + prelazione: ogni processo riceve un <b>quanto</b>; alla scadenza torna in fondo alla coda dei pronti. Se si blocca prima, al risveglio riceve un quanto pieno. Quanto piccolo → più reattività ma più context-switch (overhead); quanto più grande dei CPU burst → degenera in FCFS. Garanzia anti-starvation: con n processi e quanto q, attesa massima (n−1)·q. I CPU-bound vengono prelazionati più spesso: un modo per riconoscerli." },
{ id:"or23", topic:"sched", q:"Come funziona lo scheduling a code multiple con retroazione?",
  a:"Una coda per priorità; si serve la coda più alta non vuota, internamente con Round-Robin; più alta la priorità, più piccolo il quanto (reattività); all'ultima coda può bastare FCFS. Anti-starvation: quote di tempo CPU prefissate a TUTTE le code. Con la <b>retroazione</b> i processi migrano tra le code in base all'uso del quanto: chi lo esaurisce (CPU-bound) scende. È l'approccio di Windows (con boost euristici ai processi interattivi e autoboost contro l'inversione di priorità)." },
{ id:"or24", topic:"sched", q:"Come funziona lo scheduler CFS di Linux?",
  a:"È uno scheduling 'garantito': ogni processo ha un <b>Virtual Run-Time</b> (tempo di CPU consumato, pesato dalla priorità come fattore di decadenza); la coda dei pronti è un <b>albero red-black</b> ordinato per VRT; si schedula sempre il processo con VRT minimo e c'è prelazione quando smette di esserlo; niente quanti fissi. Gli I/O-bound accumulano poco VRT → boost naturale; chi aspetta non incrementa VRT → niente starvation; overflow gestito normalizzando." },
{ id:"or25", topic:"sched", q:"Scheduling multiprocessore: coda unica vs code multiple, e migrazione dei processi.",
  a:"<b>Coda unica condivisa</b>: semplice ma serve un lock → collo di bottiglia con molti core. <b>Una coda per core</b>: niente contesa ma serve bilanciamento: migrazione <b>push</b> (routine periodica sposta processi dalla coda più piena alla più vuota) e <b>pull/spontanea</b> (una CPU a coda vuota 'ruba' processi). Linux usa un ibrido. Affinità (predilezione): debole = preferenza, forte = vincolo a un core specifico." },
{ id:"or26", topic:"memoria", q:"Rilocazione statica vs dinamica: spiega entrambe.",
  a:"Il codice usa indirizzi 'canonici' da 0 (spazio logico). <b>Statica</b>: al caricamento l'OS scansiona il codice e somma la base assegnata a tutti i riferimenti: lenta e rigida. <b>Dinamica</b>: la MMU traduce OGNI indirizzo a run-time usando registro base (RB) e registro limite (RL): prima controlla indirizzo ≤ RL (protezione: altrimenti TRAP e terminazione), poi somma RB. Introdotta con Intel 8088; rende banale lo spostamento del processo (basta cambiare RB)." },
{ id:"or27", topic:"memoria", q:"Che cos'è lo swapping e quali problemi comporta?",
  a:"Con RAM piena, lo <b>scheduler di medio termine</b> 'parcheggia' su disco l'intera memoria di un processo (il PCB resta); al rientro, con rilocazione dinamica basta aggiornare il registro base. Problemi: I/O pendenti (es. DMA che scrive nella vecchia zona → si corrompe il nuovo processo), vincolo di contiguità → <b>frammentazione esterna</b> (la compaction è troppo onerosa), crescita dinamica dei processi → frammentazione interna delle partizioni." },
{ id:"or28", topic:"memoria", q:"Come funziona la traduzione da indirizzo virtuale a fisico con la paginazione?",
  a:"Spazio virtuale diviso in <b>pagine</b>, RAM in <b>frame</b> della stessa dimensione (potenza di 2). L'indirizzo virtuale si spacca in numero di pagina (bit alti) e offset (bit bassi, n = log2 della dimensione pagina). La MMU consulta la <b>tabella delle pagine</b> del processo: se il bit di presenza è 0 → page fault; altrimenti prende il numero di frame, lo 'incolla' al posto del numero di pagina (shift + OR con l'offset) e ottiene l'indirizzo fisico. La CPU genera SOLO indirizzi virtuali." },
{ id:"or29", topic:"memoria", q:"Descrivi i campi di una voce della tabella delle pagine.",
  a:"<b>Numero di frame</b>; <b>bit di presenza</b> (pagina in RAM?); <b>protezione</b> (lettura/scrittura, eventualmente esecuzione); <b>bit di modifica/dirty</b> (differisce dalla copia su disco? se sì, alla sostituzione va riscritta); <b>bit di referenziamento R</b> (usata di recente? azzerato periodicamente, base degli algoritmi di sostituzione); <b>disabilita cache</b> (per pagine con I/O mappato in memoria); <b>bit di validità</b> (pagina allocata?)." },
{ id:"or30", topic:"memoria", q:"Che cos'è il TLB e cosa succede al context-switch?",
  a:"Memoria associativa nella MMU (~1024 voci, ricerca parallela hardware) che tiene le voci della tabella delle pagine usate di recente, con in più il numero di pagina; rimpiazzo LRU. Hit → traduzione immediata; miss → accesso alla tabella in RAM e scrittura della voce nel TLB. Funziona per la <b>località</b>. Al context-switch: <b>flush</b> (tranne le voci del SO) oppure <b>ASID</b> nelle voci per distinguere i processi; tra thread fratelli non serve nulla. EAT = h·(t_TLB + t_RAM) + (1−h)·(t_TLB + 2t_RAM)." },
{ id:"or31", topic:"memoria", q:"Perché servono le tabelle delle pagine multilivello e quanti accessi costano?",
  a:"Con 64 bit una tabella piatta avrebbe ~2⁵² voci (pagine 4KB): impossibile. Si spezza la tabella ad albero: la tabella di 1° livello punta a tabelle di 2° livello, ecc.; i bit alti dell'indirizzo indicano il gruppo, poi la voce, poi l'offset. I sottoalberi di zone virtuali vuote NON vengono creati (puntatore NULL) → enorme risparmio. Costo: una fetch per livello (2 livelli → 3 accessi totali), mitigato dal TLB. In pratica indirizzi a 48 bit e 4-5 livelli." },
{ id:"or32", topic:"memoria", q:"Spiega copy-on-write e zero-fill-on-demand.",
  a:"<b>COW</b>: dopo la fork le pagine sono condivise e marcate read-only; al primo tentativo di scrittura la MMU invoca l'OS (non è errore) che copia SOLO quella pagina, aggiorna il puntatore del processo scrittore e ripristina i bit di scrittura su entrambe. <b>Zero-fill-on-demand</b>: alla sbrk() le nuove pagine dell'heap puntano tutte a una <i>read-only static zero page</i>; il frame reale viene assegnato (via COW) solo al primo uso effettivo. Anche la BSS è mappata sulla zero page." },
{ id:"or33", topic:"sostituzione", q:"Confronta gli algoritmi di sostituzione: OPT, NRU, FIFO, seconda chance, clock, LRU, NFU, Aging.",
  a:"<b>OPT</b>: scarta la pagina riferita più lontano nel futuro; teorico, lower bound. <b>NRU</b>: 4 classi sui bit R (azzerato periodicamente) e M; scarta dalla classe più bassa, FIFO interno. <b>FIFO</b>: la più vecchia in RAM; ignora l'uso. <b>Seconda chance</b>: FIFO ma se R=1 rimette in coda azzerando R. <b>Clock</b>: seconda chance su lista circolare con lancetta (più efficiente). <b>LRU</b>: la non usata da più tempo; esatto ma costoso (contatore hardware 64 bit o matrice di bit: riga i a 1, colonna i a 0). <b>NFU</b>: contatore += R periodicamente; non dimentica il passato. <b>Aging</b>: shift a destra del contatore e R nel bit più significativo: approssima LRU pesando il QUANDO." },
{ id:"or34", topic:"sostituzione", q:"Che cos'è l'anomalia di Belady e quali algoritmi ne soffrono? Perché LRU no?",
  a:"Con certe sequenze (es. 1,2,3,4,1,2,5,1,2,3,4,5), aumentando i frame aumentano i page fault (FIFO: 9 fault con 3 frame, 10 con 4). Ne soffrono gli algoritmi <b>FIFO-based</b> (FIFO, seconda chance, clock). Gli <b>LRU-based</b> (LRU, NFU, Aging) no, grazie alla <b>proprietà di inclusione</b>: le pagine in memoria con N frame sono sempre un sottoinsieme di quelle con N+1 frame (in memoria restano le più recenti, un frame in più aggiunge solo una pagina più vecchia)." },
{ id:"or35", topic:"sostituzione", q:"Che cosa sono thrashing, località e working set? Come si previene il thrashing?",
  a:"<b>Thrashing</b>: troppi pochi frame → si passa più tempo a gestire page fault che a eseguire. <b>Località</b>: l'insieme (dinamico) di dati e istruzioni che il processo usa in un dato periodo. <b>Working set</b>: le pagine referenziate negli ultimi Δ accessi: approssima la località (si calcola con i log del bit R). Si previene dando a ogni processo frame sufficienti per il suo working set, o monitorando la <b>PFF</b> (page fault frequency) con due soglie: sopra → più frame, sotto → meno frame. I picchi di PFF segnalano i cambi di località. Se la somma dei working set supera i frame → swapping di interi processi." },
{ id:"or36", topic:"sostituzione", q:"Grandi o piccole: come si sceglie la dimensione della pagina?",
  a:"<b>Pagine grandi</b>: tabelle più piccole, I/O su disco più efficiente (più blocchi contigui, meno seek), meno page fault a parità di pagine caricate. <b>Pagine piccole</b>: meno frammentazione interna (in media resta vuota mezza pagina) e migliore risoluzione del working set. Sempre potenza di 2 e preferibilmente multiplo del blocco del disco." },
{ id:"or37", topic:"fs", q:"Confronta le tecniche di allocazione dei file: contigua, lista linkata, FAT, i-node.",
  a:"<b>Contigua</b>: accesso diretto O(1) e ottima in lettura sequenziale, ma serve conoscere la dimensione massima a priori e crea frammentazione esterna: oggi solo per supporti read-only (CD/DVD). <b>Lista linkata</b>: niente frammentazione esterna, ma il puntatore ruba spazio nel blocco e l'accesso è sequenziale O(n) su disco. <b>FAT</b>: puntatori centralizzati in una tabella in RAM (persistente su disco, in 2 copie): blocchi interi e salti veloci; la tabella cresce con il disco. <b>I-node</b>: struttura per file con metadati + 10 puntatori diretti + indiretto singolo/doppio/triplo: file enormi, si carica in RAM solo l'i-node del file aperto." },
{ id:"or38", topic:"fs", q:"Spiega hard-link e soft-link, con vantaggi e difetti di ciascuno.",
  a:"<b>Hard-link</b>: nuova voce di directory che punta allo STESSO i-node (stesso i-number); l'i-node ha un contatore dei riferimenti e viene deallocato a 0; l'OS non distingue l'originale. Difetti: niente link tra file system diversi (i-number univoco solo nel FS), vietati i link a directory (cicli), anomalia dell'accounting (il file pesa sul proprietario originale). <b>Soft-link</b>: file speciale con il PERCORSO del bersaglio: attraversa i file system, ma si 'rompe' se il bersaglio viene spostato/rinominato/cancellato. Con la FAT i riferimenti non sono possibili (i metadati stanno nella voce di directory)." },
{ id:"or39", topic:"fs", q:"Come funzionano i controlli di consistenza (fsck) e il journaling?",
  a:"<b>Blocchi</b>: due vettori di contatori (in uso, scandendo gli i-node; liberi, scandendo la free list): devono essere complementari con soli 0/1. Blocco in nessuna lista → si aggiunge ai liberi; doppio nei liberi → si ricostruisce la lista; doppio negli usati → si duplica il blocco (un file resta danneggiato). <b>I-node</b>: contatore dei riferimenti nell'i-node vs conteggio reale scandendo le directory: devono coincidere. <b>Journaling</b>: prima di ogni macro-operazione si annotano nel log le sotto-operazioni (sui METAdati); dopo un crash si rieseguono dall'inizio (idempotenti): si controlla solo ciò che si stava modificando." },
{ id:"or40", topic:"dischi", q:"Descrivi gli algoritmi di scheduling del disco.",
  a:"Obiettivo: minimizzare il seek-time (il costo dominante). <b>FCFS</b>: in ordine di arrivo, equo ma pessimo. <b>SSTF</b>: sempre la richiesta più vicina: ottimo seek ma starvation delle lontane. <b>SCAN</b> (ascensore): una direzione alla volta; garantisce attesa massima. <b>C-SCAN</b>: serve solo in un verso e riparte dall'inizio: attese più uniformi ad alto carico. <b>LOOK/C-LOOK</b>: come SCAN/C-SCAN ma si inverte/riparte dopo l'ULTIMA richiesta, senza arrivare all'estremo fisico. Nota del corso: nel compito la testina inverte dopo l'ultima richiesta (comportamento LOOK)." },
{ id:"or41", topic:"dischi", q:"Descrivi i livelli RAID da 0 a 5.",
  a:"<b>0</b> striping puro: prestazioni ×n, nessuna ridondanza, un guasto perde tutto. <b>1</b> mirroring: ogni stripe duplicato, capacità dimezzata, tollera un guasto. <b>2</b> striping a bit + Hamming (7 dischi per 4 di dati): corregge 1 bit ma serve sincronia. <b>3</b> striping a bit + un disco di parità: il bit rotto è noto (si sa quale disco è guasto) quindi la parità basta a correggere; sincronia ancora necessaria. <b>4</b> striping a blocchi + disco di parità con XOR: niente sincronia, ma il disco di parità è il collo di bottiglia (coinvolto in ogni scrittura). <b>5</b> parità distribuite su tutti i dischi: niente bottleneck, capacità (n−1)·S, ricostruzione con XOR degli altri dischi." },
{ id:"or42", topic:"dischi", q:"Come si ricostruisce un disco guasto in RAID 5? Perché funziona lo XOR?",
  a:"La parità di riga è P = D1⊕D2⊕...⊕Dk. Se si guasta il disco j: Dj = XOR di tutti gli altri stripe della riga inclusa la parità. Funziona per le proprietà dello XOR: a⊕a=0 e a⊕0=a, quindi XOR-ando P con tutti i Di superstiti restano esattamente i bit di Dj. Per aggiornare la parità a ogni scrittura non serve rileggere tutta la riga: P_nuova = P_vecchia ⊕ stripe_vecchio ⊕ stripe_nuovo." },
{ id:"or43", topic:"dischi", q:"Come funzionano gli SSD? Spiega garbage collection e TRIM.",
  a:"Basati su memorie flash NAND: letture veloci, scritture lente (una cella va cancellata prima di essere riscritta) e numero di scritture limitato. Struttura: blocchi flash composti da pagine. Non si può cancellare una singola pagina: si scrive la nuova versione su un'altra pagina e la vecchia si marca 'non valida'. La <b>garbage collection</b> ricopia le pagine valide in un blocco libero e cancella il blocco; <b>TRIM</b> le permette di ignorare le pagine non valide: meno scritture, meno degrado, più prestazioni. Niente testina → seek-time nullo." },
{ id:"or44", topic:"memoria", q:"Dove si piazza la cache della CPU rispetto alla MMU? Vantaggi e problemi.",
  a:"<b>Dopo la MMU</b> (indirizzi fisici): chiavi univoche, nessun problema con più processi, ma il caching aspetta la traduzione (MMU bottleneck). <b>Prima della MMU</b> (indirizzi virtuali): velocissima ma le chiavi non sono univoche tra processi → flush o ASID; con le pagine condivise si crea <b>aliasing</b> (stessa pagina, chiavi diverse): si usa la ricerca preliminare con i <b>tag fisici</b> (l'offset, uguale in virtuale e fisico) in parallelo alla traduzione. In pratica: L1 prima della MMU, L2/L3 dopo." },
{ id:"or45", topic:"processi", q:"Perché il context-switch tra thread fratelli è più leggero? Come si classificano i context-switch per costo?",
  a:"I thread fratelli condividono lo spazio di indirizzamento: non va riprogrammata la MMU né svuotato il TLB. Classifica dal più veloce: 1) thread utente fratelli (nessuna TRAP: fa tutto il runtime system); 2) thread kernel fratelli (serve la TRAP); 3) processo↔processo (TRAP + cambio completo di memoria + flush TLB). Lo scheduler, potendo, preferisce un thread fratello del precedente." }
];

// Esercizi statici già risolti
window.ESERCIZI = [

{ id:"es01", topic:"memoria", title:"Memoria virtuale: numero di frame fisici",
  text:`<p>Consideriamo un sistema che fa uso di memoria virtuale con le seguenti caratteristiche: uno spazio di indirizzamento virtuale da <b>1 GB</b>, un numero di pagina virtuale a <b>22 bit</b> e un indirizzo fisico a <b>20 bit</b>.</p><p><b>Determinare esattamente quanti frame fisici ci sono in memoria.</b></p>`,
  sol:`<ol>
<li>Spazio virtuale = 1 GB = 2<sup>30</sup> byte.</li>
<li>Numero di pagine virtuali = 2<sup>22</sup> ⇒ dimensione pagina = 2<sup>30</sup> / 2<sup>22</sup> = 2<sup>8</sup> = <b>256 byte</b>.</li>
<li>Indirizzo fisico a 20 bit ⇒ RAM = 2<sup>20</sup> byte.</li>
<li>Numero di frame = RAM / dimensione pagina = 2<sup>20</sup> / 2<sup>8</sup> = 2<sup>12</sup> = <b>4096 frame</b>.</li>
</ol>
<p><b>Metodo generale</b>: dim. pagina = spazio virtuale / n. pagine; n. frame = dim. RAM / dim. pagina (pagina e frame hanno la stessa dimensione).</p>` },

{ id:"es02", topic:"sync", title:"Semafori: tracciare l'output",
  text:`<p>Tre processi condividono una variabile x. Pseudo-codici:</p>
<pre>P1:            P2:            P3:
wait(S)        wait(R)        wait(T)
x = x - 2      x = x + 2      if (x&lt;0) signal(R)
signal(T)      signal(T)      wait(T)
wait(S)        wait(R)        print(x)
x = x - 1
signal(T)</pre>
<p>Determinare l'output di P3 con x = 1 e semafori iniziali S=1, R=0, T=0.</p>`,
  sol:`<p>Traccia dell'esecuzione (le wait su semaforo 0 bloccano):</p>
<ol>
<li>Solo P1 può partire (S=1): <code>wait(S)</code> → S=0; x = 1−2 = <b>−1</b>; <code>signal(T)</code> → T=1.</li>
<li>P1 prosegue: <code>wait(S)</code> con S=0 → <b>P1 si blocca per sempre</b> (nessuno farà signal(S)): la parte x=x−1 non verrà mai eseguita.</li>
<li>P2 è bloccato su <code>wait(R)</code> (R=0). P3: <code>wait(T)</code> → T=0; x=−1 &lt; 0 ⇒ <code>signal(R)</code> → sblocca P2.</li>
<li>P2: x = −1+2 = <b>1</b>; <code>signal(T)</code> → T=1; poi <code>wait(R)</code> → si blocca (R=0).</li>
<li>P3: <code>wait(T)</code> → T=0; <code>print(x)</code> → stampa <b>1</b>.</li>
</ol>
<p><b>Output: 1</b></p>
<p><b>Metodo</b>: segui sempre chi PUÒ procedere (semaforo &gt; 0); aggiorna i semafori a ogni wait/signal; nota che un processo bloccato può restarlo per sempre e parte del suo codice non viene eseguita.</p>` },

{ id:"es03", topic:"fs", title:"FAT: da offset a blocco + dimensione minima",
  text:`<p>File system con FAT e blocchi da <b>4 KB</b>. La cartella radice dice che <code>pippo.txt</code> inizia al blocco <b>7</b>.</p>
<div class="tablewrap"><table>
<tr><th>indice</th><th>FAT</th></tr>
<tr><td>1</td><td>4</td></tr><tr><td>2</td><td>3</td></tr><tr><td>3</td><td>15</td></tr>
<tr><td>4</td><td>5</td></tr><tr><td>5</td><td>10</td></tr><tr><td>6</td><td>12</td></tr>
<tr><td>7</td><td>1</td></tr><tr><td>8</td><td>2</td></tr><tr><td>9</td><td>3</td></tr>
<tr><td>10</td><td>-1</td></tr>
</table></div>
<p>1) In quale blocco del disco si trova l'offset <b>10100</b> di pippo.txt? 2) Qual è la dimensione minima presunta del file? (offset in byte, da 0)</p>`,
  sol:`<ol>
<li><b>Catena del file</b> dalla FAT partendo dal blocco 7: 7 → FAT[7]=1 → FAT[1]=4 → FAT[4]=5 → FAT[5]=10 → FAT[10]=−1 (fine).<br>Blocchi del file, in ordine: <b>[7, 1, 4, 5, 10]</b> (5 blocchi).</li>
<li><b>Indice del blocco nel file</b>: 10100 / 4096 = 2 (divisione intera) ⇒ è il 3° blocco del file (indice 2).</li>
<li>Il 3° blocco della catena è il <b>blocco 4</b> del disco. ✓</li>
<li><b>Dimensione minima</b>: il file usa 5 blocchi, quindi ha ALMENO 4 blocchi pieni + 1 byte nell'ultimo:<br>4 · 4096 + 1 = <b>16385 byte</b>.</li>
</ol>
<p><b>Metodo</b>: indice nel file = ⌊offset / dim_blocco⌋; segui la catena FAT dal blocco iniziale; dimensione minima = (n−1)·dim_blocco + 1.</p>` },

{ id:"es04", topic:"fs", title:"I-node: da offset a blocco",
  text:`<p>File system UNIX con i-node: 13 voci di cui le prime 10 dirette, poi indiretto singolo, doppio e triplo. Blocchi da <b>4 KB</b>, numeri di blocco a <b>32 bit</b> (4 byte ⇒ 1024 puntatori per blocco).</p>
<pre>i-node 54                    blocco 112     blocco 333     blocco 233
─────────────                (ind.singolo)  (ind.doppio)   (tab. 2° liv.)
[metadati del file]
dirette:  321  322  239      16             233            821
          234  235  236      544            322            822
          14   21   233      20             444            915
          12                 555            530            50
ind. singolo → 112           922            742            51
ind. doppio  → 333           942            221            53
ind. triplo  → −1            …              …              …</pre>
<p>In quali blocchi del disco risiedono gli offset <b>4046</b>, <b>11000</b> e <b>44322</b>?</p>`,
  sol:`<p><b>Ripartizione degli offset</b> (blocchi da 4096 byte):</p>
<ul>
<li>Blocchi 0–9 (diretti): offset 0 … 40959</li>
<li>Blocchi 10–1033 (ind. singolo): offset 40960 … 4235263</li>
<li>Blocchi 1034–1049609 (ind. doppio): offset successivi</li>
</ul>
<ol>
<li><b>Offset 4046</b>: 4046/4096 = 0 ⇒ 1° blocco del file ⇒ voce diretta n.0 ⇒ <b>blocco 321</b>.</li>
<li><b>Offset 11000</b>: 11000/4096 = 2 ⇒ 3° blocco ⇒ voce diretta n.2 ⇒ <b>blocco 239</b>.</li>
<li><b>Offset 44322</b>: 44322/4096 = 10 ⇒ 11° blocco ⇒ oltre i 10 diretti ⇒ 1ª voce del blocco indiretto singolo (blocco 112) ⇒ <b>blocco 16</b>.</li>
</ol>
<p><b>Metodo</b>: k = ⌊offset/dim_blocco⌋. Se k &lt; 10: voce diretta k. Se 10 ≤ k &lt; 10+1024: voce (k−10) del blocco indiretto singolo. Se oltre: indiretto doppio, con indice (k−10−1024): la voce (÷1024) sceglie la tabella di 2° livello, il resto (mod 1024) la voce finale.</p>` },

{ id:"es05", topic:"dischi", title:"LOOK con richieste dinamiche",
  text:`<p>Disco con 200 tracce (0–199), velocità di seek <b>1 traccia/ms</b>. A t=0 il SO sta servendo la traccia <b>100</b> e in coda ci sono richieste per le tracce <b>(50, 115, 180)</b>. A t=70 arriva la richiesta per la traccia <b>150</b>; a t=130 quella per la traccia <b>90</b>.</p>
<p>Calcolare il tempo di ricerca complessivo con la politica <b>LOOK</b> partendo in ordine ascendente, e indicare la sequenza di scheduling.</p>`,
  sol:`<ol>
<li>Da 100 in salita: prossima richiesta sopra è 115. <b>100→115</b>: 15 tracce, t=15.</li>
<li>Sopra 115 resta 180. <b>115→180</b>: 65 tracce, t=80.<br>Durante il tragitto, a t=70 la testina è a quota 115+55 = <b>170</b> e arriva la richiesta 150: è GIÀ stata superata (150 &lt; 170), verrà servita in discesa.</li>
<li>A t=80 (traccia 180) non ci sono più richieste sopra ⇒ inversione (LOOK: non si va a 199).</li>
<li>In discesa: <b>180→150</b>: 30 tracce, t=110. ✓ servita 150.</li>
<li>Prossima sotto: 50. Durante la discesa, a t=130 la testina è a 150−20 = <b>130</b> e arriva la richiesta 90: è più sotto (90 &lt; 130), si serve strada facendo.</li>
<li><b>150→90</b>: 60 tracce, t=170. ✓ servita 90.</li>
<li><b>90→50</b>: 40 tracce, t=210. ✓ servita 50.</li>
</ol>
<p><b>Sequenza: 115, 180, 150, 90, 50 — Tempo totale: 15+65+30+60+40 = 210 ms</b> (210 tracce a 1 traccia/ms).</p>
<p><b>Metodo</b>: tieni traccia della POSIZIONE della testina all'istante di arrivo di ogni nuova richiesta: se è già stata superata nel verso corrente si serve al ritorno; con LOOK si inverte dopo l'ultima richiesta pendente nel verso corrente.</p>` },

{ id:"es06", topic:"memoria", title:"EAT con TLB e page fault",
  text:`<p>In un sistema con paginazione, l'accesso al TLB richiede <b>150 ns</b> e l'accesso alla memoria <b>400 ns</b>. Quando si verifica un page fault servono <b>8 ms</b> per caricare la pagina.
Se il page fault rate è del <b>2%</b> e il TLB hit ratio è del <b>70%</b>, calcolare il tempo effettivo di accesso (EAT).</p>`,
  sol:`<p>Tre casi (nota: il page fault può avvenire solo se il TLB ha fatto miss: una voce nel TLB implica pagina in RAM):</p>
<ul>
<li><b>TLB hit</b> (70%): t = TLB + RAM = 150 + 400 = 550 ns</li>
<li><b>TLB miss senza fault</b> (30% · 98%): t = TLB + RAM (tabella) + RAM (dato) = 150 + 800 = 950 ns</li>
<li><b>TLB miss con page fault</b> (30% · 2%): t = 150 + 8·10⁶ ns + gestione ≈ 8.000.150 ns</li>
</ul>
<p>EAT = 0,7·550 + 0,3·0,98·950 + 0,3·0,02·8.000.150<br>
= 385 + 279,3 + 48.000,9 ≈ <b>48.665 ns ≈ 0,049 ms</b></p>
<p><b>Osservazione chiave</b>: pur essendo rarissimo (0,6%), il page fault domina l'EAT perché costa 4 ordini di grandezza in più. È il motivo per cui il page fault rate va tenuto bassissimo.</p>
<p><b>Formula del corso senza page fault</b>: EAT = h·(t<sub>TLB</sub>+t<sub>RAM</sub>) + (1−h)·(t<sub>TLB</sub>+2t<sub>RAM</sub>).</p>` },

{ id:"es07", topic:"memoria", title:"TLB: hit ratio necessario per un dato degrado",
  text:`<p>Sistema con memoria paginata a 1 livello, tabella delle pagine in RAM, tempo di accesso alla memoria t = <b>30 ns</b>.</p>
<ol><li>Qual è il tempo effettivo di accesso alla memoria senza TLB?</li>
<li>Aggiungendo un TLB con tempo di accesso trascurabile, quale hit ratio serve per avere un degrado delle prestazioni del 3% rispetto a t?</li>
<li>E con paginazione a 2 livelli?</li></ol>`,
  sol:`<ol>
<li>Senza TLB ogni riferimento richiede 2 accessi (tabella + dato): EAT = 2t = <b>60 ns</b>.</li>
<li>Obiettivo: EAT = t·(1+3%) = 30·1,03 = <b>30,9 ns</b>.<br>
Con TLB (costo trascurabile): EAT = h·t + (1−h)·2t.<br>
30,9 = 30h + 60(1−h) = 60 − 30h ⇒ 30h = 29,1 ⇒ <b>h = 0,97 = 97%</b>.</li>
<li>Con 2 livelli il miss costa 3 accessi: EAT = h·t + (1−h)·3t.<br>
30,9 = 30h + 90(1−h) = 90 − 60h ⇒ 60h = 59,1 ⇒ <b>h = 0,985 = 98,5%</b>.</li>
</ol>
<p><b>Metodo</b>: imposta l'equazione EAT-obiettivo = h·(accessi con hit) + (1−h)·(accessi con miss) e risolvi per h. Ogni livello di tabella aggiunge un accesso al caso miss.</p>` },

{ id:"es08", topic:"memoria", title:"Tabella delle pagine: quante voci?",
  text:`<p>1) Una macchina ha indirizzi virtuali a <b>48 bit</b> e fisici a <b>32 bit</b>, con pagine da <b>4 KB</b>. Quante voci avrebbe la tabella delle pagine a un livello?</p>
<p>2) Uno spazio di indirizzamento a <b>32 bit</b>, pagine da 4 KB e memoria fisica di 512 MB: quante voci nella tabella a un livello? Dipende dalla memoria fisica?</p>`,
  sol:`<ol>
<li>Offset in una pagina da 4 KB (2¹² byte) = 12 bit ⇒ numero di pagina virtuale = 48 − 12 = 36 bit ⇒ <b>2³⁶ voci</b> (~68 miliardi!). Ecco perché servono le tabelle multilivello.</li>
<li>Numero di pagina = 32 − 12 = 20 bit ⇒ <b>2²⁰ voci</b> (~1 milione).<br>
<b>La memoria fisica NON conta</b>: il numero di voci dipende solo dallo spazio VIRTUALE e dalla dimensione della pagina. La RAM (512 MB = 2²⁹, cioè 2¹⁷ frame) determina solo quanti bit servono per il numero di frame DENTRO ogni voce.</li>
</ol>
<p><b>Metodo</b>: voci = 2^(bit virtuali − bit offset). Trappola classica: l'indirizzo fisico serve per i frame, non per il numero di voci.</p>` },

{ id:"es09", topic:"memoria", title:"Caricamento tabella delle pagine nella MMU",
  text:`<p>Una macchina ha uno spazio degli indirizzi a <b>32 bit</b> e pagine da <b>8 KB</b>. La tabella delle pagine è nell'hardware della MMU, con una word a 32 bit per voce. Quando parte un processo, la tabella viene copiata dalla RAM nell'hardware, una parola ogni <b>100 ns</b>.</p>
<p>Se ogni processo viene eseguito per <b>100 ms</b>, quale frazione del tempo di CPU è dedicata al caricamento delle tabelle?</p>`,
  sol:`<ol>
<li>Offset per pagine da 8 KB (2¹³) = 13 bit ⇒ numero di pagina = 32 − 13 = 19 bit ⇒ 2¹⁹ = <b>524.288 voci</b>.</li>
<li>Tempo di caricamento = 524.288 · 100 ns = 52.428.800 ns ≈ <b>52,4 ms</b>.</li>
<li>Se il quanto è 100 ms (di cui 52,4 per il caricamento): frazione = 52,4/100 ≈ <b>52%</b> del tempo sprecato!</li>
</ol>
<p><b>Morale</b>: tenere la tabella nei registri della MMU non è scalabile: per questo si tiene in RAM e la MMU usa solo il registro PTBR (al context-switch si aggiorna un solo registro).</p>` },

{ id:"es10", topic:"fs", title:"FAT: dimensionamento completo",
  text:`<p>Un disco ha blocchi da <b>1 KB</b> e un file system FAT. Gli elementi della FAT sono in corrispondenza biunivoca con i blocchi del disco; ogni elemento è lungo <b>3 byte</b> (24 bit) e indirizza un blocco.</p>
<ol><li>Qual è la massima capacità del disco (in blocchi e in byte)?</li>
<li>Quanti byte occupa la FAT?</li>
<li>Se il file <i>pippo</i> occupa i blocchi 15, 30, 16, 64, 40 (in quest'ordine), quali elementi della FAT lo descrivono e con quale contenuto?</li></ol>`,
  sol:`<ol>
<li>Indici a 3 byte = 24 bit ⇒ 2²⁴ = <b>16.777.216 blocchi</b> ⇒ capacità = 2²⁴ · 2¹⁰ byte = 2³⁴ byte = <b>16 GB</b>.</li>
<li>FAT = 2²⁴ voci · 3 byte = 3·2²⁴ = <b>50.331.648 byte = 48 MB</b>.</li>
<li>Ogni voce contiene il puntatore al blocco SUCCESSIVO del file:
<div class="tablewrap"><table><tr><th>indice FAT</th><th>contenuto</th></tr>
<tr><td>15</td><td>30</td></tr><tr><td>30</td><td>16</td></tr><tr><td>16</td><td>64</td></tr>
<tr><td>64</td><td>40</td></tr><tr><td>40</td><td>−1 (fine file)</td></tr></table></div>
La voce di directory di <i>pippo</i> contiene il primo blocco: 15.</li>
</ol>
<p><b>Metodo</b>: capacità max = 2^(bit indice) · dim_blocco; dim. FAT = n_blocchi · dim_voce; la catena si legge FAT[b] = blocco successivo, −1 = ultimo.</p>` },

{ id:"es11", topic:"fs", title:"FAT su disco: quanti blocchi occupa + accessi",
  text:`<p>Disco da <b>512 MB</b> con blocchi da <b>16 KB</b> e indici dei blocchi a <b>16 bit</b>.</p>
<ol><li>Calcolare la dimensione in byte della FAT.</li>
<li>Quanti blocchi occuperebbe la FAT se memorizzata su disco?</li>
<li>Quanti accessi alla FAT servono per trovare il blocco che contiene il byte 125383 di un file?</li></ol>`,
  sol:`<ol>
<li>Numero di blocchi = 512 MB / 16 KB = 2²⁹ / 2¹⁴ = 2¹⁵ = <b>32.768 blocchi</b>.<br>
FAT = 2¹⁵ voci · 2 byte = 2¹⁶ = <b>65.536 byte = 64 KB</b>.</li>
<li>Blocchi occupati dalla FAT = 64 KB / 16 KB = <b>4 blocchi</b>.</li>
<li>Il byte 125383 sta nel blocco ⌊125383 / 16384⌋ = <b>7</b> del file (indice 0-based ⇒ è l'8° blocco).<br>Per arrivarci dalla testa della catena servono 7 salti, cioè <b>7 accessi alla FAT</b> (dal 1° blocco si salta 7 volte).</li>
</ol>
<p><b>Metodo</b>: n_blocchi = capacità/dim_blocco; dim_FAT = n_blocchi · dim_voce; accessi = indice del blocco nel file (⌊offset/dim_blocco⌋).</p>` },

{ id:"es12", topic:"fs", title:"fsck: vettori di consistenza dei blocchi",
  text:`<p>Durante la fase di fsck che verifica la consistenza dei blocchi vengono prodotti questi vettori:</p>
<div class="tablewrap"><table>
<tr><th>indice blocco</th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td></tr>
<tr><th>vettore liberi</th><td>1</td><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>1</td></tr>
<tr><th>vettore occupati</th><td>1</td><td>2</td><td>1</td><td>1</td><td>0</td><td>0</td><td>2</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>2</td></tr>
</table></div>
<p>Quali problemi ci sono e quali azioni deve intraprendere il fsck per ripristinare uno stato consistente?</p>`,
  sol:`<p>Regola: i due vettori devono essere <b>complementari</b> e con soli valori 0/1. Analisi:</p>
<ol>
<li><b>Blocchi in ENTRAMBE le liste</b> (liberi=1 e occupati≥1): 0, 1, 2, 3, 7, 8, 15, 16, 17 ⇒ pericolosissimo: un blocco in uso potrebbe essere riassegnato. <b>Azione</b>: rimuoverli dalla lista dei liberi.</li>
<li><b>Blocchi in NESSUNA lista</b> (0 e 0): 4, 5, 9, 10, 11, 12, 13, 14 ⇒ blocchi 'persi' (spreco). <b>Azione</b>: aggiungerli alla lista dei liberi.</li>
<li><b>Blocchi con contatore 2 negli occupati</b>: 1, 6, 17 ⇒ appartengono a due file diversi. <b>Azione</b>: duplicare il blocco usando un blocco libero e assegnare la copia a uno dei due file (+ messaggio di errore: uno dei file è probabilmente inconsistente).</li>
</ol>
<p><b>Metodo</b>: per ogni blocco chiedi: è esattamente in una delle due liste, una volta sola? Le tre anomalie: nei liberi E negli occupati / in nessuna / duplicato.</p>` },

{ id:"es13", topic:"fs", title:"I-node: dimensione massima del file",
  text:`<p>File system UNIX basato su i-node con: <b>12</b> puntatori diretti, <b>1</b> puntatore a blocco indiretto singolo e <b>1</b> a blocco indiretto doppio. I numeri di blocco sono a <b>32 bit</b> e i blocchi su disco sono da <b>1 KB</b>.</p>
<p>Indicare la dimensione massima (in blocchi e in KB) di un file.</p>`,
  sol:`<ol>
<li>Puntatori per blocco = 1024 byte / 4 byte = <b>256</b>.</li>
<li>Diretti: 12 blocchi.</li>
<li>Indiretto singolo: 256 blocchi.</li>
<li>Indiretto doppio: 256 · 256 = 65.536 blocchi.</li>
<li>Totale = 12 + 256 + 65.536 = <b>65.804 blocchi</b> = 65.804 KB ≈ <b>64,26 MB</b>.</li>
</ol>
<p><b>Metodo</b>: max = (D + p + p² [+ p³ se c'è il triplo]) · dim_blocco, con p = dim_blocco / dim_puntatore. Con blocchi da 4 KB e i-node standard (10 diretti + 3 indiretti): ≈ 4 TB.</p>` },

{ id:"es14", topic:"dischi", title:"Scheduling disco: confronto completo su una coda",
  text:`<p>Coda di richieste (numero di cilindro): <b>82, 170, 43, 140, 24, 16, 190</b>. Testina alla traccia <b>50</b>, 200 tracce (0–199), direzione iniziale ascendente dove serve.</p>
<p>Calcolare sequenza e distanza percorsa con: FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK.</p>`,
  sol:`<ol>
<li><b>FCFS</b>: 50→82→170→43→140→24→16→190 = 32+88+127+97+116+8+174 = <b>642 tracce</b>.</li>
<li><b>SSTF</b>: 50→43(7)→24(19)→16(8)→82(66)→140(58)→170(30)→190(20) = <b>208 tracce</b>.</li>
<li><b>SCAN</b> (fino all'estremo fisico 199): 50→82→140→170→190→<u>199</u>→43→24→16 = (199−50)+(199−16) = 149+183 = <b>332 tracce</b>.</li>
<li><b>C-SCAN</b> (all'estremo, poi salto a 0 e ancora su): 50→…→199, 199→0, 0→16→24→43 = 149+199+43 = <b>391 tracce</b>.</li>
<li><b>LOOK</b> (inverte dopo l'ultima richiesta): 50→82→140→170→190→43→24→16 = (190−50)+(190−16) = 140+174 = <b>314 tracce</b>.</li>
<li><b>C-LOOK</b>: 50→…→190, salto a 16, 16→24→43 = 140+174+27 = <b>341 tracce</b>.</li>
</ol>
<p class="note"><b>Nota per il compito</b>: secondo le slide del corso, all'esame la testina inverte il verso dopo aver servito l'ultima richiesta in quella direzione (comportamento LOOK). Leggi sempre quale variante è richiesta!</p>` },

{ id:"es15", topic:"sostituzione", title:"Sostituzione pagine: OPT vs FIFO vs LRU (sequenza classica)",
  text:`<p>Sequenza di riferimenti alle pagine (3 frame, inizialmente vuoti):</p>
<pre>7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1</pre>
<p>Calcolare il numero di page fault con OPT, FIFO e LRU.</p>`,
  sol:`<ol>
<li><b>OPT</b> (scarta la pagina riferita più lontano nel futuro): <b>9 fault</b> (7,0,1,2,3,4,0,1,7 — i caricamenti). È il minimo teorico.</li>
<li><b>FIFO</b> (scarta la più vecchia in memoria): <b>15 fault</b>.</li>
<li><b>LRU</b> (scarta la meno recentemente usata): <b>12 fault</b>.</li>
</ol>
<p><b>Come si tabula</b> (esempio LRU): per ogni riferimento scrivi lo stato dei 3 frame; se la pagina c'è → hit (aggiorna solo la 'recenza'); se manca → fault e scarti: OPT guarda AVANTI nella sequenza, LRU guarda INDIETRO (l'uso più remoto), FIFO guarda l'ordine di CARICAMENTO (un hit non ringiovanisce la pagina!).</p>
<p>Errore classico: in FIFO un hit NON sposta la pagina in coda; in LRU sì (diventa la più recente). Usa il generatore di esercizi per allenarti su sequenze nuove con la tabella completa.</p>` },

{ id:"es16", topic:"sched", title:"Scheduling CPU: FCFS, SJF, SRTN, RR sugli stessi processi",
  text:`<p>Processi (tempo di arrivo, durata): P1(0,6), P2(1,4), P3(3,2), P4(5,3).</p>
<p>Calcolare tempo di attesa medio e turnaround medio con: 1) FCFS, 2) SJF non-preemptive, 3) SRTN, 4) Round-Robin con quanto = 2 ms.</p>`,
  sol:`<ol>
<li><b>FCFS</b> (ordine di arrivo P1,P2,P3,P4): fine a 6,10,12,15.<br>Attese: P1: 0; P2: 6−1=5; P3: 10−3=7; P4: 12−5=7 → media = 19/4 = <b>4,75</b>.<br>Turnaround: 6,9,9,10 → media = 34/4 = <b>8,5</b>.</li>
<li><b>SJF non-preemptive</b>: a t=0 c'è solo P1 → P1 (0–6). A t=6 pronti P2(4),P3(2),P4(3) → P3 (6–8), P4 (8–11), P2 (11–15).<br>Attese: P1: 0; P3: 6−3=3; P4: 8−5=3; P2: 11−1=10 → media = 16/4 = <b>4</b>.</li>
<li><b>SRTN</b>: t=0 P1 parte (residuo 6). t=1 arriva P2 con durata 4 &lt; residuo 5 di P1 → prelazione, P2 esegue. t=3 arriva P3 con durata 2: P2 ha residuo 2, NON minore ⇒ P2 continua. t=5 P2 finisce e arriva P4; pronti: P1(residuo 5), P3(2), P4(3) → P3 (5–7), P4 (7–10), P1 (10–15).<br>Completamenti: P1=15, P2=5, P3=7, P4=10.<br>Attese (= fine − arrivo − durata): P1: 15−0−6=9; P2: 5−1−4=0; P3: 7−3−2=2; P4: 10−5−3=2 → media = 13/4 = <b>3,25</b>.</li>
<li><b>RR q=2</b>: sequenza: P1(0–2), P2(2–4), P1(4–6), P3(6–8), P2(8–10), P4(10–12), P1(12–14), P4(14–15).<br>Fine: P1=14, P2=10, P3=8, P4=15.<br>Attese = fine − arrivo − durata: P1: 14−0−6=8; P2: 10−1−4=5; P3: 8−3−2=3; P4: 15−5−3=7 → media = 23/4 = <b>5,75</b>.</li>
</ol>
<p><b>Metodo</b>: disegna sempre il diagramma di Gantt; attesa = completamento − arrivo − durata; turnaround = completamento − arrivo. In SRTN confronta la durata del nuovo arrivato col RESIDUO del processo in esecuzione.</p>` },

{ id:"es17", topic:"dischi", title:"RAID 5: ricostruzione con XOR e capacità",
  text:`<p>Un sistema RAID 5 è composto da <b>5 dischi da 2 TB</b> ciascuno. Su una certa 'riga' gli stripe sono:</p>
<pre>Disco 1: 10110101
Disco 2: 01101001
Disco 3: (GUASTO)
Disco 4: 11100010
Parità : 01011100</pre>
<ol><li>Qual è la capacità utile del sistema?</li><li>Ricostruire lo stripe del disco 3.</li></ol>`,
  sol:`<ol>
<li>Capacità utile RAID 5 = (n−1)·S = (5−1)·2 TB = <b>8 TB</b> (l'equivalente di un disco è occupato dalle parità, distribuite).</li>
<li>D3 = D1 ⊕ D2 ⊕ D4 ⊕ P (XOR bit a bit, colonna per colonna):<br>
<pre>  10110101
⊕ 01101001   → 11011100
⊕ 11100010   → 00111110
⊕ 01011100   → 01100010</pre>
<b>D3 = 01100010</b>.<br>Verifica: D1⊕D2⊕D3⊕D4 = 01011100 = P ✓</li>
</ol>
<p><b>Metodo</b>: la parità è lo XOR di tutti gli stripe della riga; lo stripe perso è lo XOR di tutti i superstiti (parità inclusa). Conta i bit 1 per colonna: se il totale (incluso il bit da trovare) dev'essere pari, il bit mancante è la parità dei presenti.</p>` }
];
