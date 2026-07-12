// Generatori (parte 4): esercizi emersi dalle testimonianze d'esame — dimensionamento
// della bitmap dei blocchi liberi (file system) e predizione dei CPU burst in SPN/SJF
// con la media esponenziale. Ogni generatore espone { id, topic, title, gen() }.
(function () {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[ri(0, arr.length - 1)];
  const fmt = n => n.toLocaleString("it-IT");
  function bytesHuman(b) {
    if (b >= 2 ** 40) return (b / 2 ** 40) + " TB";
    if (b >= 2 ** 30) return (b / 2 ** 30) + " GB";
    if (b >= 2 ** 20) return (b / 2 ** 20) + " MB";
    if (b >= 1024) return (b / 1024) + " KB";
    return b + " byte";
  }
  const num = n => Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");

  // Bitmap dei blocchi liberi: dimensione e spazio occupato
  window.GENERATORS.push({
    id: "gbitmap", topic: "fs", title: "Bitmap dei blocchi liberi: dimensione e spazio occupato",
    gen() {
      const blockBits = pick([10, 11, 12]);                 // blocco 1KB..4KB
      const diskBits = pick([30, 31, 32, 33, 34]);          // disco 1GB..16GB
      const blockBytes = 2 ** blockBits;
      const diskBytes = 2 ** diskBits;
      const numBlocks = 2 ** (diskBits - blockBits);
      const bitmapBytes = numBlocks / 8;                    // 1 bit per blocco
      const bitmapBlocks = Math.ceil(bitmapBytes / blockBytes);
      const overhead = (bitmapBytes / diskBytes) * 100;
      const text = `<p>Un disco da <b>${bytesHuman(diskBytes)}</b> è formattato con blocchi da <b>${bytesHuman(blockBytes)}</b>. Lo spazio libero è gestito con una <b>bitmap</b> (1 bit per blocco: 1 = libero, 0 = occupato).</p>
<p><b>Calcolare: (a) quanti blocchi ha il disco; (b) la dimensione della bitmap in byte; (c) quanti blocchi del disco occupa la bitmap stessa.</b></p>`;
      const sol = `<ol>
<li><b>Numero di blocchi</b> = dimensione disco / dimensione blocco = 2<sup>${diskBits}</sup> / 2<sup>${blockBits}</sup> = 2<sup>${diskBits - blockBits}</sup> = <b>${fmt(numBlocks)} blocchi</b>.</li>
<li><b>Dimensione bitmap</b>: serve 1 bit per blocco → ${fmt(numBlocks)} bit = ${fmt(numBlocks)} / 8 byte = <b>${fmt(bitmapBytes)} byte</b> (${bytesHuman(bitmapBytes)}).</li>
<li><b>Blocchi occupati dalla bitmap</b> = ⌈ ${fmt(bitmapBytes)} byte / ${fmt(blockBytes)} byte ⌉ = <b>${fmt(bitmapBlocks)} blocchi</b>.</li>
<li>Overhead della bitmap ≈ ${fmt(bitmapBytes)} / 2<sup>${diskBits}</sup> ≈ <b>${overhead.toPrecision(2)}%</b> dello spazio del disco: trascurabile (1 bit ogni ${fmt(blockBytes)} byte).</li></ol>
<p><b>Nota</b>: la bitmap rende facile trovare gruppi di blocchi <i>liberi contigui</i>; la sua dimensione dipende solo dal numero di blocchi, non da quanti sono occupati.</p>`;
      return { text, sol };
    }
  });

  // SPN/SJF: predizione del prossimo CPU burst con media esponenziale
  window.GENERATORS.push({
    id: "gspn", topic: "sched", title: "SPN/SJF: predire i CPU burst con la media esponenziale",
    gen() {
      const alpha = pick([0.5, 0.5, 0.4, 0.6]);             // 0.5 dà conti puliti
      const tau1 = ri(4, 10);                                // stima iniziale τ1
      const n = 5;
      const t = Array.from({ length: n }, () => ri(2, 14));  // burst effettivi t1..tn
      const tau = [tau1];
      for (let i = 0; i < n; i++) tau.push(alpha * t[i] + (1 - alpha) * tau[i]);
      const tbl = (head, arr) => `<div class="tablewrap"><table><tr><th>${head}</th>${arr.map((_, i) => `<th>${i + 1}</th>`).join("")}</tr>
<tr><th>tₙ (reale)</th>${t.map(v => `<td>${v}</td>`).join("")}</tr></table></div>`;
      const text = `<p>In uno scheduler <b>SPN</b> (Shortest Process Next, ovvero SJF) la durata del prossimo CPU burst non è nota e viene <b>stimata</b> dalla storia con la media esponenziale:</p>
<p style="text-align:center">τ<sub>n+1</sub> = α · t<sub>n</sub> + (1 − α) · τ<sub>n</sub></p>
<p>Con <b>α = ${num(alpha)}</b> e stima iniziale <b>τ₁ = ${tau1}</b>, dati i burst effettivi:</p>${tbl("n", t)}
<p><b>Calcolare le stime τ₂, τ₃, …, τ₆ del prossimo burst.</b></p>`;
      let steps = "";
      for (let i = 0; i < n; i++) {
        steps += `<li>τ<sub>${i + 2}</sub> = ${num(alpha)}·${t[i]} + ${num(1 - alpha)}·${num(tau[i])} = <b>${num(tau[i + 1])}</b></li>`;
      }
      const sol = `<ol>${steps}</ol>
<p>Riepilogo stime: τ₂..τ₆ = ${tau.slice(1).map(num).join(", ")}.</p>
<p><b>Come le usa SPN</b>: a ogni scelta manda in esecuzione il processo con la stima τ del prossimo burst <b>più piccola</b>. α pesa il passato: α alto → conta di più il burst più recente; α = 0 → si ignora la storia recente e τ resta la stima iniziale.</p>`;
      return { text, sol };
    }
  });
})();
