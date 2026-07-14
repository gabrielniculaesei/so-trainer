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
                <li>La chiamata di libreria (es. <code>printf</code>) <i>non</i> è la system call: la incapsula.</li></ul>
                <p>Gli undici passi di <code>read(fd, buffer, nbytes)</code>: (1–3) i parametri vengono messi sullo stack, (4) si chiama la procedura di libreria, (5) essa mette il <b>numero della system call</b> in un registro, (6) esegue la <b>TRAP</b>, (7) il kernel legge il numero e (8) salta al gestore giusto tramite la tabella delle system call, (9) il gestore esegue, (10) si torna alla procedura di libreria, (11) e da lì al programma.</p>`,
              codeTitle: `read: dalla chiamata C alla trap`,
              code: `count = read(fd, buffer, nbytes);   <span class="c">// chiamata C</span>

<span class="c">// dentro la procedura di libreria read():</span>
    push  nbytes
    push  &amp;buffer
    push  fd
    mov   eax, 3        <span class="c">// numero della system call (read)</span>
    <span class="k">TRAP</span>                <span class="c">// -&gt; modalità kernel</span>
    <span class="c">// il kernel indicizza la tabella delle system call</span>
    <span class="c">// con eax, esegue il gestore, poi torna qui</span>
    ret                 <span class="c">// -&gt; modalità utente</span>`,
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
                <li>UNIX organizza i processi in una <b>gerarchia</b> ad albero; Windows no, tutti i processi sono pari.</li></ul>`,
              codeTitle: `fork + exec: lo schema della shell`,
              code: `pid = fork();                  <span class="c">// crea un clone del processo</span>

