// Generatori di esercizi a parametri casuali: ogni generatore espone { id, topic, title, gen() } e gen() restituisce { text, sol }
(function () {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));     // int in [a,b]
  const pick = arr => arr[ri(0, arr.length - 1)];
  const fmt = n => n.toLocaleString("it-IT");
  const log2 = n => Math.round(Math.log2(n));
  function bytesHuman(b) {
    if (b >= 2 ** 40) return (b / 2 ** 40) + " TB";
    if (b >= 2 ** 30) return (b / 2 ** 30) + " GB";
    if (b >= 2 ** 20) return (b / 2 ** 20) + " MB";
    if (b >= 1024) return (b / 1024) + " KB";
    return b + " byte";
  }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i);[a[i], a[j]] = [a[j], a[i]]; } return a; }

  window.GENERATORS = [];

  // Memoria virtuale: frame fisici (stile compito Q3)
  window.GENERATORS.push({
    id: "gframes", topic: "memoria", title: "Memoria virtuale: dimensione pagina e numero di frame",
    gen() {
      const pageBits = pick([8, 9, 10, 11, 12]);            // pagina 256B..4KB
      const vasBits = pick([28, 29, 30, 31, 32]);           // 256MB..4GB
      const vpnBits = vasBits - pageBits;
      const physBits = pick([20, 21, 22, 23, 24]);
      const frames = 2 ** (physBits - pageBits);
      const text = `<p>Un sistema usa memoria virtuale con: spazio di indirizzamento virtuale da <b>${bytesHuman(2 ** vasBits)}</b>, numero di pagina virtuale a <b>${vpnBits} bit</b> e indirizzo fisico a <b>${physBits} bit</b>.</p><p><b>Determinare la dimensione della pagina e quanti frame fisici ci sono in memoria.</b></p>`;
      const sol = `<ol>
<li>Spazio virtuale = ${bytesHuman(2 ** vasBits)} = 2<sup>${vasBits}</sup> byte; pagine virtuali = 2<sup>${vpnBits}</sup>.</li>
<li>Dimensione pagina = 2<sup>${vasBits}</sup> / 2<sup>${vpnBits}</sup> = 2<sup>${pageBits}</sup> = <b>${bytesHuman(2 ** pageBits)}</b>.</li>
<li>RAM = 2<sup>${physBits}</sup> byte = ${bytesHuman(2 ** physBits)}.</li>
<li>Frame = 2<sup>${physBits}</sup> / 2<sup>${pageBits}</sup> = 2<sup>${physBits - pageBits}</sup> = <b>${fmt(frames)} frame</b>.</li></ol>`;
      return { text, sol };
    }
  });

  // Tabella delle pagine: voci e dimensione
  window.GENERATORS.push({
    id: "gpt", topic: "memoria", title: "Tabella delle pagine: numero di voci e dimensione",
    gen() {
      const vBits = pick([32, 36, 48]);
      const pageKB = pick([4, 8, 16]);
      const offBits = log2(pageKB * 1024);
      const entryB = pick([4, 8]);
      const physBits = pick([30, 32, 34]);
      const nBits = vBits - offBits;
      const tableBytes = 2 ** nBits * entryB;
      const text = `<p>Una macchina ha indirizzi virtuali a <b>${vBits} bit</b>, indirizzi fisici a <b>${physBits} bit</b> e pagine da <b>${pageKB} KB</b>. Ogni voce della tabella delle pagine occupa <b>${entryB} byte</b>.</p><p><b>Quante voci ha la tabella delle pagine a un solo livello e quanto spazio occupa?</b></p>`;
      const sol = `<ol>
<li>Offset in una pagina da ${pageKB} KB = 2<sup>${offBits}</sup> byte ⇒ <b>${offBits} bit</b> di offset.</li>
<li>Numero di pagina virtuale = ${vBits} − ${offBits} = <b>${nBits} bit</b> ⇒ voci = 2<sup>${nBits}</sup> = ${fmt(2 ** nBits)}.</li>
<li>Dimensione tabella = 2<sup>${nBits}</sup> · ${entryB} byte = <b>${bytesHuman(tableBytes)}</b>.</li>
<li><b>Trappola</b>: l'indirizzo fisico (${physBits} bit) NON influenza il numero di voci: serve solo a dimensionare il campo 'numero di frame' dentro la voce. Le voci dipendono solo da spazio virtuale e dimensione pagina.</li></ol>`;
      return { text, sol };
    }
  });

  // EAT con TLB (formula del corso)
  window.GENERATORS.push({
    id: "geat", topic: "memoria", title: "Effective Access Time con TLB",
    gen() {
      const tlb = pick([1, 2, 5, 10, 20]);
      const ram = pick([50, 80, 100, 120, 150, 200]);
      const h = pick([70, 80, 85, 90, 95, 98]);
      const eat = (h / 100) * (tlb + ram) + (1 - h / 100) * (tlb + 2 * ram);
      const noTlb = 2 * ram;
      const text = `<p>Sistema paginato a un livello con tabella delle pagine in RAM. Tempo di accesso alla RAM = <b>${ram} ns</b>, tempo di accesso al TLB = <b>${tlb} ns</b>, TLB hit ratio = <b>${h}%</b>.</p><p><b>Calcolare il tempo effettivo di accesso (EAT) e confrontarlo con il caso senza TLB.</b></p>`;
      const sol = `<ol>
<li>TLB hit (${h}%): 1 solo accesso in RAM ⇒ t = ${tlb} + ${ram} = ${tlb + ram} ns.</li>
<li>TLB miss (${100 - h}%): 2 accessi (tabella + dato) ⇒ t = ${tlb} + 2·${ram} = ${tlb + 2 * ram} ns.</li>
<li>EAT = ${h / 100}·${tlb + ram} + ${(100 - h) / 100}·${tlb + 2 * ram} = <b>${eat.toFixed(1)} ns</b>.</li>
<li>Senza TLB: sempre 2 accessi ⇒ EAT = 2·${ram} = ${noTlb} ns. Con il TLB si risparmia il ${(100 * (noTlb - eat) / noTlb).toFixed(1)}%.</li></ol>
<p><b>Formula</b>: EAT = h·(t<sub>TLB</sub>+t<sub>RAM</sub>) + (1−h)·(t<sub>TLB</sub>+2t<sub>RAM</sub>). Con tabella a k livelli il miss costa (k+1) accessi in RAM.</p>`;
      return { text, sol };
    }
  });

  // EAT con TLB + page fault
  window.GENERATORS.push({
    id: "geatpf", topic: "memoria", title: "EAT con TLB e page fault",
    gen() {
      const tlb = pick([50, 100, 150]);
      const ram = pick([200, 300, 400]);
      const h = pick([70, 80, 90]);
      const pfr = pick([1, 2, 5]);         // %
      const pfms = pick([5, 8, 10]);       // ms
      const pfns = pfms * 1e6;
      const cHit = (h / 100) * (tlb + ram);
      const cMiss = (1 - h / 100) * (1 - pfr / 100) * (tlb + 2 * ram);
      const cPf = (1 - h / 100) * (pfr / 100) * (tlb + pfns);
      const eat = cHit + cMiss + cPf;
      const text = `<p>L'accesso al TLB richiede <b>${tlb} ns</b>, l'accesso alla memoria <b>${ram} ns</b>. La gestione di un page fault (caricamento della pagina) richiede <b>${pfms} ms</b>. Il page fault rate è <b>${pfr}%</b> e il TLB hit ratio è <b>${h}%</b>.</p><p><b>Calcolare l'EAT.</b> (Il page fault può verificarsi solo dopo un TLB miss.)</p>`;
      const sol = `<ol>
<li><b>TLB hit</b> (${h}%): la pagina è certamente in RAM ⇒ t = ${tlb} + ${ram} = ${tlb + ram} ns.</li>
<li><b>TLB miss senza fault</b> (${100 - h}% · ${100 - pfr}%): t = ${tlb} + 2·${ram} = ${tlb + 2 * ram} ns.</li>
<li><b>TLB miss con page fault</b> (${100 - h}% · ${pfr}%): t ≈ ${tlb} ns + ${pfms} ms = ${fmt(tlb + pfns)} ns.</li>
<li>EAT = ${(h / 100).toFixed(2)}·${tlb + ram} + ${((1 - h / 100) * (1 - pfr / 100)).toFixed(3)}·${tlb + 2 * ram} + ${((1 - h / 100) * (pfr / 100)).toFixed(4)}·${fmt(tlb + pfns)}<br>
= ${cHit.toFixed(1)} + ${cMiss.toFixed(1)} + ${cPf.toFixed(1)} ≈ <b>${fmt(Math.round(eat))} ns ≈ ${(eat / 1e6).toFixed(3)} ms</b>.</li></ol>
<p><b>Osservazione</b>: il termine del page fault domina sempre l'EAT (ms contro ns): per questo il fault rate dev'essere bassissimo.</p>`;
      return { text, sol };
    }
  });

  // FAT: offset -> blocco
  window.GENERATORS.push({
    id: "gfat", topic: "fs", title: "FAT: da offset a blocco del disco",
    gen() {
      const bsKB = pick([1, 2, 4]);
      const bs = bsKB * 1024;
      // catena di 5-6 blocchi distinti tra 1 e 20
      const nb = ri(5, 6);
      const blocks = shuffle(Array.from({ length: 20 }, (_, i) => i + 1)).slice(0, nb);
      const chainLen = nb;
      const idx = ri(2, chainLen - 1);                    // blocco del file interrogato
      const offset = idx * bs + ri(1, bs - 2);
      const fname = pick(["pippo.txt", "pluto.dat", "topolino.bin", "paperino.txt"]);
      // costruisci FAT (indice -> next)
      const fat = {};
      for (let i = 0; i < nb - 1; i++) fat[blocks[i]] = blocks[i + 1];
      fat[blocks[nb - 1]] = -1;
      // aggiungi voci di rumore
      const noise = shuffle(Array.from({ length: 20 }, (_, i) => i + 1).filter(x => !blocks.includes(x))).slice(0, 4);
      noise.forEach(x => { fat[x] = pick(noise); });
      const allIdx = Object.keys(fat).map(Number).sort((a, b) => a - b);
      let tab = `<div class="tablewrap"><table><tr><th>indice</th><th>FAT</th></tr>`;
      allIdx.forEach(i => tab += `<tr><td>${i}</td><td>${fat[i]}</td></tr>`);
      tab += `</table></div>`;
      const minSize = (chainLen - 1) * bs + 1;
      const text = `<p>File system FAT con blocchi da <b>${bsKB} KB</b>. La cartella radice indica che <code>${fname}</code> inizia al blocco <b>${blocks[0]}</b>.</p>${tab}
<p>1) In quale blocco del disco si trova l'offset <b>${fmt(offset)}</b> di ${fname}? 2) Qual è la dimensione minima presunta del file in byte? (offset in byte, a partire da 0)</p>`;
      const sol = `<ol>
<li><b>Catena del file</b> partendo dal blocco ${blocks[0]}: ${blocks.join(" → ")} → −1.<br>Blocchi del file in ordine: <b>[${blocks.join(", ")}]</b> (${chainLen} blocchi).</li>
<li>Indice del blocco nel file = ⌊${fmt(offset)} / ${fmt(bs)}⌋ = <b>${idx}</b> ⇒ è il ${idx + 1}° blocco della catena.</li>
<li>Il ${idx + 1}° blocco è il <b>blocco ${blocks[idx]}</b> del disco.</li>
<li>Dimensione minima = (${chainLen}−1)·${fmt(bs)} + 1 = <b>${fmt(minSize)} byte</b> (gli ultimi blocchi devono contenere almeno 1 byte).</li></ol>`;
      return { text, sol };
    }
  });

  // FAT: dimensionamento
  window.GENERATORS.push({
    id: "gfatsize", topic: "fs", title: "FAT: capacità del disco e dimensione della tabella",
    gen() {
      const entryB = pick([2, 3, 4]);
      const bsKB = pick([1, 2, 4, 8, 16]);
      const bs = bsKB * 1024;
      const nBlocks = 2 ** (entryB * 8);
      const cap = nBlocks * bs;
      const fatB = nBlocks * entryB;
      const fatBlocks = Math.ceil(fatB / bs);
      const off = ri(50000, 300000);
      const jumpIdx = Math.floor(off / bs);
      const text = `<p>Un disco usa un file system FAT con blocchi da <b>${bsKB} KB</b>. Ogni elemento della FAT è lungo <b>${entryB} byte</b> (${entryB * 8} bit) e gli elementi sono in corrispondenza biunivoca con i blocchi del disco.</p>
<ol><li>Qual è la massima capacità del disco (in blocchi e in byte)?</li>
<li>Quanti byte occupa la FAT e quanti blocchi occuperebbe su disco?</li>
<li>Quanti accessi alla FAT servono per trovare il blocco che contiene il byte ${fmt(off)} di un file?</li></ol>`;
      const sol = `<ol>
<li>Indici a ${entryB * 8} bit ⇒ max <b>2<sup>${entryB * 8}</sup> = ${fmt(nBlocks)} blocchi</b> ⇒ capacità = ${fmt(nBlocks)} · ${bytesHuman(bs)} = <b>${bytesHuman(cap)}</b>.</li>
<li>FAT = ${fmt(nBlocks)} voci · ${entryB} byte = <b>${bytesHuman(fatB)}</b> ⇒ su disco occupa ⌈${bytesHuman(fatB)} / ${bytesHuman(bs)}⌉ = <b>${fmt(fatBlocks)} blocchi</b>.</li>
<li>Il byte ${fmt(off)} sta nel blocco ⌊${fmt(off)}/${fmt(bs)}⌋ = <b>${jumpIdx}</b> del file (0-based) ⇒ dalla testa della catena servono <b>${jumpIdx} salti/accessi alla FAT</b>.</li></ol>`;
      return { text, sol };
    }
  });

  // I-node: offset -> blocco
  window.GENERATORS.push({
    id: "ginode", topic: "fs", title: "I-node: da offset a blocco (diretti/indiretti)",
    gen() {
      const bsKB = pick([1, 2, 4]);
      const bs = bsKB * 1024;
      const ptr = 4;
      const P = bs / ptr;                                    // puntatori per blocco
      // blocchi casuali
      const uniq = shuffle(Array.from({ length: 900 }, (_, i) => i + 100));
      const direct = uniq.slice(0, 10);
      const singleBlk = uniq[10];
      const doubleBlk = uniq[11];
      const singleContent = uniq.slice(12, 18);              // prime 6 voci del blocco indiretto singolo
      const dblL1 = uniq.slice(18, 21);                      // prime 3 voci del doppio (puntano a tabelle L2)
      const dblL2a = uniq.slice(21, 27);                     // prime 6 voci della prima tabella L2
      // 3 offset: diretto, indiretto singolo, indiretto doppio (dentro le prime voci note)
      const kDir = ri(0, 9);
      const off1 = kDir * bs + ri(0, bs - 1);
      const kSing = ri(0, 5);
      const off2 = (10 + kSing) * bs + ri(0, bs - 1);
      const kDbl = ri(0, 5);                                 // voce nella prima tabella L2
      const off3 = (10 + P + kDbl) * bs + ri(0, bs - 1);
      const pad = a => a.map(x => String(x).padStart(4)).join(" ");
      const text = `<p>File system UNIX con i-node: <b>10 voci dirette</b> + indiretto singolo + indiretto doppio + indiretto triplo. Blocchi da <b>${bsKB} KB</b>, numeri di blocco a 32 bit (4 byte ⇒ <b>${P} puntatori per blocco</b>).</p>
<pre>i-node del file
───────────────
[metadati del file]
dirette:      ${pad(direct.slice(0, 5))}
              ${pad(direct.slice(5))}
ind. singolo → ${singleBlk}
ind. doppio  → ${doubleBlk}
ind. triplo  → −1

prime voci del blocco ${singleBlk} (ind. singolo): ${singleContent.join(", ")}, …
prime voci del blocco ${doubleBlk} (ind. doppio) : ${dblL1.join(", ")}, …
prime voci del blocco ${dblL1[0]} (tab. 2° liv.): ${dblL2a.join(", ")}, …</pre>
<p><b>In quali blocchi del disco risiedono i byte di offset ${fmt(off1)}, ${fmt(off2)}, ${fmt(off3)}?</b> (offset da 0)</p>`;
      const sol = `<p>Indice del blocco nel file: k = ⌊offset / ${fmt(bs)}⌋. Ripartizione: k ∈ [0,9] diretti; k ∈ [10, ${10 + P - 1}] indiretto singolo; k ∈ [${10 + P}, ${10 + P + P * P - 1}] indiretto doppio.</p>
<ol>
<li>Offset ${fmt(off1)}: k = ${kDir} ⇒ voce diretta n.${kDir} ⇒ <b>blocco ${direct[kDir]}</b>.</li>
<li>Offset ${fmt(off2)}: k = ${10 + kSing} ⇒ oltre i diretti: voce n.${kSing} del blocco indiretto singolo (${singleBlk}) ⇒ <b>blocco ${singleContent[kSing]}</b>.</li>
<li>Offset ${fmt(off3)}: k = ${10 + P + kDbl} ⇒ indice nell'area doppia: j = k − 10 − ${P} = ${kDbl}.<br>
Tabella L2 = voce ⌊${kDbl}/${P}⌋ = 0 del blocco ${doubleBlk} ⇒ blocco ${dblL1[0]};<br>
voce finale = ${kDbl} mod ${P} = ${kDbl} ⇒ <b>blocco ${dblL2a[kDbl]}</b>.</li></ol>`;
      return { text, sol };
    }
  });

  // Lista collegata: numero di blocchi
  window.GENERATORS.push({
    id: "glinked", topic: "fs", title: "Allocazione a lista linkata: calcolo dei blocchi",
    gen() {
      const bs = pick([512, 1024, 2048, 4096]);
      const ptr = 4;
      const usable = bs - ptr;
      const nBlocchi = ri(4, 9);
      const size = usable * (nBlocchi - 1) + ri(Math.max(1, usable - 200), usable); // cade nell'n-esimo blocco
      const wrong = Math.ceil(size / bs);
      const right = Math.ceil(size / usable);
      const text = `<p>File system con allocazione a <b>lista linkata semplice</b>: blocchi da <b>${fmt(bs)} byte</b>, e in ogni blocco un puntatore al blocco successivo da <b>${ptr} byte</b>.</p>
<p><b>Quanti blocchi servono per memorizzare un file di ${fmt(size)} byte?</b></p>`;
      const sol = `<ol>
<li>Spazio utile per blocco = ${fmt(bs)} − ${ptr} = <b>${fmt(usable)} byte</b> (il puntatore ruba spazio!).</li>
<li>Blocchi = ⌈${fmt(size)} / ${fmt(usable)}⌉ = <b>${right} blocchi</b>.</li>
<li>Risposta sbagliata tipica: ⌈${fmt(size)}/${fmt(bs)}⌉ = ${wrong} (ignora il puntatore${wrong !== right ? " e infatti dà un risultato diverso" : ""}).</li></ol>
<p><b>Nota</b>: questo problema NON si presenta con la FAT (i puntatori stanno nella tabella, il blocco è tutto utile).</p>`;
      return { text, sol };
    }
  });

  // Scheduling del disco
  function diskSim(alg, head, reqs, maxTrack) {
    let seq = [], dist = 0, extra = "";
    const asc = (a, b) => a - b, desc = (a, b) => b - a;
    if (alg === "FCFS") {
      let cur = head;
      reqs.forEach(r => { dist += Math.abs(cur - r); cur = r; seq.push(r); });
    } else if (alg === "SSTF") {
      let cur = head, rest = reqs.slice();
      while (rest.length) {
        rest.sort((a, b) => Math.abs(cur - a) - Math.abs(cur - b));
        const r = rest.shift(); dist += Math.abs(cur - r); cur = r; seq.push(r);
      }
    } else {
      const above = reqs.filter(r => r >= head).sort(asc);
      const below = reqs.filter(r => r < head).sort(desc); // dall'alto verso il basso
      if (alg === "SCAN") {
        seq = above.slice();
        if (below.length) {
          seq.push(...below);
          dist = (maxTrack - head) + (maxTrack - below[below.length - 1]);
          extra = `La testina sale fino all'estremo fisico ${maxTrack}, poi scende fino all'ultima richiesta (${below[below.length - 1]}).`;
        } else {
          dist = above.length ? above[above.length - 1] - head : 0;
          extra = "Non ci sono richieste sotto la testina: si sale solo fino all'ultima richiesta.";
        }
      } else if (alg === "LOOK") {
        seq = above.slice();
        const top = above.length ? above[above.length - 1] : head;
        if (below.length) {
          seq.push(...below);
          dist = (top - head) + (top - below[below.length - 1]);
          extra = `La testina inverte subito dopo l'ultima richiesta in alto (${top}), senza arrivare a ${maxTrack}.`;
        } else dist = top - head;
      } else if (alg === "C-SCAN") {
        seq = above.slice();
        const belowAsc = below.slice().sort(asc);
        if (belowAsc.length) {
          seq.push(...belowAsc);
          dist = (maxTrack - head) + maxTrack + belowAsc[belowAsc.length - 1];
          extra = `Sale fino a ${maxTrack}, salta a 0 (il salto conta ${maxTrack} tracce) e risale fino a ${belowAsc[belowAsc.length - 1]}.`;
        } else dist = above.length ? above[above.length - 1] - head : 0;
      } else if (alg === "C-LOOK") {
        seq = above.slice();
        const belowAsc = below.slice().sort(asc);
        const top = above.length ? above[above.length - 1] : head;
        if (belowAsc.length) {
          seq.push(...belowAsc);
          dist = (top - head) + (top - belowAsc[0]) + (belowAsc[belowAsc.length - 1] - belowAsc[0]);
          extra = `Sale fino all'ultima richiesta (${top}), salta alla richiesta più bassa (${belowAsc[0]}: il salto conta ${top - belowAsc[0]} tracce) e risale fino a ${belowAsc[belowAsc.length - 1]}.`;
        } else dist = top - head;
      }
    }
    return { seq, dist, extra };
  }
  window.GENERATORS.push({
    id: "gdisk", topic: "dischi", title: "Scheduling del disco (FCFS/SSTF/SCAN/C-SCAN/LOOK/C-LOOK)",
    gen() {
      const maxTrack = 199;
      const head = ri(40, 120);
      const n = ri(6, 8);
      const set = new Set();
      while (set.size < n) { const v = ri(5, 195); if (Math.abs(v - head) > 3) set.add(v); }
      const reqs = [...set];
      const alg = pick(["SSTF", "SCAN", "C-SCAN", "LOOK", "C-LOOK"]);
      const r = diskSim(alg, head, reqs, maxTrack);
      const fc = diskSim("FCFS", head, reqs, maxTrack);
      const text = `<p>Disco con 200 tracce (0–${maxTrack}), velocità di seek <b>1 traccia/ms</b>. La testina è sulla traccia <b>${head}</b>${["SCAN", "LOOK", "C-SCAN", "C-LOOK"].includes(alg) ? ", direzione <b>ascendente</b>" : ""}. Coda di richieste:</p>
<pre>${reqs.join(", ")}</pre>
<p><b>Calcolare la sequenza di servizio e il tempo di ricerca complessivo con la politica ${alg}</b> (si trascurino latenza rotazionale e tempo di trasferimento).</p>`;
      const sol = `<ol>
<li><b>Sequenza ${alg}</b>: ${head} → ${r.seq.join(" → ")}.</li>
${r.extra ? `<li>${r.extra}</li>` : ""}
<li><b>Distanza totale</b>: ${r.dist} tracce ⇒ tempo di ricerca = <b>${r.dist} ms</b>.</li>
<li>Confronto con FCFS: ${fc.dist} tracce (${fc.dist > r.dist ? "peggio" : "meglio"} di ${alg}).</li></ol>
<p><b>Promemoria</b>: SSTF = sempre la più vicina (rischio starvation); SCAN = ascensore fino all'estremo fisico; LOOK = inverte dopo l'ultima richiesta; C-SCAN/C-LOOK = un solo verso, con salto. Nel compito del corso la convenzione è LOOK (inversione dopo l'ultima richiesta).</p>`;
      return { text, sol };
    }
  });

  // Sostituzione pagine
  function pageSim(alg, refs, nFrames) {
    const frames = [];                 // contenuto corrente
    const rows = [];                   // per la tabella: {ref, frames snapshot, fault}
    let faults = 0;
    const lastUse = {}, loadOrder = [];
    const rbits = {};
    let hand = 0;
    refs.forEach((p, t) => {
      const inMem = frames.includes(p);
      if (inMem) {
        lastUse[p] = t; rbits[p] = 1;
      } else {
        faults++;
        if (frames.length < nFrames) {
          frames.push(p); loadOrder.push(p);
        } else {
          let victim;
          if (alg === "FIFO") victim = loadOrder.shift();
          else if (alg === "LRU") victim = frames.slice().sort((a, b) => lastUse[a] - lastUse[b])[0];
          else if (alg === "OPT") {
            let far = -1;
            frames.forEach(f => {
              let nxt = refs.indexOf(f, t + 1);
              if (nxt === -1) nxt = Infinity;
              if (nxt > far || (far === Infinity && nxt === Infinity)) { if (nxt >= far) { far = nxt; victim = f; } }
            });
          } else if (alg === "Clock") {
            while (true) {
              const f = frames[hand % frames.length];
              if (rbits[f] === 1) { rbits[f] = 0; hand++; }
              else { victim = f; break; }
            }
          }
          const i = frames.indexOf(victim);
          frames[i] = p;
          if (alg === "FIFO") loadOrder.push(p);
          if (alg === "Clock") { hand = (frames.indexOf(p) + 1) % nFrames; }
          delete rbits[victim];
        }
        lastUse[p] = t; rbits[p] = 1;
        if (alg === "FIFO" && frames.length <= nFrames && !loadOrder.includes(p)) loadOrder.push(p);
      }
      rows.push({ ref: p, snap: frames.slice(), fault: !inMem });
    });
    return { faults, rows };
  }
  window.GENERATORS.push({
    id: "gpage", topic: "sostituzione", title: "Sostituzione delle pagine: conteggio dei page fault",
    gen() {
      const nFrames = pick([3, 3, 4]);
      const nPages = 5;
      const len = ri(14, 18);
      const refs = [];
      let last = -1;
      for (let i = 0; i < len; i++) {
        let p; do { p = ri(0, nPages - 1); } while (p === last);
        refs.push(p); last = p;
      }
      const alg = pick(["FIFO", "LRU", "OPT", "Clock"]);
      const r = pageSim(alg, refs, nFrames);
      const hits = len - r.faults;
      // tabella
      let tab = `<div class="tablewrap"><table><tr><th>rif.</th>`;
      r.rows.forEach(row => tab += `<td>${row.ref}</td>`);
      tab += `</tr>`;
      for (let f = 0; f < nFrames; f++) {
        tab += `<tr><th>frame ${f + 1}</th>`;
        r.rows.forEach(row => tab += `<td>${row.snap[f] !== undefined ? row.snap[f] : "·"}</td>`);
        tab += `</tr>`;
      }
      tab += `<tr><th>esito</th>`;
      r.rows.forEach(row => tab += `<td>${row.fault ? "<b>F</b>" : "hit"}</td>`);
      tab += `</tr></table></div>`;
      const desc = { FIFO: "si scarta la pagina caricata da più tempo (un hit NON ringiovanisce la pagina!)", LRU: "si scarta la pagina usata meno di recente (ogni hit la rende 'fresca')", OPT: "si scarta la pagina che sarà riferita più lontano nel futuro (guarda AVANTI nella sequenza)", Clock: "lancetta circolare: R=1 → azzera R e avanza; R=0 → sostituisci (R si setta a ogni riferimento)" };
      const text = `<p>Sequenza di riferimenti alle pagine (<b>${nFrames} frame</b>, inizialmente vuoti):</p>
<pre>${refs.join(", ")}</pre>
<p><b>Quanti page fault si verificano con l'algoritmo ${alg}?</b> Indicare anche le percentuali di hit e fault.</p>`;
      const sol = `<p><b>${alg}</b>: ${desc[alg]}.</p>${tab}
<p><b>Page fault: ${r.faults}</b> (${(100 * r.faults / len).toFixed(0)}%) — Hit: ${hits} (${(100 * hits / len).toFixed(0)}%) su ${len} riferimenti.</p>`;
      return { text, sol };
    }
  });

  // Scheduling CPU
  function cpuSim(alg, procs, quantum) {
    // procs: [{name, at, bt}]
    const n = procs.length;
    const rem = procs.map(p => p.bt);
    const done = new Array(n).fill(false);
    const finish = new Array(n).fill(0);
    const gantt = [];
    let t = 0, completed = 0;
    const pushG = (name, from, to) => {
      const lastSeg = gantt[gantt.length - 1];
      if (lastSeg && lastSeg.name === name && lastSeg.to === from) lastSeg.to = to;
      else gantt.push({ name, from, to });
    };
    if (alg === "FCFS") {
      const order = procs.map((p, i) => i).sort((a, b) => procs[a].at - procs[b].at || a - b);
      order.forEach(i => {
        if (t < procs[i].at) t = procs[i].at;
        pushG(procs[i].name, t, t + procs[i].bt);
        t += procs[i].bt; finish[i] = t;
      });
    } else if (alg === "SJF") {
      while (completed < n) {
        const avail = procs.map((p, i) => i).filter(i => !done[i] && procs[i].at <= t);
        if (!avail.length) { t = Math.min(...procs.filter((p, i) => !done[i]).map(p => p.at)); continue; }
        avail.sort((a, b) => procs[a].bt - procs[b].bt || procs[a].at - procs[b].at);
        const i = avail[0];
        pushG(procs[i].name, t, t + procs[i].bt);
        t += procs[i].bt; finish[i] = t; done[i] = true; completed++;
      }
    } else if (alg === "SRTN") {
      while (completed < n) {
        const avail = procs.map((p, i) => i).filter(i => !done[i] && procs[i].at <= t);
        if (!avail.length) { t = Math.min(...procs.filter((p, i) => !done[i]).map(p => p.at)); continue; }
        avail.sort((a, b) => rem[a] - rem[b] || procs[a].at - procs[b].at);
        const i = avail[0];
        // esegui fino al prossimo arrivo o al completamento
        const nextArr = Math.min(...procs.filter((p, j) => !done[j] && p.at > t).map(p => p.at), Infinity);
        const run = Math.min(rem[i], nextArr === Infinity ? rem[i] : nextArr - t);
        pushG(procs[i].name, t, t + run);
        rem[i] -= run; t += run;
        if (rem[i] === 0) { done[i] = true; finish[i] = t; completed++; }
      }
    } else if (alg === "RR") {
      const q = quantum;
      const queue = [];
      const arrived = new Array(n).fill(false);
      const admit = (time) => { procs.forEach((p, i) => { if (!arrived[i] && p.at <= time) { arrived[i] = true; queue.push(i); } }); };
      admit(0);
      while (completed < n) {
        if (!queue.length) { t = Math.min(...procs.filter((p, i) => !arrived[i]).map(p => p.at)); admit(t); continue; }
        const i = queue.shift();
        const run = Math.min(q, rem[i]);
        pushG(procs[i].name, t, t + run);
        const t0 = t; t += run; rem[i] -= run;
        // ammetti chi è arrivato durante l'esecuzione (PRIMA di rimettere in coda il corrente)
        procs.forEach((p, j) => { if (!arrived[j] && p.at <= t) { arrived[j] = true; queue.push(j); } });
        if (rem[i] === 0) { done[i] = true; finish[i] = t; completed++; }
        else queue.push(i);
      }
    }
    const waits = procs.map((p, i) => finish[i] - p.at - p.bt);
    const tats = procs.map((p, i) => finish[i] - p.at);
    return { gantt, finish, waits, tats };
  }
  window.GENERATORS.push({
    id: "gcpu", topic: "sched", title: "Scheduling CPU: tempi di attesa e turnaround",
    gen() {
      const n = 4;
      const procs = [];
      for (let i = 0; i < n; i++) procs.push({ name: "P" + (i + 1), at: i === 0 ? 0 : ri(1, 6), bt: ri(2, 8) });
      procs.sort((a, b) => a.at - b.at);
      procs.forEach((p, i) => p.name = "P" + (i + 1));
      const alg = pick(["FCFS", "SJF", "SRTN", "RR"]);
      const q = 2;
      const r = cpuSim(alg, procs, q);
      const avgW = r.waits.reduce((a, b) => a + b, 0) / n;
      const avgT = r.tats.reduce((a, b) => a + b, 0) / n;
      let ptab = `<div class="tablewrap"><table><tr><th>Processo</th><th>Arrivo</th><th>Durata</th></tr>`;
      procs.forEach(p => ptab += `<tr><td>${p.name}</td><td>${p.at}</td><td>${p.bt}</td></tr>`);
      ptab += `</table></div>`;
      const gantt = r.gantt.map(g => `[${g.from}–${g.to} ${g.name}]`).join(" ");
      let rtab = `<div class="tablewrap"><table><tr><th></th>${procs.map(p => `<th>${p.name}</th>`).join("")}</tr>
<tr><th>Completamento</th>${r.finish.map(f => `<td>${f}</td>`).join("")}</tr>
<tr><th>Turnaround</th>${r.tats.map(f => `<td>${f}</td>`).join("")}</tr>
<tr><th>Attesa</th>${r.waits.map(f => `<td>${f}</td>`).join("")}</tr></table></div>`;
      const algName = { FCFS: "FCFS", SJF: "SJF (non-preemptive)", SRTN: "SRTN (SJF con prelazione)", RR: `Round-Robin con quanto = ${q}` }[alg];
      const text = `<p>Dati i seguenti processi:</p>${ptab}
<p><b>Calcolare il diagramma di Gantt, il tempo di attesa medio e il turnaround medio con l'algoritmo ${algName}.</b></p>`;
      const sol = `<ol>
<li><b>Gantt</b>: ${gantt}</li>
<li>${rtab}</li>
<li>Attesa = completamento − arrivo − durata; Turnaround = completamento − arrivo.</li>
<li><b>Attesa media = ${avgW.toFixed(2)}</b> — <b>Turnaround medio = ${avgT.toFixed(2)}</b></li></ol>
${alg === "SRTN" ? "<p><b>Ricorda</b>: in SRTN ad ogni arrivo si confronta la durata del nuovo processo con il tempo RESIDUO di quello in esecuzione.</p>" : ""}
${alg === "RR" ? "<p><b>Ricorda</b>: allo scadere del quanto il processo torna in FONDO alla coda; chi arriva durante l'esecuzione entra in coda prima del processo prelazionato.</p>" : ""}`;
      return { text, sol };
    }
  });

  // RAID 5: XOR e capacità
  window.GENERATORS.push({
    id: "graid", topic: "dischi", title: "RAID 5: capacità e ricostruzione con XOR",
    gen() {
      const nd = pick([4, 5, 6]);            // numero totale di dischi
      const sizeTB = pick([1, 2, 4]);
      const nbits = 8;
      const nData = nd - 1;                  // su ogni riga: nd-1 stripe dati + 1 di parità
      const strips = [];
      for (let i = 0; i < nData; i++) strips.push(Array.from({ length: nbits }, () => ri(0, 1)));
      const parity = Array.from({ length: nbits }, (_, b) => strips.reduce((a, s) => a ^ s[b], 0));
      const dead = ri(0, nData - 1);         // indice del disco dati guasto
      const bin = a => a.join("");
      const survivors = strips.map((s, i) => ({ s, i })).filter(x => x.i !== dead);
      let lines = "";
      strips.forEach((s, i) => {
        lines += `Disco ${i + 1}: ${i === dead ? "(GUASTO)" : bin(s)}\n`;
      });
      lines += `Parità : ${bin(parity)}   (memorizzata sul disco ${nd} per questa riga)`;
      const rec = Array.from({ length: nbits }, (_, b) => survivors.reduce((a, x) => a ^ x.s[b], 0) ^ parity[b]);
      // passi dello XOR
      let acc = survivors[0].s.slice(), steps = "";
      for (let k = 1; k < survivors.length; k++) {
        const nxt = acc.map((v, b) => v ^ survivors[k].s[b]);
        steps += `${bin(acc)} ⊕ ${bin(survivors[k].s)} = ${bin(nxt)}<br>`;
        acc = nxt;
      }
      const fin = acc.map((v, b) => v ^ parity[b]);
      steps += `${bin(acc)} ⊕ ${bin(parity)} (parità) = <b>${bin(fin)}</b>`;
      const text = `<p>Un sistema RAID 5 è composto da <b>${nd} dischi da ${sizeTB} TB</b> ciascuno. Su una certa riga gli stripe sono (parità distribuita: per QUESTA riga sta sul disco ${nd}):</p>
<pre>${lines}</pre>
<ol><li>Qual è la capacità utile complessiva del sistema?</li>
<li>Ricostruire lo stripe del disco ${dead + 1}.</li></ol>`;
      const sol = `<ol>
<li>Capacità utile RAID 5 = (n−1)·S = (${nd}−1)·${sizeTB} TB = <b>${(nd - 1) * sizeTB} TB</b> (l'equivalente di un disco va in parità, distribuite su tutti i dischi).</li>
<li>Lo stripe perso = XOR di tutti gli stripe superstiti + parità:<br>${steps}<br>
<b>Disco ${dead + 1} = ${bin(rec)}</b>. Verifica: lo XOR di tutti gli stripe dati deve ridare la parità. ✓</li></ol>
<p><b>Perché funziona</b>: P = D1⊕…⊕Dn e a⊕a = 0, quindi XOR-ando tutti i superstiti con P 'sopravvive' solo il disco mancante.</p>`;
      return { text, sol };
    }
  });

  // Pipeline: throughput
  window.GENERATORS.push({
    id: "gpipe", topic: "intro", title: "Pipeline: throughput e latenza",
    gen() {
      const k = pick([3, 4, 5]);
      const t = pick([2, 5, 8, 9, 10]);
      const N = pick([100, 1000]);
      const thr = 1e9 / t; // istruzioni al secondo (1 ogni t ns)
      const timeN = (k + N - 1) * t;
      const text = `<p>Una CPU ha una pipeline a <b>${k} stadi</b>; ogni stadio impiega <b>${t} ns</b> per completare il proprio lavoro.</p>
<ol><li>Qual è il throughput della CPU a regime (istruzioni al secondo)?</li>
<li>Qual è la latenza di una singola istruzione?</li>
<li>Quanto tempo serve per completare ${N} istruzioni (pipeline inizialmente vuota)?</li></ol>`;
      const sol = `<ol>
<li>A regime esce <b>1 istruzione ogni ${t} ns</b> ⇒ throughput = 1/(${t}·10⁻⁹) = <b>${fmt(Math.round(thr))} istruzioni/s ≈ ${(thr / 1e6).toFixed(0)} MIPS</b>.</li>
<li>Latenza = ${k} stadi · ${t} ns = <b>${k * t} ns</b> (il tempo di attraversamento di UNA istruzione).</li>
<li>La prima istruzione esce dopo ${k}·${t} = ${k * t} ns; le altre ${N - 1} escono una ogni ${t} ns:<br>
T = (${k} + ${N} − 1)·${t} = <b>${fmt(timeN)} ns</b>.</li></ol>
<p><b>Attenzione</b>: throughput ≠ 1/latenza. La pipeline aumenta il throughput, non riduce la latenza della singola istruzione.</p>`;
      return { text, sol };
    }
  });

  // RR: attesa massima garantita
  window.GENERATORS.push({
    id: "grr", topic: "sched", title: "Round-Robin: garanzie sul tempo di attesa",
    gen() {
      const n = ri(4, 12);
      const q = pick([2, 4, 5, 10, 20, 50]);
      const ans = (n - 1) * q;
      const text = `<p>Un sistema usa Round-Robin con <b>${n} processi</b> pronti e quanto di tempo <b>q = ${q} ms</b> (si trascuri l'overhead del context-switch).</p>
<p><b>Qual è il tempo massimo che un processo può attendere prima di riottenere la CPU? Perché il RR non soffre di starvation?</b></p>`;
      const sol = `<ol>
<li>Caso peggiore: il processo è appena stato prelazionato e ha davanti tutti gli altri ${n}−1 processi, ognuno dei quali usa al più un quanto pieno.</li>
<li>Attesa massima = (n−1)·q = (${n}−1)·${q} = <b>${ans} ms</b>.</li>
<li>Niente starvation: l'attesa è LIMITATA e calcolabile a priori: ogni processo ha la garanzia di riavere la CPU entro (n−1)·q.</li></ol>
<p><b>Bonus</b>: quanto piccolo → sistema reattivo ma tanti context-switch; quanto più grande di ogni CPU burst → RR degenera in FCFS.</p>`;
      return { text, sol };
    }
  });

  // Aging: confronto contatori
  window.GENERATORS.push({
    id: "gaging", topic: "sostituzione", title: "Aging: evoluzione dei contatori",
    gen() {
      const nP = 4, cicli = 5;
      const bits = 8;
      let hist, counters;
      // rigenera finché il minimo non è unico (risposta non ambigua)
      do {
        hist = []; // hist[p][c] = bit R al ciclo c
        for (let p = 0; p < nP; p++) hist.push(Array.from({ length: cicli }, () => ri(0, 1)));
        counters = hist.map(h => {
          let c = 0;
          h.forEach(r => { c = (c >> 1) | (r << (bits - 1)); });
          return c;
        });
      } while (counters.filter(c => c === Math.min(...counters)).length !== 1);
      const minIdx = counters.indexOf(Math.min(...counters));
      let tab = `<div class="tablewrap"><table><tr><th>pagina</th>${Array.from({ length: cicli }, (_, i) => `<th>R al ciclo ${i + 1}</th>`).join("")}</tr>`;
      hist.forEach((h, p) => tab += `<tr><td>P${p}</td>${h.map(r => `<td>${r}</td>`).join("")}</tr>`);
      tab += `</table></div>`;
      const binStr = c => c.toString(2).padStart(bits, "0");
      let calc = "";
      hist.forEach((h, p) => {
        let c = 0; const passi = [];
        h.forEach(r => { c = (c >> 1) | (r << (bits - 1)); passi.push(binStr(c)); });
        calc += `<li>P${p}: ${passi.join(" → ")} = ${counters[p]}</li>`;
      });
      const text = `<p>Algoritmo di <b>Aging</b> con contatori a ${bits} bit (inizialmente a 0). La tabella mostra il valore del bit R di 4 pagine negli ultimi ${cicli} cicli di aggiornamento (in ordine cronologico):</p>
${tab}
<p><b>Calcolare i contatori dopo i ${cicli} cicli e indicare quale pagina verrebbe scartata a un page fault.</b><br>(Ricorda: ad ogni ciclo il contatore viene shiftato a destra e R entra come bit più significativo.)</p>`;
      const sol = `<p>Ad ogni ciclo: C = (C >> 1) con R nel bit più significativo.</p><ol>${calc}</ol>
<p>Contatore più basso: P${minIdx} (${counters[minIdx]} = ${binStr(counters[minIdx])}) ⇒ <b>si scarta P${minIdx}</b>.</p>
<p><b>Nota</b>: il contatore più alto appartiene alla pagina usata più di recente/frequentemente NEGLI ULTIMI cicli: i riferimenti recenti pesano di più (bit più significativi). È l'approssimazione software di LRU.</p>`;
      return { text, sol };
    }
  });

  // Semafori: traccia guidata
  window.GENERATORS.push({
    id: "gsem", topic: "sync", title: "Semafori: tracciare l'esecuzione",
    gen() {
      // pool di 3 varianti verificate a mano
      const v = pick([1, 2, 3]);
      if (v === 1) {
        const x0 = ri(2, 5);
        // P1: wait(S); x+=2; signal(T);  P2: wait(T); x*=2; signal(T)?? — teniamo la variante lineare verificata:
        // P1: wait(S) x=x+2 signal(T) | P2: wait(T) x=x*3 signal(R) | P3: wait(R) print(x)
        const res = (x0 + 2) * 3;
        return {
          text: `<p>Tre processi condividono x (valore iniziale <b>${x0}</b>). Semafori iniziali: S=1, T=0, R=0.</p>
<pre>P1:            P2:            P3:
wait(S)        wait(T)        wait(R)
x = x + 2      x = x * 3      print(x)
signal(T)      signal(R)</pre>
<p><b>Determinare l'output di P3.</b></p>`,
          sol: `<ol>
<li>Solo P1 può partire (S=1): x = ${x0}+2 = ${x0 + 2}; signal(T) → T=1.</li>
<li>P2 si sblocca: x = ${x0 + 2}·3 = ${res}; signal(R) → R=1.</li>
<li>P3 si sblocca: print(x) → <b>${res}</b>.</li></ol>
<p>I semafori impongono l'ordine P1 → P2 → P3 (catena di sincronizzazione).</p>` };
      }
      if (v === 2) {
        const x0 = ri(1, 4);
        // P1: wait(S); x=x-3; signal(T); wait(S)[blocca] x=x*10 mai | P3 come compito
        const afterP1 = x0 - 3;                      // negativo se x0<3
        const neg = afterP1 < 0;
        const afterP2 = afterP1 + 4;
        const printed = neg ? afterP2 : afterP1;
        return {
          text: `<p>Tre processi condividono x (valore iniziale <b>${x0}</b>). Semafori iniziali: S=1, R=0, T=0.</p>
<pre>P1:            P2:            P3:
wait(S)        wait(R)        wait(T)
x = x - 3      x = x + 4      if (x < 0) signal(R)
signal(T)      signal(T)      wait(T)
wait(S)        wait(R)        print(x)
x = x - 1
signal(T)</pre>
<p><b>Determinare l'output di P3.</b></p>`,
          sol: `<ol>
<li>P1 (S=1): x = ${x0}−3 = <b>${afterP1}</b>; signal(T) → T=1. Poi wait(S) con S=0: <b>P1 si blocca per sempre</b> (x=x−1 mai eseguito).</li>
<li>P3: wait(T) → T=0. Test: x = ${afterP1} ${neg ? "&lt; 0 ⇒ signal(R): sblocca P2" : "≥ 0 ⇒ NESSUNA signal(R): P2 resta bloccato per sempre"}.</li>
${neg ? `<li>P2: x = ${afterP1}+4 = <b>${afterP2}</b>; signal(T) → T=1; poi wait(R) lo blocca per sempre.</li><li>P3: wait(T) → T=0; print(x) → <b>${printed}</b>.</li>` : `<li>P3: wait(T)… ma T=0 e NESSUNO farà più signal(T): <b>P3 resta bloccato e non stampa nulla!</b> (Stallo: P1 su S, P2 su R, P3 su T.)</li>`}
</ol>
<p><b>Morale</b>: segui i semafori passo passo; l'if può cambiare radicalmente il destino dei processi${neg ? "" : " — in questa variante si arriva a un deadlock e non c'è output"}.</p>` };
      }
      // v3: mutua esclusione con contatore
      const n = ri(3, 5);
      return {
        text: `<p>${n} processi identici eseguono questo codice su una variabile condivisa x (iniziale 0), con semaforo mutex = 1:</p>
<pre>down(mutex)
x = x + 2
up(mutex)</pre>
<ol><li>Quale valore finale ha x dopo che tutti i ${n} processi hanno terminato?</li>
<li>Senza il semaforo, quale sarebbe il valore MINIMO possibile di x? Perché?</li></ol>`,
        sol: `<ol>
<li>Con il mutex ogni incremento è atomico: x = ${n}·2 = <b>${n * 2}</b>, sempre.</li>
<li>Senza mutex l'incremento non è atomico (LOAD, +2, STORE): nel caso peggiore ogni processo legge il valore vecchio e sovrascrive gli aggiornamenti altrui. Con un interleaving sfortunato possono 'sopravvivere' solo 2 incrementi... anzi, nel caso limite ne sopravvive uno solo per 'ondata': il minimo teorico è <b>2</b> (tutti leggono 0, tutti scrivono 2)${n > 2 ? ", oppure valori intermedi come 4, a seconda dell'interleaving" : ""}.</li></ol>
<p><b>Morale</b>: questa è la race condition del 'conto corrente': la sezione critica protegge la sequenza lettura-modifica-scrittura.</p>` };
    }
  });

  // Working set / allocazione proporzionale
  window.GENERATORS.push({
    id: "gws", topic: "sostituzione", title: "Allocazione proporzionale dei frame",
    gen() {
      const M = pick([64, 100, 128, 200]);
      const sizes = [ri(10, 60), ri(20, 120), ri(50, 200)];
      const S = sizes.reduce((a, b) => a + b, 0);
      const alloc = sizes.map(s => Math.floor(s / S * M));
      const text = `<p>Un sistema ha <b>${M} frame</b> liberi da spartire tra 3 processi con taglie di ${sizes[0]}, ${sizes[1]} e ${sizes[2]} pagine.</p>
<p><b>Quanti frame riceve ciascun processo con l'allocazione proporzionale?</b> Confrontare con l'allocazione equa.</p>`,
      sol = `<ol>
<li>S = ${sizes.join(" + ")} = ${S} pagine totali.</li>
<li>Formula: A<sub>i</sub> = (S<sub>i</sub>/S)·M.</li>
<li>P1: (${sizes[0]}/${S})·${M} ≈ <b>${alloc[0]} frame</b>; P2: (${sizes[1]}/${S})·${M} ≈ <b>${alloc[1]} frame</b>; P3: (${sizes[2]}/${S})·${M} ≈ <b>${alloc[2]} frame</b> (arrotondando per difetto; i frame residui si assegnano ai processi con resto maggiore o a chi ha più bisogno).</li>
<li>Allocazione equa: M/N = ${M}/3 ≈ ${Math.floor(M / 3)} frame ciascuno: ignorerebbe le taglie diverse, penalizzando il processo più grande.</li></ol>
<p><b>Nota</b>: l'allocazione per priorità dà più frame ai processi importanti a prescindere dalla taglia; il numero effettivo va poi adattato alla località (working set / PFF) per evitare il thrashing.</p>`;
      return { text, sol };
    }
  });

  // esposti per i test
  window._sims = { diskSim, pageSim, cpuSim };
})();
