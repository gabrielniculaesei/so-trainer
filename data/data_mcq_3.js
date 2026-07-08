/* BANCA DOMANDE 3: memoria/sostituzione */
window.MCQ.push(
{ id: "me01", topic: "memoria",
  q: "Con la <b>rilocazione dinamica</b> (registro base RB e registro limite RL), come viene tradotto un indirizzo logico?",
  options: [
    "La MMU verifica che l'indirizzo logico non superi RL, poi lo somma a RB, a run-time",
    "La MMU somma RL all'indirizzo logico e verifica che il risultato non superi RB",
    "Il loader somma RB a tutti i riferimenti individuati nel codice al caricamento",
    "La MMU sottrae RB dall'indirizzo logico e confronta il risultato con RL",
    "Il compilatore fissa gli indirizzi assoluti e la MMU esegue solo il controllo di protezione"
  ],
  correct: 0,
  expl: "La traduzione è fatta dalla MMU a run-time: prima il controllo di protezione (indirizzo ≤ RL, altrimenti TRAP e terminazione del processo), poi indirizzo fisico = logico + RB. La riscrittura del codice al caricamento (opzione C) è la rilocazione statica." },

{ id: "me02", topic: "memoria",
  q: "Con riferimento allo <b>swapping</b>, individuare l'affermazione <b>falsa</b>.",
  options: [
    "L'intera zona di memoria di un processo viene temporaneamente parcheggiata su disco",
    "Il processo swappato non può essere schedulato finché non torna in RAM",
    "Se ne occupa lo scheduler di medio termine",
    "Il PCB del processo swappato viene eliminato e ricreato al rientro in RAM",
    "Con la rilocazione dinamica, al rientro basta aggiornare il registro base"
  ],
  correct: 3,
  expl: "Il PCB resta: il processo non termina, è solo 'parcheggiato'. Al rientro (magari in una partizione diversa) riparte da dove si era fermato; con rilocazione dinamica basta cambiare il registro base." },

{ id: "me03", topic: "memoria",
  q: "Qual è la differenza tra frammentazione <b>esterna</b> e <b>interna</b>?",
  options: [
    "Esterna: buchi non contigui tra le partizioni; interna: spazio inutilizzato nell'allocato",
    "Esterna: spazio sprecato dentro l'ultima pagina di un processo; interna: buchi liberi tra le partizioni",
    "Esterna: riguarda esclusivamente il disco; interna: riguarda esclusivamente la RAM",
    "Esterna: causata dalla paginazione; interna: causata dallo swapping delle partizioni",
    "Interna: si risolve con la compattazione della memoria; esterna: è strutturalmente inevitabile"
  ],
  correct: 0,
  expl: "Esterna = spazio libero spezzettato in buchi non contigui (tipica dell'allocazione contigua; si mitiga con la compattazione, onerosa). Interna = spazio inutilizzato all'interno di ciò che è stato allocato (es. ultima pagina/blocco usati solo in parte)." },

{ id: "me04", topic: "memoria",
  q: "Nella gestione dello spazio libero con liste, quale criterio descrive il <b>best fit</b>?",
  options: [
    "Si sceglie il primo buco sufficientemente grande partendo dall'inizio della lista",
    "Si sceglie il buco più piccolo tra quelli sufficientemente capienti",
    "Si sceglie il buco più grande disponibile nella lista",
    "Si riparte dall'ultimo punto in cui si è allocato e si prende il primo buco capiente",
    "Si sceglie il buco che minimizza la distanza dalla partizione del processo richiedente"
  ],
  correct: 1,
  expl: "Best fit cerca il buco più 'aderente'. Paradossalmente peggiora la frammentazione esterna: genera microbuchi inutilizzabili. First fit = primo buco valido (A); next fit = come first ma dall'ultima posizione (D); worst fit = buco più grande (C)." },

{ id: "me05", topic: "memoria",
  q: "Con riferimento alla <b>memoria virtuale paginata</b>, individuare l'affermazione <b>falsa</b>.",
  options: [
    "Lo spazio di indirizzamento virtuale è diviso in pagine di dimensione fissa",
    "La RAM è divisa in frame della stessa dimensione delle pagine",
    "Una pagina può essere caricata in un qualunque frame libero",
    "La paginazione elimina la frammentazione esterna",
    "Tutte le pagine di un processo devono trovarsi in RAM perché esso possa eseguire"
  ],
  correct: 4,
  expl: "Il punto di forza della memoria virtuale è proprio che NON servono tutte le pagine in RAM: le altre stanno nell'area di swap su disco e vengono caricate su page fault (demand paging)." },

{ id: "me06", topic: "memoria",
  q: "Sistema con spazio di indirizzamento virtuale di 64 KB, pagine da 4 KB, RAM da 32 KB. Quante pagine e quanti frame ci sono?",
  options: [
    "16 pagine e 8 frame",
    "8 pagine e 16 frame",
    "64 pagine e 32 frame",
    "16 pagine e 16 frame",
    "32 pagine e 8 frame"
  ],
  correct: 0,
  expl: "Pagine = 64 KB / 4 KB = 16 (indirizzo virtuale a 16 bit: 4 bit di pagina + 12 di offset). Frame = 32 KB / 4 KB = 8 (indirizzo fisico a 15 bit: 3 bit di frame + 12 di offset)." },

{ id: "me07", topic: "memoria",
  q: "Se lo spazio di indirizzamento virtuale è 2<sup>m</sup> byte e la dimensione della pagina è 2<sup>n</sup> byte, come si scompone l'indirizzo virtuale?",
  options: [
    "Gli m−n bit più significativi sono il numero di pagina, gli n meno significativi l'offset",
    "Gli n bit più significativi sono il numero di pagina, gli m−n meno significativi l'offset",
    "I primi m/2 bit sono il numero di pagina, i restanti costituiscono l'offset",
    "Gli m−n bit meno significativi sono il numero di pagina, gli n più significativi l'offset",
    "Il numero di pagina occupa sempre 20 bit e l'offset i restanti m−20"
  ],
  correct: 0,
  expl: "Numero di pagina = m−n bit più significativi; offset = n bit meno significativi. La traduzione sostituisce il numero di pagina con il numero di frame, mentre l'offset resta invariato." },

{ id: "me08", topic: "memoria",
  q: "Che cos'è un <b>page fault</b>?",
  options: [
    "Un errore fatale di protezione che causa la terminazione immediata del processo",
    "La pagina riferita non è in RAM: l'OS la recupera dal disco e aggiorna la tabella",
    "Il tentativo di scrittura su una pagina marcata con il bit di protezione a sola lettura",
    "L'evento in cui la traduzione non è nel TLB e serve un accesso alla tabella in RAM",
    "L'esaurimento dei frame liberi, che costringe il paging daemon a intervenire"
  ],
  correct: 1,
  expl: "Il page fault NON è un errore: la MMU rileva il bit di presenza a 0 e genera un'eccezione; la routine dell'OS carica la pagina dal disco (eventualmente scartandone un'altra), aggiorna la tabella e la richiesta viene ritentata. L'opzione D descrive un TLB miss." },

{ id: "me09", topic: "memoria",
  q: "Quale di queste informazioni <b>NON</b> è contenuta in una voce della tabella delle pagine?",
  options: [
    "Il bit di presenza della pagina in memoria centrale",
    "I bit di protezione (lettura/scrittura)",
    "Il dirty bit, che segnala l'avvenuta modifica della pagina",
    "Il bit di referenziamento, azzerato periodicamente",
    "Il numero della pagina virtuale a cui la voce si riferisce"
  ],
  correct: 4,
  expl: "Nella tabella le voci sono memorizzate in ordine: la voce i-esima riguarda la pagina i, quindi il numero di pagina è implicito nella posizione. È nel TLB che serve memorizzarlo esplicitamente, perché lì le voci non sono sequenziali. Domanda sottile ma istruttiva!" },

{ id: "me10", topic: "memoria",
  q: "A cosa serve il <b>dirty bit</b> (bit di modifica) nella voce della tabella delle pagine?",
  options: [
    "Indica se la pagina differisce dalla copia su disco: se sì, va riscritta prima dello scarto",
    "Indica che la pagina è stata referenziata di recente e che quindi non conviene scartarla dalla memoria",
    "Segnala che la pagina contiene buffer di I/O e non deve essere messa in cache",
    "Indica che la pagina appartiene a una libreria condivisa in sola lettura",
    "Viene azzerato periodicamente dall'OS per stimare la frequenza degli accessi"
  ],
  correct: 0,
  expl: "Se la pagina non è stata modificata (dirty = 0) la copia su disco è identica: si può scartare senza riscriverla. Se dirty = 1 va prima aggiornata la copia su disco. Le opzioni B ed E descrivono il bit di referenziamento R; la C il bit di disabilitazione della cache." },

{ id: "me11", topic: "memoria",
  q: "Con riferimento alla <b>tabella dei frame</b>, individuare l'affermazione <b>corretta</b>.",
  options: [
    "È unica, con una voce per frame: stato libero/occupato e processo proprietario",
    "Ne esiste una per ogni processo, con una voce per ogni sua pagina virtuale",
    "Contiene, per ogni frame, il numero della pagina ospitata con i relativi bit R e M",
    "È la struttura usata dalla MMU per tradurre gli indirizzi virtuali in fisici",
    "Contiene una voce per ogni pagina del solo processo attualmente in esecuzione"
  ],
  correct: 0,
  expl: "La tabella dei frame è unica (i frame sono una risorsa fisica): per ogni frame indica se è libero/occupato e l'ID del processo proprietario — NON quale pagina contiene (l'opzione C descrive la tabella invertita). Si consulta per piazzare le pagine, non per tradurre." },

{ id: "me12", topic: "memoria",
  q: "Dove si trova la tabella delle pagine nei sistemi moderni e come la raggiunge la MMU?",
  options: [
    "In RAM nello spazio dell'OS; la MMU vi accede tramite il registro PTBR",
    "Interamente nei registri della MMU, ricaricati dalla RAM a ogni context-switch",
    "Nella cache L1 della CPU, con tag virtuali e ASID del processo corrente",
    "Nell'area di swap su disco, caricata in RAM solo dopo il primo page fault",
    "Nel PCB del processo, consultato direttamente dall'hardware a ogni accesso"
  ],
  correct: 0,
  expl: "Tenerla nei registri MMU non è scalabile (ricaricamento costosissimo a ogni switch: era fattibile con tabelle piccole). Si tiene in RAM e la MMU usa il PTBR (Page-Table Base Register): al context-switch basta aggiornare il PTBR. Costo: un accesso extra in RAM per traduzione (mitigato dal TLB)." },

{ id: "me13", topic: "memoria",
  q: "Che cos'è il <b>TLB</b> (Translation Lookaside Buffer)?",
  options: [
    "Una memoria associativa nella MMU con le voci della tabella usate di recente",
    "Una copia in RAM della tabella delle pagine, mantenuta aggiornata dal paging daemon",
    "La porzione della cache L2 che l'OS riserva alle tabelle delle pagine dei processi attivi",
    "Un buffer del controller del disco che accelera il caricamento delle pagine dallo swap",
    "La tabella che mappa ogni frame fisico sulla pagina virtuale che lo occupa"
  ],
  correct: 0,
  expl: "Il TLB (~1024 voci) memorizza le traduzioni recenti: in caso di hit si evita l'accesso alla tabella in RAM. Contiene anche il numero di pagina (le voci non sono sequenziali); rimpiazzo con LRU; funziona per il principio di località. L'opzione E descrive la tabella invertita." },

{ id: "me14", topic: "memoria",
  q: "Cosa accade al TLB in caso di <b>context-switch</b> e come si può evitare il problema?",
  options: [
    "Va svuotato (flush): i numeri di pagina sono univoci solo nel processo; alternativa: l'ASID",
    "Va copiato nel PCB del processo uscente e ricaricato integralmente al suo ritorno",
    "Basta invalidare le voci con dirty bit a 1: le altre restano valide per il nuovo processo",
    "Non serve alcuna azione: le voci contengono l'indirizzo fisico, che è univoco nel sistema",
    "Va sincronizzato con la tabella in RAM tramite un'operazione di write-back completa"
  ],
  correct: 0,
  expl: "Senza identificativo, pagine di processi diversi con lo stesso numero si confonderebbero: serve il flush (costoso: tanti miss iniziali, e si perdono voci riutilizzabili) oppure l'ASID (Address-Space IDentifier) nelle voci. Tra thread fratelli non serve toccare il TLB." },

{ id: "me15", topic: "memoria",
  q: "Tempo di accesso alla RAM t = 100 ns, accesso al TLB trascurabile, TLB hit ratio 80%. Qual è il tempo di accesso effettivo secondo la formula del corso EAT = h·(t<sub>TLB</sub>+t<sub>RAM</sub>) + (1−h)·(t<sub>TLB</sub>+2t<sub>RAM</sub>)?",
  options: [
    "100 ns",
    "120 ns",
    "140 ns",
    "160 ns",
    "180 ns"
  ],
  correct: 1,
  expl: "EAT = 0,8·(100) + 0,2·(200) = 80 + 40 = 120 ns. In caso di hit un solo accesso in RAM; in caso di miss due accessi (tabella + dato). Senza TLB sarebbe sempre 200 ns." },

{ id: "me16", topic: "memoria",
  q: "Perché si usano le tabelle delle pagine <b>multilivello</b>?",
  options: [
    "Con spazi grandi la tabella piatta non starebbe in RAM: l'albero evita le zone vuote",
    "Riducono il numero di accessi in memoria necessari per completare ogni traduzione",
    "Consentono di usare pagine di dimensione variabile, riducendo la frammentazione interna",
    "Rendono superfluo il TLB, sostituendolo con la più rapida tabella di primo livello",
    "Permettono a più processi di condividere l'intera gerarchia di tabelle, risparmiando RAM"
  ],
  correct: 0,
  expl: "La tabella si divide in gruppi su più livelli: i sottoalberi delle zone vuote dello spazio virtuale non vengono creati (puntatore NULL). Il prezzo è però una fetch IN PIÙ per ogni livello (opzione B è l'esatto contrario) — per questo il TLB diventa ancora più prezioso." },

{ id: "me17", topic: "memoria",
  q: "Indirizzi virtuali a 32 bit, pagine da 4 KB, voci da 4 byte: quanto occupa la tabella delle pagine a singolo livello?",
  options: [
    "4 MB (2²⁰ voci × 4 byte)",
    "4 KB (2¹⁰ voci × 4 byte)",
    "1 MB (2²⁰ voci × 1 byte)",
    "16 MB (2²² voci × 4 byte)",
    "256 KB (2¹⁶ voci × 4 byte)"
  ],
  correct: 0,
  expl: "Pagine = 2³² / 2¹² = 2²⁰ (circa 1 milione di voci). Tabella = 2²⁰ voci × 4 byte = 4 MB. Con indirizzi a 64 bit il problema esplode (2⁵² voci con pagine da 4 KB!): da qui le tabelle multilivello." },

{ id: "me18", topic: "memoria",
  q: "Con riferimento alla <b>tabella delle pagine invertita</b>, individuare l'affermazione <b>falsa</b>.",
  options: [
    "Contiene una voce per ogni frame fisico, non per ogni pagina virtuale",
    "Ogni voce contiene PID e numero di pagina della pagina ospitata",
    "La ricerca può essere lenta perché lineare (si mitiga con hash o TLB)",
    "La sua dimensione è proporzionale alla RAM e non allo spazio virtuale",
    "È la soluzione oggi più diffusa nei sistemi desktop e server"
  ],
  correct: 4,
  expl: "La tabella invertita (usata dalle CPU Intel Itanium) è stata abbandonata: ricerca costosa, problemi con le pagine condivise ('falsi page fault'), e gli OS sono tarati sull'approccio multilivello." },

{ id: "me19", topic: "memoria",
  q: "Cache della CPU piazzata <b>prima</b> della MMU (indirizzi virtuali): quale problema si presenta e come si risolve?",
  options: [
    "Gli indirizzi virtuali non sono univoci tra processi: servono flush al context-switch oppure ASID",
    "La cache deve comunque attendere la traduzione della MMU, annullando ogni vantaggio",
    "Il dirty bit delle voci non può essere mantenuto coerente con la tabella delle pagine",
    "La cache può ospitare solo pagine del kernel, perché quelle utente cambiano troppo spesso",
    "Le pagine più grandi della linea di cache non possono essere memorizzate"
  ],
  correct: 0,
  expl: "Con indirizzi virtuali la cache è velocissima (non aspetta la MMU: l'attesa della traduzione è il problema della cache POST-MMU) ma le chiavi non sono univoche tra processi: come per il TLB, si usa flush o ASID. Nei sistemi reali: L1 prima della MMU, L2/L3 dopo." },

{ id: "me20", topic: "memoria",
  q: "Con riferimento alle <b>pagine condivise</b>, individuare l'affermazione <b>sbagliata</b>.",
  options: [
    "Più istanze dello stesso programma possono condividere le pagine del codice",
    "Le pagine di codice condivise devono essere accessibili in sola lettura",
    "Gli indirizzi virtuali con cui i processi vedono la stessa pagina condivisa possono essere diversi (aliasing)",
    "Le tabelle delle pagine dei processi che condividono puntano allo stesso frame",
    "Ogni processo deve possedere una propria copia fisica in RAM della pagina condivisa"
  ],
  correct: 4,
  expl: "Il senso della condivisione è proprio avere UNA sola copia fisica in RAM puntata dalle tabelle di tutti i processi coinvolti. Copie separate si creano solo in caso di scrittura (copy-on-write). Domanda apparsa all'esame in questa forma!" },

{ id: "me21", topic: "memoria",
  q: "Come funziona il <b>copy-on-write</b> dopo una fork()?",
  options: [
    "Pagine condivise e read-only: alla prima scrittura l'OS copia la sola pagina interessata",
    "Tutte le pagine del padre vengono duplicate subito dopo la fork, ma la copia avviene in background durante l'idle",
    "Il tentativo di scrittura su una pagina condivisa genera un errore fatale e il processo scrivente viene terminato",
    "Le pagine modificate vengono copiate nell'area di swap e ricaricate dal disco al primo accesso del padre",
    "Padre e figlio scrivono a turno sulla stessa pagina, sincronizzati da un mutex gestito dal kernel"
  ],
  correct: 0,
  expl: "La fork costa 'zero' in termini di frame: si copiano solo le pagine effettivamente modificate, quando vengono modificate. Il tentativo di scrittura su pagina read-only condivisa NON è un errore fatale: la MMU invoca la procedura dell'OS che crea la copia e aggiorna i bit di scrittura di entrambe." },

{ id: "me22", topic: "memoria",
  q: "Che cos'è lo <b>zero-fill-on-demand</b>?",
  options: [
    "Le nuove pagine dell'heap puntano a una static zero page read-only: i frame reali arrivano al primo uso",
    "L'azzeramento preventivo di tutti i frame liberi, eseguito dal paging daemon nei periodi di idle",
    "Il riempimento con zeri delle pagine liberate, prima che tornino nella scorta dei frame",
    "L'allocazione immediata di frame azzerati ad ogni chiamata sbrk() del processo",
    "La mappatura del file eseguibile in memoria con tutte le pagine inizialmente azzerate"
  ],
  correct: 0,
  expl: "L'OS 'mente' al processo: alla sbrk() le nuove pagine puntano tutte alla pagina statica di zeri; solo quando il processo le usa davvero si assegnano frame reali (con copy-on-write). Anche la zona BSS (dati non inizializzati) è mappata così." },

{ id: "me23", topic: "memoria",
  q: "Differenza tra linking <b>statico</b> e <b>dinamico</b> delle librerie:",
  options: [
    "Statico: la libreria è copiata nell'eseguibile; dinamico: caricata a run-time e condivisa in RAM",
    "Statico: la libreria è caricata alla prima call; dinamico: il codice è incluso nell'eseguibile alla compilazione",
    "Dinamico: ogni processo riceve in RAM una copia privata della libreria al momento del caricamento",
    "Statico: le funzioni si risolvono tramite una tabella dei simboli consultata ad ogni chiamata",
    "Dinamico: la libreria viene ricaricata dal disco ad ogni context-switch del processo"
  ],
  correct: 0,
  expl: "Con il linking dinamico la libreria è una sola in RAM e tutti i processi la vedono nel proprio spazio di indirizzamento (l'eseguibile resta piccolo). Con i file mappati si fa di meglio: si caricano solo le pagine (funzioni) effettivamente usate." },

{ id: "me24", topic: "memoria",
  q: "Con riferimento allo <b>slab allocator</b> del kernel Linux, individuare l'affermazione <b>corretta</b>.",
  options: [
    "Ogni cache è specializzata in oggetti di taglia fissa: gli slab eliminano le due frammentazioni",
    "Gli slab sono liste di pagine non contigue collegate da puntatori interni al kernel",
    "Ogni cache contiene oggetti di dimensioni diverse, mantenuti ordinati per taglia crescente",
    "Lo slab allocator gestisce l'heap dei processi utente attraverso la chiamata sbrk()",
    "Gli slab sostituiscono integralmente la paginazione per tutta la memoria del kernel"
  ],
  correct: 0,
  expl: "Slab = pezzo di memoria fisicamente contiguo (gruppo di pagine); cache = collezione di slab specializzata per una dimensione di oggetto (PCB, i-node, ecc.). Funziona perché nel kernel le dimensioni degli oggetti sono note a priori. Il kernel usa sia indirizzi fisici sia paginazione." },

{ id: "me25", topic: "memoria",
  q: "Un sistema usa il metodo <b>lock & key</b> (OS/360): la RAM è divisa in porzioni con chiave e ogni processo ha una chiave nella PSW. Quando un accesso viene negato?",
  options: [
    "Quando la chiave della porzione indirizzata non coincide con la chiave nella PSW",
    "Quando la chiave della porzione coincide con quella di un altro processo pronto",
    "Quando il processo tenta l'accesso trovandosi in modalità kernel",
    "Quando la porzione indirizzata supera la dimensione standard di 2 KB",
    "Quando la chiave nella PSW non è stata aggiornata dall'ultimo context-switch"
  ],
  correct: 0,
  expl: "Ad ogni fetch/store si confronta la chiave della porzione con quella nella PSW del processo: se non coincidono l'accesso è fuori dal proprio spazio e viene negato. Al context-switch la chiave nella PSW viene sovrascritta con quella del nuovo processo. Metodo semplice ma poco scalabile." },

{ id: "me26", topic: "memoria",
  q: "Perché la CPU genera <b>solo indirizzi virtuali</b> nei sistemi con memoria virtuale?",
  options: [
    "Perché la traduzione è interamente a carico della MMU, in modo trasparente al processo",
    "Perché gli indirizzi fisici sono noti soltanto al momento della compilazione del kernel",
    "Perché la CPU genera indirizzi fisici solo in modalità kernel e virtuali in modalità utente",
    "Perché gli indirizzi virtuali coincidono con quelli fisici fino al primo page fault",
    "Perché la MMU converte gli indirizzi solo per le STORE, mentre le FETCH sono dirette"
  ],
  correct: 0,
  expl: "Il processo lavora nel suo spazio virtuale (da 0 a MAX); la MMU traduce ogni riferimento a run-time usando la tabella delle pagine. Questo dà protezione intrinseca e permette l'allocazione non contigua." },

{ id: "so01", topic: "sostituzione",
  q: "L'algoritmo di sostituzione <b>OPT</b> (ottimale):",
  options: [
    "scarta la pagina che verrà referenziata più lontano nel futuro; teorico, fa da lower bound",
    "scarta la pagina referenziata più di recente, che con ogni probabilità ha esaurito il suo compito",
    "scarta la pagina con il minor numero di riferimenti totali dall'inizio dell'esecuzione",
    "è implementato in hardware dalle MMU moderne, sfruttando il bit di referenziamento",
    "sceglie la vittima simulando gli altri algoritmi e adottando la scelta più frequente"
  ],
  correct: 0,
  expl: "OPT richiederebbe di conoscere il futuro: non è implementabile in pratica, ma nelle simulazioni (dove la sequenza è nota) fornisce il minimo teorico di page fault (lower bound) contro cui confrontare gli algoritmi reali." },

{ id: "so02", topic: "sostituzione",
  q: "L'algoritmo <b>NRU</b> (Not Recently Used) divide le pagine in 4 classi. In base a quali bit, e da quale classe scarta?",
  options: [
    "Bit R e M: si scarta (con FIFO interno) dalla classe più bassa non vuota; R pesa più di M",
    "Bit R e M: si scarta dalla classe R=1, M=1, che contiene le pagine ormai completate",
    "Bit di presenza e validità: si scartano le pagine che hanno entrambi i bit azzerati",
    "Bit R e M: M pesa più di R, perché una pagina modificata va comunque riscritta su disco",
    "Bit R e contatore di aging: si scarta la pagina con la combinazione più bassa"
  ],
  correct: 0,
  expl: "Classi: (0) R=0,M=0 → (1) R=0,M=1 → (2) R=1,M=0 → (3) R=1,M=1. R è il bit più significativo perché azzerato periodicamente: R=0 significa non usata di recente. A parità di R, meglio scartare una pagina non modificata (non va riscritta su disco)." },

{ id: "so03", topic: "sostituzione",
  q: "Come funziona l'algoritmo della <b>seconda chance</b>?",
  options: [
    "Come FIFO, ma se la testa ha R=1 viene rimessa in coda con R=0 e si esamina la successiva",
    "Come FIFO, ma la testa con R=1 viene scartata subito perché facilmente ricaricabile",
    "Ogni pagina può causare al massimo due page fault prima di essere fissata in RAM",
    "Come LRU, ma il contatore viene azzerato una sola volta a metà vita della pagina",
    "La pagina scartata resta in un buffer da cui può essere ripescata al fault successivo"
  ],
  correct: 0,
  expl: "Seconda chance = FIFO + controllo del bit R: le pagine recentemente usate (R=1) vengono rimesse in coda come 'giovani' con R azzerato. La prima testa con R=0 viene scartata. (Il 'ripescaggio' dell'opzione E esiste, ma è un'ottimizzazione dei frame liberi, non questo algoritmo.)" },

{ id: "so04", topic: "sostituzione",
  q: "Qual è il vantaggio dell'algoritmo <b>Clock</b> rispetto alla seconda chance?",
  options: [
    "Usa una lista circolare con lancetta: spostare la 'testa' è l'avanzamento di un puntatore",
    "Sostituisce il bit R con un timestamp aggiornato direttamente dal timer di sistema",
    "Evita di azzerare il bit R, preservando la storia degli accessi delle pagine risparmiate",
    "Usa due lancette: una azzera i bit R e l'altra sceglie la pagina vittima da scartare",
    "Mantiene una scorta di frame liberi che elimina la necessità di scegliere una vittima"
  ],
  correct: 0,
  expl: "Clock è la seconda chance implementata su lista circolare: la lancetta punta alla pagina più vecchia; R=1 → azzera R e avanza; R=0 → sostituisce. Stesse scelte, ma senza estrazioni e reinserimenti nella lista: basta muovere un puntatore." },

{ id: "so05", topic: "sostituzione",
  q: "L'algoritmo <b>LRU</b> (Least Recently Used):",
  options: [
    "scarta la pagina non referenziata da più tempo; esatta ma costosa da implementare",
    "scarta la pagina residente in RAM da più tempo, indipendentemente dall'uso che ne è stato fatto",
    "scarta la pagina con il minor numero di accessi complessivi dall'inizio dell'esecuzione",
    "approssima NFU aggiungendo lo shift a destra periodico del contatore",
    "scarta la pagina il cui bit R risulta azzerato da più cicli consecutivi"
  ],
  correct: 0,
  expl: "LRU si basa sulla località: chi non è usato da molto probabilmente non servirà presto. L'implementazione esatta richiede timestamp hardware aggiornati ad ogni istruzione (o la matrice n×n di bit): per questo in software lo si approssima con NFU/Aging (l'opzione D descrive Aging, ma al contrario: è Aging che approssima LRU). L'opzione B è FIFO." },

{ id: "so06", topic: "sostituzione",
  q: "Nell'implementazione di LRU con <b>matrice di bit</b> n×n, cosa accade quando viene referenziata la pagina del frame i?",
  options: [
    "La riga i va tutta a 1, poi la colonna i viene azzerata; vittima: la riga di valore minimo",
    "La colonna i viene posta tutta a 1 e la riga i azzerata; la vittima è la pagina con più bit a 1",
    "La cella (i,i) viene incrementata di 1; la vittima è la pagina con la diagonale più bassa",
    "La riga i viene shiftata a destra inserendo un 1 come bit più significativo",
    "La riga i viene scambiata con la riga della pagina meno recentemente usata"
  ],
  correct: 0,
  expl: "Riga i tutta a 1, colonna i azzerata: così ogni riferimento 'toglie un 1' alle altre pagine. La pagina con la riga di valore minimo (più zeri) è la meno recentemente usata e viene scartata. L'opzione D descrive l'aggiornamento di Aging." },

{ id: "so07", topic: "sostituzione",
  q: "Qual è il difetto dell'algoritmo <b>NFU</b> (Not Frequently Used) rispetto ad Aging?",
  options: [
    "Non dimentica il passato: una pagina molto usata tempo fa conserva un contatore alto",
    "Azzera il contatore troppo spesso, rendendo tutte le pagine equivalenti tra loro",
    "Conta ogni singolo accesso alla pagina, mandando rapidamente in overflow il contatore",
    "Richiede la matrice di bit n×n, troppo costosa per le quantità di RAM moderne",
    "Ignora completamente il bit R, basandosi soltanto sul bit di modifica M"
  ],
  correct: 0,
  expl: "NFU somma periodicamente R al contatore: il contatore cresce e basta, senza pesare QUANDO sono avvenuti i riferimenti ('la pagina vive di rendita'). Aging risolve con lo shift a destra che 'invecchia' i riferimenti passati. NFU non conta ogni accesso: campiona R periodicamente." },

{ id: "so08", topic: "sostituzione",
  q: "L'algoritmo di <b>Aging</b> mantiene un contatore C per ogni pagina. Qual è l'aggiornamento periodico corretto?",
  options: [
    "Somma del bit di referenziamento R al contatore C, con seguente shift a sinistra",
    "Shift a sinistra di C e somma del bit di referenziamento R",
    "Shift a sinistra di C e inserimento di R come bit più significativo",
    "Shift a destra di C e inserimento del bit R come bit più significativo",
    "Shift a destra di C e inserimento del bit di modifica M come bit meno significativo"
  ],
  correct: 3,
  expl: "Aging: C viene shiftato a DESTRA di una posizione e il bit R entra come bit PIÙ significativo. Così i riferimenti recenti pesano di più e quelli antichi 'svaniscono'. Si scarta la pagina con contatore più basso." },

{ id: "so09", topic: "sostituzione",
  q: "Con Aging, la pagina A ha contatore 10000000 e la pagina B ha contatore 01000011. Chi viene scartata e perché?",
  options: [
    "B, perché ha il contatore più basso: conta QUANDO è stata usata, non quante volte",
    "A, perché ha meno bit a 1 e quindi è stata referenziata meno volte in totale",
    "A, perché il bit più significativo indica un riferimento ormai troppo vecchio",
    "B, perché i suoi bit meno significativi rivelano riferimenti molto recenti",
    "Nessuna delle due: a parità di bit più significativo si confronta il dirty bit"
  ],
  correct: 0,
  expl: "10000000 (128) > 01000011 (67): A è stata referenziata nell'ULTIMO ciclo (bit più significativo), B no. Si scarta B nonostante sia stata usata più volte in totale: il 'peso' degli accessi recenti domina. È il principio LRU approssimato da Aging." },

{ id: "so10", topic: "sostituzione",
  q: "Che cos'è l'<b>anomalia di Belady</b> e quali algoritmi ne soffrono?",
  options: [
    "Con certe sequenze più frame producono più fault; colpisce gli algoritmi FIFO-based",
    "Con certe sequenze, aumentando i frame aumentano i page fault; ne soffrono gli algoritmi LRU-based (LRU, NFU, aging)",
    "Il numero di page fault resta costante al variare dei frame; riguarda soltanto l'algoritmo OPT",
    "I page fault crescono al diminuire della RAM disponibile; è un comportamento comune a tutti gli algoritmi",
    "Le pagine condivise vengono conteggiate due volte nei fault; riguarda la tabella delle pagine invertita"
  ],
  correct: 0,
  expl: "Con la sequenza classica 1,2,3,4,1,2,5,1,2,3,4,5 FIFO fa 9 fault con 3 frame e 10 con 4! Gli algoritmi LRU-based non ne soffrono grazie alla proprietà di inclusione. L'opzione D descrive il comportamento NORMALE (più RAM, meno fault), non l'anomalia." },

{ id: "so11", topic: "sostituzione",
  q: "Perché gli algoritmi <b>LRU-based non</b> soffrono dell'anomalia di Belady?",
  options: [
    "Inclusione: le pagine in memoria con N frame sono un sottoinsieme di quelle con N+1",
    "Per la proprietà di inclusione: le pagine in memoria con N+1 frame sono un sottoinsieme di quelle con N frame",
    "Perché mantengono in memoria solo pagine con R=1, per definizione immuni dall'anomalia",
    "Perché il numero di fault di LRU non dipende dal numero di frame disponibili",
    "Perché LRU compatta i riferimenti duplicati della sequenza prima di elaborarli"
  ],
  correct: 0,
  expl: "Con LRU in memoria restano le pagine usate più di recente: un frame in più aggiunge solo una pagina 'più vecchia' senza cambiare le altre (inclusione). FIFO invece guarda l'età di caricamento e può scartare pagine usatissime." },

{ id: "so12", topic: "sostituzione",
  q: "Che cos'è il <b>demand paging</b>?",
  options: [
    "Le pagine si caricano solo al primo riferimento: all'avvio i frame del processo sono vuoti",
    "Le pagine dell'eseguibile vengono precaricate in blocco alla creazione del processo",
    "Il paging daemon carica in anticipo le pagine che prevede verranno richieste a breve",
    "Il processo dichiara tramite syscall quali pagine caricare all'avvio e quali dopo",
    "Le pagine vengono caricate a gruppi corrispondenti a un intero working set"
  ],
  correct: 0,
  expl: "Non si sceglie a priori cosa caricare: ogni pagina arriva in RAM al suo primo riferimento (page fault). All'inizio dell'esecuzione i fault sono numerosi, poi la località si stabilizza." },

{ id: "so13", topic: "sostituzione",
  q: "Che cos'è il <b>thrashing</b>?",
  options: [
    "La condizione in cui si passa più tempo a gestire i fault che a eseguire",
    "Lo spostamento ciclico di interi processi tra RAM e disco quando la memoria è satura",
    "Il degrado del TLB quando le voci disponibili non bastano per la località del processo",
    "La liberazione eccessiva di frame da parte del paging daemon nei periodi di idle",
    "Lo scambio continuo della stessa pagina condivisa tra due processi cooperanti"
  ],
  correct: 0,
  expl: "Con frame appena sopra il minimo, i fault diventano continui e il processo (e il sistema) 'sfarfalla': più gestione dei fault che esecuzione utile. Si previene commisurando i frame alla località del processo (working set / PFF)." },

{ id: "so14", topic: "sostituzione",
  q: "Che cos'è il <b>working set</b> di un processo?",
  options: [
    "L'insieme delle pagine referenziate negli ultimi Δ accessi (la località corrente)",
    "L'insieme di tutte le pagine caricate in RAM dal processo dalla sua creazione",
    "Il numero minimo di frame imposto dall'architettura per eseguire qualsiasi istruzione",
    "L'insieme delle pagine che avevano R=1 al momento dell'ultimo page fault",
    "L'insieme delle pagine condivise tra il processo e i suoi figli dopo la fork"
  ],
  correct: 0,
  expl: "Guardando gli ultimi Δ riferimenti si individuano le pagine della località attuale. Se il working set non sta nei frame assegnati, il processo va in sofferenza (thrashing in arrivo). Si calcola con i log periodici del bit R, non con una foto al momento del fault." },

{ id: "so15", topic: "sostituzione",
  q: "Come funziona il metodo della <b>Page Fault Frequency</b> (PFF)?",
  options: [
    "Sopra la soglia superiore si assegnano frame; sotto quella inferiore se ne tolgono",
    "Sopra la soglia superiore si tolgono frame al processo, che evidentemente li sta sprecando",
    "La PFF misura i fault dell'intero sistema e oltre soglia attiva lo swapping globale",
    "Tra le due soglie il processo viene sospeso in attesa che la sua località si stabilizzi",
    "La PFF si applica solo con sostituzione locale e viene disattivata con quella globale"
  ],
  correct: 0,
  expl: "PFF con due soglie: frequenza alta = località più grande della memoria assegnata (servono frame); frequenza bassa = frame in eccesso (si possono togliere). Equivale in pratica al monitoraggio del working set; i picchi di PFF segnalano i cambi di località." },

{ id: "so16", topic: "sostituzione",
  q: "Differenza tra sostituzione <b>locale</b> e <b>globale</b> delle pagine:",
  options: [
    "Locale: vittima tra le pagine del processo colpevole; globale: tra tutte, con frame variabili",
    "Locale: vittima tra tutte le pagine in memoria; globale: solo tra quelle del processo che ha causato il fault",
    "Locale: applicabile solo con FIFO; globale: applicabile solo con LRU e derivati",
    "Locale: richiede il calcolo del working set; globale: richiede il monitoraggio della PFF",
    "Locale: il numero di frame per processo varia nel tempo; globale: resta costante"
  ],
  correct: 0,
  expl: "Con l'approccio globale un processo 'affamato' conquista frame a scapito di chi ne ha bisogno di meno: il sistema si autobilancia. Con quello locale ogni processo vive nel suo insieme fisso di frame." },

{ id: "so17", topic: "sostituzione",
  q: "A cosa serve il <b>paging daemon</b>?",
  options: [
    "A mantenere una scorta di frame liberi, liberando in idle i frame meno utili",
    "A eseguire la compattazione periodica della RAM per eliminare la frammentazione esterna",
    "A scambiare interi processi tra RAM e disco quando il grado di multiprogrammazione cresce",
    "A sincronizzare su disco le pagine modificate ad ogni context-switch dei processi",
    "A precaricare le pagine dei processi appena creati per ridurre i fault iniziali"
  ],
  correct: 0,
  expl: "Se c'è sempre qualche frame libero, il page fault si gestisce senza applicare al volo l'algoritmo di sostituzione (il caso lento). Il demone si attiva quando la scorta scende sotto soglia, nei periodi di idle, e usa l'algoritmo di sostituzione a livello globale." },

{ id: "so18", topic: "sostituzione",
  q: "Un frame 'liberato' dal paging daemon contiene ancora la vecchia pagina. Perché è utile?",
  options: [
    "Se la pagina viene richiesta subito e il frame non è stato riassegnato, bastano le tabelle: nessun I/O",
    "Il contenuto resta disponibile per il rollback delle scritture non ancora confermate dal journaling",
    "Serve alla routine di fsck per ricostruire i metadati del file system dopo un crash",
    "Permette al TLB di continuare a tradurre gli indirizzi della pagina scartata senza miss",
    "Evita di dover azzerare il frame quando viene assegnato a un nuovo processo"
  ],
  correct: 0,
  expl: "Il contenuto del frame non viene cancellato ma solo sovrascritto quando serve: un errore dell'algoritmo di sostituzione si ripara a costo quasi nullo 'ripescando' la pagina ancora presente in RAM. (Un frame dato a un NUOVO processo va comunque pulito: zero page.)" },

{ id: "so19", topic: "sostituzione",
  q: "Quali sono i vantaggi di scegliere pagine <b>grandi</b>?",
  options: [
    "Tabelle più piccole, I/O su disco più efficiente, meno fault a parità di pagine caricate",
    "Minore frammentazione interna e migliore risoluzione del working set",
    "Tabelle più piccole e frammentazione interna ridotta circa della metà",
    "Meno page fault e possibilità di eliminare del tutto il TLB",
    "I/O più efficiente e azzeramento della frammentazione esterna, altrimenti presente"
  ],
  correct: 0,
  expl: "Pagine grandi: meno voci nelle tabelle, letture su disco più sequenziali, più dati per fault. Pagine PICCOLE: meno frammentazione interna (in media resta vuota mezza pagina) e località meglio delimitata (opzione B). La frammentazione esterna non c'è comunque con la paginazione." },

{ id: "so20", topic: "sostituzione",
  q: "Sequenza di riferimenti 1,2,3,4,1,2,5,1,2,3,4,5 con 3 frame, algoritmo FIFO: quanti page fault si verificano?",
  options: [
    "9",
    "8",
    "10",
    "12",
    "7"
  ],
  correct: 0,
  expl: "1F,2F,3F [1,2,3] → 4F [2,3,4] → 1F [3,4,1] → 2F [4,1,2] → 5F [1,2,5] → 1 hit → 2 hit → 3F [2,5,3] → 4F [5,3,4] → 5 hit. Totale 9 fault. Nota: con 4 frame la stessa sequenza dà 10 fault: anomalia di Belady!" },

{ id: "so21", topic: "sostituzione",
  q: "Quale numero minimo di frame per processo va garantito e da cosa dipende?",
  options: [
    "Dipende dall'architettura: un'istruzione può richiedere più pagine contemporaneamente",
    "Un solo frame, sufficiente a contenere la pagina dell'istruzione correntemente in esecuzione",
    "Dipende dalla dimensione del file eseguibile diviso per la dimensione della pagina",
    "Dipende dal numero di thread del processo: un frame per ogni stack attivo",
    "Un numero fisso pari a 2, uno per il codice e uno per i dati del processo"
  ],
  correct: 0,
  expl: "Es. MOV [1000],#1: serve la pagina dell'istruzione E quella della locazione 1000: con un solo frame l'istruzione non completerebbe mai (fault infiniti). Il minimo dipende dal set di istruzioni dell'architettura, non dalla taglia del processo." },

{ id: "so22", topic: "sostituzione",
  q: "Allocazione <b>proporzionale</b> dei frame: con S = somma delle taglie dei processi, quanti frame riceve il processo i-esimo di taglia S<sub>i</sub> su M frame totali?",
  options: [
    "A<sub>i</sub> = (S<sub>i</sub> / S) · M",
    "A<sub>i</sub> = M / N, con N pari al numero di processi",
    "A<sub>i</sub> = (S / S<sub>i</sub>) · M",
    "A<sub>i</sub> = S<sub>i</sub> · M − S",
    "A<sub>i</sub> = (S<sub>i</sub> / M) · S"
  ],
  correct: 0,
  expl: "Ogni processo riceve frame in proporzione alla propria taglia: Ai = Si/S · M. L'allocazione equa (M/N, opzione B) ignora le taglie; quella per priorità dà più frame ai processi importanti a prescindere dalla taglia." }
);
