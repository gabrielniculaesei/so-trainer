/* BANCA DOMANDE 1: intro/struttura/processi */
window.TOPICS = {
  intro:        "Introduzione e architettura",
  struttura:    "Struttura SO e macchine virtuali",
  processi:     "Processi e thread",
  sync:         "Sincronizzazione e mutua esclusione",
  sched:        "Scheduling della CPU",
  memoria:      "Gestione memoria e paginazione",
  sostituzione: "Sostituzione pagine e working set",
  fs:           "File system",
  dischi:       "Dischi, RAID e SSD"
};

window.MCQ = [
{ id: "in01", topic: "intro",
  q: "Quale tra le seguenti <b>NON</b> è un'operazione tipicamente svolta dal sistema operativo?",
  options: [
    "La gestione e la schedulazione dei processi",
    "La traduzione dei programmi sorgente in linguaggio macchina",
    "La gestione della memoria centrale e della memoria virtuale",
    "La gestione delle operazioni di I/O verso i dispositivi",
    "L'applicazione dei meccanismi di protezione tra processi"
  ],
  correct: 1,
  expl: "Il SO gestisce risorse (CPU, memoria, I/O, file system) e crea astrazioni; la compilazione è compito di un programma applicativo (il compilatore), non del sistema operativo." },

{ id: "in02", topic: "intro",
  q: "Con riferimento alle due modalità di esecuzione della CPU, individuare l'affermazione <b>falsa</b>.",
  options: [
    "In modalità utente è eseguibile soltanto un sottoinsieme limitato del set di istruzioni",
    "In modalità kernel possono essere eseguite le istruzioni che gestiscono l'I/O e gli interrupt",
    "Il passaggio da modalità utente a modalità kernel avviene tramite l'istruzione TRAP",
    "Un processo utente può impostare da sé il flag di modalità nella PSW",
    "Le routine di gestione degli interrupt vengono eseguite in modalità kernel"
  ],
  correct: 3,
  expl: "Il flag di modalità nella PSW è modificabile solo in modalità kernel: se un processo utente potesse cambiarlo da solo, la protezione non avrebbe senso. Si passa in modalità kernel solo tramite TRAP/interrupt." },

{ id: "in03", topic: "intro",
  q: "Che cos'è la Program Status Word (PSW)?",
  options: [
    "Il registro che contiene l'indirizzo della prossima istruzione da eseguire",
    "Il registro con i bit di stato (flag) della CPU, tra cui la modalità di esecuzione",
    "Il registro che contiene l'indirizzo della cima dello stack della modalità attuale",
    "Il registro in cui viene salvata la parola di stato dell'ultimo interrupt gestito",
    "Il registro che contiene la chiave di protezione della porzione di RAM in uso"
  ],
  correct: 1,
  expl: "La PSW memorizza i flag di stato della CPU (esito dei confronti, modalità utente/kernel, ecc.). L'indirizzo della prossima istruzione è nel Program Counter; la cima dello stack è nello Stack Pointer; la chiave nella PSW esisteva solo nel metodo lock & key di OS/360." },

{ id: "in04", topic: "intro",
  q: "Una CPU dispone di una pipeline a 3 stadi in cui ogni stadio impiega 10 ns per completare il proprio lavoro. Qual è, a regime, il throughput della CPU?",
  options: [
    "1 istruzione ogni 30 ns, cioè circa 33 milioni di istruzioni al secondo",
    "1 istruzione ogni 10 ns, cioè 100 milioni di istruzioni al secondo",
    "3 istruzioni ogni 10 ns, cioè 300 milioni di istruzioni al secondo",
    "1 istruzione ogni 3 ns, cioè circa 333 milioni di istruzioni al secondo",
    "3 istruzioni ogni 30 ns, cioè 10 milioni di istruzioni al secondo"
  ],
  correct: 1,
  expl: "A regime la pipeline completa un'istruzione ad ogni 'passo' di stadio: ogni 10 ns esce un'istruzione ⇒ 1/(10·10⁻⁹) = 10⁸ = 100 milioni di istruzioni/s. I 30 ns sono la latenza della singola istruzione, non il throughput." },

{ id: "in05", topic: "intro",
  q: "Con riferimento alle CPU superscalari, individuare l'affermazione <b>corretta</b>.",
  options: [
    "Dispongono di più pipeline e le istruzioni possono completare fuori ordine",
    "Dispongono di un'unica pipeline più profonda, che elimina i tempi morti tra gli stadi",
    "Eseguono più istruzioni per ciclo duplicando la sola ALU, con un unico stadio di fetch",
    "Dedicano una pipeline al codice kernel e una al codice utente, per motivi di protezione",
    "Sono completamente trasparenti al sistema operativo, che non deve mai tenerne conto"
  ],
  correct: 0,
  expl: "Una CPU superscalare ha più pipeline e può eseguire più istruzioni contemporaneamente; l'esecuzione può avvenire fuori ordine (gestita dall'hardware) e questi meccanismi NON sono del tutto trasparenti al SO." },

{ id: "in06", topic: "intro",
  q: "Che cosa accade quando un processo utente effettua una chiamata di sistema (syscall)?",
  options: [
    "Il processo salta alla routine kernel, che viene eseguita in modalità utente per sicurezza",
    "Una TRAP commuta in modalità kernel; salvati i registri, si esegue la routine e si torna in modalità utente",
    "Il kernel crea un processo di sistema che esegue l'istruzione richiesta e restituisce l'esito via IPC",
    "La CPU disabilita gli interrupt, esegue l'istruzione privilegiata in modalità utente e li riabilita",
    "Il codice della routine viene copiato nello spazio del processo, eseguito e poi rimosso"
  ],
  correct: 1,
  expl: "La TRAP cambia modalità da utente a kernel; alla TRAP si passa un indice che identifica la routine kernel in un'apposita tabella; i registri sono salvati (nello stack kernel), la routine eseguita, poi si torna in modalità utente." },

{ id: "in07", topic: "intro",
  q: "Con riferimento alla gerarchia delle memorie, individuare l'affermazione <b>falsa</b>.",
  options: [
    "I registri sono la memoria più veloce e si trovano sullo stesso chip della CPU",
    "La cache è più veloce della RAM ma meno capiente",
    "All'aumentare della capienza di una memoria tende a diminuire la sua velocità",
    "La cache L3 è più piccola e più veloce della cache L1",
    "La CPU non può accedere direttamente ai dati presenti sulle memorie di massa"
  ],
  correct: 3,
  expl: "È il contrario: salendo di livello (L1 → L2 → L3) la cache diventa più capiente ma più lenta. L1 è la più piccola e veloce." },

{ id: "in08", topic: "intro",
  q: "Qual è il ruolo del <b>driver</b> di un dispositivo di I/O?",
  options: [
    "È il componente hardware che collega il controller del dispositivo al bus di sistema",
    "È il software che traduce le richieste standard del SO nei comandi specifici del controller",
    "È il registro del controller (porta di I/O) su cui la CPU scrive con istruzioni IN/OUT",
    "È il chip che trasferisce i dati dal buffer del controller alla RAM senza usare la CPU",
    "È la routine che gestisce l'interrupt generato dal dispositivo a fine operazione"
  ],
  correct: 1,
  expl: "Il driver 'traduce' le richieste standard del SO nei comandi specifici compresi dal controller: è l'interfaccia software tra SO e controller (come un interprete tra due lingue). Le porte di I/O sono i registri del controller; il chip che accede direttamente alla RAM è il DMA." },

{ id: "in09", topic: "intro",
  q: "Con riferimento ai tre metodi di gestione dell'I/O (busy waiting, interrupt, DMA), individuare l'affermazione <b>falsa</b>.",
  options: [
    "Nel busy waiting la CPU legge continuamente la porta di I/O finché l'operazione non è completata (polling)",
    "Con gli interrupt la CPU viene avvisata dal controller e trasferisce i dati dal buffer alla RAM",
    "Con il DMA il trasferimento dei dati in memoria avviene senza il coinvolgimento continuo della CPU",
    "Con il DMA non viene generato alcun interrupt, quindi la CPU non viene mai coinvolta",
    "Il busy waiting comporta uno spreco delle risorse della CPU"
  ],
  correct: 3,
  expl: "Anche con il DMA viene generato un interrupt al completamento dell'operazione: la CPU deve comunque gestirlo, ma impiega molto meno tempo perché i dati sono già stati trasferiti in RAM dal chip DMA." },

{ id: "in10", topic: "intro",
  q: "Che cos'è il multithreading (hyperthreading) a livello di CPU?",
  options: [
    "La presenza di due CPU fisiche complete sullo stesso chip, con esecuzione realmente parallela",
    "La CPU mantiene lo stato di due thread e li alterna: due CPU virtuali, nessun vero parallelismo",
    "Una tecnica software con cui il SO alterna due processi ad ogni istruzione macchina eseguita",
    "La duplicazione della sola ALU per eseguire due calcoli aritmetici nello stesso ciclo di clock",
    "Un sinonimo di multiprogrammazione: la presenza di più processi caricati in memoria"
  ],
  correct: 1,
  expl: "Con il multithreading la CPU tiene lo stato di due thread e commuta velocemente tra essi: il SO vede due CPU 'virtuali', ma non c'è vero parallelismo (che invece c'è con più core/multiprocessori)." },

{ id: "in11", topic: "intro",
  q: "Quali sono i principali vantaggi di un sistema multiprocessore rispetto a più calcolatori separati?",
  options: [
    "Maggiore throughput, economia di scala e maggiore affidabilità grazie alle risorse condivise",
    "Tempo di esecuzione esattamente N volte inferiore con N CPU, mancando contese sulla memoria",
    "Eliminazione delle race condition, poiché ogni CPU lavora su una copia privata dei dati",
    "Possibilità di eseguire il kernel su una CPU dedicata, evitando la modalità kernel sulle altre",
    "Riduzione dei context-switch, perché ogni processo resta legato alla stessa CPU per sempre"
  ],
  correct: 0,
  expl: "I vantaggi sono throughput, economia di scala e affidabilità. Con N CPU NON si ottiene un tempo esattamente N volte minore: la memoria condivisa crea contese sugli stessi dati (e le race condition restano, anzi peggiorano)." },

{ id: "in12", topic: "intro",
  q: "Un interrupt hardware arriva mentre la CPU sta eseguendo un processo utente. Individuare l'affermazione <b>falsa</b>.",
  options: [
    "La routine di gestione dell'interrupt viene eseguita in modalità kernel",
    "PC e PSW del processo interrotto vengono salvati",
    "La routine di gestione viene individuata tramite il vettore degli interrupt",
    "Il sistema di notifica degli interrupt può essere temporaneamente disattivato durante la gestione",
    "La routine viene eseguita solo quando il processo corrente rilascia volontariamente la CPU"
  ],
  correct: 4,
  expl: "Le routine di gestione degli interrupt hanno priorità su tutto (processi utente, syscall e perfino altri interrupt): l'esecuzione del processo viene sospesa immediatamente, senza attendere alcun rilascio volontario." },

{ id: "in13", topic: "intro",
  q: "Nei sistemi operativi <b>real-time</b>:",
  options: [
    "l'obiettivo primario è massimizzare il throughput medio dei processi batch",
    "le azioni vanno completate entro scadenze prefissate, sacrificando la multiprogrammazione",
    "lo scheduler deve essere il più imprevedibile possibile per distribuire equamente la CPU",
    "i processi in esecuzione sono molti e non noti a priori agli sviluppatori del sistema",
    "la prelazione è il meccanismo fondamentale attorno a cui è costruito l'intero sistema"
  ],
  correct: 1,
  expl: "Nei sistemi real-time (es. sistemi industriali) conta la tempestività: pochi processi noti a priori, scheduling prevedibile, e ogni processo può usare la CPU al massimo entro limiti prefissati — non sono sistemi preemptive." },

{ id: "in14", topic: "intro",
  q: "Lo <b>stack</b> di un processo:",
  options: [
    "contiene i record di attivazione delle procedure ed è gestito in modalità LIFO",
    "contiene le istruzioni del programma in esecuzione, lette in sequenza dal Program Counter",
    "è l'area da cui vengono allocati dinamicamente gli oggetti creati dal programmatore",
    "ha dimensione fissata alla compilazione e non può crescere durante l'esecuzione",
    "è condiviso tra tutti i thread di uno stesso processo, come i file aperti"
  ],
  correct: 0,
  expl: "Lo stack memorizza i frame (record) di attivazione delle procedure, creati alla CALL e distrutti al RETURN, con politica LIFO; cresce e si riduce dinamicamente (fisicamente è 'capovolto' in memoria). Gli oggetti dinamici stanno nell'heap; ogni thread ha il PROPRIO stack." },

{ id: "st01", topic: "struttura",
  q: "Con riferimento alla struttura <b>monolitica</b> di un sistema operativo, individuare l'affermazione <b>corretta</b>.",
  options: [
    "Tutto il kernel è un unico programma binario in cui ogni procedura può richiamare le altre",
    "Ogni componente del SO gira come processo separato in modalità utente e comunica a messaggi",
    "Il kernel contiene solo scheduler, gestione memoria, IPC e gestione degli interrupt",
    "I componenti sono moduli caricabili a runtime, eseguiti in modalità kernel su richiesta",
    "Le procedure sono organizzate in strati e ognuna può chiamare solo quelle dello strato inferiore"
  ],
  correct: 0,
  expl: "Nella struttura monolitica tutto il kernel è un unico blocco eseguibile in modalità kernel, con procedure che possono chiamarsi liberamente. Le alternative descrivono microkernel (B, C), struttura a moduli (D) e struttura a livelli (E)." },

{ id: "st02", topic: "struttura",
  q: "Con riferimento alla struttura a <b>microkernel</b>, individuare l'affermazione <b>falsa</b>.",
  options: [
    "Nel kernel restano solo i componenti indispensabili (scheduling, gestione memoria, IPC, interrupt)",
    "Componenti come file system e driver girano come processi in modalità utente",
    "La comunicazione tra componenti avviene tramite messaggi recapitati dal microkernel",
    "Un driver instabile può facilmente corrompere le strutture dati del microkernel",
    "Un processo 'reincarnation' può rilevare componenti in errore e ricrearli"
  ],
  correct: 3,
  expl: "È esattamente il contrario: nei microkernel i driver sono isolati in processi utente, quindi un driver instabile NON può danneggiare il kernel. Lo svantaggio è l'overhead del sistema a messaggi." },

{ id: "st03", topic: "struttura",
  q: "Qual è la differenza principale tra struttura a <b>moduli</b> (es. Linux) e struttura a <b>microkernel</b>?",
  options: [
    "I moduli girano tutti in modalità kernel e comunicano con normali chiamate anziché con messaggi",
    "I moduli girano in modalità utente ma condividono lo spazio di indirizzamento del kernel",
    "Solo il microkernel consente di caricare componenti a sistema avviato, i moduli sono fissi",
    "La struttura a moduli richiede il reincarnation server per garantire la stabilità dei driver",
    "Il sistema a messaggi dei moduli è più efficiente delle syscall usate dal microkernel"
  ],
  correct: 0,
  expl: "I moduli sono componenti separati come nel microkernel, ma vengono eseguiti tutti in modalità kernel: si evita l'overhead dei messaggi (si usano normali chiamate), al prezzo di minore robustezza. I moduli possono anche essere caricati a runtime (es. moduli I/O)." },

{ id: "st04", topic: "struttura",
  q: "Nella struttura a <b>livelli</b> (strati), individuare l'affermazione <b>falsa</b>.",
  options: [
    "Ogni livello fornisce servizi ai livelli superiori tramite un'interfaccia",
    "Salendo di livello cresce il livello di astrazione",
    "Le procedure di un livello possono chiamare quelle di qualsiasi altro livello",
    "Le chiamate nidificate tra livelli possono causare problemi di overhead",
    "Il debug è facilitato perché un bug è circoscritto allo strato che lo contiene"
  ],
  correct: 2,
  expl: "Nella struttura a livelli ogni strato può usare solo i servizi del livello immediatamente inferiore: è proprio questo vincolo a distinguerla dalla struttura monolitica (e a causare potenziale overhead per chiamate nidificate)." },

{ id: "st05", topic: "struttura",
  q: "Che differenza c'è tra hypervisor di <b>tipo 1</b> e di <b>tipo 2</b>?",
  options: [
    "Il tipo 1 gira sull'hardware e fa da OS per le VM; il tipo 2 è un processo sull'OS principale",
    "Il tipo 1 è un processo utente dell'OS ospitante; il tipo 2 gira direttamente sull'hardware fisico",
    "Il tipo 1 esegue solo VM con architettura diversa (emulazione); il tipo 2 solo con la stessa architettura",
    "Il tipo 2 è riservato ai server professionali; il tipo 1 è pensato per i PC desktop",
    "Il tipo 1 può ospitare una sola VM alla volta; il tipo 2 non ha limiti sul numero di VM"
  ],
  correct: 0,
  expl: "L'hypervisor di tipo 1 (bare metal) gira direttamente sull'hardware e fa da 'OS' per le VM (uso professionale); quello di tipo 2 (es. VirtualBox) è un normale processo che gira sull'OS ospitante e si appoggia ad esso per le operazioni." },

{ id: "st06", topic: "struttura",
  q: "Qual è la differenza tra <b>simulazione (emulazione)</b> e <b>virtualizzazione</b>?",
  options: [
    "L'emulazione interpreta le istruzioni di un'architettura diversa; la virtualizzazione esegue i processi direttamente sulla CPU fisica",
    "La virtualizzazione interpreta le istruzioni una ad una; l'emulazione le esegue direttamente sull'hardware fisico della macchina",
    "L'emulazione richiede una macchina meno potente di quella emulata, perché il lavoro è svolto via software",
    "La virtualizzazione è possibile solo se l'OS ospite viene modificato per sapere di essere virtualizzato",
    "Emulazione e virtualizzazione differiscono soltanto per il tipo di hypervisor utilizzato"
  ],
  correct: 0,
  expl: "L'emulatore 'traduce' le istruzioni di un'architettura diversa e ne simula l'effetto (molto costoso: serve una macchina PIÙ potente, come per gli emulatori di console); la virtualizzazione esegue i processi direttamente sulla CPU fisica. L'OS ospite consapevole è la paravirtualizzazione." },

{ id: "st07", topic: "struttura",
  q: "Con riferimento al modello a <b>container</b> (es. Docker), individuare l'affermazione <b>corretta</b>.",
  options: [
    "Ogni container include un proprio kernel virtuale minimale, avviato dall'hypervisor",
    "I servizi nei container si appoggiano direttamente sull'OS principale, senza OS ospite",
    "I container offrono un isolamento superiore alle VM perché emulano anche l'hardware",
    "Un container può essere eseguito soltanto sopra un hypervisor di tipo 1",
    "Il modello a container aumenta l'overhead rispetto alle VM in cambio di più sicurezza"
  ],
  correct: 1,
  expl: "Nel container NON gira un OS virtuale: i servizi usano direttamente il kernel dell'OS principale. È questo il motivo principale della riduzione di overhead rispetto alle VM, mantenendo comunque l'isolamento." },

{ id: "st08", topic: "struttura",
  q: "Che cos'è la <b>paravirtualizzazione</b>?",
  options: [
    "Una virtualizzazione in cui l'OS ospite sa di essere virtualizzato e collabora con l'ospitante",
    "Una virtualizzazione parziale in cui solo la CPU è virtualizzata mentre l'I/O viene emulato",
    "L'esecuzione di una VM con architettura hardware diversa tramite traduzione delle istruzioni",
    "La condivisione del kernel dell'OS principale tra più ambienti isolati tra loro",
    "Una tecnica per eseguire l'hypervisor di tipo 2 direttamente sull'hardware fisico"
  ],
  correct: 0,
  expl: "Nella paravirtualizzazione l'OS virtuale è 'conscio' di essere virtualizzato (es. XEN con kernel Linux modificati): i due OS collaborano e l'efficienza aumenta. La C è l'emulazione, la D è il modello a container." },

{ id: "st09", topic: "struttura",
  q: "Perché nelle macchine virtuali le operazioni di I/O sono tipicamente meno efficienti?",
  options: [
    "Perché i dischi virtuali usano un file system incompatibile con quello della macchina fisica",
    "Ogni syscall passa per l'hypervisor e la VM non dialoga direttamente coi dispositivi",
    "Perché il DMA non può essere utilizzato dall'OS ospitante quando è attiva una VM",
    "Perché l'OS ospite disattiva la cache del disco per garantire la coerenza con l'host",
    "Perché i processi kernel della VM girano a frequenza di clock dimezzata"
  ],
  correct: 1,
  expl: "Tutti i processi della VM (anche quelli 'kernel' virtuali) girano in modalità utente reale: le syscall passano per l'hypervisor che simula la modalità kernel virtuale, e la VM non accede direttamente all'hardware: da qui lo spreco di risorse soprattutto sull'I/O." },

{ id: "pr01", topic: "processi",
  q: "Qual è la definizione corretta di <b>processo</b>?",
  options: [
    "Un programma eseguibile memorizzato su disco insieme ai suoi metadati",
    "Un'istanza di esecuzione di un programma, con il proprio spazio degli indirizzi",
    "L'insieme delle istruzioni macchina generate dal compilatore per un dato sorgente",
    "Un flusso di esecuzione che condivide memoria e file aperti con altri flussi",
    "La porzione del kernel che gestisce le risorse assegnate a un'applicazione"
  ],
  correct: 1,
  expl: "Il processo è un'istanza di esecuzione di un programma: lo stesso programma lanciato 3 volte genera 3 processi distinti. L'opzione D descrive un thread." },

{ id: "pr02", topic: "processi",
  q: "Che cosa contiene il <b>PCB</b> (Process Control Block)?",
  options: [
    "Il codice eseguibile e i dati statici del processo",
    "Registri salvati, stato, file aperti, parentela e le altre informazioni del processo",
    "La sola tabella delle pagine del processo, condivisa con i suoi processi figli",
    "L'elenco dei semafori sui quali il processo è autorizzato a fare down e up",
    "Il contenuto dello stack utente e dello stack kernel del processo"
  ],
  correct: 1,
  expl: "Il PCB è il record della tabella dei processi associato a un singolo processo: contiene registri salvati, stato, file aperti, parentela, memory limits, ecc. Quando il processo muore, il PCB si svuota e può essere riassegnato." },

{ id: "pr03", topic: "processi",
  q: "Con riferimento alla chiamata <b>fork()</b> nei sistemi UNIX, individuare l'affermazione <b>falsa</b>.",
  options: [
    "Crea un clone del processo chiamante con un ID diverso",
    "Padre e figlio possono distinguersi tramite il valore restituito dalla chiamata",
    "La exec() azzera lo stato del processo clone per fargli eseguire un altro programma",
    "Il processo figlio condivide lo stesso PCB del padre fino alla prima exec()",
    "Dopo la fork i due processi possono comunicare soltanto tramite IPC"
  ],
  correct: 3,
  expl: "Il figlio è un processo a tutti gli effetti: ha un proprio PCB e un proprio ID fin dalla creazione. Il codice e i dati sono copie identiche (ottimizzate con copy-on-write), ma le strutture del SO sono distinte da subito." },

{ id: "pr04", topic: "processi",
  q: "Un processo può terminare per diverse cause. Quale tra le seguenti <b>NON</b> è una causa di terminazione?",
  options: [
    "Uscita normale volontaria (exit con codice 0)",
    "Uscita su errore prevista dal programma (exit con codice diverso da 0)",
    "Errore critico involontario, come una divisione per zero",
    "Richiesta di terminazione da parte di un altro processo (kill)",
    "Il passaggio dallo stato pronto allo stato in esecuzione"
  ],
  correct: 4,
  expl: "La transizione ready → running è una normale fase della vita del processo (viene schedulato), non una causa di terminazione. Le altre quattro sono le cause classiche: volontarie (exit normale/su errore) e involontarie (errore critico, kill)." },

{ id: "pr05", topic: "processi",
  q: "Quale tra le seguenti transizioni di stato di un processo <b>NON</b> è possibile?",
  options: [
    "In esecuzione (running) → bloccato (blocked)",
    "In esecuzione (running) → pronto (ready)",
    "Pronto (ready) → in esecuzione (running)",
    "Bloccato (blocked) → pronto (ready)",
    "Pronto (ready) → bloccato (blocked)"
  ],
  correct: 4,
  expl: "Un processo pronto non sta eseguendo nulla, quindi non può effettuare chiamate bloccanti: la transizione ready → blocked non esiste. Un processo si blocca solo mentre è in esecuzione. (Domanda apparsa all'esame!)" },

{ id: "pr06", topic: "processi",
  q: "Quale transizione di stato avviene quando scatta la <b>prelazione</b> (fine del quanto di tempo)?",
  options: [
    "Running → blocked",
    "Running → ready",
    "Ready → blocked",
    "Blocked → running",
    "Running → terminated"
  ],
  correct: 1,
  expl: "Con la prelazione il processo in esecuzione viene interrotto e rimesso nella coda dei processi pronti: transizione running → ready. Non è bloccato (non aspetta alcun evento), è semplicemente in attesa di essere rischedulato." },

{ id: "pr07", topic: "processi",
  q: "Un processo effettua una richiesta di I/O su disco. Cosa succede tipicamente?",
  options: [
    "Passa in stato blocked ed entra nella coda del dispositivo; al completamento torna pronto",
    "Passa in stato ready e ritenta periodicamente l'accesso al dispositivo fino all'esito",
    "Resta in stato running con priorità abbassata finché il controller non risponde",
    "Viene migrato sulla coda di un altro core per non rallentare la CPU corrente",
    "Il suo PCB viene svuotato e ricreato al termine dell'operazione di I/O"
  ],
  correct: 0,
  expl: "Le operazioni di I/O sono bloccanti: il processo entra in stato blocked e viene accodato nella coda del dispositivo (una per ogni controller); la CPU viene assegnata a un altro processo pronto. Al completamento, torna in stato ready." },

{ id: "pr08", topic: "processi",
  q: "Quando un processo padre termina, cosa accade tipicamente ai suoi figli nei sistemi UNIX/Linux?",
  options: [
    "Vengono terminati a cascata insieme al padre, in ogni caso",
    "Vengono adottati da INIT (o da systemd nelle distribuzioni moderne)",
    "Vengono adottati dal processo fratello con l'identificativo più basso",
    "Restano senza padre: il campo di parentela nel loro PCB viene azzerato",
    "Vengono sospesi e spostati su disco fino al riavvio del sistema"
  ],
  correct: 1,
  expl: "I processi orfani vengono adottati da INIT (o systemd, radice dei processi utente nelle distribuzioni moderne), che diventa il loro nuovo padre: l'albero dei processi resta connesso." },

{ id: "pr09", topic: "processi",
  q: "Qual è la differenza fondamentale tra <b>processo</b> e <b>thread</b>?",
  options: [
    "Il processo raggruppa le risorse; il thread è un flusso di esecuzione che le condivide con i fratelli",
    "Il thread possiede uno spazio di indirizzamento privato; il processo lo condivide con gli altri processi",
    "Il processo è schedulabile dallo scheduler; il thread viene eseguito solo nei tempi morti del processo",
    "Il thread è l'istanza di esecuzione di un programma; il processo è il file eseguibile su disco",
    "Il processo può bloccarsi su I/O; il thread per definizione non esegue mai chiamate bloccanti"
  ],
  correct: 0,
  expl: "Il processo 'contiene' le risorse (spazio di indirizzamento, file aperti…); i thread sono i flussi di esecuzione che le condividono. Ogni thread ha però il SUO stack, i SUOI registri, il SUO program counter e il SUO stato." },

{ id: "pr10", topic: "processi",
  q: "Quali risorse sono <b>condivise</b> tra i thread di uno stesso processo?",
  options: [
    "Stack e registri della CPU",
    "Program counter e stato di esecuzione",
    "Spazio di indirizzamento, strutture dati, codice e file aperti",
    "Solo il PCB, mentre la memoria resta privata di ogni thread",
    "Nessuna risorsa: i thread sono isolati come i processi"
  ],
  correct: 2,
  expl: "I thread condividono le risorse del processo (memoria, codice, file aperti). Sono invece privati di ciascun thread: stack, registri, PC e stato." },

{ id: "pr11", topic: "processi",
  q: "Con riferimento alle operazioni sui thread, individuare l'abbinamento <b>errato</b>.",
  options: [
    "thread_create: un thread ne crea un altro all'interno dello stesso processo",
    "thread_exit: il thread chiamante termina la propria esecuzione",
    "thread_join: un thread si blocca finché un altro thread non rilascia il mutex",
    "thread_yield: un thread rilascia volontariamente la CPU a favore di un fratello"
  ],
  correct: 2,
  expl: "La thread_join è analoga alla wait() dei processi: blocca il chiamante fino alla TERMINAZIONE del thread indicato — non c'entra con i mutex. Il processo termina quando tutti i suoi thread terminano." },

{ id: "pr12", topic: "processi",
  q: "Nel modello di thread <b>a livello utente</b> (1 a molti), individuare l'affermazione <b>falsa</b>.",
  options: [
    "I thread sono gestiti da un runtime system dentro il processo, non dal kernel",
    "Il context-switch tra thread fratelli non richiede una TRAP ed è molto veloce",
    "Se un thread effettua una chiamata bloccante, l'OS blocca l'intero processo",
    "Lo scheduling dei thread può essere personalizzato dal programmatore",
    "I thread possono girare in parallelo su core diversi, sfruttando il multicore"
  ],
  correct: 4,
  expl: "Con thread a livello utente l'OS vede un solo processo e gli assegna una sola CPU/core: i thread NON possono girare in parallelo su core diversi. È uno dei principali limiti del modello, insieme al blocco dell'intero processo su chiamate bloccanti e page fault." },

{ id: "pr13", topic: "processi",
  q: "Nel modello di thread <b>a livello kernel</b> (1 a 1), individuare l'affermazione <b>corretta</b>.",
  options: [
    "Il context-switch tra thread kernel fratelli non richiede la TRAP",
    "La tabella dei thread risiede nel kernel e il context-switch richiede una TRAP",
    "Una chiamata bloccante di un thread blocca automaticamente tutti i suoi fratelli",
    "I thread kernel di uno stesso processo non possono girare su core diversi",
    "Creare un thread kernel costa quanto creare un processo, per la copia della memoria"
  ],
  correct: 1,
  expl: "Con thread kernel l'OS gestisce direttamente i thread (tabella nel kernel): serve la TRAP per il context-switch, ma un thread bloccato NON blocca i fratelli e il multicore è sfruttabile. Creare/distruggere thread costa 10-100 volte meno che con i processi (e col modello a worker si risparmia ulteriormente)." },

{ id: "pr14", topic: "processi",
  q: "Perché con i thread a livello utente un <b>page fault</b> è problematico?",
  options: [
    "Perché il runtime system non può usare la MMU e i suoi thread non supportano la paginazione",
    "Perché il blocco è asincrono: l'OS blocca l'intero processo e non è prevenibile con una select",
    "Perché il page fault azzera lo stack del thread che lo ha causato, perdendone lo stato",
    "Perché il fault costringe il runtime system a ricostruire da zero la tabella dei thread",
    "Perché durante il fault il runtime system perde i riferimenti ai thread in stato pronto"
  ],
  correct: 1,
  expl: "Con una chiamata di I/O il thread può controllare prima (select) se sarà bloccante e cedere la CPU a un fratello; il page fault invece arriva all'improvviso (il thread non sa di averlo causato) e l'OS blocca l'intero processo, inclusi tutti gli altri thread." },

{ id: "pr15", topic: "processi",
  q: "Ordinare i context-switch dal più veloce al più lento.",
  options: [
    "Thread utente fratelli → thread kernel fratelli → processo-processo",
    "Processo-processo → thread kernel fratelli → thread utente fratelli",
    "Thread kernel fratelli → thread utente fratelli → processo-processo",
    "Thread utente fratelli → processo-processo → thread kernel fratelli",
    "Thread kernel fratelli → processo-processo → thread utente fratelli"
  ],
  correct: 0,
  expl: "Thread utente fratelli: nessuna TRAP (gestito dal runtime). Thread kernel fratelli: serve la TRAP ma non si riprogramma la MMU (stessa memoria). Processo-processo: TRAP + cambio completo di spazio di memoria (riprogrammazione MMU): il più costoso." },

{ id: "pr16", topic: "processi",
  q: "Nel modello ibrido <b>molti a molti</b>:",
  options: [
    "più thread utente possono condividere un singolo thread kernel, a scelta del programmatore",
    "ogni thread utente riceve obbligatoriamente un thread kernel dedicato dal sistema",
    "tutti i thread utente del sistema condividono un unico thread kernel globale",
    "il kernel decide autonomamente il mapping e il programmatore non può influenzarlo",
    "i thread kernel vengono creati solo quando tutti i thread utente risultano bloccati"
  ],
  correct: 0,
  expl: "Il modello M:N combina i pregi dei due approcci: si sceglie quali task raggruppare su un singolo thread kernel e quali (es. la GUI, che non deve mai freezarsi) meritano un thread kernel dedicato." },

{ id: "pr17", topic: "processi",
  q: "Perché il modello a <b>worker</b> (pool di thread) è vantaggioso?",
  options: [
    "Evita la sincronizzazione, perché ogni worker lavora esclusivamente su dati privati",
    "Thread creati in numero fisso all'avvio e riciclati: niente costi di creazione ripetuti",
    "Consente di superare il limite massimo di thread per processo imposto dal kernel",
    "Garantisce che ogni richiesta sia servita da un thread appena creato e quindi privo di stato residuo",
    "Permette al dispatcher di servire le richieste senza mai effettuare chiamate bloccanti"
  ],
  correct: 1,
  expl: "I worker vengono creati una volta sola e tenuti in idle: quando servono vengono risvegliati e al termine tornano in idle. Si evita di pagare ripetutamente il costo di creazione/distruzione dei thread (che, pur ridotto rispetto ai processi, esiste)." },

{ id: "pr18", topic: "processi",
  q: "Un web server multithread riceve molte richieste concorrenti. Qual è l'organizzazione tipica?",
  options: [
    "Un thread dispatcher smista le richieste ai worker liberi, che possono servirle in parallelo",
    "Ogni richiesta viene gestita da un nuovo processo creato con la fork e terminato alla risposta",
    "Un unico thread serve le richieste in ordine FIFO, sospendendosi a ogni interrogazione del database",
    "I worker si dividono ogni singola richiesta in parti uguali per bilanciare il carico tra i core",
    "Il dispatcher serve direttamente le richieste mentre i worker si occupano solo del caching"
  ],
  correct: 0,
  expl: "Il modello dispatcher/worker permette di servire più richieste in parallelo (vero o pseudo): se un worker si blocca su I/O o database, gli altri continuano a servire richieste. Il dispatcher può creare nuovi thread o riciclare worker liberi." },

{ id: "pr19", topic: "processi",
  q: "Come gestisce i thread il sistema operativo Linux?",
  options: [
    "Tramite 'task' creati con clone(), di cui fork e thread_create sono casi particolari",
    "Tramite la chiamata CreateThread, identica a quella di Windows per compatibilità POSIX",
    "Solo a livello utente: la libreria Pthreads implementa i thread interamente in spazio utente",
    "Ogni thread è un processo completo, con spazio di indirizzamento duplicato alla creazione",
    "Tramite la syscall dedicata thread_clone(), distinta dalla clone() usata per i processi"
  ],
  correct: 0,
  expl: "Linux usa il concetto di task, ibrido tra processo e thread: la syscall clone() è modulabile e fork/thread_create sono solo due suoi casi particolari. La libreria standard POSIX di accesso ai thread kernel è Pthreads." },

{ id: "pr20", topic: "processi",
  q: "Con riferimento alla comunicazione a <b>pipe</b> tra processi, individuare l'affermazione <b>falsa</b>.",
  options: [
    "Il canale di output di un processo viene connesso al canale di input di un altro",
    "Tra i due processi c'è un buffer intermedio gestito dal sistema operativo",
    "Se il buffer si svuota, il processo che legge si blocca in attesa di dati",
    "Se uno dei due processi termina, il canale si chiude e l'altro solitamente termina",
    "I due processi devono condividere lo stesso spazio di indirizzamento"
  ],
  correct: 4,
  expl: "La pipe serve proprio a far comunicare processi che NON condividono memoria: ognuno mantiene il suo spazio di indirizzamento isolato e i dati passano attraverso il buffer gestito dal SO." },

{ id: "pr21", topic: "processi",
  q: "Quali canali di comunicazione standard possiede ogni processo UNIX?",
  options: [
    "Un canale di input, uno di output e un canale di output separato per gli errori",
    "Un canale di input e uno di output, entrambi bidirezionali e bufferizzati dal kernel",
    "Tre canali di input (tastiera, file, rete) e un unico canale di output condiviso",
    "Un canale unico multiplexato nel tempo tra input, output e messaggi di errore",
    "Due canali di errore (fatale e non fatale) più un canale dati bidirezionale"
  ],
  correct: 0,
  expl: "Sono standard input, standard output e standard error: l'error è separato per mantenere 'pulito' il canale di output. Di default input = tastiera, output ed error = terminale." },

{ id: "pr22", topic: "processi",
  q: "La shell esegue un comando esterno. Qual è la sequenza corretta?",
  options: [
    "fork() crea il figlio, che esegue il comando con exec(); la shell si blocca sulla wait()",
    "La shell chiama exec() su sé stessa e al termine del comando viene ricreata dal processo INIT",
    "La shell chiama wait() prima della fork(), per riservare la CPU al futuro processo figlio",
    "Il comando viene eseguito da un thread interno della shell, che resta comunque interattiva",
    "La shell inoltra il comando a INIT, che lo esegue e le restituisce l'output tramite una pipe"
  ],
  correct: 0,
  expl: "Classico esempio: fork() crea il figlio, il figlio con exec() carica il programma del comando, la shell si blocca sulla wait() finché il figlio non termina (a meno di usare '&' per l'esecuzione in background)." }
];