if (pid &lt; 0) {
    <span class="c">// fork fallita: niente memoria / troppi processi</span>
} else if (pid == 0) {
    <span class="c">// FIGLIO (fork ha restituito 0)</span>
    execve(comando, parametri, ambiente);
    <span class="c">// se execve riesce, non torna mai:</span>
    <span class="c">// l'immagine del processo è stata sostituita</span>
} else {
    <span class="c">// PADRE (fork ha restituito il PID del figlio)</span>
    waitpid(pid, &amp;status, 0);  <span class="c">// aspetta che il figlio finisca</span>
}`,
              tip: `<code>fork</code> restituisce <b>due volte</b>, con valori diversi: 0 al figlio, il PID del figlio al padre. È così che le due copie, identiche, capiscono chi sono.`
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
                <li>Resta però una tecnica usata <i>dentro il kernel</i>, per poche istruzioni.</li></ul>`,
              codeTitle: `atomicità per forza bruta`,
              code: `disable_interrupts();   <span class="c">// niente clock =&gt; niente context switch</span>
    <span class="c">// ... sezione critica ...</span>
enable_interrupts();

<span class="c">// Se il processo si dimentica la enable, il sistema è morto.</span>
<span class="c">// Su multicore gli altri core continuano a girare: inutile.</span>`
            },
            {
              id: "c2-lock-var", label: "Variabile di lock e alternanza stretta",
              desc: `<p><b>Variabile di lock</b> semplice: si testa se è 0 e la si mette a 1 — ma "testa e imposta" <b>non è atomico</b>. Se A legge 0 e viene interrotto <i>un istante prima</i> di scrivere 1, anche B legge 0: entrambi entrano. La race condition si è solo spostata di un gradino.</p>
                <p><b>Alternanza stretta</b> (variabile <code>turn</code>): funziona davvero, ma viola la <b>condizione 3</b> — l'accesso è obbligatoriamente alternato, quindi un processo fermo <i>fuori</i> dalla sezione critica impedisce all'altro di rientrare. È anche busy waiting puro.</p>`,
              codeTitle: `alternanza stretta (turn)`,
              code: `int turn;               <span class="c">// di chi è il turno</span>

void enter_region(int process) {
    while (turn != process)
        ;               <span class="c">// attesa attiva: gira a vuoto</span>
}

void leave_region(int process) {
    turn = 1 - process; <span class="c">// passa il turno all'altro</span>
}`,
              tip: `Il difetto dell'alternanza stretta si racconta così: P0 esce dalla sezione critica, mette <code>turn = 1</code>, e poi va a fare un lungo calcolo. P1 entra, esce, rimette <code>turn = 0</code>… e ora P1 <b>non può rientrare</b> pur essendo la risorsa libera, perché deve aspettare che P0 faccia il suo giro.`
            },
            {
              id: "c2-peterson", label: "Soluzione di Peterson",
              desc: `<p>Soluzione <b>software</b> corretta per due processi (1981): l'array <code>interested[]</code> dichiara l'intenzione, la variabile <code>turn</code> rompe la parità. Il trucco è che chi arriva <b>per secondo</b> sovrascrive <code>turn</code> con il proprio numero e quindi è lui a restare fuori.</p>
                <ul><li>Soddisfa tutte e quattro le condizioni: niente deadlock, niente starvation, nessuna ipotesi sulle velocità.</li>
                <li>Ma è pur sempre <b>attesa attiva</b>: il processo brucia CPU nel ciclo.</li>
                <li>Sulle CPU moderne può fallire a causa dell'<b>esecuzione fuori ordine</b>: senza barriere di memoria, le due scritture possono essere riordinate.</li></ul>`,
              codeTitle: `Peterson (2 processi)`,
              code: `#define N 2
int turn;                 <span class="c">// di chi è il turno</span>
int interested[N];        <span class="c">// tutti a FALSE all'inizio</span>

void enter_region(int process) {
    int other = 1 - process;      <span class="c">// l'altro processo</span>
    interested[process] = TRUE;   <span class="c">// mi dichiaro interessato</span>
    turn = process;               <span class="c">// ...e cedo il turno</span>
    while (turn == process &amp;&amp; interested[other] == TRUE)
        ;                         <span class="c">// attesa attiva</span>
}

void leave_region(int process) {
    interested[process] = FALSE;  <span class="c">// esco dalla sezione critica</span>
}`,
              tip: `Se l'altro <b>non è interessato</b>, il <code>while</code> non gira nemmeno una volta: si entra subito. È questo che salva la condizione 3, che l'alternanza stretta violava.`
            },
            {
              id: "c2-tsl", label: "TSL / XCHG e busy waiting",
              desc: `<p>Soluzione <b>hardware</b>. <code>TSL RX, LOCK</code> (Test and Set Lock) fa due cose in <b>un'unica operazione atomica</b>: copia il contenuto di <code>LOCK</code> nel registro <code>RX</code> e scrive 1 in <code>LOCK</code>. Per garantirlo, la CPU <b>blocca il bus di memoria</b> per tutta la durata dell'istruzione, così nessun altro core può toccare quella parola.</p>
                <p>Il valore <i>vecchio</i> finito nel registro dice com'era il lock: se era 0 l'ho preso io, se era 1 lo teneva qualcun altro (e riscriverci 1 non cambia nulla).</p>
                <p><code>XCHG</code> (x86) scambia atomicamente registro e memoria: logica identica.</p>
                <ul><li>Funziona anche su multiprocessore — è il suo vantaggio decisivo su Peterson.</li>
                <li>Ma è uno <b>spin lock</b>: attesa attiva, CPU sprecata.</li></ul>`,
              codeTitle: `TSL: enter_region / leave_region`,
              code: `enter_region:
    <span class="k">TSL</span> REGISTER, LOCK   <span class="c">// atomico: REGISTER = LOCK; LOCK = 1</span>
    CMP REGISTER, #0     <span class="c">// il lock era libero?</span>
    JNE enter_region     <span class="c">// no (era 1): riprova -&gt; busy waiting</span>
    RET                  <span class="c">// sì (era 0): entra nella sezione critica</span>

leave_region:
    MOVE LOCK, #0        <span class="c">// libera il lock</span>
    RET

<span class="c">// x86: la stessa logica con XCHG REGISTER, LOCK</span>
<span class="c">// (scambia atomicamente registro e memoria)</span>`,
              tip: `Il busy waiting causa il <b>problema dell'inversione di priorità</b>: H (alta priorità) gira a vuoto aspettando il lock di L (bassa priorità); ma L è solo <i>pronto</i>, e lo scheduler sceglie sempre H — quindi L non uscirà mai dalla sezione critica e H girerà per sempre.`
            },
            {
              id: "c2-sleep", label: "Sleep e wakeup",
              desc: `<p>Per non sprecare CPU, il processo che non può procedere si <b>blocca</b> con <code>sleep()</code> (passa a <i>bloccato</i>) e viene rimesso tra i pronti da <code>wakeup()</code>. Sono system call.</p>
                <p>Ma da sole non bastano: il <b>segnale di wakeup si perde</b>. Il consumatore legge <code>count == 0</code> e sta per dormire; viene prelazionato <i>prima</i> di eseguire <code>sleep()</code>; il produttore inserisce, porta <code>count</code> a 1 e manda un <code>wakeup</code> a un processo che <b>non sta ancora dormendo</b>. Il segnale svanisce nel nulla, il consumatore poi dorme — e non lo sveglierà più nessuno. A quel punto il buffer si riempie e si addormenta anche il produttore: <b>deadlock</b>.</p>
                <p>Toppa possibile: un <b>bit di wakeup in sospeso</b> (un "salvadanaio" per un segnale). Regge con due processi, ma non scala: con tre o più servirebbero più bit — e a quel punto tanto vale usare un <b>contatore</b>, cioè un semaforo.</p>`,
              codeTitle: `produttore–consumatore con sleep/wakeup (rotto!)`,
              code: `int count = 0;                  <span class="c">// elementi nel buffer</span>

void producer(void) {
    while (TRUE) {
        item = produce_item();
        if (count == N) sleep();     <span class="c">// buffer pieno: dormi</span>
        insert_item(item);
        count = count + 1;
        if (count == 1)              <span class="c">// era vuoto: sveglia l'altro</span>
            wakeup(consumer);
    }
}

void consumer(void) {
    while (TRUE) {
        if (count == 0) sleep();     <span class="c">// &lt;-- QUI la corsa critica:</span>
                                     <span class="c">// se vengo interrotto tra il test</span>
                                     <span class="c">// e la sleep, perdo il wakeup</span>
        item = remove_item();
        count = count - 1;
        if (count == N - 1)
            wakeup(producer);
        consume_item(item);
    }
}`,
              tip: `<code>count</code> è una variabile condivisa non protetta: è lei la sezione critica. Il semaforo risolve perché il contatore <b>ricorda</b> gli <code>up</code> già fatti, mentre un <code>wakeup</code> mandato a chi non dorme è perso per sempre.`
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
                <li>Il contatore memorizza i segnali: niente wakeup persi.</li>
                <li>Un semaforo inizializzato a <b>1</b> e usato per la mutua esclusione si dice <b>semaforo binario</b>.</li></ul>`,
              codeTitle: `semantica di down e up`,
              code: `<span class="k">down</span>(S):              <span class="c">// atomica</span>
    if (S &gt; 0)
        S = S - 1;      <span class="c">// consuma un wakeup salvato e prosegui</span>
    else
        sleep();        <span class="c">// nessun wakeup: bloccati sulla coda di S</span>
                        <span class="c">// (il down NON è completato)</span>

<span class="k">up</span>(S):                <span class="c">// atomica</span>
    S = S + 1;          <span class="c">// salva un wakeup</span>
    if (qualcuno dorme su S)
        risveglia_uno();  <span class="c">// completerà il suo down</span>`,
              tip: `Nomenclatura d'esame: sui semafori si dice <b>down/up</b>. <i>wait/signal</i> è riservato alle variabili condizione dei monitor — e la distinzione viene chiesta apposta.`
            },
            {
              id: "c2-mutex", label: "Mutex e futex",
              desc: `<p>Il <b>mutex</b> è un semaforo <b>binario</b> semplificato: solo due stati, <i>locked</i> e <i>unlocked</i>, e nessun contatore. Serve unicamente alla mutua esclusione.</p>
                <p>Essendo così semplice, si può realizzare <b>in spazio utente</b> con TSL/XCHG. La differenza cruciale rispetto a <code>enter_region</code> è <code>thread_yield</code>: se il lock è occupato, il thread <b>cede subito la CPU</b> invece di girare a vuoto.</p>
                <p>Il <b>futex</b> (Linux) unisce i due mondi: finché non c'è contesa lavora interamente in spazio utente con un'istruzione atomica — <b>zero system call</b>; solo se il lock è davvero conteso chiama il kernel per mettersi in coda. Si paga il kernel unicamente quando serve.</p>`,
              codeTitle: `mutex_lock: spin che cede la CPU`,
              code: `mutex_lock:
    <span class="k">TSL</span> REGISTER, MUTEX  <span class="c">// atomico: copia e metti a 1</span>
    CMP REGISTER, #0      <span class="c">// era sbloccato?</span>
    JZE ok                <span class="c">// sì: entra</span>
    CALL thread_yield     <span class="c">// no: cedi la CPU allo scheduler</span>
    JMP mutex_lock        <span class="c">// ...e riprova</span>
ok: RET

mutex_unlock:
    MOVE MUTEX, #0
    RET`,
              tip: `Differenza da ricordare: <code>enter_region</code> (TSL) fa <b>busy waiting</b> e brucia il quanto; <code>mutex_lock</code> chiama <code>thread_yield</code> e lo restituisce. Stesso hardware, politica opposta.`
            },
            {
              id: "c2-prodcons", label: "Produttore–consumatore", sim: "sim_prodcons",
              desc: `<p>Tre semafori per un buffer circolare da N posti:</p>
                <ul><li><b><code>full</code></b> = posizioni piene, inizializzato a <b>0</b>;</li>
                <li><b><code>empty</code></b> = posizioni libere, inizializzato a <b>N</b>;</li>
                <li><b><code>mutex</code></b> = 1, protegge il buffer.</li></ul>
                <p>I due contatori fanno la <b>sincronizzazione</b> (chi deve aspettare, e quanto), il mutex fa la <b>mutua esclusione</b> sul buffer: sono ruoli diversi, e per questo servono tre semafori e non uno.</p>`,
              codeTitle: `produttore–consumatore con i semafori`,
              code: `#define N 100          <span class="c">// posti nel buffer</span>

semaphore mutex = 1;    <span class="c">// mutua esclusione sul buffer</span>
semaphore empty = N;    <span class="c">// posti liberi</span>
semaphore full  = 0;    <span class="c">// posti pieni</span>

void producer(void) {
    while (TRUE) {
        item = produce_item();
        <span class="k">down</span>(&amp;empty);        <span class="c">// c'è posto? (se no, dormi)</span>
        <span class="k">down</span>(&amp;mutex);        <span class="c">// entra nella sezione critica</span>
        insert_item(item);
        <span class="k">up</span>(&amp;mutex);          <span class="c">// esci</span>
        <span class="k">up</span>(&amp;full);           <span class="c">// un posto pieno in più</span>
    }
}

void consumer(void) {
    while (TRUE) {
        <span class="k">down</span>(&amp;full);         <span class="c">// c'è roba? (se no, dormi)</span>
        <span class="k">down</span>(&amp;mutex);
        item = remove_item();
        <span class="k">up</span>(&amp;mutex);
        <span class="k">up</span>(&amp;empty);          <span class="c">// un posto libero in più</span>
        consume_item(item);
    }
}`,
              tip: `<b>L'ordine dei down non è scambiabile.</b> Con <code>down(mutex)</code> prima di <code>down(empty)</code>, il produttore che trova il buffer pieno si addormenta <i>tenendosi il mutex</i>: il consumatore si blocca sul <code>down(mutex)</code> e non potrà mai svuotare il buffer → <b>deadlock</b>. Gli <code>up</code>, invece, si possono scambiare senza danno.`
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
                <p>Convenzione di Hoare: chi fa signal esce subito (o cede il monitor al risvegliato), per non avere due processi attivi dentro il monitor.</p>
                <p>Perché il monitor non soffre del wakeup perso? Perché la mutua esclusione è <b>automatica</b>: mentre un processo sta valutando la condizione e chiamando <code>wait</code>, nessun altro può essere dentro il monitor a fargli il <code>signal</code> addosso.</p>`,
              codeTitle: `produttore–consumatore con un monitor`,
              code: `monitor ProducerConsumer
    condition full, empty;      <span class="c">// variabili condizione</span>
    integer count = 0;

    procedure insert(item):
        if (count == N) <span class="k">wait</span>(full);   <span class="c">// pieno: cedi il monitor</span>
        insert_item(item);
        count = count + 1;
        if (count == 1) <span class="k">signal</span>(empty); <span class="c">// era vuoto: sveglia</span>

    procedure remove():
        if (count == 0) <span class="k">wait</span>(empty);  <span class="c">// vuoto: cedi il monitor</span>
        item = remove_item();
        count = count - 1;
        if (count == N-1) <span class="k">signal</span>(full);
end monitor

procedure producer():
    while (true) { item = produce_item(); ProducerConsumer.insert(item); }

procedure consumer():
    while (true) { item = ProducerConsumer.remove(); consume_item(item); }`,
              tip: `Differenza chiesta spessissimo: la variabile condizione <b>non ha contatore</b>, quindi un <code>signal</code> senza nessuno in attesa <b>si perde</b>; il semaforo invece <b>ricorda</b> l'<code>up</code> nel contatore. E nota che qui non c'è nessun mutex esplicito: la mutua esclusione la mette il <b>compilatore</b>.`
            },
            {
              id: "c2-messaggi", label: "Scambio di messaggi e barriere",
              desc: `<p><b>Messaggi</b> (<code>send</code>/<code>receive</code>): niente memoria condivisa, quindi funzionano anche fra macchine diverse — è l'unica via nei sistemi distribuiti.</p>
                <p>Criticità: <b>messaggi persi</b> (si risolve con un <i>ack</i> del destinatario, e quindi con le ritrasmissioni), <b>identificazione</b> del destinatario, <b>autenticazione</b> (parlo davvero col server giusto?).</p>
                <p>Indirizzamento: <b>diretto</b> (ogni processo ha un indirizzo univoco), tramite <b>mailbox</b> (buffer con N posti: chi manda a una mailbox piena si blocca) oppure <b>rendezvous</b>, senza buffer — chi arriva primo aspetta l'altro.</p>
                <p><b>Barriera</b>: sincronizzazione a fasi — nessuno supera la barriera finché non sono arrivati tutti. Tipica del calcolo parallelo.</p>`,
              codeTitle: `produttore–consumatore a messaggi`,
              code: `#define N 100

void producer(void) {
    message m;
    while (TRUE) {
        item = produce_item();
        <span class="k">receive</span>(consumer, &amp;m);   <span class="c">// aspetta un messaggio VUOTO</span>
        build_message(&amp;m, item);
        <span class="k">send</span>(consumer, &amp;m);      <span class="c">// spediscilo pieno</span>
    }
}

void consumer(void) {
    message m;
    for (i = 0; i &lt; N; i++)
        <span class="k">send</span>(producer, &amp;m);      <span class="c">// "credito" iniziale: N vuoti</span>
    while (TRUE) {
        <span class="k">receive</span>(producer, &amp;m);
        item = extract_item(&amp;m);
        <span class="k">send</span>(producer, &amp;m);      <span class="c">// restituisci il contenitore vuoto</span>
        consume_item(item);
    }
}`,
              tip: `Gli N messaggi vuoti mandati all'inizio dal consumatore fanno esattamente il lavoro del semaforo <code>empty</code> = N: limitano il produttore a N elementi in volo.`
            }
          ]
        },
        {
          id: "c2-classici", label: "Problemi classici", topic: "sync",
          desc: `<p>I tre problemi-modello con cui si valuta ogni primitiva di sincronizzazione: sono anche gli esercizi d'esame più probabili.</p>`,
          children: [
            {
              id: "c2-filosofi", label: "Filosofi a cena",
              desc: `<p>Cinque filosofi attorno a un tavolo, cinque forchette (una fra due piatti), e per mangiare ne servono <b>due</b>. Modella la contesa di più risorse insieme.</p>
                <p><b>Tentativo ingenuo</b> (prendi la sinistra, poi la destra): se tutti prendono la sinistra nello stesso istante, nessuno trova la destra e non la rilascia mai → <b>deadlock</b>. Se invece, non trovando la destra, tutti rilasciano e riprovano <i>dopo lo stesso tempo</i>, ripartono in sincrono all'infinito: <b>starvation</b> (livelock) — girano, ma nessuno mangia.</p>
                <p><b>Soluzione corretta</b>: un <code>mutex</code> protegge il controllo dello stato; un filosofo passa a <i>mangiando</i> solo se <b>nessuno dei due vicini</b> sta mangiando, altrimenti si blocca sul <i>proprio</i> semaforo. Sarà un vicino, posando le forchette, a chiamare <code>test()</code> su di lui e a risvegliarlo.</p>`,
              codeTitle: `filosofi: ingenuo (deadlock) e corretto`,
              code: `<span class="c">// --- TENTATIVO INGENUO: va in deadlock ---</span>
void philosopher(int i) {
    while (TRUE) {
        think();
        take_fork(i);            <span class="c">// sinistra</span>
        take_fork((i+1) % N);    <span class="c">// destra &lt;- se tutti sono qui: deadlock</span>
        eat();
        put_fork(i);
        put_fork((i+1) % N);
    }
}

<span class="c">// --- SOLUZIONE CORRETTA ---</span>
int state[N];                    <span class="c">// THINKING / HUNGRY / EATING</span>
semaphore mutex = 1;             <span class="c">// protegge state[]</span>
semaphore s[N];                  <span class="c">// un semaforo per filosofo, a 0</span>

void take_forks(int i) {
    <span class="k">down</span>(&amp;mutex);
    state[i] = HUNGRY;
    test(i);                     <span class="c">// posso mangiare?</span>
    <span class="k">up</span>(&amp;mutex);
    <span class="k">down</span>(&amp;s[i]);              <span class="c">// se test() non è passato, dormi qui</span>
}

void put_forks(int i) {
    <span class="k">down</span>(&amp;mutex);
    state[i] = THINKING;
    test(LEFT); test(RIGHT);     <span class="c">// sveglia i vicini se ora possono</span>
    <span class="k">up</span>(&amp;mutex);
}

void test(int i) {
    if (state[i] == HUNGRY &amp;&amp;
        state[LEFT] != EATING &amp;&amp; state[RIGHT] != EATING) {
        state[i] = EATING;
        <span class="k">up</span>(&amp;s[i]);            <span class="c">// sblocca il down in take_forks</span>
    }
}`,
              tip: `È l'esempio-tipo per distinguere <b>deadlock</b> (tutti bloccati, nessuno avanza) da <b>starvation</b>/livelock (tutti attivi, ma nessuno progredisce). Nella soluzione corretta le due forchette si prendono <b>entrambe o nessuna</b>, dentro la sezione critica: è questo che elimina il deadlock.`
            },
            {
              id: "c2-lettori", label: "Lettori e scrittori",
              desc: `<p>Modella l'accesso a un database: molti <b>lettori</b> possono leggere <b>insieme</b>, ma uno <b>scrittore</b> deve avere accesso <b>esclusivo</b> (nessun altro scrittore e nessun lettore).</p>
                <p>Schema: il contatore <code>rc</code> dei lettori attivi, protetto da <code>mutex</code>; il <b>primo</b> lettore che entra fa <code>down(db)</code> "a nome di tutti", l'<b>ultimo</b> che esce fa <code>up(db)</code>. I lettori intermedi non toccano <code>db</code>.</p>
                <ul><li>Difetto della versione base: se arrivano lettori di continuo, <code>rc</code> non torna mai a 0 e lo scrittore resta in <b>starvation</b>.</li>
                <li>Correzione: i lettori che arrivano <i>mentre</i> uno scrittore aspetta vengono accodati <b>dietro</b> a lui — meno parallelismo, ma niente starvation.</li></ul>`,
              codeTitle: `lettori–scrittori con i semafori`,
              code: `semaphore mutex = 1;     <span class="c">// protegge rc</span>
semaphore db = 1;        <span class="c">// accesso esclusivo al database</span>
int rc = 0;              <span class="c">// lettori attivi</span>

void reader(void) {
    while (TRUE) {
        <span class="k">down</span>(&amp;mutex);
        rc = rc + 1;
        if (rc == 1) <span class="k">down</span>(&amp;db);   <span class="c">// il PRIMO blocca gli scrittori</span>
        <span class="k">up</span>(&amp;mutex);

        read_data_base();            <span class="c">// più lettori qui insieme</span>

        <span class="k">down</span>(&amp;mutex);
        rc = rc - 1;
        if (rc == 0) <span class="k">up</span>(&amp;db);     <span class="c">// l'ULTIMO li rilascia</span>
        <span class="k">up</span>(&amp;mutex);
        use_data_read();
    }
}

void writer(void) {
    while (TRUE) {
        think_up_data();
        <span class="k">down</span>(&amp;db);                <span class="c">// accesso esclusivo</span>
        write_data_base();
        <span class="k">up</span>(&amp;db);
    }
}`,
              tip: `Nota che lo scrittore fa <code>down(db)</code> e basta: non tocca <code>rc</code>. Tutta l'asimmetria del problema sta nel "primo entra / ultimo esce" dei lettori.`
            },
            {
              id: "c2-barbiere", label: "Barbiere che dorme",
              desc: `<p>Un barbiere, una poltrona, N sedie d'attesa. Se non ci sono clienti il barbiere <b>dorme</b>; se arriva un cliente e il barbiere dorme, lo <b>sveglia</b>; se ci sono clienti ma nessuna sedia libera, il nuovo cliente <b>se ne va</b>.</p>
                <p>Tre semafori: <code>customers</code> (clienti in attesa, 0), <code>barbers</code> (barbieri pronti, 0), <code>mutex</code> (1), più il contatore <code>waiting</code> per sapere se c'è posto.</p>`,
              codeTitle: `barbiere che dorme`,
              code: `semaphore customers = 0;   <span class="c">// clienti in attesa</span>
semaphore barbers   = 0;   <span class="c">// barbieri liberi</span>
semaphore mutex     = 1;
int waiting = 0;           <span class="c">// clienti seduti in attesa</span>

void barber(void) {
    while (TRUE) {
        <span class="k">down</span>(&amp;customers);   <span class="c">// nessun cliente? dormi</span>
        <span class="k">down</span>(&amp;mutex);
        waiting = waiting - 1;
        <span class="k">up</span>(&amp;barbers);       <span class="c">// sono pronto</span>
        <span class="k">up</span>(&amp;mutex);
        cut_hair();
    }
}

void customer(void) {
    <span class="k">down</span>(&amp;mutex);
    if (waiting &lt; CHAIRS) {
        waiting = waiting + 1;
        <span class="k">up</span>(&amp;customers);     <span class="c">// sveglia il barbiere se dorme</span>
        <span class="k">up</span>(&amp;mutex);
        <span class="k">down</span>(&amp;barbers);     <span class="c">// aspetta il tuo turno</span>
        get_haircut();
    } else {
        <span class="k">up</span>(&amp;mutex);         <span class="c">// niente posto: vattene</span>
    }
}`
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
              codeTitle: `le formule da usare negli esercizi`,
              code: `turnaround(i) = fine(i) - arrivo(i)
attesa(i)     = turnaround(i) - burst(i)
turnaround medio = ( somma dei turnaround ) / n
throughput    = lavori completati / tempo totale

<span class="c">// Round-robin: peso del context switch</span>
efficienza = quanto / (quanto + costo_switch)
<span class="c">// quanto = 4 ms, switch = 1 ms  -&gt;  4/5 = 80% (20% sprecato)</span>
<span class="c">// quanto = 100 ms, switch = 1 ms -&gt; 99%  (ma risposte lente)</span>`,
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
              desc: `<p><b>Shortest Process Next</b>: l'idea di SJF applicata ai sistemi interattivi. Non conoscendo la durata del prossimo burst, la si <b>stima</b> dalla storia passata.</p>
                <p><b>Aging</b>: media pesata fra la stima precedente e l'ultima misura, <b>a·T₀ + (1−a)·T₁</b>. Scegliendo <i>a</i> si decide quanta memoria dare al passato: <i>a</i> grande = stima inerziale, <i>a</i> piccolo = reattiva all'ultima misura.</p>`,
              codeTitle: `aging con a = 1/2 (somma e dimezza)`,
              code: `stima(n+1) = a * stima(n) + (1 - a) * misura(n)

<span class="c">// con a = 1/2 basta sommare e dividere per 2:</span>
T0 = 40                       <span class="c">// stima iniziale</span>
misuro 20  -&gt; (40 + 20)/2 = 30
misuro 20  -&gt; (30 + 20)/2 = 25
misuro 20  -&gt; (25 + 20)/2 = 22.5
misuro 20  -&gt; (22.5 + 20)/2 = 21.25   <span class="c">// converge verso 20</span>

<span class="c">// il peso delle misure vecchie decade esponenzialmente:</span>
<span class="c">// 1/2, 1/4, 1/8, 1/16 ...</span>`
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
              codeTitle: `traduzione di un indirizzo virtuale`,
              code: `<span class="c">// dati: pagine da 4 KB, indirizzo virtuale a 32 bit</span>
offset  = 12 bit          <span class="c">// perché 2^12 = 4096 = 4 KB</span>
n_pagina = 32 - 12 = 20 bit   <span class="c">// -&gt; 2^20 pagine, 1 M di voci</span>

<span class="c">// indirizzo virtuale 8196 (decimale):</span>
pagina = 8196 / 4096 = 2        <span class="c">// divisione intera</span>
offset = 8196 % 4096 = 4        <span class="c">// resto</span>

<span class="c">// se la tabella dice: pagina 2 -&gt; frame 6</span>
fisico = 6 * 4096 + 4 = 24580   <span class="c">// frame * dim_pagina + offset</span>

<span class="c">// in binario è solo una sostituzione di bit:</span>
<span class="c">//   [ n_pagina | offset ]  -&gt;  [ n_frame | offset ]</span>`,
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
              codeTitle: `gestione di un page fault, passo per passo`,
              code: `1. la MMU vede P = 0  -&gt; <span class="k">TRAP</span> al sistema operativo
2. il SO salva PC e registri (contesto del processo)
3. capisce quale pagina virtuale serviva
4. controlla che l'indirizzo sia <b>valido</b> e permesso
   <span class="c">// se non lo è: SIGSEGV, il processo muore</span>
5. cerca un frame libero
   se non c'è -&gt; sceglie una <b>vittima</b> (Clock/LRU/...)
   se vittima.M == 1 -&gt; la riscrive su disco  <span class="c">// pagina sporca</span>
6. legge la pagina richiesta dal disco nel frame
   <span class="c">// il processo resta BLOCCATO durante l'I/O:</span>
   <span class="c">// nel frattempo la CPU esegue qualcun altro</span>
7. aggiorna la tabella delle pagine: P = 1, R = 0, M = 0
8. ripristina il contesto e <b>rilancia l'istruzione</b> che aveva
   causato il fault  <span class="c">// stavolta la traduzione riesce</span>`,
              tip: `Il page fault <b>non è un errore</b> del programma: è il meccanismo normale della memoria virtuale. L'errore è l'accesso a un indirizzo <i>non valido</i> (segmentation fault), che il SO scopre al passo 4. E l'istruzione viene <b>rieseguita</b>, non ripresa a metà.`
            },
            {
              id: "c3-tlb", label: "TLB", sim: "sim_eat",
              desc: `<p>Il <b>Translation Lookaside Buffer</b> è una piccola cache associativa dentro la MMU (poche decine di voci) che memorizza le traduzioni usate di recente: senza, ogni accesso in memoria ne richiederebbe <b>due</b> (uno per la tabella, uno per il dato).</p>
                <ul><li><b>Hit</b>: traduzione immediata, niente accesso alla tabella.</li>
                <li><b>Miss</b>: si legge la tabella delle pagine e si inserisce la voce nel TLB, espellendone una.</li>
                <li>Funziona grazie alla <b>località</b>: pochi frame coprono la grande maggioranza degli accessi.</li>
                <li>Al context switch il TLB va <b>invalidato</b> (o le voci etichettate con l'ASID): è una delle voci di costo del cambio di processo.</li></ul>
                <p><b>EAT</b> = h·(t<sub>TLB</sub> + t<sub>mem</sub>) + (1−h)·(t<sub>TLB</sub> + 2·t<sub>mem</sub>), con <i>h</i> = hit ratio.</p>`,
              codeTitle: `EAT: esempio numerico`,
              code: `EAT = h * (t_tlb + t_mem) + (1 - h) * (t_tlb + 2 * t_mem)
      \\_____ hit _____/         \\________ miss ________/
                                 <span class="c">// 2 accessi: tabella + dato</span>

<span class="c">// t_tlb = 20 ns, t_mem = 100 ns, hit ratio h = 80%</span>
EAT = 0.80 * (20 + 100) + 0.20 * (20 + 200)
    = 0.80 * 120 + 0.20 * 220
    = 96 + 44 = <span class="k">140 ns</span>

<span class="c">// con h = 98%:  0.98*120 + 0.02*220 = 122 ns</span>
<span class="c">// senza TLB sarebbe sempre 200 ns: ecco quanto vale la località</span>`,
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
                <p><b>Anomalia di Belady</b>: con FIFO può capitare che <b>aumentando i frame aumentino i page fault</b> — controintuitivo, ma si dimostra con la stringa <code>0 1 2 3 0 1 4 0 1 2 3 4</code>.</p>`,
              codeTitle: `anomalia di Belady: 3 frame vs 4 frame`,
              code: `stringa: 0 1 2 3 0 1 4 0 1 2 3 4

<span class="c">// con 3 frame -&gt; 9 page fault</span>
0 1 2 | 3 0 1 | 4 . . | 2 3 .          <span class="c">// (. = hit)</span>

<span class="c">// con 4 frame -&gt; 10 page fault  (!!)</span>
0 1 2 3 | . . 4 0 | 1 2 3 4

<span class="c">// PIÙ memoria, PIÙ fault: è l'anomalia.</span>
<span class="c">// Succede perché FIFO ignora l'uso: con 4 frame le pagine</span>
<span class="c">// 0 e 1 finiscono espulse proprio prima di essere richieste.</span>`,
              tip: `LRU e OPT sono <b>algoritmi a stack</b> (con più frame l'insieme delle pagine residenti <i>contiene</i> quello con meno frame) e quindi <b>non soffrono</b> dell'anomalia; FIFO e seconda chance sì. Domanda ricorrente.`
            },
            {
              id: "c3-clock", label: "Seconda chance e Clock", sim: "sim_pages",
              desc: `<p><b>Seconda chance</b>: FIFO che però guarda il bit R della pagina più vecchia. Se R = 1, non la espelle: azzera R, la <b>rimette in coda</b> come se fosse appena arrivata, e prosegue. Se R = 0, la espelle.</p>
                <p><b>Clock</b>: identico nel comportamento, ma le pagine sono in una <b>lista circolare</b> con una lancetta. Invece di spostare le pagine in coda si sposta la lancetta — stessa politica, molto più efficiente.</p>`,
              codeTitle: `algoritmo Clock`,
              code: `page_fault():
    while (TRUE):
        p = pagina puntata dalla lancetta

        if (p.R == 0):
            <span class="c">// non usata di recente: è la vittima</span>
            if (p.M == 1) scrivi p su disco   <span class="c">// era sporca</span>
            carica la nuova pagina al posto di p
            avanza la lancetta
            return

        else:
            p.R = 0            <span class="c">// seconda chance:</span>
            avanza la lancetta <span class="c">// azzera R e passa alla prossima</span>

<span class="c">// Se TUTTE le pagine hanno R = 1, la lancetta fa un giro intero</span>
<span class="c">// azzerando i bit e torna al punto di partenza, che ora ha R = 0:</span>
<span class="c">// espelle la più vecchia -&gt; degenera in FIFO.</span>`,
              tip: `Clock e seconda chance producono <b>la stessa sequenza di vittime</b>: cambia solo l'implementazione (lista circolare + lancetta invece di spostare le pagine in coda).`
            },
            {
              id: "c3-lru", label: "LRU e aging",
              desc: `<p><b>LRU</b> (Least Recently Used): espelle la pagina non usata da più tempo. Ottima approssimazione dell'ottimale (il passato recente predice il futuro prossimo), ma costosa: richiede hardware speciale (lista aggiornata a ogni accesso, o un contatore per voce).</p>
                <p><b>Aging</b>: approssimazione software. Ogni pagina ha un contatore a <i>n</i> bit; a ogni tick il contatore viene <b>shiftato a destra</b> e il bit R viene inserito <b>a sinistra</b> (nel bit più significativo). Si espelle il contatore più basso.</p>
                <p>Così un accesso <i>recente</i> pesa più di molti accessi <i>vecchi</i>: è esattamente lo spirito di LRU.</p>
                <ul><li>Differenza da LRU: l'aging ha memoria finita (n tick) e, dentro lo stesso tick, non distingue l'ordine degli accessi.</li></ul>`,
              codeTitle: `aging: shift a destra, R entra da sinistra`,
              code: `ogni tick di clock:
    for (ogni pagina p):
        p.contatore = (p.contatore &gt;&gt; 1) | (p.R &lt;&lt; 7)   <span class="c">// 8 bit</span>
        p.R = 0

<span class="c">// esempio su 4 tick, contatori a 8 bit:</span>
<span class="c">// pagina  R:1 0 1 0     contatore dopo ogni tick</span>
        tick 1 (R=1)   10000000
        tick 2 (R=0)   01000000
        tick 3 (R=1)   10100000
        tick 4 (R=0)   01010000

<span class="c">// vittima = contatore PIÙ BASSO (usata meno di recente)</span>
<span class="c">// 00110000 &lt; 01000000: un accesso recente batte due vecchi.</span>`
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
                <p><b>Prepaginazione</b>: al ripristino di un processo swappato, si ricaricano subito le pagine del suo working set invece di aspettare un fault per ciascuna.</p>`,
              codeTitle: `calcolo del working set W(t, k)`,
              code: `<span class="c">// W(t,k) = pagine DISTINTE usate nelle ultime k referenze</span>
riferimenti: 2 6 1 5 7 7 7 5 1 6 2 3 4 1 2 3 4 4 4 3 4
                                     ^t1              ^t2

k = 10:
  W(t1, 10) = {1, 2, 5, 6, 7}   -&gt; |W| = 5 pagine
  W(t2, 10) = {1, 2, 3, 4}      -&gt; |W| = 4 pagine

<span class="c">// al processo servono almeno |W| frame:</span>
<span class="c">//   frame &gt;= |W|  -&gt; pochi page fault</span>
<span class="c">//   frame &lt;  |W|  -&gt; thrashing</span>
<span class="c">// somma dei working set &gt; frame totali del sistema</span>
<span class="c">//   =&gt; ridurre il grado di multiprogrammazione (swap out)</span>`
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
                <p>Con <i>s</i> = dimensione media del processo, <i>e</i> = byte per voce di tabella, l'overhead totale è minimizzato da <b>p = √(2·s·e)</b>. In pratica: 4 KB.</p>`,
              codeTitle: `dimensione ottimale della pagina`,
              code: `overhead(p) = s*e/p  +  p/2
              \\_____/     \\___/
          tabella pagine   frammentazione
          (piu' voci se     interna (mezza
           p e' piccola)    pagina sprecata)

<span class="c">// derivando e ponendo = 0:</span>
p_ottimo = sqrt(2 * s * e)

<span class="c">// s = 1 MB (processo medio), e = 8 byte per voce:</span>
p = sqrt(2 * 1048576 * 8) = sqrt(16777216) = <span class="k">4096 byte</span>`
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
              codeTitle: `hard link vs link simbolico`,
              code: `$ ln    a.txt  duro.txt    <span class="c">// hard link: stesso i-node</span>
$ ln -s a.txt  soft.txt    <span class="c">// simbolico: file che contiene "a.txt"</span>

i-node 27 [ contatore link = 2 ]  &lt;- a.txt, duro.txt
i-node 41 [ contenuto: "a.txt" ]  &lt;- soft.txt

$ rm a.txt
  i-node 27: contatore 2 -&gt; 1     <span class="c">// il file VIVE ancora</span>
  duro.txt  -&gt; funziona   <span class="k">OK</span>
  soft.txt  -&gt; punta a un nome che non esiste piu': <span class="k">dangling</span>

<span class="c">// il file viene davvero cancellato solo quando</span>
<span class="c">// il contatore dei link arriva a 0</span>`,
              tip: `Cancellare il file "originale" non rompe un hard link (i nomi sono <b>pari</b>: nessuno è più originale dell'altro), ma rompe un link simbolico. È la domanda tipica.`
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
              codeTitle: `dimensione massima di un file`,
              code: `<span class="c">// dati: blocchi da 1 KB, puntatori da 4 byte, 12 diretti</span>
k = B / p = 1024 / 4 = <span class="k">256</span>   <span class="c">// puntatori per blocco indice</span>

diretti          : 12          blocchi
indiretto singolo:      k =    256
indiretto doppio :    k^2 = 65 536
indiretto triplo :    k^3 = 16 777 216
                     ------------------
totale = 12 + k + k^2 + k^3 = 16 843 020 blocchi
max    = 16 843 020 * 1 KB ~= <span class="k">16 GB</span>

<span class="c">// accessi a disco per leggere UN blocco (senza cache):</span>
<span class="c">//   diretto: 1 | ind. singolo: 2 | doppio: 3 | triplo: 4</span>`,
              tip: `Esercizio ricorrente: con blocchi da <i>B</i> byte e puntatori da <i>p</i> byte, ogni blocco indice contiene <b>k = B/p</b> puntatori → capacità = (diretti + k + k² + k³) · B. Il grosso lo fa sempre l'indiretto triplo.`
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
              codeTitle: `stesso esempio, quattro algoritmi`,
              code: `<span class="c">// testina a 53, disco 0..199, direzione: verso l'alto</span>
<span class="c">// richieste: 98 183 37 122 14 124 65 67</span>

FCFS : 53-98-183-37-122-14-124-65-67
       spostamento totale = <span class="k">640</span>

SSTF : 53-65-67-37-14-98-122-124-183   <span class="c">// sempre la più vicina</span>
       totale = <span class="k">236</span>          <span class="c">// ottimo, ma affama i lontani</span>

SCAN : 53-65-67-98-122-124-183-<span class="k">199</span>-37-14
       totale = 146 + 185 = <span class="k">331</span>   <span class="c">// tocca il BORDO (199)</span>

LOOK : 53-65-67-98-122-124-183-37-14
       totale = 130 + 169 = <span class="k">299</span>   <span class="c">// inverte dopo l'ULTIMA richiesta</span>

<span class="c">// somma sempre |differenze| fra cilindri consecutivi</span>`,
              tip: `Convenzione del corso: <b>LOOK inverte dopo l'ultima richiesta</b>, SCAN arriva fino al <b>bordo del disco</b>. È la differenza messa apposta fra i distrattori — nell'esempio qui sopra vale 32 cilindri.`
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
              codeTitle: `XOR: calcolo e ricostruzione`,
              code: `<span class="c">// tabella dello XOR: 1 se i bit sono DIVERSI</span>
0^0 = 0   0^1 = 1   1^0 = 1   1^1 = 0
<span class="c">// proprietà chiave:  x ^ x = 0    e    x ^ 0 = x</span>

<span class="c">// striscia su 3 dischi dati + 1 di parità</span>
D1 = 1011
D2 = 0110
D3 = 1100
P  = D1 ^ D2 ^ D3
   = 1011 ^ 0110 = 1101
   = 1101 ^ 1100 = <span class="k">0001</span>

<span class="c">// si rompe D2: lo si ricostruisce con TUTTI gli altri + P</span>
D2 = D1 ^ D3 ^ P
   = 1011 ^ 1100 = 0111
   = 0111 ^ 0001 = <span class="k">0110</span>   <span class="c">// ...ed è proprio D2</span>`,
              tip: `Lo XOR è associativo e commutativo, e <b>x ⊕ x = 0</b>: per questo la stessa formula serve sia a calcolare la parità sia a ricostruire un dato qualunque. Verifica sempre il risultato rifacendo lo XOR di tutta la striscia: deve tornare la parità.`
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
