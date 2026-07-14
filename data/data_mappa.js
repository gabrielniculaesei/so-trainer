/* MAPPA MENTALE — albero dei concetti del corso.
   Nodo: { id, label, topic?, desc?, tip?, sim?, children? }
   - topic  : chiave di window.TOPICS (se assente si eredita dal padre)
   - desc   : HTML, la spiegazione che compare nel pannello
   - tip    : nota "all'esame" (trabocchetti ricorrenti)
   - sim    : id di una simulazione in window.SIMS, da aprire dal pannello  */
window.MAPPA = {
  id: "root",
  label: "Sistemi Operativi",
  desc: `<p>Il programma di teoria in un colpo d'occhio: quattro capitoli, dal ruolo del sistema operativo fino ai dischi.</p>
    <ul>
      <li><b>1 · Introduzione e struttura</b> — cosa fa un SO, come dialoga con l'hardware, com'è costruito.</li>
      <li><b>2 · Processi</b> — processi e thread, mutua esclusione, scheduling della CPU.</li>
      <li><b>3 · Memoria</b> — dallo spazio degli indirizzi alla memoria virtuale e alla sostituzione delle pagine.</li>
      <li><b>4 · File system e dischi</b> — come i dati vengono organizzati e come arrivano davvero sul disco.</li>
    </ul>
    <p>Clicca un ramo per aprirlo, un nodo per leggerne la spiegazione. Segna come <b>ripassato</b> ciò che sai già: la barra in alto misura quanto manca.</p>`,
  children: [

    /* ============================ CAPITOLO 1 ============================ */
    {
      id: "c1", label: "1 · Introduzione e struttura", topic: "intro",
      desc: `<p>Il sistema operativo è lo strato di software che sta fra l'hardware nudo e i programmi. Da qui nascono tutte le domande "di apertura" dell'orale.</p>
        <ul><li>Le sue <b>due facce</b>: macchina estesa e gestore di risorse.</li>
        <li>Il <b>meccanismo</b> con cui è protetto: doppia modalità di esecuzione e system call.</li>
        <li>Le <b>architetture</b> con cui lo si costruisce: da monolitico a microkernel, fino alla virtualizzazione.</li></ul>`,
      children: [
        {
          id: "c1-ruolo", label: "Ruolo del sistema operativo",
          desc: `<p>Un SO va guardato da due punti di vista complementari: <b>dall'alto</b> (cosa offre ai programmi) e <b>dal basso</b> (cosa amministra).</p>`,
          children: [
            {
              id: "c1-macchina", label: "Macchina estesa",
              desc: `<p>Vista <b>dall'alto</b>: il SO nasconde l'hardware dietro astrazioni pulite. Il programmatore scrive su un <i>file</i>, non su tracce e settori; usa un <i>processo</i>, non registri della CPU.</p>
                <ul><li>Astrazioni tipiche: processo, spazio degli indirizzi, file, socket.</li>
                <li>Obiettivo: interfaccia comoda, uniforme, portabile.</li></ul>`
            },
            {
              id: "c1-gestore", label: "Gestore di risorse",
              desc: `<p>Vista <b>dal basso</b>: CPU, memoria e dispositivi sono risorse contese da più programmi. Il SO le assegna in modo ordinato ed equo, e protegge ciascun processo dagli altri.</p>
                <ul><li>Multiplazione nel <b>tempo</b> (la CPU a turno) e nello <b>spazio</b> (la memoria divisa).</li>
                <li>Deve garantire protezione: nessun processo può leggere o rovinare la memoria altrui.</li></ul>`
            }
          ]
        },
        {
          id: "c1-hw", label: "L'hardware sotto il SO",
          desc: `<p>Le scelte del SO si spiegano quasi sempre con un vincolo hardware: la CPU è velocissima, i dischi sono lentissimi, la memoria costa.</p>`,
          children: [
            {
              id: "c1-ciclo", label: "Ciclo fetch–decode–execute", sim: "sim_cpu_cycle",
              desc: `<p>La CPU ripete all'infinito: <b>preleva</b> l'istruzione indirizzata dal Program Counter, la <b>decodifica</b>, la <b>esegue</b>, incrementa il PC.</p>
                <ul><li>Il <b>PC</b> dice qual è la prossima istruzione; salvarlo e ripristinarlo è il cuore del context switch.</li>
                <li>Registri e PSW fanno parte del <i>contesto</i> del processo.</li></ul>`
            },
            {
              id: "c1-interrupt", label: "Interrupt, polling e DMA",
              desc: `<p>Un dispositivo I/O avvisa la CPU di aver finito con un <b>interrupt</b>: la CPU sospende ciò che sta facendo, salva il contesto e salta alla routine di servizio.</p>
                <ul><li><b>Polling</b> (attesa attiva): la CPU interroga ciclicamente il dispositivo — semplice ma spreca cicli.</li>
                <li><b>Interrupt</b>: il dispositivo chiama la CPU solo quando serve.</li>
                <li><b>DMA</b>: il controller trasferisce i dati in memoria da solo e lancia <i>un solo</i> interrupt alla fine, liberando la CPU dal trasferimento byte per byte.</li></ul>`,
              tip: `Il DMA non elimina l'interrupt: lo riduce a uno solo, a trasferimento completato.`
            },
            {
              id: "c1-gerarchia", label: "Gerarchia di memoria",
              desc: `<p>Dall'alto verso il basso: <b>registri → cache → memoria centrale → disco/SSD → nastro</b>. Scendendo, la capacità cresce e il costo per byte scende, ma il tempo di accesso peggiora di ordini di grandezza.</p>
                <ul><li>Regge grazie al <b>principio di località</b>: i programmi riusano di continuo poche zone di memoria.</li>
                <li>È la stessa idea che rende utili la cache, il TLB e la memoria virtuale.</li></ul>`
            }
          ]
        },
        {
          id: "c1-modo", label: "Modalità di esecuzione",
          desc: `<p>Il SO deve poter fare tutto, i programmi utente no. La separazione è imposta dall'hardware con un bit di modo nella PSW.</p>`,
          children: [
            {
              id: "c1-kernel", label: "Kernel mode e user mode",
              desc: `<p>In <b>modalità kernel</b> la CPU esegue l'intero set di istruzioni e accede a tutto l'hardware. In <b>modalità utente</b> è disponibile solo un sottoinsieme: niente I/O diretto, niente gestione degli interrupt, niente accesso alla memoria altrui.</p>
                <ul><li>Le istruzioni <b>privilegiate</b> eseguite in modalità utente causano una trap.</li>
                <li>Il passaggio a kernel avviene solo per vie controllate: system call, interrupt, eccezioni.</li></ul>`,
              tip: `Domanda classica: "in modalità utente il processo può disabilitare gli interrupt?" No — è un'istruzione privilegiata.`
            },
            {
              id: "c1-syscall", label: "System call e trap", sim: "sim_syscall",
              desc: `<p>La <b>system call</b> è la porta d'ingresso al kernel: il programma mette in un registro il numero della chiamata, esegue una <b>trap</b> (interrupt software), la CPU passa in modalità kernel e salta al gestore, che consulta la tabella delle system call.</p>
                <ul><li>Al termine si torna in modalità utente con l'istruzione successiva alla trap.</li>
                <li>Esempi UNIX: <code>fork</code>, <code>exec</code>, <code>open</code>, <code>read</code>, <code>write</code>, <code>waitpid</code>.</li>
                <li>La chiamata di libreria (es. <code>printf</code>) <i>non</i> è la system call: la incapsula.</li></ul>`,
              tip: `Trap = interrupt <b>sincrono</b>, provocato dal programma stesso. L'interrupt di I/O è invece asincrono.`
            },
            {
              id: "c1-protezione", label: "Protezione e privilegi",
              desc: `<p>La protezione poggia su tre appoggi hardware: <b>bit di modo</b>, <b>MMU</b> (nessun processo esce dal proprio spazio degli indirizzi) e <b>timer</b> (nessun processo tiene la CPU per sempre).</p>`
            }
          ]
        },
        {
          id: "c1-storia", label: "Evoluzione dei sistemi",
          desc: `<p>Ogni generazione risolve lo spreco lasciato dalla precedente: prima la CPU ferma, poi la CPU che aspetta l'I/O, infine l'utente che aspetta il computer.</p>`,
          children: [
            {
              id: "c1-batch", label: "Batch e spooling",
              desc: `<p><b>Batch</b>: i lavori vengono raccolti in lotti ed eseguiti uno dopo l'altro, senza interazione. Lo <b>spooling</b> usa il disco come buffer (es. per la stampa), così l'I/O di un lavoro si sovrappone al calcolo di un altro.</p>`
            },
            {
              id: "c1-multiprog", label: "Multiprogrammazione",
              desc: `<p>Più lavori stanno in memoria contemporaneamente: quando uno si blocca per I/O, la CPU passa a un altro. Nasce qui il bisogno di <b>scheduling</b>, <b>protezione</b> della memoria e <b>rilocazione</b>.</p>
                <ul><li>Con <i>n</i> processi in memoria e frazione <i>p</i> di tempo in attesa di I/O, l'uso della CPU vale circa <b>1 − p<sup>n</sup></b>.</li></ul>`
            },
            {
              id: "c1-timesharing", label: "Time-sharing",
              desc: `<p>Multiprogrammazione + <b>quanto di tempo</b>: la CPU ruota fra i processi abbastanza in fretta da dare a ogni utente l'illusione di avere la macchina tutta per sé. L'obiettivo cambia: non più il throughput, ma il <b>tempo di risposta</b>.</p>`
            }
          ]
        },
        {
          id: "c1-strutture", label: "Strutture del SO", topic: "struttura",
          desc: `<p>Come si organizza internamente il kernel. Il compromesso è sempre lo stesso: <b>prestazioni</b> (tutto nello stesso spazio) contro <b>robustezza e modularità</b> (componenti isolati).</p>`,
          children: [
            {
              id: "c1-monolitico", label: "Sistema monolitico",
              desc: `<p>Tutto il SO è un unico programma in modalità kernel: ogni procedura può chiamare qualunque altra. È il modello di UNIX e Linux.</p>
                <ul><li><b>Pro</b>: velocissimo, nessun passaggio di contesto interno.</li>
                <li><b>Contro</b>: un bug in un driver può far crollare l'intero sistema.</li></ul>`
            },
            {
              id: "c1-livelli", label: "Sistema a livelli",
              desc: `<p>Il SO è una pila di strati, ognuno dei quali usa solo i servizi del livello sottostante (THE di Dijkstra). Ordinato e verificabile, ma è difficile decidere dove tagliare i livelli e ogni attraversamento costa.</p>`
            },
            {
              id: "c1-microkernel", label: "Microkernel",
              desc: `<p>Nel kernel resta il minimo indispensabile (scambio di messaggi, scheduling di base, gestione dell'MMU); driver, file system e gestione della memoria diventano <b>processi utente</b>.</p>
                <ul><li><b>Pro</b>: alta affidabilità — un driver che crolla è un processo che crolla, e si può far ripartire.</li>
                <li><b>Contro</b>: più passaggi kernel↔utente, quindi overhead di messaggi.</li></ul>`
            },
            {
              id: "c1-clientserver", label: "Modello client-server",
              desc: `<p>Generalizzazione del microkernel: i processi <b>client</b> chiedono servizi ai processi <b>server</b> tramite messaggi. Il kernel si limita a consegnare i messaggi — e i due lati possono stare su macchine diverse (sistemi distribuiti).</p>`
            },
            {
              id: "c1-moduli", label: "Moduli caricabili",
              desc: `<p>Compromesso usato dai sistemi reali: nucleo monolitico + <b>moduli</b> (driver, file system) caricabili e scaricabili a caldo. Prestazioni del monolitico con parte della flessibilità del microkernel.</p>`
            }
          ]
        },
        {
          id: "c1-vm", label: "Macchine virtuali", topic: "struttura",
          desc: `<p>L'<b>hypervisor</b> (o VMM) presenta a ogni ospite l'illusione di una macchina fisica completa, con le sue modalità kernel/utente. Un SO ospite gira così senza modifiche, isolato dagli altri.</p>`,
          children: [
            {
              id: "c1-tipo1", label: "Hypervisor di tipo 1",
              desc: `<p>Gira <b>direttamente sull'hardware</b>, al posto del SO: è lui il vero kernel. Ogni SO ospite crede di essere in modalità kernel, ma esegue in modalità utente; le sue istruzioni privilegiate causano trap che l'hypervisor emula (<i>trap-and-emulate</i>).</p>
                <ul><li>Massime prestazioni: è il modello dei server e del cloud.</li></ul>`
            },
            {
              id: "c1-tipo2", label: "Hypervisor di tipo 2",
              desc: `<p>Gira come <b>normale applicazione</b> sopra un SO ospitante (VirtualBox, VMware Workstation). Più comodo da installare, più lento perché ogni accesso all'hardware passa dal SO sottostante.</p>`
            },
            {
              id: "c1-paravirt", label: "Paravirtualizzazione",
              desc: `<p>Il SO ospite viene <b>modificato</b>: al posto delle istruzioni privilegiate esegue chiamate esplicite all'hypervisor (<b>hypercall</b>). Si perde la compatibilità binaria, si guadagna in efficienza (niente emulazione a colpi di trap).</p>`
            },
            {
              id: "c1-container", label: "Container",
              desc: `<p>Virtualizzazione <b>a livello di SO</b>: un solo kernel, tanti spazi utente isolati. Non c'è un SO ospite da avviare, quindi partono in un istante e pesano poco — ma tutti condividono lo stesso kernel.</p>`,
              tip: `Distinzione da tenere pronta: la macchina virtuale virtualizza l'<b>hardware</b>, il container virtualizza il <b>sistema operativo</b>.`
            }
          ]
        }
      ]
    },

    /* ============================ CAPITOLO 2 ============================ */
    {
      id: "c2", label: "2 · Processi e scheduling", topic: "processi",
      desc: `<p>Il capitolo più pesante dell'esame: il processo come astrazione, la mutua esclusione e gli algoritmi di scheduling.</p>
        <ul><li><b>Processi e thread</b> — chi esegue, e con quale contesto.</li>
        <li><b>Sincronizzazione</b> — come si evitano le race condition (semafori, monitor).</li>
        <li><b>Scheduling</b> — chi va in esecuzione e per quanto.</li></ul>`,
      children: [
        {
          id: "c2-proc", label: "Il processo",
          desc: `<p>Un processo è un <b>programma in esecuzione</b>: il codice più il suo contesto (registri, PC, stack, spazio degli indirizzi, file aperti). Il programma è statico, il processo è vivo.</p>`,
          children: [
            {
              id: "c2-modello", label: "Modello a processi",
              desc: `<p>Astrazione: ogni processo ha la sua CPU virtuale. In realtà la CPU è una sola e commuta rapidamente fra i processi (<b>pseudo-parallelismo</b>): la velocità di avanzamento di un processo non è riproducibile, ma la sua correttezza non deve dipenderne.</p>`
            },
            {
              id: "c2-pcb", label: "PCB e context switch",
              desc: `<p>Il <b>PCB</b> (Process Control Block) è la scheda del processo nella tabella dei processi: PID, stato, PC e registri salvati, puntatori alla mappa di memoria, file aperti, informazioni di accounting.</p>
                <p>Il <b>context switch</b> salva il contesto del processo uscente nel suo PCB e ricarica quello dell'entrante.</p>
                <ul><li>È <b>puro overhead</b>: passaggio in modalità kernel, salvataggio dei registri, cambio della mappa di memoria, aggiornamento dell'MMU, invalidazione della cache (e del TLB).</li></ul>`,
              tip: `Non è "lavoro utile": più context switch = meno efficienza. È l'argomento con cui si giustifica un quanto non troppo piccolo.`
            },
            {
              id: "c2-stati", label: "Stati del processo", sim: "sim_pstati",
              desc: `<p>Tre stati fondamentali e quattro transizioni:</p>
                <ul><li><b>esecuzione → pronto</b>: revoca della CPU (fine quanto), decisa dallo scheduler.</li>
                <li><b>esecuzione → bloccato</b>: il processo si ferma da solo, in attesa di un evento (I/O, semaforo).</li>
                <li><b>bloccato → pronto</b>: l'evento è arrivato.</li>
                <li><b>pronto → esecuzione</b>: dispatch dello scheduler.</li></ul>`,
              tip: `Non esiste <b>bloccato → esecuzione</b>: un processo che si sblocca passa sempre per la coda dei pronti. E non esiste <b>pronto → bloccato</b>.`
            },
            {
              id: "c2-fork", label: "Creazione e terminazione",
              desc: `<p>In UNIX <code>fork</code> crea un figlio <b>clone</b> del padre (stessa immagine, PID diverso; ritorna 0 al figlio e il PID del figlio al padre); poi tipicamente il figlio esegue <code>exec</code> per sostituire la propria immagine con un nuovo programma.</p>
                <ul><li>Uscita: <code>exit</code> volontaria, oppure errore fatale, oppure uccisione (<code>kill</code>).</li>
                <li>UNIX organizza i processi in una <b>gerarchia</b> ad albero; Windows no, tutti i processi sono pari.</li></ul>`
            }
          ]
        },
        {
          id: "c2-thread", label: "Thread",
          desc: `<p>Un thread è un flusso di esecuzione dentro un processo: ha <b>PC, registri e stack propri</b>, ma <b>condivide</b> con gli altri thread dello stesso processo lo spazio degli indirizzi, i file aperti e i dati globali.</p>`,
          children: [
            {
              id: "c2-perche-thread", label: "Perché i thread",
              desc: `<p>Sono processi "leggeri": creazione e commutazione costano molto meno (non si cambia mappa di memoria) e permettono parallelismo con condivisione naturale dei dati.</p>
                <ul><li>Utili quando l'applicazione alterna calcolo e attese di I/O (server web, editor).</li>
                <li>Rovescio della medaglia: condividendo tutto, servono <b>sincronizzazione</b> e disciplina — non c'è protezione fra thread.</li></ul>`
            },
            {
              id: "c2-thread-utente", label: "Thread a livello utente",
              desc: `<p>Gestiti da una libreria in spazio utente: il kernel <b>non li vede</b>, vede solo il processo.</p>
                <ul><li><b>Pro</b>: commutazione velocissima (poche istruzioni, niente trap), schedulazione personalizzabile, funzionano anche su kernel che non li supportano.</li>
                <li><b>Contro</b>: una <b>chiamata bloccante</b> di un thread blocca l'<i>intero processo</i>; non c'è interrupt del clock interno, quindi un thread che non cede non viene mai prelazionato; niente parallelismo reale su più core.</li></ul>`
            },
            {
              id: "c2-thread-kernel", label: "Thread a livello kernel",
              desc: `<p>Il kernel conosce e schedula i singoli thread.</p>
                <ul><li><b>Pro</b>: se un thread si blocca, gli altri del processo proseguono; parallelismo vero su multiprocessore.</li>
                <li><b>Contro</b>: ogni operazione sui thread è una system call, quindi molto più costosa.</li></ul>`
            },
            {
              id: "c2-thread-ibridi", label: "Modelli ibridi",
              desc: `<p>Si multiplano <i>m</i> thread utente su <i>n</i> thread kernel, cercando di ottenere la velocità dei primi e la robustezza dei secondi. La complessità di gestione è il prezzo.</p>`
            }
          ]
        },
        {
          id: "c2-ipc", label: "Il problema della corsa critica", topic: "sync",
          desc: `<p>Quando più processi/thread accedono a dati condivisi, il risultato può dipendere dall'ordine di esecuzione. Da qui nasce tutta la sincronizzazione.</p>`,
          children: [
            {
              id: "c2-race", label: "Race condition",
              desc: `<p>Due o più processi leggono e scrivono dati condivisi e il risultato finale <b>dipende da chi arriva primo</b>. Esempio classico: due processi leggono <code>in = 7</code> dallo spooler, entrambi ci scrivono il proprio file, uno dei due lavori sparisce.</p>
                <p>Il bug è intermittente e dipende dal timing: per questo va prevenuto per costruzione, non con i test.</p>`
            },
            {
              id: "c2-sc", label: "Sezione critica",
              desc: `<p>La <b>sezione critica</b> è la porzione di codice che accede alla risorsa condivisa. Serve garantire che <b>un solo</b> processo alla volta si trovi nella propria sezione critica: <b>mutua esclusione</b>.</p>`
            },
            {
              id: "c2-4cond", label: "Le quattro condizioni",
              desc: `<p>Una buona soluzione al problema della sezione critica deve soddisfare tutte e quattro:</p>
                <ol><li>Mai due processi contemporaneamente dentro la sezione critica.</li>
                <li>Nessuna ipotesi su <b>velocità</b> o numero delle CPU.</li>
                <li>Un processo fuori dalla propria sezione critica <b>non deve bloccare</b> gli altri.</li>
                <li>Nessun processo deve attendere <b>indefinitamente</b> per entrare (niente starvation).</li></ol>`,
              tip: `Le condizioni 3 e 4 sono quelle che fanno cadere le soluzioni ingenue: sono il metro con cui si bocciano alternanza stretta &amp; co.`
            }
          ]
        },
        {
          id: "c2-mutex-sol", label: "Soluzioni alla mutua esclusione", topic: "sync",
          desc: `<p>Le si esamina in ordine storico: ognuna ripara un difetto della precedente. All'orale conviene raccontarle proprio come una scala.</p>`,
          children: [
            {
              id: "c2-disint", label: "Disabilitare gli interrupt",
              desc: `<p>Il processo disabilita gli interrupt entrando nella sezione critica e li riabilita uscendo: senza interrupt del clock, nessuna commutazione.</p>
                <ul><li>È istruzione <b>privilegiata</b>: darla ai processi utente è pericolosissimo (se dimentica di riabilitarli, il sistema è morto).</li>
                <li>Su <b>multiprocessore</b> non funziona: disabilita gli interrupt di una sola CPU.</li>
                <li>Resta però una tecnica usata <i>dentro il kernel</i>, per poche istruzioni.</li></ul>`
            },
            {
              id: "c2-lock-var", label: "Variabile di lock e alternanza stretta",
              desc: `<p><b>Variabile di lock</b> semplice: si testa se è 0 e la si mette a 1 — ma test e assegnamento non sono atomici, quindi la race condition si sposta solo di un gradino.</p>
                <p><b>Alternanza stretta</b> (variabile <code>turn</code>): funziona, ma viola la condizione 3 — un processo fuori dalla sezione critica (magari lentissimo o fermo) impedisce all'altro di entrare, perché l'accesso è obbligatoriamente alternato.</p>`
            },
            {
              id: "c2-peterson", label: "Soluzione di Peterson",
              desc: `<p>Soluzione <b>software</b> corretta per due processi: un array <code>interested[]</code> per dichiarare l'intenzione più la variabile <code>turn</code> per rompere la parità. Chi arriva per secondo cede il turno e aspetta.</p>
                <ul><li>Soddisfa tutte e quattro le condizioni.</li>
                <li>Ma è pur sempre <b>attesa attiva</b>: il processo brucia CPU nel ciclo di controllo.</li></ul>`
            },
            {
              id: "c2-tsl", label: "TSL / XCHG e busy waiting",
              desc: `<p>Soluzione <b>hardware</b>: <code>TSL RX, LOCK</code> legge <code>LOCK</code> in un registro e vi scrive 1 in un'unica operazione <b>atomica</b> (il bus di memoria è bloccato per la durata). <code>XCHG</code> scambia atomicamente registro e memoria: stessa idea.</p>
                <ul><li><code>enter_region</code>: ripeti TSL finché il vecchio valore non è 0.</li>
                <li><code>leave_region</code>: <code>LOCK = 0</code>.</li>
                <li>Funziona anche su multiprocessore, ma è <b>spin lock</b>: attesa attiva, CPU sprecata.</li></ul>`,
              tip: `Il busy waiting può causare il <b>problema dell'inversione di priorità</b>: un processo H ad alta priorità gira a vuoto aspettando un L a bassa priorità che, essendo pronto ma mai schedulato, non potrà mai uscire dalla sezione critica.`
            },
            {
              id: "c2-sleep", label: "Sleep e wakeup",
              desc: `<p>Per non sprecare CPU, il processo che non può entrare si <b>blocca</b> (<code>sleep</code>) e verrà risvegliato (<code>wakeup</code>) da chi esce.</p>
                <p>Difetto: il <b>segnale di wakeup perso</b>. Se il consumatore controlla il buffer, lo trova vuoto, ma viene prelazionato <i>prima</i> di eseguire <code>sleep</code>, il produttore riempie e manda un wakeup a un processo che non sta ancora dormendo: il segnale svanisce e il consumatore dorme per sempre.</p>`,
              tip: `È esattamente il problema che il <b>semaforo</b> risolve, perché il contatore <i>ricorda</i> i segnali già inviati.`
            }
          ]
        },
        {
          id: "c2-sem", label: "Semafori e mutex", topic: "sync",
          desc: `<p>Dijkstra, 1965: un intero non negativo con due operazioni <b>atomiche</b>. È lo strumento con cui si risolvono quasi tutti gli esercizi d'esame.</p>`,
          children: [
            {
              id: "c2-down-up", label: "Semaforo: down e up",
              desc: `<p><b><code>down(S)</code></b>: se <code>S &gt; 0</code> decrementa e prosegue; se <code>S == 0</code> il processo si <b>blocca</b> sulla coda del semaforo (senza attesa attiva).</p>
                <p><b><code>up(S)</code></b>: incrementa <code>S</code>; se qualcuno è in attesa, ne risveglia uno (che completa il proprio <code>down</code>).</p>
                <ul><li>Entrambe sono <b>atomiche</b>: indivisibili, tipicamente realizzate nel kernel disabilitando gli interrupt (o con TSL su multiprocessore).</li>
                <li>Il contatore memorizza i segnali: niente wakeup persi.</li></ul>`,
              tip: `Nomenclatura d'esame: sui semafori si dice <b>down/up</b>. <i>wait/signal</i> è riservato alle variabili condizione dei monitor — e la distinzione viene chiesta apposta.`
            },
            {
              id: "c2-mutex", label: "Mutex",
              desc: `<p>Semaforo <b>binario</b> (0/1) usato solo per la mutua esclusione: <code>lock</code>/<code>unlock</code> attorno alla sezione critica. Più semplice ed efficiente del semaforo generale, non serve un contatore.</p>
                <p>Il <b>futex</b> è la versione efficiente di Linux: prova lo spin in spazio utente (caso non conteso: nessuna system call) e ricorre al kernel solo se c'è davvero contesa.</p>`
            },
            {
              id: "c2-prodcons", label: "Produttore–consumatore", sim: "sim_prodcons",
              desc: `<p>Tre semafori per un buffer circolare da N posti:</p>
                <ul><li><b><code>full</code></b> = posizioni piene, inizializzato a <b>0</b>;</li>
                <li><b><code>empty</code></b> = posizioni libere, inizializzato a <b>N</b>;</li>
                <li><b><code>mutex</code></b> = 1, protegge il buffer.</li></ul>
                <p>Produttore: <code>down(empty)</code> → <code>down(mutex)</code> → inserisce → <code>up(mutex)</code> → <code>up(full)</code>.<br>
                Consumatore: <code>down(full)</code> → <code>down(mutex)</code> → preleva → <code>up(mutex)</code> → <code>up(empty)</code>.</p>`,
              tip: `<b>L'ordine dei down non è scambiabile.</b> Se si fa <code>down(mutex)</code> prima di <code>down(empty)</code>, un produttore può addormentarsi su un buffer pieno <i>tenendo il mutex</i>: il consumatore non può entrare per svuotarlo → <b>deadlock</b>. Gli up, invece, si possono scambiare senza danno.`
            }
          ]
        },
        {
          id: "c2-monitor", label: "Monitor", topic: "sync",
          desc: `<p>Costrutto di <b>alto livello</b> (Hoare e Brinch Hansen): un modulo che racchiude dati condivisi e procedure. La mutua esclusione è garantita dal <b>compilatore</b>: un solo processo alla volta è attivo dentro il monitor.</p>
            <ul><li>Meno soggetto a errori dei semafori — l'ordine dei down non è più un problema del programmatore.</li>
            <li>Richiede però il supporto del linguaggio (Java: <code>synchronized</code>); il C non lo ha.</li></ul>`,
          children: [
            {
              id: "c2-condvar", label: "Variabili condizione: wait e signal",
              desc: `<p>La mutua esclusione non basta: serve anche <b>aspettare una condizione</b> (buffer pieno, buffer vuoto). Le variabili condizione hanno due operazioni:</p>
                <ul><li><b><code>wait(c)</code></b>: il processo si blocca <b>rilasciando il monitor</b>, così un altro può entrare.</li>
                <li><b><code>signal(c)</code></b>: risveglia un processo in attesa su <code>c</code>. Se non c'è nessuno in attesa, il segnale è <b>perso per sempre</b>.</li></ul>
                <p>Convenzione di Hoare: chi fa signal esce subito (o cede il monitor al risvegliato), per non avere due processi attivi dentro il monitor.</p>`,
              tip: `Differenza chiesta spessissimo: la variabile condizione <b>non ha contatore</b>, quindi un <code>signal</code> senza nessuno in attesa si perde; il semaforo invece <b>ricorda</b> l'<code>up</code> nel contatore.`
            },
            {
              id: "c2-messaggi", label: "Scambio di messaggi e barriere",
              desc: `<p><b>Messaggi</b> (<code>send</code>/<code>receive</code>): niente memoria condivisa, quindi funzionano anche fra macchine diverse. Problemi tipici: messaggi persi (si usano ack e ritrasmissioni), autenticazione, indirizzamento (diretto o tramite <b>mailbox</b>).</p>
                <p><b>Barriera</b>: sincronizzazione a fasi — nessun processo supera la barriera finché non sono arrivati tutti. Tipica del calcolo parallelo.</p>`
            }
          ]
        },
        {
          id: "c2-classici", label: "Problemi classici", topic: "sync",
          desc: `<p>I tre problemi-modello con cui si valuta ogni primitiva di sincronizzazione: sono anche gli esercizi d'esame più probabili.</p>`,
          children: [
            {
              id: "c2-filosofi", label: "Filosofi a cena",
              desc: `<p>Cinque filosofi, cinque forchette, ognuno ne serve due. Se tutti prendono la sinistra insieme, nessuno può prendere la destra: <b>deadlock</b>. Se tutti rilasciano e riprovano insieme, girano a vuoto: <b>starvation</b> (livelock).</p>
                <p>Soluzione corretta: un <b>mutex</b> protegge il controllo dello stato, e ogni filosofo può passare a <i>mangiando</i> solo se <b>nessuno dei due vicini</b> sta mangiando; altrimenti si blocca sul proprio semaforo, e sarà un vicino, finendo di mangiare, a risvegliarlo (<code>test()</code> sui vicini).</p>`,
              tip: `È l'esempio-tipo per definire <b>deadlock</b> vs <b>starvation</b>: da tenere pronto anche come domanda di teoria pura.`
            },
            {
              id: "c2-lettori", label: "Lettori e scrittori",
              desc: `<p>Molti lettori possono accedere <b>insieme</b> al database; uno scrittore deve avere accesso <b>esclusivo</b>.</p>
                <p>Schema: un contatore <code>rc</code> dei lettori attivi, protetto da un mutex; il <b>primo</b> lettore che entra fa <code>down(db)</code>, l'<b>ultimo</b> che esce fa <code>up(db)</code>.</p>
                <ul><li>Difetto della versione base: con lettori sempre in arrivo, lo scrittore può restare in <b>starvation</b> — si corregge accodando i nuovi lettori dietro allo scrittore in attesa.</li></ul>`
            },
            {
              id: "c2-barbiere", label: "Barbiere che dorme",
              desc: `<p>Un barbiere, una sedia, N sedie d'attesa. Tre semafori: <code>customers</code> (clienti in attesa), <code>barbers</code> (barbiere pronto), <code>mutex</code>, più un contatore <code>waiting</code>. Se non c'è posto, il cliente se ne va; se non ci sono clienti, il barbiere dorme.</p>`
            }
          ]
        },
        {
          id: "c2-sched", label: "Scheduling della CPU", topic: "sched",
          desc: `<p>Lo <b>scheduler</b> decide quale processo pronto mandare in esecuzione, e l'<b>algoritmo di scheduling</b> è la regola con cui sceglie.</p>`,
          children: [
            {
              id: "c2-quando", label: "Quando si schedula",
              desc: `<p>Quattro momenti: <b>creazione</b> di un processo, <b>terminazione</b>, <b>blocco</b> (I/O o semaforo), <b>interrupt di I/O</b> (un dispositivo ha finito e potrebbe aver sbloccato qualcuno).</p>`
            },
            {
              id: "c2-preempt", label: "Preemptive vs non preemptive",
              desc: `<p><b>Non preemptive</b>: il processo scelto tiene la CPU finché non si blocca o termina — nessuna revoca forzata.</p>
                <p><b>Preemptive</b>: il processo riceve un tempo massimo (quanto); allo scadere, un <b>interrupt del clock</b> restituisce il controllo allo scheduler, che può revocargli la CPU.</p>
                <ul><li>La prelazione richiede un timer hardware: senza clock non esiste scheduling preemptive.</li></ul>`
            },
            {
              id: "c2-bound", label: "CPU-bound e I/O-bound",
              desc: `<p><b>CPU-bound</b>: lunghi burst di calcolo, rare attese di I/O. <b>I/O-bound</b>: burst di CPU brevi, molto tempo in attesa.</p>
                <ul><li>Conta la <b>lunghezza del burst di CPU</b>, non la durata dell'I/O.</li>
                <li>Conviene favorire gli I/O-bound: se partono subito, avviano l'I/O che poi procede <b>in parallelo</b> al calcolo di un altro processo. Le CPU migliorano più in fretta dei dischi, quindi i processi tendono a diventare sempre più I/O-bound.</li></ul>`
            },
            {
              id: "c2-metriche", label: "Metriche e obiettivi",
              desc: `<p>Universali: <b>equità</b>, rispetto delle politiche, bilanciamento (tutte le parti del sistema occupate).</p>
                <ul><li><b>Batch</b>: massimizzare il <b>throughput</b> (lavori/ora) e minimizzare il <b>turnaround</b> (dalla sottomissione al completamento); tenere la CPU sempre attiva.</li>
                <li><b>Interattivi</b>: minimizzare il <b>tempo di risposta</b>.</li>
                <li><b>Real-time</b>: rispettare le <b>scadenze</b>, evitare degrado della qualità.</li></ul>
                <p><b>Turnaround</b> = fine − arrivo; <b>attesa</b> = turnaround − tempo di CPU.</p>`,
              tip: `Negli esercizi il turnaround si misura <b>dall'istante di arrivo</b>, non dall'istante 0: è l'errore più frequente.`
            },
            {
              id: "c2-batch-alg", label: "Algoritmi batch", sim: "sim_sched",
              desc: `<ul><li><b>FCFS</b> (First Come First Served) — non preemptive, coda unica in ordine di arrivo. Semplicissimo, ma un processo CPU-bound lunghissimo davanti fa aspettare tutti (<i>effetto convoglio</i>).</li>
                <li><b>SJF</b> (Shortest Job First) — non preemptive, sceglie il job più breve. <b>Ottimale</b> per il turnaround medio, ma solo se tutti i job sono disponibili contemporaneamente, e richiede di conoscere in anticipo le durate.</li>
                <li><b>SRTN</b> (Shortest Remaining Time Next) — versione preemptive di SJF: all'arrivo di un job più corto del tempo residuo dell'attuale, si commuta.</li></ul>`
            },
            {
              id: "c2-rr", label: "Round-robin e quanto", sim: "sim_sched",
              desc: `<p>Ogni processo riceve un <b>quanto</b> di tempo; allo scadere viene prelazionato e messo in fondo alla coda dei pronti. Se si blocca o termina prima, si commuta subito.</p>
                <p>La scelta del quanto è un compromesso:</p>
                <ul><li><b>Troppo corto</b> → troppi context switch, efficienza della CPU a picco (con switch da 1 ms e quanto da 4 ms si spreca il 20%).</li>
                <li><b>Troppo lungo</b> → tempi di risposta scadenti per le richieste interattive (degenera in FCFS).</li>
                <li>Valore ragionevole: <b>20–50 ms</b>.</li></ul>`
            },
            {
              id: "c2-prio", label: "Priorità e code multiple",
              desc: `<p><b>Scheduling a priorità</b>: la CPU va al processo pronto con priorità massima. Le priorità possono essere <b>statiche</b> o <b>dinamiche</b>; per evitare che i processi ad alta priorità monopolizzino la CPU se ne abbassa la priorità a ogni scatto del clock.</p>
                <p><b>Code multiple</b>: classi di priorità, ognuna con il proprio algoritmo (scheduling <i>verticale</i> fra le classi, <i>orizzontale</i> dentro la classe). Rischio: <b>starvation</b> delle code basse.</p>
                <p><b>Code multiple con retroazione</b>: chi consuma tutto il quanto senza bloccarsi <b>scende</b> di classe (è CPU-bound), chi si blocca presto resta in alto (è I/O-bound). Quanti piccoli in alto (reattività), quanti grandi in basso (meno switch); la classe più bassa può avere quanto infinito, cioè FCFS.</p>`
            },
            {
              id: "c2-spn", label: "SPN e aging",
              desc: `<p><b>Shortest Process Next</b>: l'idea di SJF applicata ai sistemi interattivi, stimando la durata del prossimo burst dalla storia passata.</p>
                <p><b>Aging</b>: media pesata fra stima precedente e ultima misura, <b>a·T₀ + (1−a)·T₁</b>. Con <i>a</i> = 1/2 basta sommare e dimezzare: le misure vecchie perdono peso esponenzialmente.</p>`
            },
            {
              id: "c2-fair", label: "Garantito, lotteria, fair-share",
              desc: `<ul><li><b>Garantito</b>: con <i>n</i> processi, a ciascuno si promette 1/<i>n</i> della CPU; si esegue quello col rapporto <i>CPU avuta / CPU dovuta</i> più basso.</li>
                <li><b>A lotteria</b>: biglietti distribuiti ai processi (più biglietti = più probabilità); a ogni decisione si estrae. Semplice, reattivo, e le quote si rispettano statisticamente; i processi cooperanti possono scambiarsi i biglietti.</li>
                <li><b>Fair-share</b>: la quota è garantita per <b>utente</b>, non per processo — chi lancia 9 processi non ruba CPU a chi ne lancia 1.</li></ul>`
            },
            {
              id: "c2-rt", label: "Scheduling real-time",
              desc: `<p><b>Hard real-time</b>: scadenze assolute, superarle è un guasto. <b>Soft real-time</b>: qualche sforamento è tollerabile.</p>
                <p>Eventi <b>periodici</b> (a intervalli regolari) o <b>aperiodici</b>. Con <i>m</i> eventi periodici, l'evento <i>i</i> con periodo <i>P<sub>i</sub></i> che richiede <i>C<sub>i</sub></i> secondi di CPU, il carico è gestibile solo se</p>
                <p style="text-align:center"><b>Σ C<sub>i</sub> / P<sub>i</sub> ≤ 1</b></p>
                <p>Un sistema che soddisfa questa condizione si dice <b>schedulabile</b>. Gli algoritmi sono <b>statici</b> (decisioni prese prima dell'esecuzione) o <b>dinamici</b> (a runtime).</p>`
            },
            {
              id: "c2-multi", label: "Thread e multiprocessore",
              desc: `<p><b>Thread utente</b>: il kernel schedula il processo, la libreria sceglie il thread — nessun interrupt del clock interno. <b>Thread kernel</b>: il kernel sceglie direttamente il thread, e può preferire un thread dello stesso processo (mappa di memoria e cache già calde).</p>
                <p><b>Multiprocessore</b>: <i>asimmetrico</i> (un master schedula per tutti — collo di bottiglia) oppure <b>SMP</b>, con <b>coda unica</b> (serve un lock, ma nessun bilanciamento) o <b>code separate</b> per core (niente contesa, cache calde, ma serve bilanciare il carico con migrazione guidata o furto di lavoro).</p>`
            }
          ]
        }
      ]
    },

    /* ============================ CAPITOLO 3 ============================ */
    {
      id: "c3", label: "3 · Memoria", topic: "memoria",
      desc: `<p>Come si dà a ogni processo l'illusione di una memoria propria, grande e contigua, quando la RAM è poca, condivisa e frammentata.</p>
        <ul><li><b>Prima della virtualizzazione</b>: rilocazione, swapping, frammentazione.</li>
        <li><b>Paginazione</b>: MMU, tabella delle pagine, TLB.</li>
        <li><b>Sostituzione</b>: quale pagina buttare fuori quando la memoria è piena.</li></ul>`,
      children: [
        {
          id: "c3-noabs", label: "Senza astrazione di memoria",
          desc: `<p>Se i programmi vedono gli indirizzi fisici reali, due programmi in memoria si pestano i piedi: uno può scrivere nella memoria dell'altro, e lo stesso programma caricato a indirizzi diversi si rompe.</p>`,
          children: [
            {
              id: "c3-riloc", label: "Rilocazione",
              desc: `<p>Il problema: gli indirizzi generati dal compilatore valgono solo se il programma parte dall'indirizzo previsto.</p>
                <ul><li><b>Rilocazione statica</b>: al caricamento si sommano gli offset a tutti gli indirizzi del programma — lenta, e non distingue indirizzi da costanti.</li>
                <li><b>Rilocazione dinamica</b>: la traduzione avviene <b>a ogni accesso</b>, in hardware.</li></ul>`
            },
            {
              id: "c3-baselimit", label: "Registri base e limite",
              desc: `<p>Rilocazione dinamica minimale: a ogni accesso l'hardware calcola <b>indirizzo fisico = base + indirizzo logico</b> e verifica che l'indirizzo logico sia <b>&lt; limite</b>; se sborda, trap.</p>
                <ul><li>Risolve insieme rilocazione e <b>protezione</b>.</li>
                <li>Costo: un'addizione e un confronto a ogni accesso in memoria.</li></ul>`
            }
          ]
        },
        {
          id: "c3-swap", label: "Swapping e frammentazione",
          desc: `<p>Se i processi non ci stanno tutti insieme in RAM, li si sposta interi fra memoria e disco (<b>swapping</b>). Andando avanti, la memoria si riempie di buchi.</p>`,
          children: [
            {
              id: "c3-fram-est", label: "Frammentazione esterna",
              desc: `<p>La memoria libera esiste, ma è <b>spezzettata</b> in buchi troppo piccoli per il processo che deve entrare. È il male dell'allocazione a partizioni variabili.</p>
                <p>Rimedio: la <b>compattazione</b> (si accostano i processi e i buchi si fondono), costosissima perché richiede di copiare tutta la memoria.</p>`
            },
            {
              id: "c3-fram-int", label: "Frammentazione interna",
              desc: `<p>Si assegna al processo <b>più memoria di quella che chiede</b> (perché l'unità di allocazione è fissa), e l'avanzo dentro l'unità resta inutilizzato.</p>
                <ul><li>È il costo tipico della <b>paginazione</b>: in media mezza pagina sprecata per processo (l'ultima pagina è quasi sempre parziale).</li></ul>`,
              tip: `Da non confondere: <b>esterna</b> = spazio libero fuori dalle partizioni, inutilizzabile perché sparso; <b>interna</b> = spazio sprecato <i>dentro</i> l'unità assegnata. La paginazione <b>elimina</b> la frammentazione esterna e introduce quella interna.`
            }
          ]
        },
        {
          id: "c3-libera", label: "Gestione della memoria libera",
          desc: `<p>Il SO deve sapere quali zone sono libere e sceglierne una quando arriva un processo.</p>`,
          children: [
            {
              id: "c3-bitmap", label: "Bitmap e liste",
              desc: `<p><b>Bitmap</b>: la memoria è divisa in unità di allocazione, un bit per unità (0 = libera, 1 = occupata). Occupa poco, ma trovare <i>k</i> unità libere consecutive richiede di scandire la bitmap.</p>
                <p><b>Lista concatenata</b> di segmenti (P = processo, H = buco), con indirizzo di partenza e lunghezza: l'aggiornamento alla terminazione di un processo è semplice (si fondono i buchi adiacenti).</p>`
            },
            {
              id: "c3-fit", label: "First / best / worst / next fit", sim: "sim_fit",
              desc: `<ul><li><b>First fit</b>: il primo buco abbastanza grande, scandendo dall'inizio. Veloce.</li>
                <li><b>Next fit</b>: come first fit, ma riparte da dove si era fermato l'ultima volta. Leggermente peggiore.</li>
                <li><b>Best fit</b>: il buco <b>più piccolo</b> che basta. Sembra il migliore, ma lascia briciole inutilizzabili e deve scorrere tutta la lista.</li>
                <li><b>Worst fit</b>: il buco <b>più grande</b>, così l'avanzo resta utile. In pratica funziona male.</li>
                <li><b>Quick fit</b>: liste separate per taglie comuni — allocazione velocissima, ma la fusione dei buchi diventa costosa.</li></ul>`,
              tip: `Best fit ≠ scelta migliore: negli esercizi produce spesso più frammentazione di first fit.`
            }
          ]
        },
        {
          id: "c3-vm", label: "Memoria virtuale e paginazione",
          desc: `<p>Idea chiave: lo spazio degli indirizzi di un processo può essere <b>più grande della RAM</b> e non deve stare in memoria tutto insieme. Solo le pagine servite davvero risiedono in memoria; le altre stanno su disco.</p>`,
          children: [
            {
              id: "c3-pag", label: "Pagine, frame e MMU", sim: "sim_mmu",
              desc: `<p>Lo spazio virtuale è diviso in <b>pagine</b>, la memoria fisica in <b>frame</b> della stessa dimensione. La <b>MMU</b> traduce ogni indirizzo virtuale in fisico, consultando la tabella delle pagine.</p>
                <p>Un indirizzo virtuale si spacca in due:</p>
                <ul><li><b>numero di pagina</b> = bit alti → indice nella tabella delle pagine;</li>
                <li><b>offset</b> = bit bassi → copiato <b>invariato</b> nell'indirizzo fisico.</li></ul>
                <p>Con pagine da 4 KB l'offset è di 12 bit (2¹² = 4096).</p>`,
              tip: `L'offset non viene mai tradotto: cambia solo il numero di pagina → numero di frame. È la base di tutti gli esercizi di traduzione.`
            },
            {
              id: "c3-tabella", label: "Tabella delle pagine e bit di controllo",
              desc: `<p>Una voce per pagina virtuale, contenente il numero di frame più i bit:</p>
                <ul><li><b>P</b> (present/absent) — la pagina è in memoria? Se no → <b>page fault</b>.</li>
                <li><b>M</b> (modified / <i>dirty</i>) — la pagina è stata scritta? Se sì, va riscritta su disco quando la si sostituisce.</li>
                <li><b>R</b> (referenced) — la pagina è stata usata di recente? Serve agli algoritmi di sostituzione.</li>
                <li>Bit di <b>protezione</b> (lettura/scrittura/esecuzione), bit di <b>caching disabilitato</b> (per l'I/O mappato in memoria).</li></ul>`
            },
            {
              id: "c3-fault", label: "Page fault",
              desc: `<p>La pagina richiesta non è in memoria (bit P = 0): la MMU genera una <b>trap</b> al SO, che salva il contesto, trova un frame libero (o ne <b>sceglie una vittima</b>, riscrivendola su disco se M = 1), carica la pagina, aggiorna la tabella e <b>rilancia l'istruzione interrotta</b>.</p>`,
              tip: `Il page fault <b>non è un errore</b> del programma: è il meccanismo normale della memoria virtuale. L'errore è l'accesso a un indirizzo non valido (segmentation fault).`
            },
            {
              id: "c3-tlb", label: "TLB", sim: "sim_eat",
              desc: `<p>Il <b>Translation Lookaside Buffer</b> è una piccola cache associativa dentro la MMU (poche decine di voci) che memorizza le traduzioni usate di recente: senza, ogni accesso in memoria ne richiederebbe <b>due</b> (uno per la tabella, uno per il dato).</p>
                <ul><li><b>Hit</b>: traduzione immediata, niente accesso alla tabella.</li>
                <li><b>Miss</b>: si legge la tabella delle pagine e si inserisce la voce nel TLB, espellendone una.</li>
                <li>Funziona grazie alla <b>località</b>: pochi frame coprono la grande maggioranza degli accessi.</li>
                <li>Al context switch il TLB va <b>invalidato</b> (o le voci etichettate con l'ASID): è una delle voci di costo del cambio di processo.</li></ul>
                <p><b>EAT</b> = h·(t<sub>TLB</sub> + t<sub>mem</sub>) + (1−h)·(t<sub>TLB</sub> + 2·t<sub>mem</sub>), con <i>h</i> = hit ratio.</p>`,
              tip: `Attenzione all'ipotesi dell'esercizio: se il tempo di ricerca nel TLB è "trascurabile" sparisce il termine t<sub>TLB</sub>. E in caso di miss la memoria si accede <b>due</b> volte.`
            },
            {
              id: "c3-tabgrandi", label: "Tabelle delle pagine grandi",
              desc: `<p>Con indirizzi a 32/64 bit la tabella diventa enorme (2²⁰ voci per processo a 32 bit con pagine da 4 KB). Due rimedi:</p>
                <ul><li><b>Multilivello</b>: il numero di pagina si spezza in più campi; i sotto-livelli non usati <b>non vengono allocati</b> (si sfrutta il fatto che lo spazio degli indirizzi è quasi tutto vuoto). Costo: più accessi in memoria per la traduzione.</li>
                <li><b>Tabella invertita</b>: una voce per <b>frame fisico</b> (non per pagina virtuale), quindi la dimensione dipende dalla RAM e non dallo spazio virtuale. La ricerca però è per contenuto → serve una <b>tabella hash</b> (più il TLB) per renderla praticabile.</li></ul>`
            }
          ]
        },
        {
          id: "c3-sost", label: "Sostituzione delle pagine", topic: "sostituzione", sim: "sim_pages",
          desc: `<p>Memoria piena e serve una pagina nuova: quale si butta fuori? Meglio scegliere una pagina poco usata — e se è "pulita" (M = 0) si risparmia la riscrittura su disco.</p>`,
          children: [
            {
              id: "c3-ott", label: "Ottimale (OPT)",
              desc: `<p>Espelle la pagina che sarà richiesta <b>più lontano nel futuro</b>. Genera il numero minimo possibile di page fault, ma è <b>irrealizzabile</b>: richiede di conoscere il futuro.</p>
                <p>Serve come <b>metro di paragone</b>: si misura quanto un algoritmo reale si avvicina all'ottimo.</p>`
            },
            {
              id: "c3-nru", label: "NRU",
              desc: `<p>Usa i bit <b>R</b> e <b>M</b> per formare quattro classi:</p>
                <ol start="0"><li>R=0, M=0 — non riferita, non modificata (la vittima ideale);</li>
                <li>R=0, M=1;</li>
                <li>R=1, M=0;</li>
                <li>R=1, M=1.</li></ol>
                <p>Espelle una pagina <b>a caso</b> nella classe non vuota di numero più basso. Il bit R viene azzerato periodicamente dal clock.</p>`,
              tip: `La classe 1 (R=0, M=1) esiste ed è "strana" ma corretta: è una pagina modificata tempo fa, il cui bit R è stato poi azzerato dal clock.`
            },
            {
              id: "c3-fifo", label: "FIFO e anomalia di Belady",
              desc: `<p><b>FIFO</b>: si espelle la pagina caricata da più tempo. Semplicissimo, ma stupido: può buttare fuori una pagina vecchissima e usatissima.</p>
                <p><b>Anomalia di Belady</b>: con FIFO può capitare che <b>aumentando i frame aumentino i page fault</b> — controintuitivo, ma dimostrabile con la stringa 0 1 2 3 0 1 4 0 1 2 3 4.</p>`,
              tip: `LRU e OPT sono <b>algoritmi a stack</b> e <b>non soffrono</b> dell'anomalia di Belady; FIFO e seconda chance sì. Domanda ricorrente.`
            },
            {
              id: "c3-clock", label: "Seconda chance e Clock", sim: "sim_pages",
              desc: `<p><b>Seconda chance</b>: FIFO che però guarda il bit R della pagina più vecchia. Se R = 1, non la espelle: azzera R, la <b>rimette in coda</b> come se fosse appena arrivata, e prosegue. Se R = 0, la espelle.</p>
                <p><b>Clock</b>: identico nel comportamento, ma le pagine sono in una <b>lista circolare</b> con una lancetta. Invece di spostare le pagine si sposta la lancetta — stessa politica, molto più efficiente.</p>`,
              tip: `Clock e seconda chance producono <b>la stessa sequenza di vittime</b>: cambia solo l'implementazione. Se tutte le pagine hanno R = 1, la lancetta fa un giro completo azzerando tutto e degenera in FIFO.`
            },
            {
              id: "c3-lru", label: "LRU e aging",
              desc: `<p><b>LRU</b> (Least Recently Used): espelle la pagina non usata da più tempo. Ottima approssimazione dell'ottimale (il passato recente predice il futuro prossimo), ma costosa: richiede hardware speciale (lista aggiornata a ogni accesso, o un contatore per voce).</p>
                <p><b>Aging</b>: approssimazione software. Ogni pagina ha un contatore a <i>n</i> bit; a ogni tick il contatore viene <b>shiftato a destra</b> e il bit R viene inserito <b>a sinistra</b> (bit più significativo). Si espelle il contatore più basso.</p>
                <ul><li>Differenza da LRU: l'aging ha memoria finita (n tick) e, dentro lo stesso tick, non distingue l'ordine degli accessi.</li></ul>`
            },
            {
              id: "c3-wsclock", label: "Working set e WSClock",
              desc: `<p><b>WSClock</b>: lista circolare come Clock, ma la scelta usa il working set. Per la pagina puntata: se R = 1 la si salta (azzerando R); se R = 0 e l'<b>età</b> (tempo virtuale corrente − ultimo uso) supera τ, la pagina è <b>fuori dal working set</b> e viene espulsa — se è pulita subito, se è sporca si programma la scrittura su disco e si prosegue.</p>
                <p>È l'algoritmo effettivamente usato: buone prestazioni e implementazione ragionevole.</p>`
            }
          ]
        },
        {
          id: "c3-ws", label: "Working set e thrashing", topic: "sostituzione",
          desc: `<p>Non basta scegliere <i>bene</i> la vittima: bisogna anche dare a ogni processo <b>abbastanza frame</b>.</p>`,
          children: [
            {
              id: "c3-localita", label: "Località",
              desc: `<p>In ogni fase di esecuzione un processo usa solo una <b>piccola parte</b> delle sue pagine (località temporale e spaziale). È il principio che rende praticabili paginazione, TLB e cache.</p>`
            },
            {
              id: "c3-workingset", label: "Working set",
              desc: `<p>Il <b>working set</b> è l'insieme delle pagine usate dal processo nelle ultime <i>k</i> referenze (o nell'ultimo intervallo di tempo virtuale τ). Se il working set sta in memoria, i page fault sono rari.</p>
                <p><b>Prepaginazione</b>: al ripristino di un processo swappato, si ricaricano subito le pagine del suo working set invece di aspettare un fault per ciascuna.</p>`
            },
            {
              id: "c3-thrash", label: "Thrashing",
              desc: `<p>Il processo non ha abbastanza frame per contenere il proprio working set: ogni page fault ne provoca un altro. Il sistema passa <b>più tempo a paginare che a lavorare</b>, l'uso della CPU crolla.</p>
                <p>Trappola: se il SO reagisce al calo di utilizzo della CPU <b>aumentando</b> il grado di multiprogrammazione, peggiora tutto. Il rimedio corretto è ridurre il grado di multiprogrammazione, <b>swappando fuori</b> interi processi.</p>`
            },
            {
              id: "c3-alloc", label: "Allocazione locale e globale",
              desc: `<p><b>Locale</b>: la vittima si cerca solo fra le pagine dello <i>stesso</i> processo — l'allocazione di frame è fissa, e un processo che cresce va in thrashing da solo.</p>
                <p><b>Globale</b>: la vittima si cerca fra tutte le pagine — l'allocazione si adatta da sola, ma un processo può rubare frame agli altri. In genere gli algoritmi globali funzionano meglio.</p>
                <p><b>PFF</b> (Page Fault Frequency): si misura la frequenza dei fault di ogni processo; troppo alta → più frame, troppo bassa → gliene si tolgono.</p>`
            }
          ]
        },
        {
          id: "c3-design", label: "Scelte di progetto", topic: "memoria",
          desc: `<p>Le decisioni che restano una volta scelti gli algoritmi.</p>`,
          children: [
            {
              id: "c3-dimpag", label: "Dimensione della pagina",
              desc: `<p>Compromesso:</p>
                <ul><li><b>Pagine piccole</b> → meno frammentazione interna, working set più aderente… ma <b>tabelle delle pagine enormi</b> e più overhead di trasferimento.</li>
                <li><b>Pagine grandi</b> → tabelle piccole e trasferimenti da disco più efficienti… ma più spazio sprecato nell'ultima pagina.</li></ul>
                <p>Con <i>s</i> = dimensione media del processo, <i>e</i> = byte per voce di tabella, l'overhead totale è minimizzato da <b>p = √(2·s·e)</b>. In pratica: 4 KB.</p>`
            },
            {
              id: "c3-ied", label: "Spazi I e D, pagine condivise",
              desc: `<p><b>Spazi separati per istruzioni e dati</b>: due spazi di indirizzamento distinti, quindi il doppio dello spazio disponibile e la parte istruzioni può essere <b>condivisa</b> e sola lettura.</p>
                <p><b>Pagine condivise</b>: più processi che eseguono lo stesso programma condividono le pagine di codice (una sola copia in RAM). I dati restano privati, tipicamente con <b>copy-on-write</b>: si condividono finché nessuno scrive, alla prima scrittura si duplica la pagina.</p>`
            },
            {
              id: "c3-segm", label: "Segmentazione",
              desc: `<p>Lo spazio degli indirizzi è diviso in <b>segmenti</b> di lunghezza variabile e significato logico (codice, dati, stack, tabella dei simboli), ognuno con crescita indipendente. L'indirizzo è la coppia <b>(segmento, offset)</b>.</p>
                <ul><li><b>Pro</b>: protezione e condivisione naturali a livello di unità logica; ogni segmento cresce senza disturbare gli altri.</li>
                <li><b>Contro</b>: essendo di lunghezza variabile, riporta la <b>frammentazione esterna</b>.</li>
                <li><b>Segmentazione con paginazione</b> (MULTICS, x86): ogni segmento è a sua volta paginato — si tengono i vantaggi logici del segmento senza la frammentazione esterna.</li></ul>`,
              tip: `Differenza da tenere pronta: la pagina è di dimensione <b>fissa</b> ed è invisibile al programmatore (scelta del SO); il segmento è di dimensione <b>variabile</b> e ha un <b>significato logico</b> visibile al programmatore.`
            }
          ]
        }
      ]
    },

    /* ============================ CAPITOLO 4 ============================ */
    {
      id: "c4", label: "4 · File system e dischi", topic: "fs",
      desc: `<p>Dal file — l'astrazione che il SO offre — fino al disco fisico e ai suoi tempi di accesso.</p>
        <ul><li><b>Interfaccia</b>: file, directory, pathname, link.</li>
        <li><b>Implementazione</b>: contigua, concatenata, FAT, i-node.</li>
        <li><b>Hardware</b>: tempi di accesso, scheduling del braccio, RAID, SSD.</li></ul>`,
      children: [
        {
          id: "c4-file", label: "File",
          desc: `<p>Astrazione dell'informazione persistente: sopravvive alla terminazione del processo che l'ha creato, ha un nome ed è condivisibile.</p>`,
          children: [
            {
              id: "c4-attributi", label: "Nome, tipo e attributi",
              desc: `<p><b>Attributi</b> (metadati): dimensione, proprietario, permessi, date di creazione/modifica/accesso, flag (nascosto, sola lettura, archivio).</p>
                <p><b>Estensione</b>: in UNIX è pura convenzione, in Windows determina il programma associato. I <b>tipi</b> tipici: file regolari (ASCII o binari), directory, file speciali a caratteri o a blocchi.</p>
                <p><b>Numero magico</b>: i primi byte del file ne identificano davvero il formato, a prescindere dall'estensione.</p>`
            },
            {
              id: "c4-accesso", label: "Accesso e operazioni",
              desc: `<p><b>Sequenziale</b>: si leggono i byte in ordine dall'inizio (eredità del nastro). <b>Casuale (random access)</b>: si può saltare a una posizione qualsiasi, con <code>seek</code> o indicando la posizione nella <code>read</code>.</p>
                <p>System call tipiche: <code>create</code>, <code>open</code>, <code>read</code>, <code>write</code>, <code>seek</code>, <code>close</code>, <code>unlink</code>.</p>
                <ul><li><code>open</code> serve a <b>pagare una volta sola</b> la ricerca del file e i controlli di accesso: restituisce un descrittore usato poi da tutte le altre chiamate.</li></ul>`
            }
          ]
        },
        {
          id: "c4-dir", label: "Directory",
          desc: `<p>Una directory è un file speciale che <b>associa nomi a file</b> (o meglio, ai loro descrittori). Serve a organizzare e a risolvere i nomi.</p>`,
          children: [
            {
              id: "c4-albero", label: "Gerarchia ad albero",
              desc: `<p>Evoluzione: directory <b>singola</b> (un solo livello, collisioni di nomi fra utenti) → <b>a due livelli</b> (una per utente) → <b>ad albero</b>, con directory annidate a piacere. È l'organizzazione universale di oggi.</p>`
            },
            {
              id: "c4-path", label: "Pathname assoluto e relativo", sim: "sim_path",
              desc: `<p><b>Assoluto</b>: parte dalla radice (<code>/usr/gabriel/tesi.txt</code>). <b>Relativo</b>: parte dalla <b>working directory</b> del processo.</p>
                <p>Voci speciali: <code>.</code> (directory corrente) e <code>..</code> (padre).</p>
                <p>La <b>risoluzione</b> del pathname è un cammino: si legge la directory, si trova la voce, si carica il suo i-node, si passa alla componente successiva — un accesso a disco per ogni livello (per questo la cache è essenziale).</p>`
            },
            {
              id: "c4-link", label: "Link fisici e simbolici",
              desc: `<p><b>Hard link</b>: una seconda voce di directory che punta <b>allo stesso i-node</b>; l'i-node tiene un <b>contatore dei link</b> e il file esiste finché il contatore è &gt; 0. Non può attraversare i file system e non può puntare a una directory.</p>
                <p><b>Link simbolico</b>: un file speciale che <b>contiene il pathname</b> di un altro file. Può attraversare i file system e puntare a directory, ma se l'originale viene cancellato resta <b>pendente</b> (dangling), e ogni accesso costa una risoluzione in più.</p>`,
              tip: `Cancellare il file "originale" non rompe un hard link (il contatore scende solo a 1), ma rompe un link simbolico. È la domanda tipica.`
            }
          ]
        },
        {
          id: "c4-impl", label: "Implementazione dei file",
          desc: `<p>Il problema: dato un file, sapere <b>quali blocchi del disco</b> lo compongono. Quattro risposte storiche, in ordine di qualità crescente.</p>`,
          children: [
            {
              id: "c4-contigua", label: "Allocazione contigua",
              desc: `<p>Il file occupa blocchi <b>consecutivi</b>. Bastano indirizzo del primo blocco e lunghezza.</p>
                <ul><li><b>Pro</b>: implementazione banale, lettura sequenziale velocissima (una sola ricerca), accesso casuale immediato.</li>
                <li><b>Contro</b>: <b>frammentazione esterna</b> e serve conoscere in anticipo la dimensione finale del file — non si può far crescere.</li>
                <li>Torna utile sui supporti <b>a sola lettura</b> (CD-ROM), dove le dimensioni sono note e nulla cresce.</li></ul>`
            },
            {
              id: "c4-concatenata", label: "Lista concatenata",
              desc: `<p>Ogni blocco contiene i dati più il <b>puntatore al blocco successivo</b>. Niente frammentazione esterna, il file cresce liberamente.</p>
                <ul><li><b>Contro</b>: l'<b>accesso casuale è lentissimo</b> (per arrivare al blocco <i>n</i> bisogna leggere gli <i>n</i> precedenti) e il puntatore mangia spazio nel blocco, quindi la dimensione utile non è più una potenza di 2.</li></ul>`
            },
            {
              id: "c4-fat", label: "FAT", sim: "sim_fat",
              desc: `<p>Si tolgono i puntatori dai blocchi e li si mette tutti in una <b>tabella in memoria</b>, la <i>File Allocation Table</i>, con una voce per blocco del disco. La voce di directory contiene solo il <b>primo</b> blocco; la catena si segue nella tabella.</p>
                <ul><li><b>Pro</b>: l'intero blocco resta ai dati e l'accesso casuale è veloce, perché la catena si percorre <b>in RAM</b>, senza accessi al disco.</li>
                <li><b>Contro</b>: la tabella deve stare <b>tutta in memoria</b> e cresce col disco — è il limite che rende FAT inadatta ai dischi grandi.</li></ul>`
            },
            {
              id: "c4-inode", label: "i-node", sim: "sim_inode",
              desc: `<p>A ogni file è associato un <b>i-node</b>: attributi + indirizzi dei blocchi. In memoria serve solo l'i-node dei file <b>aperti</b> — la memoria occupata è proporzionale ai file aperti, non alla dimensione del disco. È la soluzione di UNIX/Linux.</p>
                <p>Indirizzamento a più livelli: alcuni puntatori <b>diretti</b> (i primi blocchi, quindi i file piccoli si risolvono subito), poi <b>indiretto singolo</b>, <b>indiretto doppio</b> e <b>indiretto triplo</b>, che aggiungono capacità enorme al costo di qualche accesso in più.</p>`,
              tip: `Esercizio ricorrente: dimensione massima del file. Con blocchi da <i>B</i> byte e puntatori da <i>p</i> byte, ogni blocco indice contiene <b>k = B/p</b> puntatori → capacità = (diretti + k + k² + k³) · B.`
            },
            {
              id: "c4-dirimpl", label: "Implementazione delle directory",
              desc: `<p>La voce di directory contiene il nome più: gli attributi e i blocchi (MS-DOS), oppure solo il <b>numero di i-node</b> (UNIX), lasciando gli attributi nell'i-node.</p>
                <p>Nomi <b>lunghi e variabili</b>: si memorizzano in linea (voce a lunghezza variabile, con il rischio di buchi) oppure in uno <b>heap</b> in coda alla directory, tenendo le voci a lunghezza fissa. Per directory grandi si usa una <b>tabella hash</b> o una cache dei nomi già risolti.</p>`
            }
          ]
        },
        {
          id: "c4-gestione", label: "Gestione dello spazio e affidabilità",
          desc: `<p>Sapere quali blocchi sono liberi e non perdere i dati quando il sistema crolla.</p>`,
          children: [
            {
              id: "c4-liberi", label: "Blocchi liberi",
              desc: `<p><b>Lista concatenata</b> di blocchi che contengono i numeri dei blocchi liberi: occupa spazio solo quando il disco è quasi pieno (ed è allora che ne resta poco).</p>
                <p><b>Bitmap</b>: un bit per blocco. Molto più compatta (un disco da <i>n</i> blocchi richiede <i>n</i> bit) e permette di trovare blocchi <b>contigui</b>, ma occupa spazio fisso anche a disco vuoto.</p>`
            },
            {
              id: "c4-consistenza", label: "Consistenza e journaling",
              desc: `<p>Un crash a metà di un'operazione (es. blocco tolto dalla lista libera ma non ancora inserito nel file) lascia il file system <b>inconsistente</b>.</p>
                <p><b>fsck</b>: a posteriori, si scandisce tutto il disco e si confrontano due contatori per blocco (quante volte compare in un file, quante nella lista libera): blocchi <b>mancanti</b>, blocchi <b>duplicati</b> nella lista libera, blocchi in due file. Lentissimo sui dischi grandi.</p>
                <p><b>Journaling</b>: prima di eseguire l'operazione se ne scrive l'<b>intenzione</b> in un log; dopo il crash basta rileggere il journal e rieseguire (o annullare) le operazioni incomplete — niente scansione integrale. Richiede operazioni <b>idempotenti</b>. È il modello di NTFS, ext3/ext4.</p>`
            },
            {
              id: "c4-cache", label: "Cache del disco e prestazioni",
              desc: `<p>La <b>buffer cache</b> tiene in RAM i blocchi usati di recente: la maggior parte delle letture non tocca il disco.</p>
                <ul><li>Sostituzione tipicamente <b>LRU</b>, ma con correzioni: i blocchi <b>critici</b> (i-node, directory) vengono riscritti presto per non perdere la consistenza (<code>sync</code> periodico; <i>write-through</i> in MS-DOS).</li>
                <li><b>Read-ahead</b>: si precarica il blocco <i>k+1</i> quando si legge il <i>k</i> — vantaggioso solo per l'accesso <b>sequenziale</b>.</li>
                <li><b>Ridurre i movimenti del braccio</b>: blocchi dello stesso file vicini fra loro, i-node distribuiti sul disco (o al centro) invece che tutti in testa; <b>deframmentazione</b> periodica.</li></ul>`
            }
          ]
        },
        {
          id: "c4-dischi", label: "Dischi", topic: "dischi",
          desc: `<p>Il disco magnetico è meccanico: da qui vengono tutti i suoi tempi e tutte le ottimizzazioni del SO.</p>`,
          children: [
            {
              id: "c4-geom", label: "Geometria e tempo di accesso",
              desc: `<p>Piatti → <b>tracce</b> → <b>settori</b>; le tracce alla stessa distanza dal centro sui vari piatti formano un <b>cilindro</b>.</p>
                <p>Tempo di accesso = <b>seek</b> + <b>latenza di rotazione</b> + <b>trasferimento</b>:</p>
                <ul><li><b>seek</b>: spostamento del braccio sul cilindro giusto — il termine <b>dominante</b>, ed è l'unico su cui il SO può agire (schedulando le richieste).</li>
                <li><b>latenza</b>: attesa che il settore passi sotto la testina (in media mezzo giro: 30000/RPM ms).</li>
                <li><b>trasferimento</b>: lettura vera e propria dei bit.</li></ul>`
            },
            {
              id: "c4-diskched", label: "Scheduling del disco", sim: "sim_disk",
              desc: `<ul><li><b>FCFS</b>: nell'ordine di arrivo. Equo, ma il braccio fa avanti e indietro.</li>
                <li><b>SSTF</b> (Shortest Seek Time First): sempre la richiesta più vicina alla testina. Ottimo throughput, ma <b>starvation</b> delle richieste lontane.</li>
                <li><b>SCAN</b> (ascensore): il braccio va in una direzione servendo tutto ciò che incontra, poi arriva <b>all'estremo del disco</b>, inverte e torna.</li>
                <li><b>LOOK</b>: come SCAN, ma inverte <b>dopo l'ultima richiesta pendente</b> in quella direzione, senza arrivare all'estremo.</li>
                <li><b>C-SCAN / C-LOOK</b>: serve solo <b>in una direzione</b>; arrivato in fondo torna all'inizio senza servire nulla nel viaggio di ritorno. Attesa più uniforme.</li></ul>`,
              tip: `Convenzione del corso: <b>LOOK inverte dopo l'ultima richiesta</b>, non al bordo del disco — è la differenza con SCAN, ed è messa apposta fra i distrattori. Somma sempre gli <b>spostamenti in valore assoluto</b>.`
            },
            {
              id: "c4-raid", label: "RAID", sim: "sim_raid",
              desc: `<p>Più dischi visti come uno solo, per <b>parallelismo</b> (velocità) e/o <b>ridondanza</b> (affidabilità).</p>
                <ul><li><b>RAID 0</b> — <i>striping</i>: i dati sono distribuiti a strisce su tutti i dischi. Massima velocità, <b>nessuna ridondanza</b> (anzi: l'affidabilità peggiora, basta un disco rotto).</li>
                <li><b>RAID 1</b> — <i>mirroring</i>: ogni disco è duplicato. Ottima affidabilità e letture veloci, ma metà dello spazio è sacrificato.</li>
                <li><b>RAID 2/3</b>: ridondanza a livello di bit/byte (Hamming o parità), con dischi sincronizzati. Poco usati.</li>
                <li><b>RAID 4</b>: striping a blocchi + un disco <b>dedicato</b> alla parità → quel disco è il <b>collo di bottiglia</b> in scrittura.</li>
                <li><b>RAID 5</b>: come RAID 4 ma con la parità <b>distribuita</b> su tutti i dischi: niente collo di bottiglia. È il più usato.</li></ul>`
            },
            {
              id: "c4-xor", label: "Parità XOR e ricostruzione", sim: "sim_raid",
              desc: `<p>La parità è lo <b>XOR bit a bit</b> dei blocchi della striscia: <code>P = D₁ ⊕ D₂ ⊕ D₃</code>.</p>
                <p>Se un disco si rompe, il blocco perduto si ricalcola con lo XOR di <b>tutti gli altri</b>, parità inclusa: <code>D₂ = D₁ ⊕ D₃ ⊕ P</code>.</p>
                <ul><li>Regge la rottura di <b>un solo</b> disco (RAID 6, con due parità, ne regge due).</li>
                <li>Ogni scrittura richiede di aggiornare anche la parità: è la <i>write penalty</i>.</li></ul>`,
              tip: `Lo XOR è associativo e commutativo, e x ⊕ x = 0: per questo la formula di ricostruzione funziona sostituendo un dato qualunque con P.`
            },
            {
              id: "c4-ssd", label: "SSD",
              desc: `<p>Memoria flash, <b>nessuna parte mobile</b>: niente seek, niente latenza di rotazione, quindi l'accesso casuale costa quanto quello sequenziale — lo scheduling del braccio diventa inutile.</p>
                <ul><li>Si legge e si scrive a <b>pagine</b>, ma si <b>cancella</b> solo a <b>blocchi</b> interi (molto più grandi): non si può riscrivere una pagina sul posto.</li>
                <li>Da qui la <b>write amplification</b> e la necessità dell'<b>FTL</b> (Flash Translation Layer), che mappa gli indirizzi logici su pagine fisiche e scrive sempre su pagine già cancellate.</li>
                <li>Le celle si usurano (numero finito di cicli di scrittura): il <b>wear leveling</b> distribuisce le scritture su tutte le celle.</li>
                <li><b>TRIM</b>: il file system avvisa l'SSD di quali pagine non servono più, così il garbage collector può cancellarle in anticipo.</li></ul>`
            }
          ]
        }
      ]
    }
  ]
};
