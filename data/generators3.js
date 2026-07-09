// Generatori (parte 3): colmano le lacune di "intro" e "struttura" con esercizi
// numerici tipici d'esame — legge di Amdahl, overhead delle interruzioni e costo
// dei cambi di modalità delle system call. Ogni generatore espone { id, topic, title, gen() }.
(function () {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[ri(0, arr.length - 1)];
  const fmt = n => n.toLocaleString("it-IT");

  // ---- Legge di Amdahl (intro) ----
  window.GENERATORS.push({
    id: "gamdahl", topic: "intro", title: "Legge di Amdahl: speedup con N processori",
    gen() {
      const pf = pick([50, 60, 70, 75, 80, 90, 95]);   // % parallelizzabile
      const N = pick([2, 4, 8, 16]);
      const f = pf / 100, sfrac = 1 - f;
      const S = 1 / (sfrac + f / N);
      const Smax = 1 / sfrac;
      const text = `<p>Un programma ha una parte <b>parallelizzabile pari al ${pf}%</b> del suo tempo di esecuzione; il restante ${100 - pf}% è intrinsecamente sequenziale.</p>
<p><b>(a)</b> Qual è lo speedup se lo si esegue su <b>${N} processori</b> (legge di Amdahl)? <b>(b)</b> Qual è lo speedup massimo teorico, con infiniti processori?</p>`;
      const sol = `<ol>
<li>Legge di Amdahl: <code>S = 1 / ( (1 − f) + f/N )</code>, con f = frazione parallelizzabile = ${f.toFixed(2)}.</li>
<li>Parte sequenziale: 1 − f = ${sfrac.toFixed(2)}; parte parallela ripartita: f/N = ${f.toFixed(2)}/${N} = ${(f / N).toFixed(4)}.</li>
<li><b>(a)</b> S = 1 / (${sfrac.toFixed(2)} + ${(f / N).toFixed(4)}) = 1 / ${(sfrac + f / N).toFixed(4)} = <b>${S.toFixed(2)}×</b>.</li>
<li><b>(b)</b> Con N → ∞ il termine f/N → 0, quindi S<sub>max</sub> = 1 / (1 − f) = 1 / ${sfrac.toFixed(2)} = <b>${Smax.toFixed(2)}×</b>.</li>
<li><b>Morale</b>: è la parte sequenziale a mettere il tetto. Con il ${100 - pf}% sequenziale non si va oltre ${Smax.toFixed(2)}×, per quanti processori si aggiungano.</li></ol>`;
      return { text, sol };
    }
  });

  // ---- Overhead delle interruzioni vs polling (intro) ----
  window.GENERATORS.push({
    id: "gintr", topic: "intro", title: "Interruzioni: quanta CPU consuma la gestione",
    gen() {
      const R = pick([500, 1000, 2000, 5000]);   // interrupt/s
      const H = pick([2, 4, 5, 8, 10]);           // µs per ISR
      const P = pick([50, 100, 200]);             // µs tra due poll
      const c = 1;                                 // µs per singolo poll
      const intrFrac = R * H / 1e6;                // frazione di secondo
      const pollFrac = (1e6 / P) * c / 1e6;
      const text = `<p>Un dispositivo genera <b>${fmt(R)} interrupt al secondo</b>; ogni gestore (ISR) dura <b>${H} µs</b>.</p>
<p><b>(a)</b> Che percentuale di tempo di CPU è spesa nella gestione degli interrupt? <b>(b)</b> In alternativa si potrebbe usare il <b>polling</b> controllando il dispositivo ogni <b>${P} µs</b>, con un controllo che costa ${c} µs: quale percentuale di CPU userebbe il polling?</p>`;
      const sol = `<ol>
<li><b>(a)</b> In un secondo ci sono ${fmt(R)} ISR da ${H} µs: tempo totale = ${fmt(R)} × ${H} µs = ${fmt(R * H)} µs = ${(intrFrac).toFixed(4)} s.</li>
<li>Percentuale = ${fmt(R * H)} µs / 1 000 000 µs = <b>${(intrFrac * 100).toFixed(2)}%</b>.</li>
<li><b>(b)</b> Polling ogni ${P} µs → ${fmt(1e6 / P)} controlli al secondo, ciascuno da ${c} µs: ${fmt(1e6 / P)} × ${c} µs = ${fmt(1e6 / P * c)} µs = <b>${(pollFrac * 100).toFixed(2)}%</b>.</li>
<li><b>Confronto</b>: con eventi ${intrFrac < pollFrac ? "poco frequenti conviene l'interrupt (paghi solo quando serve)" : "molto frequenti il polling può costare meno degli interrupt (niente cambio di contesto per ognuno)"}. Il polling spreca CPU quando non succede nulla; l'interrupt aggiunge il costo del cambio di contesto a ogni evento.</li></ol>`;
      return { text, sol };
    }
  });

  // ---- Costo dei cambi di modalità delle system call (struttura) ----
  window.GENERATORS.push({
    id: "gsyscost", topic: "struttura", title: "System call: costo dei cambi di modalità",
    gen() {
      const N = pick([2000, 5000, 10000, 20000]);   // syscall totali
      const C = pick([1, 2, 4]);                      // µs per cambio di modalità
      const T = pick([2, 4, 5, 10]);                  // secondi di esecuzione
      const us = N * C;                                // µs nei cambi di modalità
      const sec = us / 1e6;
      const pct = sec / T * 100;
      const text = `<p>Durante <b>${T} secondi</b> di esecuzione, un programma effettua <b>${fmt(N)} system call</b>. Ogni system call comporta un cambio di modalità (utente → kernel → utente) il cui costo complessivo è <b>${C} µs</b>.</p>
<p><b>Quanto tempo di CPU è speso solo nei cambi di modalità, e che percentuale del tempo totale rappresenta?</b></p>`;
      const sol = `<ol>
<li>Tempo nei cambi di modalità = numero di system call × costo = ${fmt(N)} × ${C} µs = ${fmt(us)} µs = <b>${sec.toFixed(3)} s</b>.</li>
<li>Percentuale sul tempo totale = ${sec.toFixed(3)} s / ${T} s = <b>${pct.toFixed(2)}%</b>.</li>
<li><b>Nota</b>: è puro overhead del meccanismo (TRAP, salvataggio/ripristino del contesto), non lavoro utile. È il motivo per cui si cerca di ridurre il numero di system call, ad esempio leggendo/scrivendo a blocchi grandi invece di un byte alla volta.</li></ol>`;
      return { text, sol };
    }
  });
})();
