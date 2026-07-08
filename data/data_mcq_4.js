/* BANCA DOMANDE 4: file system/dischi */
window.MCQ.push(
{ id: "fs01", topic: "fs",
  q: "Con riferimento alle tecniche di memorizzazione dei file sui blocchi del disco, individuare l'affermazione <b>falsa</b>.",
  options: [
    "Nell'allocazione contigua è necessario conoscere a priori la dimensione massima del file in fase di creazione",
    "Nell'allocazione concatenata (con liste collegate) è presente una certa perdita di spazio dovuta alla frammentazione interna",
    "L'allocazione contigua richiede meno RAM e meno accessi al disco per localizzare un blocco arbitrario del file",
    "Usando una FAT non serve una bitmap aggiuntiva per i blocchi liberi",
    "Nell'allocazione con FAT la capacità del blocco è solo parzialmente sfruttabile, dovendo memorizzare il numero del blocco successivo"
  ],
  correct: 4,
  expl: "Con la FAT i puntatori stanno TUTTI nella tabella, non nei blocchi: il blocco è sfruttabile al 100%. È l'allocazione a lista concatenata semplice a 'rubare' spazio nei blocchi per i puntatori." },

{ id: "fs02", topic: "fs",
  q: "Perché l'allocazione <b>contigua</b> dei file è usata oggi solo su memorie di sola lettura (CD/DVD)?",
  options: [
    "Se il file cresce può mancare spazio contiguo: su supporti riscrivibili è ingestibile",
    "La lettura sequenziale è inefficiente, perché la testina deve riposizionarsi a ogni blocco del file",
    "Richiede di mantenere l'intera tabella di allocazione in RAM, possibile solo per supporti read-only",
    "L'accesso diretto a un offset richiede di scorrere tutti i blocchi precedenti del file",
    "I supporti riscrivibili non garantiscono blocchi di dimensione costante, requisito dell'allocazione contigua"
  ],
  correct: 0,
  expl: "Su un supporto write-once il contenuto è immutabile e l'allocazione contigua funziona benissimo (in lettura è ottima: la testina si posiziona una volta sola — il contrario dell'opzione B). Su dischi riscrivibili l'espansione dei file e la frammentazione esterna la rendono impraticabile." },

{ id: "fs03", topic: "fs",
  q: "Nell'allocazione con <b>liste linkate semplici</b> (puntatore dentro ogni blocco), quali sono i due problemi principali?",
  options: [
    "Il puntatore ruba spazio nel blocco e l'accesso è sequenziale O(n) su disco",
    "La frammentazione esterna tra i blocchi e la dimensione fissa della tabella di allocazione",
    "La necessità di conoscere in anticipo la dimensione del file e lo spreco di RAM per i puntatori",
    "L'impossibilità di far crescere il file e la lentezza della scansione della directory",
    "La perdita dell'intero file in caso di danneggiamento della tabella dei puntatori centralizzata"
  ],
  correct: 0,
  expl: "Es. blocchi da 1 KB con puntatore da 4 byte → 1020 byte utili: leggere 1 KB di dati tocca 2 blocchi. E per raggiungere il blocco n-esimo si attraversa la catena sul disco. La FAT risolve entrambi: puntatori centralizzati in tabella, tabella in RAM." },

{ id: "fs04", topic: "fs",
  q: "Come si raggiunge il blocco che contiene un certo offset di un file in un file system <b>FAT</b>?",
  options: [
    "Si parte dal primo blocco (in directory) e si fanno ⌊offset/dim_blocco⌋ salti nella FAT in RAM",
    "Si calcola blocco_iniziale + ⌊offset/dim_blocco⌋: i blocchi di un file gestito a FAT sono contigui",
    "Si consulta l'i-node del file e si segue il puntatore diretto o indiretto corrispondente all'offset",
    "Si seguono i puntatori memorizzati in coda a ciascun blocco, leggendoli uno ad uno dal disco",
    "Si cerca l'offset nella bitmap dei blocchi, che per ogni file mantiene l'elenco ordinato dei blocchi"
  ],
  correct: 0,
  expl: "⌊offset/dim_blocco⌋ dà l'indice del blocco DENTRO il file; si parte dal primo blocco (in directory) e si salta nella FAT, che sta in RAM: salti veloci. L'opzione B descrive l'allocazione contigua, la C gli i-node, la D le liste linkate semplici." },

{ id: "fs05", topic: "fs",
  q: "Un disco usa una FAT con voci da 2 byte (16 bit) e blocchi da 4 KB. Qual è la capacità massima indirizzabile?",
  options: [
    "2¹⁶ blocchi × 4 KB = 256 MB",
    "2¹⁶ blocchi × 4 KB = 64 MB",
    "2³² blocchi × 4 KB = 16 TB",
    "2¹⁶ byte × 4 = 256 KB",
    "2²⁴ blocchi × 4 KB = 64 GB"
  ],
  correct: 0,
  expl: "Con indici a 16 bit si indirizzano 2¹⁶ = 65.536 blocchi; ogni blocco è 4 KB = 2¹² byte → 2¹⁶ · 2¹² = 2²⁸ byte = 256 MB. La dimensione dell'indice FAT limita la capacità del disco (per questo esistono FAT-12/16/32...)." },

{ id: "fs06", topic: "fs",
  q: "Con riferimento all'<b>i-node</b> UNIX standard del corso (13 voci), individuare l'affermazione <b>corretta</b>.",
  options: [
    "Le prime 10 voci puntano a blocchi dati; le ultime 3 agli indiretti singolo, doppio e triplo",
    "Le prime 3 voci sono indirette (singolo, doppio, triplo); le altre 10 puntano a blocchi dati",
    "Tutte le 13 voci puntano a blocchi dati; oltre il 13° blocco si allega un secondo i-node in catena",
    "Le voci puntano a extent di dimensione crescente: 1, 2, 4, 8… blocchi contigui",
    "Le prime 12 voci sono dirette e l'ultima punta alla porzione di FAT dedicata al file"
  ],
  correct: 0,
  expl: "10 dirette + 1 indiretto singolo + 1 indiretto doppio + 1 indiretto triplo. Il nome del file NON sta nell'i-node ma nella directory (voce: nome + i-number). Con blocchi da 4 KB e puntatori da 4 byte: max ≈ (10 + 1024 + 1024² + 1024³)·4 KB ≈ 4 TB." },

{ id: "fs07", topic: "fs",
  q: "File system UNIX, blocchi da 4 KB, puntatori da 4 byte (1024 per blocco). Un file di 50 KB: quali strutture servono per indirizzarne tutti i blocchi?",
  options: [
    "I 10 puntatori diretti dell'i-node più il blocco indiretto singolo per i restanti 3 blocchi",
    "Soltanto i puntatori diretti dell'i-node, che coprono fino a 52 KB",
    "I puntatori diretti più il blocco indiretto doppio, necessario oltre i 40 KB",
    "Il solo blocco indiretto singolo, che indirizza qualunque file fino a 4 MB",
    "I 10 diretti, l'indiretto singolo e l'indiretto doppio, ciascuno per una parte del file"
  ],
  correct: 0,
  expl: "50 KB / 4 KB = 12,5 → 13 blocchi. I primi 10 sono coperti dai puntatori diretti (40 KB); gli altri 3 dal blocco indiretto singolo (che da solo copre fino a 1024 blocchi = 4 MB aggiuntivi). L'indiretto doppio serve solo oltre 10+1024 blocchi." },

{ id: "fs08", topic: "fs",
  q: "Dove sono memorizzati i <b>metadati</b> di un file in un file system UNIX basato su i-node?",
  options: [
    "Nell'i-node del file, tranne il nome che sta nella voce di directory",
    "Nella voce di directory, tranne la dimensione che si ricava dalla catena dei blocchi",
    "Nel primo blocco dati del file, prima del contenuto vero e proprio",
    "Nel superblocco della partizione, indicizzati per i-number",
    "Nella tabella dei file aperti del kernel, caricata all'avvio del sistema"
  ],
  correct: 0,
  expl: "La voce di directory contiene solo nome + i-number; tutti gli altri metadati (dimensione, permessi, contatore dei riferimenti, puntatori ai blocchi...) sono nell'i-node." },

{ id: "fs09", topic: "fs",
  q: "Con riferimento ai <b>soft-link</b> (link simbolici), individuare l'affermazione <b>falsa</b>.",
  options: [
    "È un file speciale che contiene il percorso del file a cui punta",
    "Ha un proprio i-node, distinto da quello del file originale",
    "Se il file originale viene spostato o rinominato, il soft-link si 'rompe'",
    "Può puntare a file appartenenti a file system diversi",
    "Punta all'i-node dell'originale e ne incrementa il contatore dei riferimenti"
  ],
  correct: 4,
  expl: "Quella è la definizione di HARD-link. Il soft-link è un file a parte il cui contenuto è il PERCORSO del bersaglio: l'OS lo segue ad ogni apertura, e se il percorso non è più valido il link si rompe (l'OS non aggiorna i soft-link: costerebbe troppo)." },

{ id: "fs10", topic: "fs",
  q: "Con riferimento agli <b>hard-link</b>, individuare l'affermazione <b>falsa</b>.",
  options: [
    "Un hard-link punta allo stesso i-node del file originale",
    "L'i-node mantiene un contatore dei riferimenti e viene deallocato solo quando arriva a 0",
    "Per l'OS è impossibile distinguere il riferimento 'originale' dagli altri",
    "Non si possono creare hard-link tra file system diversi",
    "Cancellato il file originale, tutti gli hard-link smettono di funzionare"
  ],
  correct: 4,
  expl: "È il punto di forza dell'hard-link: cancellare un riferimento decrementa solo il contatore; gli altri riferimenti continuano a funzionare perché l'i-node (e il contenuto) restano vivi finché il contatore non arriva a 0. L'i-number è univoco solo nel singolo file system, da cui il limite dell'opzione D." },

{ id: "fs11", topic: "fs",
  q: "Perché a livello utente è vietato creare hard-link alle <b>directory</b>?",
  options: [
    "Per evitare cicli nell'albero delle directory, che manderebbero in loop l'attraversamento",
    "Perché le directory non possiedono un i-node a cui il link possa puntare",
    "Perché il contatore dei riferimenti delle directory è riservato alle voci '.' e '..'",
    "Perché i permessi delle directory non sono rappresentabili nella maschera del link",
    "Perché una directory può essere raggiunta solo tramite percorsi assoluti"
  ],
  correct: 0,
  expl: "Un hard-link a una directory antenata creerebbe un loop non rilevabile (l'OS non distingue i riferimenti tra loro). Con i soft-link il rischio è gestibile perché sono file di natura diversa, riconoscibili durante l'attraversamento." },

{ id: "fs12", topic: "fs",
  q: "Gestione dei blocchi liberi con <b>lista concatenata</b>: qual è il 'trucco' che la rende conveniente?",
  options: [
    "I nodi si memorizzano dentro gli stessi blocchi liberi: zero spazio rubato e lista che si accorcia",
    "La lista viene mantenuta ordinata per dimensione, così il best fit trova subito il blocco adatto",
    "Ogni nodo traccia esattamente un gruppo di 1024 blocchi, allineandosi alla dimensione del blocco",
    "La lista risiede in RAM e viene ricostruita dalla bitmap ad ogni avvio del sistema",
    "I nodi occupano l'area dei metadati della partizione, lasciando integri i blocchi dati"
  ],
  correct: 0,
  expl: "Il nodo che descrive il blocco libero X sta dentro X stesso: quando il blocco viene allocato, il nodo sparisce senza costi. A differenza della bitmap (dimensione fissa), la lista si restringe man mano che il disco si riempie." },

{ id: "fs13", topic: "fs",
  q: "Controllo di consistenza sui blocchi (fsck): un blocco compare con contatore 1 sia nel vettore dei blocchi in uso sia in quello dei liberi. Cosa si fa?",
  options: [
    "Si rimuove il blocco dalla lista dei liberi: i due vettori devono essere complementari",
    "Nulla: è la situazione attesa per i blocchi dei file appena creati e non ancora sincronizzati",
    "Si incrementa il contatore dell'i-node che punta al blocco, per riallineare i conteggi",
    "Si marca il blocco come danneggiato e lo si esclude dalle allocazioni future",
    "Si duplica il blocco assegnando la copia a uno dei due proprietari"
  ],
  correct: 0,
  expl: "Ogni blocco deve stare o tra gli usati o tra i liberi (vettori complementari, valori 0/1). Un blocco 'in uso E libero' rischia di essere riassegnato a un nuovo file sovrascrivendo dati: si corregge togliendolo dai liberi. La duplicazione (opzione E) è il rimedio per il caso 'blocco in uso da DUE file'." },

{ id: "fs14", topic: "fs",
  q: "fsck rileva un blocco con contatore <b>2 nel vettore dei blocchi in uso</b> (appartiene a due file). Qual è il rimedio?",
  options: [
    "Si copia il blocco su un blocco libero, assegnando la copia a uno dei due file",
    "Si cancellano entrambi i file dopo averne notificato i proprietari",
    "Si assegna il blocco al file con i-number più basso e si tronca l'altro al blocco precedente",
    "Si marca il blocco come condiviso: due file possono avere blocchi comuni se in sola lettura",
    "Si sposta il blocco nella lista dei liberi e si delega il ripristino al journaling"
  ],
  correct: 0,
  expl: "Un blocco non può avere due proprietari. Duplicandolo, la struttura torna consistente; il contenuto di uno dei file potrebbe comunque risultare corrotto (con messaggio di errore), ma si evita che le scritture di un file danneggino l'altro." },

{ id: "fs15", topic: "fs",
  q: "Con riferimento al <b>journaling</b>, individuare l'affermazione <b>falsa</b>.",
  options: [
    "Prima di eseguire una macro-operazione, le sotto-operazioni vengono annotate in un log",
    "Dopo un crash si rieseguono le operazioni del log dall'inizio, progettate per essere rieseguibili senza danni",
    "Nel journal si annotano le operazioni sui metadati",
    "Il vantaggio è controllare solo ciò che si stava modificando, senza scandire tutto il file system",
    "Il journaling elimina la necessità di scrivere i dati su disco in modo persistente"
  ],
  correct: 4,
  expl: "Il journaling non evita le scritture: le PRECEDE con l'annotazione nel log per poter recuperare la consistenza dopo un crash (ri-eseguendo le sotto-operazioni, idempotenti). ext3/ext4 e NTFS lo usano." },

{ id: "fs16", topic: "fs",
  q: "La <b>cache del disco</b> (buffer cache) gestita dal sistema operativo:",
  options: [
    "è una porzione della RAM gestita via software con lista LRU e hash; metadati a scrittura sincrona",
    "è una memoria dedicata montata sul controller del disco e gestita dal suo firmware",
    "usa l'algoritmo OPT, dato che il pattern di accesso ai blocchi è noto in anticipo",
    "contiene esclusivamente i blocchi delle directory, mentre i dati passano diretti al disco",
    "scrive in modo sincrono i dati e in modo asincrono i metadati, per privilegiare il throughput"
  ],
  correct: 0,
  expl: "L'OS usa i frame liberi della RAM come cache dei blocchi del disco: lista LRU (testa = vittima) + hash per le ricerche. La scrittura è asincrona per i dati ma SINCRONA per i metadati (perderli in un crash è troppo pericoloso) — l'opzione E è invertita." },

{ id: "fs17", topic: "fs",
  q: "Che cosa sono le ottimizzazioni <b>free-behind</b> e <b>read-ahead</b> della cache del disco?",
  options: [
    "Free-behind: il blocco appena scritto viene scartato; read-ahead: si caricano anche i blocchi adiacenti",
    "Free-behind: si caricano in anticipo i blocchi successivi; read-ahead: si scartano i blocchi appena scritti",
    "Sono i due puntatori (testa e coda) della lista LRU usata dalla cache del disco",
    "Free-behind: rilascio anticipato dei lock advisory; read-ahead: acquisizione anticipata dei lock",
    "Sono le due fasi della garbage collection delle memorie flash NAND"
  ],
  correct: 0,
  expl: "Read-ahead sfrutta la sequenzialità dei file sui dischi meccanici (i blocchi successivi serviranno probabilmente a breve). Free-behind applica il ragionamento opposto ai blocchi appena scritti: difficilmente verranno riscritti subito, meglio liberare spazio." },

{ id: "fs18", topic: "fs",
  q: "Con riferimento a <b>MBR e avvio</b> del sistema, individuare la sequenza corretta.",
  options: [
    "BIOS → MBR (bootloader) → boot block della partizione → kernel",
    "Il BIOS carica il boot block della partizione attiva, che carica l'MBR e quindi il kernel",
    "L'MBR viene eseguito dalla ROM e carica direttamente il kernel, senza passaggi intermedi",
    "Il kernel minimale nella ROM monta la partizione EFI e avvia il BIOS come processo di sistema",
    "Il BIOS esegue GRUB dalla partizione di swap, che decomprime il kernel in RAM"
  ],
  correct: 0,
  expl: "Catena di avvio storica: BIOS → MBR (bootloader generico + partition table) → boot block della partizione → kernel. Oggi si usa GPT con lo standard EFI (partizione EFI con eseguibili di avvio). GRUB è il bootloader di Linux (nel caso, sta nell'MBR)." },

{ id: "fs19", topic: "fs",
  q: "Nell'implementazione delle directory, come gestisce i nomi di lunghezza variabile la <b>prima strategia</b> vista nel corso?",
  options: [
    "Ogni voce ha una parte fissa più il nome variabile, preceduta dal campo 'file entry length'",
    "Le voci contengono solo i campi fissi più un puntatore al nome, memorizzato in un heap comune a fine directory",
    "Ogni voce ha dimensione fissa pari alla lunghezza massima consentita per un nome",
    "I nomi lunghi vengono spezzati su più voci consecutive, collegate da un flag di continuazione",
    "I nomi sono memorizzati negli i-node dei file e la directory contiene solo gli i-number"
  ],
  correct: 0,
  expl: "Prima strategia: voce = [entry length | campi fissi | nome variabile + terminatore + padding]. La SECONDA strategia è l'opzione B (heap dei nomi). Il nome non sta mai nell'i-node. Per directory enormi: hash table o caching in RAM." },

{ id: "fs20", topic: "fs",
  q: "Che cos'è un <b>extent</b>?",
  options: [
    "Un gruppo di blocchi contigui trattato come unità singola nelle strutture di allocazione",
    "Un puntatore indiretto aggiuntivo introdotto per superare il limite dei 4 TB per file",
    "L'area di riserva che ogni file mantiene per poter crescere senza frammentarsi",
    "Un gruppo di voci di directory compattate per accelerare la ricerca dei nomi",
    "La regione della partizione riservata al journal del file system"
  ],
  correct: 0,
  expl: "Con gli extent si traccia un 'gruppo di blocchi contigui' invece del singolo blocco: a parità di file, molte meno voci in lista/FAT/i-node. Usati dai file system moderni (ext4, NTFS, BTRFS)." },

{ id: "fs21", topic: "fs",
  q: "Che differenza c'è tra lock <b>mandatory</b> e lock <b>advisory</b> sui file?",
  options: [
    "Il mandatory è imposto dall'OS e non aggirabile; l'advisory è un avviso che i processi possono ignorare",
    "Il mandatory vale tra processi dello stesso utente, l'advisory tra processi di utenti diversi",
    "Il mandatory blocca solo le scritture concorrenti, l'advisory anche le letture",
    "L'advisory è imposto dal kernel, il mandatory è una convenzione cooperativa tra processi",
    "Il mandatory corrisponde al lock condiviso dei lettori, l'advisory a quello esclusivo degli scrittori"
  ],
  correct: 0,
  expl: "Mandatory = obbligatorio (l'accesso viene proprio negato dall'OS); advisory = consultivo (il rispetto è demandato alla cooperazione dei processi). I lock shared/exclusive sono un'altra classificazione e ricalcano il problema lettori/scrittori." },

{ id: "fs22", topic: "fs",
  q: "File system con allocazione a <b>lista linkata semplice</b>: blocchi da 1 KB (1024 byte) e puntatore al blocco successivo da 4 byte memorizzato in ogni blocco. Quanti blocchi servono per un file di 4090 byte?",
  options: [
    "4 blocchi, calcolati come ⌈4090/1024⌉",
    "5 blocchi: ogni blocco ha 1024−4 = 1020 byte utili e ⌈4090/1020⌉ = 5",
    "3 blocchi, perché il primo blocco non contiene il puntatore",
    "6 blocchi, considerando un blocco aggiuntivo per i metadati del file",
    "5 blocchi, calcolati come ⌈4090/1024⌉ + 1 blocco per la lista dei puntatori"
  ],
  correct: 1,
  expl: "Il puntatore ruba 4 byte: spazio utile per blocco = 1024 − 4 = 1020 byte. ⌈4090/1020⌉ = ⌈4,01⌉ = 5 blocchi. Dividere per 1024 (che darebbe 4) è l'errore tipico: è la domanda sul 'calcolo dei blocchi di una lista collegata' apparsa all'esame." },

{ id: "di01", topic: "dischi",
  q: "Perché nello scheduling del disco (meccanico) si minimizza il numero di tracce percorse?",
  options: [
    "Domina il seek-time (posizionamento della testina), proporzionale alla distanza",
    "Il costo dominante è la latenza rotazionale, proporzionale al numero di tracce attraversate",
    "Il trasferimento dei dati è l'operazione più lenta e beneficia della vicinanza tra i blocchi",
    "Il controller riordina comunque le richieste e al SO conviene solo accodarle ordinatamente",
    "Le tracce esterne del piatto sono più veloci e vanno raggiunte il prima possibile"
  ],
  correct: 0,
  expl: "Nei dischi elettromeccanici i costi di lettura/scrittura in sé sono trascurabili rispetto al seek-time, proporzionale alla distanza della testina dal cilindro richiesto. Gli algoritmi di scheduling ordinano le richieste per minimizzare il cammino." },

{ id: "di02", topic: "dischi",
  q: "Coda richieste: 98, 183, 37, 122, 14, 124, 65, 67 con testina a 53. Quante tracce percorre <b>FCFS</b>?",
  options: [
    "640",
    "236",
    "299",
    "532",
    "708"
  ],
  correct: 0,
  expl: "FCFS serve in ordine di arrivo: |53−98|+|98−183|+|183−37|+|37−122|+|122−14|+|14−124|+|124−65|+|65−67| = 45+85+146+85+108+110+59+2 = 640. È l'esempio classico del corso." },

{ id: "di03", topic: "dischi",
  q: "Stessa coda (98, 183, 37, 122, 14, 124, 65, 67), testina a 53: con <b>SSTF</b> qual è la prima richiesta servita e quante tracce si percorrono in totale?",
  options: [
    "Prima 65; totale 236 tracce",
    "Prima 37; totale 299 tracce",
    "Prima 98; totale 380 tracce",
    "Prima 67; totale 208 tracce",
    "Prima 65; totale 322 tracce"
  ],
  correct: 0,
  expl: "SSTF sceglie sempre la richiesta più vicina: 53→65(12)→67(2)→37(30)→14(23)→98(84)→122(24)→124(2)→183(59) = 236 tracce. Ottimo per il seek-time ma rischia la starvation delle richieste lontane." },

{ id: "di04", topic: "dischi",
  q: "Qual è il problema principale dell'algoritmo <b>SSTF</b>?",
  options: [
    "La starvation: con richieste sempre vicine alla testina, quelle lontane attendono indefinitamente",
    "Il numero di tracce percorse, sistematicamente superiore a quello di FCFS nei carichi reali",
    "La necessità di conoscere in anticipo l'ordine di arrivo delle richieste future",
    "L'oscillazione continua della testina tra i due estremi del disco",
    "Il costo computazionale della ricerca della richiesta più vicina, che cresce con la coda"
  ],
  correct: 0,
  expl: "SSTF non è equo: privilegia sistematicamente le richieste vicine, e quelle lontane non hanno garanzie ('starvation'). SCAN/LOOK risolvono dando una direzione alla testina, garantendo un'attesa massima a ogni richiesta." },

{ id: "di05", topic: "dischi",
  q: "Come funziona l'algoritmo dell'<b>ascensore</b> (scansione)?",
  options: [
    "La testina viaggia in una direzione servendo ciò che incontra; poi inverte e serve il resto",
    "La testina serve sempre la richiesta più vicina alla sua posizione corrente",
    "La testina serve le richieste in un solo verso e ritorna all'inizio senza servirne alcuna",
    "La testina alterna una richiesta nella metà bassa e una nella metà alta del disco",
    "Le richieste vengono servite nell'ordine di arrivo, come in una coda FIFO"
  ],
  correct: 0,
  expl: "Come un ascensore: un verso alla volta, garantendo un'attesa massima ad ogni richiesta. NOTA per il compito: per come indicato nel corso, la testina inverte il verso dopo aver servito l'ULTIMA richiesta in quella direzione (comportamento LOOK). L'opzione C descrive la scansione circolare." },

{ id: "di06", topic: "dischi",
  q: "Qual è la differenza tra <b>SCAN</b> e <b>C-SCAN</b> (scansione circolare)?",
  options: [
    "In C-SCAN la testina serve in un solo verso: in fondo torna all'inizio senza servire nulla",
    "In C-SCAN la testina serve le richieste in entrambi i versi, ma inverte solo agli estremi fisici",
    "In SCAN la testina non inverte mai il verso; in C-SCAN inverte ad ogni richiesta servita",
    "C-SCAN è la versione di SCAN che serve per prima la richiesta più vicina alla testina",
    "C-SCAN differisce da SCAN solo perché inverte il verso all'ultima richiesta anziché all'estremo"
  ],
  correct: 0,
  expl: "C-SCAN mantiene sempre lo stesso verso: al ritorno ignora tutte le richieste. Vantaggio: attese medie più uniformi ad alto carico (le richieste 'vecchie', in media lontane, vengono raggiunte prima). A basso carico meglio SCAN o SSTF. L'opzione E descrive LOOK." },

{ id: "di07", topic: "dischi",
  q: "Differenza tra <b>SCAN</b> e <b>LOOK</b> (convenzione da manuale):",
  options: [
    "SCAN arriva all'estremo fisico del disco prima di invertire; LOOK inverte dopo l'ultima richiesta",
    "LOOK arriva fisicamente all'estremo del disco; SCAN inverte non appena servita l'ultima richiesta pendente",
    "SCAN serve le richieste in entrambi i versi; LOOK in uno solo, con salto al ritorno",
    "LOOK riordina le richieste per distanza; SCAN le mantiene in ordine di arrivo",
    "SCAN richiede di conoscere il numero totale di tracce; LOOK anche i tempi di arrivo"
  ],
  correct: 0,
  expl: "LOOK 'guarda' se ci sono ancora richieste nel verso corrente: se no, inverte subito. Nel compito del corso è la convenzione indicata anche per la scansione (vedi nota delle slide): la testina cambia verso dopo l'ultima richiesta servita in quel verso." },

{ id: "di08", topic: "dischi",
  q: "Coda: 82, 170, 43, 140, 24, 16, 190. Testina a 50, direzione ascendente, algoritmo <b>LOOK</b>. Qual è la sequenza servita e la distanza totale?",
  options: [
    "50→82→140→170→190 poi 43→24→16; distanza (190−50)+(190−16) = 314 tracce",
    "50→43→24→16 poi 82→140→170→190; distanza (50−16)+(190−16) = 208 tracce",
    "50→82→140→170→190→199 poi 43→24→16; distanza (199−50)+(199−16) = 332 tracce",
    "50→82→140→170→190 poi salto a 16→24→43; distanza 140+174+27 = 341 tracce",
    "50→82→140→170→190 poi 43→24→16; distanza (190−50)+(50−16) = 174 tracce"
  ],
  correct: 0,
  expl: "LOOK ascendente: serve 82,140,170,190 (fino all'ULTIMA richiesta in alto, NON fino a 199), poi inverte e serve 43,24,16. Distanza = (190−50) + (190−16) = 140+174 = 314. L'opzione C è SCAN (estremo fisico), la D è C-LOOK (salto)." },

{ id: "di09", topic: "dischi",
  q: "Con riferimento al <b>RAID 0</b> (striping), individuare l'affermazione <b>falsa</b>.",
  options: [
    "Il file system viene diviso in stripe distribuiti sui dischi in Round-Robin",
    "Le prestazioni di lettura/scrittura possono moltiplicarsi per il numero di dischi",
    "Non c'è alcuna ridondanza",
    "Se si rompe un solo disco si perde l'intero volume logico",
    "La capacità utile è la metà della capacità totale dei dischi"
  ],
  correct: 4,
  expl: "In RAID 0 TUTTA la capacità è utile (niente ridondanza): con 4 dischi da 1 TB → 4 TB. La capacità dimezzata è del RAID 1 (mirroring). Contropartita del RAID 0: la probabilità di perdere il volume cresce col numero di dischi." },

{ id: "di10", topic: "dischi",
  q: "Con riferimento al <b>RAID 1</b> (mirroring), individuare l'affermazione <b>corretta</b>.",
  options: [
    "Ogni stripe è duplicato su un disco 'copia': un guasto tollerato, ma dischi raddoppiati",
    "Usa striping a livello di bit con il codice di Hamming per correggere gli errori",
    "Aggiunge un disco dedicato alla parità, calcolata con lo XOR degli stripe",
    "Distribuisce le informazioni di parità su tutti i dischi per bilanciare il carico",
    "Duplica soltanto i metadati del file system, mentre i dati restano in copia singola"
  ],
  correct: 0,
  expl: "RAID 1 = duplicazione integrale. Guasto di un disco → si continua con la copia (stato degradato); il disco sostituito viene ricostruito copiando. Costo: 50% della capacità. Le opzioni B, C, D descrivono RAID 2, RAID 3/4 e RAID 5." },

{ id: "di11", topic: "dischi",
  q: "Quale ridondanza usa il <b>RAID 2</b> e qual è il suo limite principale?",
  options: [
    "Hamming su striping a livello di bit: corregge un bit ma esige dischi in perfetto sincronismo",
    "Bit di parità singolo con striping a livello di bit: corregge qualsiasi errore senza vincoli di sincronia",
    "XOR a livello di blocchi su un disco dedicato: il limite è il collo di bottiglia del disco di parità",
    "Mirroring completo dei dischi: il limite è il costo doppio dell'hardware",
    "Parità distribuite su tutti i dischi: il limite è la complessità della ricostruzione"
  ],
  correct: 0,
  expl: "RAID 2: striping a livello di bit + ECC di Hamming (es. 4 bit dati + 3 di ridondanza = 7 dischi). Se si rompe il disco i, si corregge l'i-esimo bit di ogni codeword. Il sincronismo richiesto tra i dischi è il suo tallone d'Achille. Le altre opzioni descrivono RAID 3, RAID 4, RAID 1 e RAID 5." },

{ id: "di12", topic: "dischi",
  q: "Con riferimento al <b>RAID 4</b>, individuare l'affermazione <b>falsa</b>.",
  options: [
    "Usa striping a livello di stripe/blocchi, non di bit",
    "La ridondanza è lo XOR degli stripe della stessa 'riga', su un disco dedicato",
    "Ad ogni scrittura va aggiornato anche il blocco di parità",
    "Il disco delle parità lavora più degli altri e tende a rompersi prima",
    "Richiede il sincronismo perfetto dei dischi, come RAID 2 e RAID 3"
  ],
  correct: 4,
  expl: "Proprio perché lo striping è a livello di blocchi (stripe) e non di bit, RAID 4 NON richiede il sincronismo. Il suo difetto è il collo di bottiglia del disco di parità: ogni scrittura lo coinvolge. RAID 5 lo risolve distribuendo le parità." },

{ id: "di13", topic: "dischi",
  q: "In un RAID 5 con n dischi di capacità S ciascuno, qual è la capacità utile?",
  options: [
    "(n − 1) · S",
    "n · S",
    "n · S / 2",
    "(n − 2) · S",
    "n · (S − 1)"
  ],
  correct: 0,
  expl: "Le informazioni di parità (distribuite su tutti i dischi) occupano l'equivalente di un disco: capacità utile = (n−1)·S. Es. 5 dischi da 2 TB → 8 TB utili. (Domanda apparsa all'esame!)" },

{ id: "di14", topic: "dischi",
  q: "RAID 5: sulla stessa 'riga' i dischi contengono gli stripe D1 = 1011, D2 = 0110, D3 = 1100 e la parità P = XOR degli stripe. Il disco 2 si guasta: come si ricostruisce D2?",
  options: [
    "D2 = D1 ⊕ D3 ⊕ P: lo XOR di tutti gli stripe superstiti della riga, parità inclusa",
    "D2 = D1 ⊕ D3: lo XOR dei soli stripe dati superstiti, senza usare la parità",
    "D2 = NOT(D1 ⊕ D3): il complemento dello XOR degli stripe superstiti",
    "D2 = P ⊕ 1111: la parità invertita bit a bit rispetto alla maschera unitaria",
    "D2 = (D1 AND D3) OR P: la combinazione logica degli stripe con la parità"
  ],
  correct: 0,
  expl: "P = D1⊕D2⊕D3, quindi D2 = D1⊕D3⊕P. Con i valori: P = 1011⊕0110⊕1100 = 0001; D2 = 1011⊕1100⊕0001 = 0110 ✓. La proprietà dello XOR (a⊕a=0) rende la ricostruzione possibile qualunque sia il disco perso." },

{ id: "di15", topic: "dischi",
  q: "Qual è il vantaggio del RAID 5 rispetto al RAID 4?",
  options: [
    "Le parità sono distribuite su tutti i dischi: sparisce il collo di bottiglia del disco di parità",
    "Aggiunge un secondo disco di parità, tollerando il guasto di due dischi contemporaneamente",
    "Dimezza il numero di scritture necessarie per aggiornare la parità ad ogni modifica",
    "Passa allo striping a livello di bit, più leggero per l'hardware del controller",
    "Sostituisce lo XOR con il codice di Hamming, correggendo anche gli errori silenziosi"
  ],
  correct: 0,
  expl: "Stesso numero di dischi e stessa capacità utile di RAID 4, ma parità 'spalmate': nessun disco lavora più degli altri e tutti memorizzano anche dati (prestazioni ×n). Di fatto RAID 5 sostituisce RAID 4. Il doppio disco di parità è il RAID 6 (fuori programma)." },

{ id: "di16", topic: "dischi",
  q: "Con riferimento agli <b>SSD</b>, individuare l'affermazione <b>falsa</b>.",
  options: [
    "Sono basati su memorie flash NAND",
    "Le scritture sono più lente delle letture e il numero di scritture per cella è limitato",
    "Una pagina flash non può essere sovrascritta senza prima cancellare l'intero blocco flash",
    "Il seek-time è nullo perché non c'è alcuna testina",
    "Le singole pagine flash possono essere cancellate individualmente all'occorrenza"
  ],
  correct: 4,
  expl: "La cancellazione avviene solo per interi blocchi flash: è per questo che servono garbage collection e TRIM. Le pagine 'sporche' vengono marcate non valide e recuperate solo quando si cancella tutto il blocco." },

{ id: "di17", topic: "dischi",
  q: "A cosa serve il comando <b>TRIM</b> negli SSD?",
  options: [
    "Permette al garbage collector di ignorare le pagine non valide, senza ricopiarle",
    "Riorganizza le pagine valide in blocchi contigui per velocizzare le letture sequenziali",
    "Verifica l'usura delle celle e rimappa quelle esaurite su celle di riserva",
    "Azzera immediatamente le celle appena liberate, per motivi di sicurezza",
    "Comprime le pagine usate raramente per aumentare la capacità effettiva del disco"
  ],
  correct: 0,
  expl: "Durante la garbage collection si ricopiano solo le pagine valide nel nuovo blocco; grazie a TRIM le pagine marcate 'spazzatura' vengono ignorate. Si riducono le scritture (che degradano le celle NAND) e migliorano le prestazioni." },

{ id: "di18", topic: "dischi",
  q: "Un disco ha 200 tracce (0-199), velocità di seek 1 traccia/ms. La testina è sulla traccia 100 e la coda contiene (50, 115, 180). LOOK in ordine ascendente, nessuna nuova richiesta: qual è il tempo di ricerca complessivo?",
  options: [
    "80 + 130 = 210 ms",
    "(199−100) + (199−50) = 248 ms",
    "15 + 65 + 130 + 30 = 240 ms",
    "50 + 65 + 15 = 130 ms",
    "80 + 180 = 260 ms"
  ],
  correct: 0,
  expl: "Ascendente: 100→115 (15) →180 (65): 80 ms. Poi inversione (LOOK: senza toccare la traccia 199): 180→50 (130). Totale 210 ms = 210 tracce a 1 ms/traccia. Sequenza: 115, 180, 50." },

{ id: "di19", topic: "dischi",
  q: "Perché conviene che la dimensione della pagina di memoria virtuale sia un multiplo della dimensione del blocco del disco?",
  options: [
    "Per non dover mai leggere o scrivere blocchi parziali durante il paging",
    "Per permettere alla FAT di indicizzare direttamente le pagine dell'area di swap",
    "Per allineare le pagine ai cilindri del disco, azzerando la latenza rotazionale",
    "Perché la MMU può tradurre soltanto indirizzi multipli della dimensione del blocco",
    "Per far coincidere il numero di voci del TLB con quello della cache del disco"
  ],
  correct: 0,
  expl: "Il trasferimento delle pagine da/verso l'area di swap avviene per blocchi: se la pagina è un multiplo esatto del blocco, le operazioni sono allineate ed efficienti (mai letture parziali)." },

{ id: "di20", topic: "dischi",
  q: "Con riferimento alla geometria di un disco meccanico, individuare l'affermazione <b>corretta</b>.",
  options: [
    "Le tracce alla stessa posizione del braccio, sovrapposte sui piatti, formano un cilindro",
    "Ogni piatto è diviso in settori radiali che attraversano tutte le tracce dello stesso lato",
    "Il cilindro è la regione anulare di un singolo piatto letta da una testina",
    "I processi vedono direttamente la geometria fisica: piatto, traccia e settore",
    "Il numero di tracce per piatto coincide sempre con il numero di settori per traccia"
  ],
  correct: 0,
  expl: "Geometria: piatti → tracce (anelli) → settori (spicchi); cilindro = insieme delle tracce alla stessa posizione del braccio su tutti i piatti. Il SO nasconde tutto: presenta ai processi uno spazio di blocchi linearizzato (un'altra astrazione)." }
);
