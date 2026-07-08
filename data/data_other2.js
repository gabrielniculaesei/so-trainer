// Altri esercizi risolti (tipologie plausibili all'esame)
window.ESERCIZI.push(

{ id:"ex201", topic:"processi", title:"Fork: quanti processi vengono creati?",
  text:`<p>Si consideri il seguente frammento di codice C eseguito da un processo P:</p>
<pre>for (int i = 0; i &lt; 3; i++)
    fork();</pre>
<p>1) Quanti processi esistono complessivamente al termine del ciclo (P incluso)?<br>
2) Quanti nuovi processi sono stati creati?<br>
3) E se le fork fossero 4?</p>`,
  sol:`<ol>
<li>Ogni fork <b>raddoppia</b> il numero di processi, perché anche i figli eseguono le fork successive del ciclo:<br>
dopo la 1ª fork: 2 processi; dopo la 2ª: 4; dopo la 3ª: <b>2³ = 8 processi</b>.</li>
<li>Nuovi processi creati = 2³ − 1 = <b>7</b>.</li>
<li>Con k fork in sequenza: 2<sup>k</sup> processi totali ⇒ con 4 fork: 2⁴ = 16 processi (15 creati).</li>
</ol>
<p><b>Trappola classica</b>: rispondere "3 processi creati" dimenticando che ANCHE i figli proseguono il ciclo ed eseguono le fork rimanenti. Disegna l'albero: P si sdoppia, poi ogni ramo si sdoppia di nuovo, ecc.</p>` },

{ id:"ex202", topic:"sostituzione", title:"NRU: classi e scelta della vittima",
  text:`<p>Un sistema usa l'algoritmo NRU. Al momento di un page fault le pagine in memoria hanno questi bit (R azzerato periodicamente, M = dirty) e tempo di caricamento:</p>
<div class="tablewrap"><table>
<tr><th>pagina</th><th>R</th><th>M</th><th>caricata al tempo</th></tr>
<tr><td>A</td><td>1</td><td>0</td><td>12</td></tr>
<tr><td>B</td><td>0</td><td>1</td><td>5</td></tr>
<tr><td>C</td><td>1</td><td>1</td><td>3</td></tr>
<tr><td>D</td><td>0</td><td>1</td><td>9</td></tr>
<tr><td>E</td><td>1</td><td>0</td><td>7</td></tr>
</table></div>
<p>1) Assegnare ogni pagina alla sua classe NRU. 2) Quale pagina viene scartata, e perché?</p>`,
  sol:`<ol>
<li>Classe = 2·R + M (R pesa di più perché azzerato periodicamente):<br>
<div class="tablewrap"><table>
<tr><th>classe</th><th>bit</th><th>pagine</th></tr>
<tr><td>0</td><td>R=0, M=0</td><td>—</td></tr>
<tr><td>1</td><td>R=0, M=1</td><td>B, D</td></tr>
<tr><td>2</td><td>R=1, M=0</td><td>A, E</td></tr>
<tr><td>3</td><td>R=1, M=1</td><td>C</td></tr>
</table></div></li>
<li>Si scarta dalla <b>classe più bassa non vuota</b> → classe 1 = {B, D}. Dentro la classe si sceglie in ordine FIFO (la più vecchia in RAM): B (tempo 5) è più vecchia di D (tempo 9) ⇒ <b>si scarta B</b>.</li>
</ol>
<p><b>Nota</b>: meglio scartare una pagina non referenziata di recente anche se modificata (classe 1), piuttosto che una referenziata di recente e pulita (classe 2): R domina su M.</p>` },

{ id:"ex203", topic:"sostituzione", title:"Working set: calcolo dall'elenco dei riferimenti",
  text:`<p>Un processo genera questa sequenza di riferimenti alle pagine (istanti 1…12):</p>
<pre>istante:  1  2  3  4  5  6  7  8  9 10 11 12
pagina :  2  1  5  1  2  3  5  3  2  4  3  4</pre>
<p>Con finestra Δ = 4, determinare il working set (e la sua cardinalità) agli istanti t = 6, t = 9 e t = 12.</p>`,
  sol:`<p>WS(t, Δ) = insieme delle pagine referenziate negli ultimi Δ accessi (istanti t−3 … t):</p>
<ol>
<li><b>t = 6</b>: riferimenti agli istanti 3,4,5,6 = {5, 1, 2, 3} ⇒ WS = {1, 2, 3, 5}, |WS| = 4.</li>
<li><b>t = 9</b>: riferimenti agli istanti 6,7,8,9 = {3, 5, 3, 2} ⇒ WS = {2, 3, 5}, |WS| = 3.</li>
<li><b>t = 12</b>: riferimenti agli istanti 9,10,11,12 = {2, 4, 3, 4} ⇒ WS = {2, 3, 4}, |WS| = 3.</li>
</ol>
<p><b>Uso pratico</b>: se al processo sono assegnati meno frame della cardinalità del working set, è in sofferenza (rischio thrashing) e l'OS dovrebbe dargli altri frame; se ne ha di più, alcuni possono essergli tolti. La somma delle cardinalità di tutti i WS confrontata coi frame disponibili dice se il sistema regge o serve swappare interi processi.</p>` },

{ id:"ex204", topic:"memoria", title:"Tabella multilivello: risolvere un indirizzo a 2 livelli",
  text:`<p>Sistema a 32 bit con tabella delle pagine a 2 livelli: 10 bit per la tabella di 1° livello, 10 bit per quella di 2° livello, 12 bit di offset (pagine da 4 KB).</p>
<p>Il processo genera l'indirizzo virtuale <b>4.206.596</b> (= 0x00403004).</p>
<p>1) Calcolare indice di 1° livello, indice di 2° livello e offset.<br>
2) Se la voce individuata punta al frame <b>8</b>, qual è l'indirizzo fisico?</p>`,
  sol:`<ol>
<li>Scomposizione dell'indirizzo:
<ul>
<li>indice 1° livello = ⌊4.206.596 / 2²²⌋ = ⌊4.206.596 / 4.194.304⌋ = <b>1</b></li>
<li>indice 2° livello = ⌊4.206.596 / 2¹²⌋ mod 2¹⁰ = ⌊4.206.596/4096⌋ mod 1024 = 1027 mod 1024 = <b>3</b></li>
<li>offset = 4.206.596 mod 4096 = <b>4</b></li>
</ul>
In binario: <code>0000000001 | 0000000011 | 000000000100</code></li>
<li>La voce 1 della tabella di 1° livello punta a una tabella di 2° livello; la voce 3 di questa dà il frame 8 ⇒ indirizzo fisico = 8·4096 + 4 = <b>32.772</b>.</li>
</ol>
<p><b>Costo</b>: senza TLB questa traduzione richiede 3 accessi in RAM (voce L1 + voce L2 + dato). Il vantaggio dei 2 livelli: le tabelle L2 delle zone virtuali vuote non vengono nemmeno create.</p>` },

{ id:"ex205", topic:"sync", title:"Semafori: contare i processi bloccati",
  text:`<p>Un semaforo S è inizializzato a <b>2</b>. Avvengono nell'ordine questi eventi:</p>
<pre>1) P1: down(S)     4) P4: down(S)
2) P2: down(S)     5) P5: down(S)
3) P3: down(S)     6) Q : up(S)
                   7) Q : up(S)</pre>
<p>Per ogni istante indicare il valore di S e i processi bloccati. Alla fine: quanti processi sono ancora bloccati?</p>`,
  sol:`<div class="tablewrap"><table>
<tr><th>evento</th><th>S dopo</th><th>bloccati</th><th>note</th></tr>
<tr><td>P1: down</td><td>1</td><td>—</td><td>passa</td></tr>
<tr><td>P2: down</td><td>0</td><td>—</td><td>passa</td></tr>
<tr><td>P3: down</td><td>0</td><td>P3</td><td>S=0 ⇒ blocco</td></tr>
<tr><td>P4: down</td><td>0</td><td>P3, P4</td><td>blocco</td></tr>
<tr><td>P5: down</td><td>0</td><td>P3, P4, P5</td><td>blocco</td></tr>
<tr><td>Q: up</td><td>0</td><td>P4, P5</td><td>risveglia P3 (S resta 0)</td></tr>
<tr><td>Q: up</td><td>0</td><td>P5</td><td>risveglia P4</td></tr>
</table></div>
<p><b>Alla fine: S = 0 e 1 processo bloccato (P5).</b></p>
<p><b>Scorciatoia</b>: valore 'concettuale' = init − down + up = 2 − 5 + 2 = −1: il valore negativo indica quanti processi restano bloccati (1); il semaforo reale non scende mai sotto 0 e una up con coda non vuota risveglia un processo invece di incrementare.</p>` },

{ id:"ex206", topic:"sync", title:"Produttore-consumatore: stato dei semafori a metà esecuzione",
  text:`<p>Buffer da N = 5 slot, semafori inizializzati a: empty = 5, full = 0, mutex = 1. Avvengono, completandosi, queste operazioni:</p>
<ol>
<li>Il produttore inserisce 3 item</li>
<li>Il consumatore estrae 1 item</li>
<li>Il produttore inserisce 3 item</li>
<li>Il produttore tenta di inserire un ulteriore item</li>
</ol>
<p>Dopo il passo 4, quali sono i valori di empty, full e mutex? Cosa sta facendo il produttore?</p>`,
  sol:`<ol>
<li>Dopo 3 inserimenti: empty = 5−3 = 2, full = 0+3 = 3, mutex = 1 (rilasciato dopo ogni inserimento).</li>
<li>Dopo 1 estrazione: empty = 3, full = 2, mutex = 1.</li>
<li>Dopo altri 3 inserimenti: empty = 0, full = 5, mutex = 1. Il buffer è pieno (5/5).</li>
<li>Il produttore esegue <code>down(empty)</code> con empty = 0 ⇒ <b>si blocca</b> PRIMA di entrare nella sezione critica.</li>
</ol>
<p><b>Stato finale: empty = 0, full = 5, mutex = 1, produttore bloccato su empty.</b></p>
<p><b>Nota</b>: il mutex vale 1 (libero): il produttore si è bloccato FUORI dalla sezione critica, quindi il consumatore può tranquillamente entrare, estrarre e con up(empty) risvegliarlo. È il motivo per cui down(empty) va fatta prima di down(mutex).</p>` },

{ id:"ex207", topic:"memoria", title:"First/Best/Worst/Next fit sulla lista dei buchi (classico Tanenbaum)",
  text:`<p>La memoria ha questi buchi liberi, in ordine di indirizzo:</p>
<pre>10 KB, 4 KB, 20 KB, 18 KB, 7 KB, 9 KB, 12 KB, 15 KB</pre>
<p>Arrivano in sequenza tre richieste di segmento da <b>12 KB</b>, <b>10 KB</b> e <b>9 KB</b>. In quale buco viene allocata ciascuna richiesta con: 1) first fit, 2) best fit, 3) worst fit, 4) next fit?</p>`,
  sol:`<ol>
<li><b>First fit</b> (primo buco capiente dall'inizio, ogni volta):<br>
12 KB → buco da <b>20</b> (resta 8); 10 KB → buco da <b>10</b> (esatto); 9 KB → buco da <b>18</b> (resta 9).</li>
<li><b>Best fit</b> (il più piccolo tra i capienti):<br>
12 KB → <b>12</b> (esatto); 10 KB → <b>10</b> (esatto); 9 KB → <b>9</b> (esatto).</li>
<li><b>Worst fit</b> (il più grande):<br>
12 KB → <b>20</b> (resta 8); 10 KB → <b>18</b> (resta 8); 9 KB → <b>15</b> (resta 6).</li>
<li><b>Next fit</b> (come first, ma ripartendo da dove ci si era fermati):<br>
12 KB → <b>20</b> (resta 8); riparto da lì: 10 KB → <b>18</b> (resta 8); 9 KB → 7? no → <b>9</b> (esatto).</li>
</ol>
<p><b>Osservazioni da esame</b>: best fit sembra perfetto qui, ma in generale crea micro-buchi inutilizzabili (paradossalmente peggiora la frammentazione esterna); first/next sono più veloci (non scandiscono tutta la lista); con la lista dei buchi ordinata per dimensione, best diventa immediato (testa) e worst pure (coda).</p>` },

{ id:"ex208", topic:"memoria", title:"EAT con page fault: quanto dev'essere raro un fault?",
  text:`<p>Tempo di accesso alla memoria (paginazione compresa) ma = <b>100 ns</b>; tempo di gestione di un page fault = <b>8 ms</b>.</p>
<p>1) Scrivere la formula dell'EAT in funzione del page fault rate p.<br>
2) Calcolare l'EAT per p = 0,1% (un fault ogni 1000 accessi).<br>
3) Quale valore massimo può avere p perché il degrado resti entro il <b>10%</b> (EAT ≤ 110 ns)?</p>`,
  sol:`<ol>
<li>EAT = (1 − p)·ma + p·t<sub>fault</sub> = (1−p)·100 + p·8.000.000 ns.</li>
<li>p = 0,001: EAT = 0,999·100 + 0,001·8.000.000 = 99,9 + 8000 ≈ <b>8100 ns</b>: 81 volte più lento! Un fault ogni 1000 accessi è già devastante.</li>
<li>110 ≥ (1−p)·100 + p·8.000.000 ⇒ 10 ≥ p·(8.000.000 − 100) ⇒ p ≤ 10/7.999.900 ≈ <b>1,25·10⁻⁶</b>,<br>
cioè al massimo <b>1 fault ogni 800.000 accessi</b>.</li>
</ol>
<p><b>Morale</b>: il costo del fault è di 4-5 ordini di grandezza superiore all'accesso: per questo gli algoritmi di sostituzione, il working set e il paging daemon esistono. Domanda 'sull'effective access time con relativo calcolo' apparsa all'esame.</p>` },

{ id:"ex209", topic:"sostituzione", title:"Anomalia di Belady: FIFO con 3 e 4 frame",
  text:`<p>Sequenza di riferimenti:</p>
<pre>1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5</pre>
<p>Contare i page fault con FIFO usando 3 frame e poi 4 frame. Cosa si osserva?</p>`,
  sol:`<p><b>3 frame</b> (F = fault, h = hit):</p>
<div class="tablewrap"><table>
<tr><th>rif.</th><td>1</td><td>2</td><td>3</td><td>4</td><td>1</td><td>2</td><td>5</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
<tr><th>memoria</th><td>1</td><td>1,2</td><td>1,2,3</td><td>2,3,4</td><td>3,4,1</td><td>4,1,2</td><td>1,2,5</td><td>1,2,5</td><td>1,2,5</td><td>2,5,3</td><td>5,3,4</td><td>5,3,4</td></tr>
<tr><th>esito</th><td>F</td><td>F</td><td>F</td><td>F</td><td>F</td><td>F</td><td>F</td><td>h</td><td>h</td><td>F</td><td>F</td><td>h</td></tr>
</table></div>
<p>Totale: <b>9 fault</b>.</p>
<p><b>4 frame</b>:</p>
<div class="tablewrap"><table>
<tr><th>rif.</th><td>1</td><td>2</td><td>3</td><td>4</td><td>1</td><td>2</td><td>5</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
<tr><th>memoria</th><td>1</td><td>1,2</td><td>1,2,3</td><td>1,2,3,4</td><td>=</td><td>=</td><td>2,3,4,5</td><td>3,4,5,1</td><td>4,5,1,2</td><td>5,1,2,3</td><td>1,2,3,4</td><td>2,3,4,5</td></tr>
<tr><th>esito</th><td>F</td><td>F</td><td>F</td><td>F</td><td>h</td><td>h</td><td>F</td><td>F</td><td>F</td><td>F</td><td>F</td><td>F</td></tr>
</table></div>
<p>Totale: <b>10 fault</b>.</p>
<p><b>Osservazione (anomalia di Belady)</b>: con un frame IN PIÙ i fault sono AUMENTATI (9 → 10). Accade solo con algoritmi FIFO-based (FIFO, seconda chance, clock); gli LRU-based ne sono immuni per la proprietà di inclusione.</p>` },

{ id:"ex210", topic:"dischi", title:"RAID 4: il costo di una piccola scrittura",
  text:`<p>Un RAID 4 ha 4 dischi dati (D1..D4) + 1 disco di parità P. Va riscritto UN solo stripe su D2.</p>
<p>1) Quante operazioni di I/O servono, nel caso generale, per completare la scrittura mantenendo la parità corretta? Elencarle.<br>
2) Con quale formula si calcola la nuova parità senza rileggere tutta la riga?<br>
3) Perché questo schema penalizza il disco P, e come lo risolve il RAID 5?</p>`,
  sol:`<ol>
<li><b>4 operazioni di I/O</b>: leggere lo stripe vecchio da D2, leggere la parità vecchia da P, scrivere lo stripe nuovo su D2, scrivere la parità nuova su P. (Se lo stripe vecchio è ancora nella cache del disco, si risparmia la prima lettura.)</li>
<li>P<sub>nuova</sub> = P<sub>vecchia</sub> ⊕ stripe<sub>vecchio</sub> ⊕ stripe<sub>nuovo</sub>: lo XOR col valore vecchio 'toglie' il suo contributo, quello col nuovo lo 'aggiunge'. Non serve leggere D1, D3, D4.</li>
<li>OGNI scrittura su QUALSIASI disco dati coinvolge anche P: il disco di parità lavora molto più degli altri (collo di bottiglia e usura precoce). Il RAID 5 distribuisce i blocchi di parità su tutti i dischi: carico bilanciato e prestazioni ×n anche in scrittura.</li>
</ol>` },

{ id:"ex211", topic:"fs", title:"Hard-link: tracciare il contatore dei riferimenti",
  text:`<p>Su un file system UNIX a i-node avvengono queste operazioni:</p>
<pre>1) L'utente A crea /home/a/dati.txt
2) L'utente B crea l'hard-link /home/b/mio.txt  → stesso file
3) L'utente A crea l'hard-link /home/a/backup   → stesso file
4) L'utente A cancella /home/a/dati.txt
5) L'utente B cancella /home/b/mio.txt
6) L'utente A cancella /home/a/backup</pre>
<p>Indicare il valore del contatore dei riferimenti dell'i-node dopo ogni passo e dire quando il contenuto del file viene davvero rimosso dal disco.</p>`,
  sol:`<div class="tablewrap"><table>
<tr><th>passo</th><th>operazione</th><th>contatore</th></tr>
<tr><td>1</td><td>creazione</td><td>1</td></tr>
<tr><td>2</td><td>+ hard-link di B</td><td>2</td></tr>
<tr><td>3</td><td>+ hard-link di A</td><td>3</td></tr>
<tr><td>4</td><td>− dati.txt</td><td>2</td></tr>
<tr><td>5</td><td>− mio.txt</td><td>1</td></tr>
<tr><td>6</td><td>− backup</td><td>0 ⇒ i-node deallocato</td></tr>
</table></div>
<p>Il contenuto sparisce solo al passo <b>6</b>, quando il contatore arriva a 0: cancellare 'l'originale' (passo 4) non elimina nulla, perché per l'OS i riferimenti sono indistinguibili.</p>
<p><b>Nota (anomalia dell'accounting)</b>: dai passi 4 a 6 il file continua a pesare sulla quota disco dell'utente A, anche se A non ha più riferimenti 'suoi' dopo il passo 4… anzi: al passo 5-6 il file è raggiungibile solo tramite il link di A (backup), ma il proprietario resta A in ogni caso.</p>` },

{ id:"ex212", topic:"fs", title:"Stesso offset, quattro allocazioni: confronto completo",
  text:`<p>Un file F è lungo 20 KB su un file system con blocchi da <b>4 KB</b> (5 blocchi: b0…b4). Vogliamo il byte di offset <b>17.000</b>.</p>
<p>Per ciascuna tecnica, dire quale blocco del disco contiene l'offset e quanti accessi/letture servono per individuarlo:</p>
<ol><li>Allocazione contigua, F inizia al blocco 200</li>
<li>Lista linkata semplice (puntatori nei blocchi), F inizia al blocco 84 con catena 84 → 91 → 87 → 90 → 95</li>
<li>FAT (stessa catena), FAT in RAM</li>
<li>I-node (blocchi nelle prime 5 voci dirette: 84, 91, 87, 90, 95), i-node in RAM</li></ol>`,
  sol:`<p>Indice del blocco nel file: k = ⌊17.000 / 4096⌋ = <b>4</b> ⇒ serve il 5° blocco del file (b4).</p>
<ol>
<li><b>Contigua</b>: blocco = 200 + 4 = <b>204</b>. Calcolo diretto, <b>0 letture</b> aggiuntive dal disco: si legge subito il blocco 204. Accesso O(1).</li>
<li><b>Lista linkata</b>: bisogna leggere DAL DISCO b0=84, b1=91, b2=87, b3=90 per seguire i puntatori ⇒ <b>4 letture disco</b> prima di arrivare al blocco <b>95</b>. Accesso O(n) su disco.</li>
<li><b>FAT</b>: stessi 4 salti (84→91→87→90→95) ma nella tabella <b>in RAM</b>: velocissimi; poi UNA lettura disco del blocco <b>95</b>.</li>
<li><b>I-node</b>: la voce diretta n.4 dà subito il blocco <b>95</b>: nessun salto, una lettura disco. (Oltre il 10° blocco sarebbero serviti gli indiretti: 1-2 letture disco extra per le tabelle.)</li>
</ol>
<p><b>Morale</b>: la differenza tra le tecniche non è DOVE sta il file ma QUANTO costa arrivarci: contigua O(1) ma inflessibile; lista O(n) su disco; FAT O(n) ma in RAM; i-node O(1) per i file piccoli, con la RAM occupata solo dai file aperti.</p>` },

{ id:"ex213", topic:"sched", title:"Priorità con prelazione: schedulare e calcolare i tempi",
  text:`<p>Scheduling a <b>priorità con prelazione</b> (numero più alto = priorità più alta; a parità, ordine di arrivo):</p>
<div class="tablewrap"><table>
<tr><th>processo</th><th>arrivo</th><th>durata</th><th>priorità</th></tr>
<tr><td>A</td><td>0</td><td>4</td><td>1</td></tr>
<tr><td>B</td><td>1</td><td>3</td><td>3</td></tr>
<tr><td>C</td><td>2</td><td>2</td><td>4</td></tr>
<tr><td>D</td><td>4</td><td>1</td><td>2</td></tr>
</table></div>
<p>Costruire il diagramma di Gantt e calcolare attesa media e turnaround medio.</p>`,
  sol:`<ol>
<li><b>Gantt</b>: t0–1: A (unico). t1: arriva B (pr.3 &gt; 1) ⇒ prelazione: t1–2: B. t2: arriva C (pr.4 &gt; 3) ⇒ prelazione: t2–4: C (completa). t4: arriva D; pronti: B (pr.3, residuo 2), D (pr.2), A (pr.1, residuo 3) ⇒ t4–6: B (completa). t6–7: D. t7–10: A.<br>
<code>[0–1 A][1–2 B][2–4 C][4–6 B][6–7 D][7–10 A]</code></li>
<li>Completamenti: A=10, B=6, C=4, D=7.</li>
<li>Turnaround (fine − arrivo): A: 10, B: 5, C: 2, D: 3 → medio = 20/4 = <b>5</b>.</li>
<li>Attesa (turnaround − durata): A: 6, B: 2, C: 0, D: 2 → media = 10/4 = <b>2,5</b>.</li>
</ol>
<p><b>Da ricordare</b>: nello scheduling a priorità con prelazione, il confronto avviene ad ogni ARRIVO (come in SRTN, ma sul campo priorità). Il processo a bassa priorità (A) rischia la starvation: si cura con l'aging.</p>` },

{ id:"ex214", topic:"memoria", title:"Dal numero di bit alla struttura: progettare la paginazione",
  text:`<p>Una macchina ha indirizzi virtuali a <b>24 bit</b>, pagine da <b>2 KB</b> e <b>1 MB</b> di RAM.</p>
<ol><li>Quanti bit per l'offset, quanti per il numero di pagina virtuale, quante voci nella tabella?</li>
<li>Quanti frame ha la RAM e quanti bit servono per il numero di frame?</li>
<li>Se ogni voce occupa 4 byte, quanto è grande la tabella delle pagine? E quante tabelle da 2 KB servirebbero per contenerla (spunto per il multilivello)?</li></ol>`,
  sol:`<ol>
<li>Offset: 2 KB = 2¹¹ ⇒ <b>11 bit</b>. Numero di pagina: 24 − 11 = <b>13 bit</b> ⇒ <b>2¹³ = 8192 voci</b>.</li>
<li>Frame: 1 MB / 2 KB = 2²⁰/2¹¹ = 2⁹ = <b>512 frame</b> ⇒ numero di frame a <b>9 bit</b> (sta comodamente in una voce insieme ai bit di controllo).</li>
<li>Tabella = 8192 · 4 B = <b>32 KB</b> ⇒ 32 KB / 2 KB = <b>16 pagine</b> solo per la tabella! Con un 2° livello si materializzano solo le parti realmente usate dello spazio virtuale.</li>
</ol>
<p><b>Schema riassuntivo</b>: bit offset = log₂(dim pagina); bit numero pagina = bit virtuali − bit offset; voci = 2^(bit numero pagina); frame = RAM / dim pagina. L'indirizzo FISICO non influenza mai il numero di voci.</p>` },

{ id:"ex215", topic:"fs", title:"I-node: quanti accessi al disco per aprire un file?",
  text:`<p>File system UNIX a i-node. Si vuole aprire il file <code>/usr/carlo/documenti</code>.</p>
<p>L'i-node della radice <code>/</code> è già in RAM. Ogni directory occupa un solo blocco dati e ogni i-node sta in un blocco a sé; nessun altro blocco è in cache.</p>
<p>1) Quanti accessi al disco servono per raggiungere l'i-node di <code>documenti</code>?<br>
2) E per leggere anche il primo blocco di dati del file?</p>`,
  sol:`<p>La radice è in RAM, quindi si parte dal suo blocco dati. Ogni livello del percorso costa due accessi: leggere il blocco dati della directory padre (per trovare la voce e il numero di i-node del figlio) e poi leggere l'i-node del figlio.</p>
<ol>
<li>leggo il blocco dati di <code>/</code> → trovo «usr» e il suo numero di i-node</li>
<li>leggo l'i-node di <code>/usr</code></li>
<li>leggo il blocco dati di <code>/usr</code> → trovo «carlo»</li>
<li>leggo l'i-node di <code>/usr/carlo</code></li>
<li>leggo il blocco dati di <code>/usr/carlo</code> → trovo «documenti»</li>
<li>leggo l'i-node di <code>/usr/carlo/documenti</code></li>
</ol>
<p>1) <b>6 accessi</b> per l'i-node del file (= 2 × 3 componenti, con la radice già in RAM).<br>
2) Leggere anche il primo blocco dati del file: <b>7 accessi</b>.</p>
<p><b>Regola</b>: con la radice in RAM servono <b>2·k</b> accessi per l'i-node del file (k = componenti del percorso), <b>+1</b> per leggerne il primo blocco dati. Se anche l'i-node della radice fosse su disco, sarebbe +1 all'inizio.</p>` },

{ id:"ex216", topic:"memoria", title:"Tabella a 2 livelli: quanta memoria occupa davvero",
  text:`<p>Paginazione a 2 livelli su 32 bit: 10 bit per l'indice di 1° livello, 10 bit per quello di 2° livello, 12 bit di offset (pagine da 4 KB). Ogni tabella (L1 o L2) occupa esattamente una pagina da 4 KB (1024 voci × 4 byte).</p>
<p>Un processo usa <b>solo due</b> regioni dello spazio virtuale: <b>[0, 1.000.000]</b> e <b>[4.200.000, 5.200.000]</b>.</p>
<p>1) Quanta memoria fisica occupano le sue tabelle delle pagine?<br>
2) Confronto con una tabella a un solo livello.</p>`,
  sol:`<p>Ogni voce di L1 copre 2²² byte = <b>4 MB</b> (1024 pagine × 4 KB). Una tabella L2 va materializzata solo per gli indici L1 effettivamente toccati.</p>
<ol>
<li>Regione [0, 1.000.000]: sta tutta nell'indice L1 <b>0</b> (0 … 4.194.303) ⇒ serve <b>1 tabella L2</b>.</li>
<li>Regione [4.200.000, 5.200.000]: entrambi gli estremi cadono in [4.194.304, 8.388.607], cioè indice L1 <b>1</b> ⇒ serve <b>1 tabella L2</b>.</li>
</ol>
<p>Totale: <b>1 tabella L1 + 2 tabelle L2 = 3 pagine × 4 KB = 12 KB</b>.</p>
<p>2) Una tabella a un solo livello avrebbe 2²⁰ voci × 4 byte = <b>4 MB sempre residenti</b>, indipendentemente da quanto spazio è realmente usato. Il multilivello materializza solo le L2 delle zone davvero indirizzate.</p>
<p><b>Attenzione</b>: se una regione attraversasse più multipli di 4 MB, servirebbe una L2 per <i>ciascun</i> indice L1 toccato.</p>` },

{ id:"ex217", topic:"memoria", title:"Tempo di accesso medio con memoria cache",
  text:`<p>Una CPU consulta una <b>cache</b> prima della RAM. Tempo di accesso alla cache = <b>5 ns</b>, tempo di accesso alla RAM = <b>100 ns</b>, <b>hit ratio</b> della cache = <b>95%</b>.</p>
<p>1) Calcolare il tempo di accesso medio alla memoria.<br>
2) Come cambia se il controllore aggiunge un <b>overhead</b> fisso di 2 ns a ogni accesso?<br>
3) Quale hit ratio servirebbe per avere un tempo medio ≤ 8 ns (senza overhead)?</p>`,
  sol:`<p>In caso di <b>hit</b> si paga solo la cache; in caso di <b>miss</b> si paga la ricerca in cache <i>e poi</i> l'accesso alla RAM: t<sub>miss</sub> = 5 + 100 = 105 ns.</p>
<ol>
<li>T = h·t<sub>hit</sub> + (1−h)·t<sub>miss</sub> = 0,95·5 + 0,05·105 = 4,75 + 5,25 = <b>10 ns</b>.<br>
Forma equivalente: T = t<sub>cache</sub> + (1−h)·t<sub>RAM</sub> = 5 + 0,05·100 = <b>10 ns</b>.</li>
<li>Con overhead fisso: T = 2 + 10 = <b>12 ns</b> (l'overhead si somma a ogni accesso, hit o miss).</li>
<li>8 ≥ 5 + (1−h)·100 ⇒ 3 ≥ (1−h)·100 ⇒ 1−h ≤ 0,03 ⇒ <b>h ≥ 97%</b>.</li>
</ol>
<p><b>Nota</b>: è la stessa struttura dell'EAT con TLB (media pesata hit/miss), qui applicata alla gerarchia cache–RAM. Questa "formulona" (tempo medio con cache hit, cache miss ed eventuale overhead) è comparsa allo scritto; il termine di miss domina il tempo medio, per questo si punta a hit ratio altissimi.</p>` },

{ id:"ex218", topic:"intro", title:"Pipeline: throughput e latenza",
  text:`<p>Una CPU ha una pipeline a <b>3 stadi</b>; ogni stadio impiega <b>6 ns</b> per completare il proprio lavoro.</p>
<p>1) Qual è il throughput della CPU a regime (istruzioni al secondo)?<br>
2) Qual è la latenza di una singola istruzione?<br>
3) Quanto tempo serve per completare 1000 istruzioni (pipeline inizialmente vuota)?</p>`,
  sol:`<ol>
<li>A regime esce <b>1 istruzione ogni 6 ns</b> (il periodo è dettato da un solo stadio, non dalla loro somma) ⇒ throughput = 1 / (6·10⁻⁹ s) ≈ <b>166.666.667 istruzioni/s ≈ 166,7 MIPS</b>.</li>
<li>Latenza = 3 stadi · 6 ns = <b>18 ns</b> (tempo di attraversamento di UNA istruzione dall'ingresso all'uscita).</li>
<li>La prima istruzione esce dopo 18 ns; le altre 999 escono una ogni 6 ns:<br>
T = (3 + 1000 − 1)·6 = 1002·6 = <b>6012 ns</b>.</li>
</ol>
<p><b>Attenzione (apparso all'esame)</b>: throughput ≠ 1/latenza. Il throughput dipende dallo stadio più lento (qui 1 ogni 6 ns), NON dai 18 ns di attraversamento. La pipeline aumenta il throughput, non riduce la latenza della singola istruzione.</p>` },

{ id:"ex219", topic:"fs", title:"Allocazione indicizzata a due livelli: file da 1 MB",
  text:`<p>File system con <b>allocazione indicizzata a due livelli</b>: blocco logico da <b>512 byte</b>, indirizzi di blocco da <b>4 byte</b>. L'indice di 1° livello punta a blocchi indice di 2° livello, che a loro volta puntano ai blocchi di dati del file.</p>
<p>Per un file da <b>1 MB</b>:</p>
<ol><li>Quanti indirizzi entrano in un blocco indice?</li>
<li>Quanti blocchi occupa il file in totale (dati + indici)?</li>
<li>Come si accede al suo 400° blocco?</li>
<li>Come si accede al byte 236.448?</li>
<li>Qual è la dimensione massima di un file e quanti blocchi occupa al massimo?</li></ol>`,
  sol:`<ol>
<li>Indirizzi per blocco = 512 / 4 = <b>128 puntatori</b>.</li>
<li>Dati: 1 MB / 512 = 1.048.576 / 512 = <b>2048 blocchi dati</b>. Servono ⌈2048/128⌉ = <b>16 blocchi indice di 2° livello</b>, più <b>1 blocco indice di 1° livello</b> ⇒ totale = 2048 + 16 + 1 = <b>2065 blocchi</b>.</li>
<li>Il blocco n. 400 è indicizzato dal blocco indice di 2° livello n. ⌊400/128⌋ = <b>3</b>, alla posizione 400 mod 128 = <b>16</b> al suo interno. Quel blocco di 2° livello è a sua volta puntato dal 4° indirizzo (indice 3) dell'indice di 1° livello, che occupa i byte 12–15 del blocco di 1° livello.</li>
<li>Il byte 236.448 sta nel blocco ⌊236.448 / 512⌋ = <b>461</b> (contando da 0 ⇒ 462° blocco), all'offset 236.448 mod 512 = <b>416</b>. Individuato il blocco, lo si raggiunge come al punto 3.</li>
<li>Con 128 puntatori nell'indice di 1° livello e 128 in ciascuno di 2° livello: max = 128 × 128 = 16.384 blocchi dati ⇒ <b>16.384 × 512 = 8 MB</b> (8.388.608 byte). Occupa al massimo 16.384 + 128 + 1 = <b>16.513 blocchi</b>.</li>
</ol>
<p><b>Metodo generale</b>: blocco del file k = ⌊byte / dim_blocco⌋; indice di 2° livello = ⌊k / P⌋, posizione nel blocco = k mod P (con P = puntatori per blocco). La dimensione massima è P²·dim_blocco.</p>` },

{ id:"ex220", topic:"dischi", title:"SCAN con richieste che arrivano nel tempo + tempo di attesa medio",
  text:`<p>Disco con tracce da <b>0 a 100</b>, gestito con politica <b>SCAN</b>. All'istante 0 la testina è sul cilindro <b>40</b> in direzione <b>ascendente</b>; lo spostamento a una traccia adiacente richiede <b>2 ms</b> (si trascuri la latenza).</p>
<p>Arrivano richieste per i cilindri <b>90, 45, 40, 60, 55</b> rispettivamente agli istanti <b>0, 20, 30, 40, 80 ms</b>.</p>
<p>1) In che ordine vengono servite? 2) Qual è il tempo di attesa medio (dall'istante di arrivo a quello di servizio)?</p>`,
  sol:`<p>La testina sale da 40 a 0,5 tracce/ms (2 ms/traccia). Posizione all'arrivo di ciascuna richiesta:</p>
<div class="tablewrap"><table>
<tr><th>richiesta</th><th>arrivo</th><th>posizione testina</th><th>quando servita</th></tr>
<tr><td>90</td><td>0</td><td>40 (sale)</td><td>t=100</td></tr>
<tr><td>45</td><td>20</td><td>50 → già superata, al ritorno</td><td>t=230</td></tr>
<tr><td>40</td><td>30</td><td>55 → già superata, al ritorno</td><td>t=240</td></tr>
<tr><td>60</td><td>40</td><td>60 → esattamente sotto la testina</td><td>t=40</td></tr>
<tr><td>55</td><td>80</td><td>80 → già superata, al ritorno</td><td>t=210</td></tr>
</table></div>
<p>Salendo la testina serve 60 (t=40) e 90 (t=100), prosegue fino all'estremo fisico <b>100</b> (t=120, SCAN va sempre al bordo), poi inverte e scendendo serve 55 (t=210), 45 (t=230), 40 (t=240).</p>
<ol>
<li><b>Ordine di servizio: 60, 90, 55, 45, 40.</b></li>
<li>Tempi di attesa (servizio − arrivo): 60: 40−40=0; 90: 100−0=100; 55: 210−80=130; 45: 230−20=210; 40: 240−30=210.<br>
Media = (0 + 100 + 130 + 210 + 210) / 5 = 650 / 5 = <b>130 ms</b>.</li>
</ol>
<p><b>Attenzione</b>: SCAN (a differenza di LOOK) arriva sempre all'estremo fisico del disco (qui 100) prima di invertire. Traccia SEMPRE la posizione della testina all'istante di ogni arrivo: se la richiesta è già stata oltrepassata nel verso corrente, verrà servita solo al ritorno.</p>` }
);
