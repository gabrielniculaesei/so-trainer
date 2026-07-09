// Simulazioni interattive (parte 3): colma le lacune di "struttura" e "intro".
//  - sim_syscall: il percorso di una system call (modalità utente ↔ kernel)
//  - sim_cpu_cycle: il ciclo fetch–decode–execute e le interruzioni
(function () {
  "use strict";
  const K = window.SIMKIT;

  /* ==================== Percorso di una system call ==================== */
  (function () {
    // ogni syscall: numero, se blocca su I/O, cosa restituisce
    const CALLS = {
      read: { num: 0, blocks: true, ret: "n. di byte letti (es. 512)", handler: "sys_read", what: "chiede il dato al driver del dispositivo" },
      getpid: { num: 39, blocks: false, ret: "il PID del processo (es. 4123)", handler: "sys_getpid", what: "legge il PID dal descrittore del processo, in memoria" }
    };
    // tabella (estratto) mostrata nello spazio kernel
    const TABLE = [[0, "read"], [1, "write"], [2, "open"], [39, "getpid"], [60, "exit"]];

    function build(callKey) {
      const c = CALLS[callKey];
      const F = [];
      // stato: band 'user'|'kernel', px (posizione orizzontale del token), mode 'U'|'K',
      //        proc (stato del processo), ctx (contesto salvato?), num, ret, hl (handler evidenziato), msg
      const push = (o) => F.push(Object.assign({ mode: "U", band: "user", proc: "esecuzione", ctx: false, num: null, ret: null, hl: null }, o));
      push({ px: 70, msg: "Il processo P gira in <b>modalità utente</b> ed esegue il suo codice: può usare solo le proprie istruzioni e la propria memoria." });
      push({ px: 150, num: c.num, msg: `P chiama <code>${callKey}()</code>: la libreria mette il <b>numero della syscall</b> (${c.num}) in un registro e prepara i parametri.` });
      push({ px: 250, band: "kernel", mode: "K", ctx: true, num: c.num, msg: "Istruzione <b>TRAP</b> (interruzione software): la CPU passa in <b>modalità kernel</b> e l'hardware <b>salva il contesto</b> (PC e registri) di P." });
      push({ px: 330, band: "kernel", mode: "K", ctx: true, num: c.num, hl: c.num, msg: `Il <b>dispatcher</b> usa il numero come indice nella <b>tabella delle system call</b> e salta al gestore <code>${c.handler}()</code>.` });
      if (c.blocks) {
        push({ px: 410, band: "kernel", mode: "K", ctx: true, proc: "bloccato", num: c.num, hl: c.num, msg: `<code>${c.handler}()</code> ${c.what}: l'I/O è lento, quindi <b>P si blocca</b> e la CPU passa a un altro processo pronto.` });
        push({ px: 470, band: "kernel", mode: "K", ctx: true, proc: "pronto", num: c.num, hl: c.num, msg: "L'I/O termina: un <b>interrupt</b> segnala il completamento, P torna <b>pronto</b> e lo scheduler lo rimette in esecuzione nel kernel." });
      } else {
        push({ px: 440, band: "kernel", mode: "K", ctx: true, num: c.num, hl: c.num, msg: `<code>${c.handler}()</code> ${c.what}: nessun I/O, quindi <b>nessun blocco</b>.` });
      }
      push({ px: 545, band: "kernel", mode: "K", ctx: true, num: c.num, ret: c.ret, hl: c.num, msg: "Il kernel prepara il <b>valore di ritorno</b>, poi <b>ripristina il contesto</b> salvato di P." });
      push({ px: 610, band: "user", mode: "U", num: c.num, ret: c.ret, msg: `Istruzione di ritorno (<b>IRET</b>): la CPU torna in <b>modalità utente</b>; <code>${callKey}()</code> restituisce ${c.ret} e il programma prosegue.` });
      return F;
    }

    function svg(f) {
      const W = 660, H = 190;
      const uY = 16, uH = 52, kY = 118, kH = 60, bound = 92;
      let s = `<svg class="sim-svg" viewBox="0 0 ${W} ${H}" style="width:${W}px;max-width:100%">`;
      // fasce utente / kernel
      s += `<rect x="8" y="${uY}" width="${W - 16}" height="${uH}" rx="8" style="fill:var(--surface2);stroke:var(--border)"/>`;
      s += `<text x="18" y="${uY + 16}" style="fill:var(--dim);font-family:var(--mono);font-size:10px">spazio utente — modalità U</text>`;
      s += `<rect x="8" y="${kY}" width="${W - 16}" height="${kH}" rx="8" style="fill:var(--surface2);stroke:var(--border)"/>`;
      s += `<text x="18" y="${kY + 15}" style="fill:var(--dim);font-family:var(--mono);font-size:10px">spazio kernel — modalità K</text>`;
      // confine hardware
      s += `<line x1="8" y1="${bound}" x2="${W - 8}" y2="${bound}" style="stroke:var(--border);stroke-dasharray:5 4"/>`;
      s += `<text x="${W - 12}" y="${bound - 5}" text-anchor="end" style="fill:var(--dim);font-family:var(--mono);font-size:9px">confine hardware · TRAP ↓ / IRET ↑</text>`;
      // token (il processo)
      const cy = f.band === "user" ? uY + uH / 2 : kY + kH / 2;
      const col = f.mode === "K" ? "var(--accent)" : "var(--amber)";
      const soft = f.mode === "K" ? "var(--accent-soft)" : "var(--amber-soft)";
      s += `<circle cx="${f.px}" cy="${cy}" r="15" style="fill:${soft};stroke:${col};stroke-width:2"/>`;
      s += `<text x="${f.px}" y="${cy + 4}" text-anchor="middle" style="fill:${col};font-family:var(--mono);font-size:12px;font-weight:700">P</text>`;
      // badge modalità
      s += `<rect x="${W - 70}" y="8" width="62" height="20" rx="5" style="fill:${soft};stroke:${col}"/>`;
      s += `<text x="${W - 39}" y="22" text-anchor="middle" style="fill:${col};font-family:var(--mono);font-size:11px;font-weight:700">mod. ${f.mode}</text>`;
      return s + "</svg>";
    }

    function panel(f) {
      const procCol = f.proc === "bloccato" ? "deadcell" : f.proc === "esecuzione" ? "reccell" : "";
      let h = `<div class="sim-cols">
        <div><b>registri</b><br>numero syscall: <code>${f.num == null ? "—" : f.num}</code><br>valore di ritorno: <code>${f.ret || "—"}</code></div>
        <div><b>stato di P</b><br><span class="badge ${procCol}">${f.proc}</span><br>contesto salvato: ${f.ctx ? "sì" : "no"}</div>
      </div>`;
      // tabella delle system call
      h += `<table><tr><th>n.</th><th>gestore</th></tr>` +
        TABLE.map(([n, name]) => `<tr class="${f.hl === n ? "hlrow" : ""}"><td>${n}</td><td>sys_${name}()</td></tr>`).join("") +
        `</table>`;
      return h;
    }

    window.SIMS.push({
      id: "sim_syscall", topic: "struttura", name: "Percorso di una system call", icon: "SYS",
      title: "Dalla read() al kernel e ritorno: come funziona una system call",
      desc: "Segui il processo mentre passa dalla modalità utente a quella kernel con una TRAP, il dispatcher trova il gestore nella tabella, il servizio (magari bloccante) viene eseguito e si torna in modalità utente.",
      info: `<p><b>Come leggere la scena.</b> Le due fasce sono i due spazi con i loro privilegi: <b>utente</b> (limitato) e <b>kernel</b> (accesso completo all'hardware). Il pallino è il processo P: la sua posizione dice in quale modalità sta girando. Il badge in alto a destra ripete la modalità corrente (U/K).</p>
      <ul>
        <li><b>Perché serve la TRAP.</b> In modalità utente il processo non può toccare i dispositivi: per farlo <i>chiede</i> al kernel con una system call. La TRAP è l'unico ponte controllato tra i due mondi, e fa scattare il salvataggio del contesto.</li>
        <li><b>Il numero e la tabella.</b> Il kernel non salta a un indirizzo scelto dal processo (sarebbe un buco di sicurezza): il processo passa solo un <b>numero</b>, e il dispatcher lo traduce nel gestore giusto tramite la tabella delle syscall.</li>
        <li><b>Chiamata bloccante.</b> Con <code>read()</code> il dato arriva da un dispositivo lento: P si <b>blocca</b> e la CPU va ad altri — è il motivo per cui una syscall di I/O di solito comporta un context switch. Con <code>getpid()</code> il dato è già in memoria: nessun blocco.</li>
        <li><b>Ritorno.</b> Finito il servizio, il kernel ripristina il contesto e con IRET riporta P in modalità utente, con il valore di ritorno in un registro.</li>
      </ul>`,
      mount(box) {
        box.innerHTML = `<div class="sim-params">
            <label>system call <select class="p-call">
              <option value="read">read() — bloccante (I/O)</option>
              <option value="getpid">getpid() — non bloccante</option>
            </select></label>
          </div>
          <div class="sim-player"></div>
          <p class="sim-hint">In modalità utente il processo non può accedere direttamente all'hardware: la system call è la richiesta controllata al kernel. Il numero (non l'indirizzo) protegge il sistema; la tabella delle syscall fa da centralino.</p>`;
        const q = s => box.querySelector(s);
        const render = (f) => K.msg(f.msg) + svg(f) + panel(f);
        const pl = K.player(q(".sim-player"), { build: () => build(q(".p-call").value), render });
        q(".p-call").addEventListener("change", () => pl.reload());
      }
    });
  })();

  /* ==================== Ciclo fetch–decode–execute ==================== */
  (function () {
    // piccolo programma in memoria + due celle dati e una cella risultato
    const PROG = {
      0: { txt: "LOAD 6", op: "LOAD", arg: 6 },
      1: { txt: "ADD 7", op: "ADD", arg: 7 },
      2: { txt: "STORE 8", op: "STORE", arg: 8 },
      3: { txt: "HLT", op: "HLT" },
      4: { txt: "[gestore INT]", op: "ISR" }
    };
    const DATA0 = { 6: 5, 7: 3, 8: 0 };
    const ROWS = [0, 1, 2, 3, 4, null, 6, 7, 8];

    function build(withInt) {
      const F = [];
      let pc = 0, ir = null, acc = 0, saved = null, served = false, mem = Object.assign({}, DATA0);
      const push = (o) => F.push(Object.assign({ pc, ir, acc, mem: Object.assign({}, mem), phase: "", hl: null, intPending: withInt && !served, inISR: !!saved, msg: "" }, o));
      push({ phase: "avvio", msg: "Stato iniziale: il <b>PC</b> (program counter) punta alla prima istruzione. La CPU ripete sempre lo stesso ciclo: preleva, decodifica, esegue." });

      let guard = 0;
      while (guard++ < 40) {
        // controllo interruzioni al confine tra due istruzioni
        if (withInt && !served && !saved && pc === 2) {
          push({ phase: "interrupt", msg: "Fine istruzione: c'è un <b>interrupt</b> in attesa. Prima di prelevare la prossima istruzione, la CPU esegue il <b>ciclo di interruzione</b>." });
          saved = pc;
          pc = 4;
          push({ phase: "interrupt", pc, msg: `L'hardware <b>salva il PC</b> (${saved}) e carica nel PC l'indirizzo del <b>gestore</b> (4). Il programma principale è sospeso.` });
          push({ phase: "ISR", pc, hl: 4, msg: "Esecuzione del <b>gestore di interruzione</b> (ISR): serve il dispositivo che ha interrotto." });
          pc = saved; saved = null; served = true;
          push({ phase: "IRET", pc, msg: `<b>IRET</b>: ripristina il PC salvato (${pc}). Il programma principale riprende esattamente da dove era stato sospeso.` });
        }
        const instr = PROG[pc];
        if (!instr) break;
        // FETCH
        ir = instr.txt; const at = pc; pc = pc + 1;
        push({ phase: "fetch", ir, pc, hl: at, msg: `<b>Fetch</b>: l'istruzione all'indirizzo ${at} entra nel registro istruzione <b>IR</b> = <code>${ir}</code>; il PC avanza a ${pc}.` });
        // DECODE
        push({ phase: "decode", ir, msg: `<b>Decode</b>: l'unità di controllo interpreta <code>${instr.op}</code>${instr.arg != null ? ` con operando ${instr.arg}` : ""}.` });
        // EXECUTE
        if (instr.op === "LOAD") { acc = mem[instr.arg]; push({ phase: "execute", acc, hl: instr.arg, msg: `<b>Execute</b>: <code>LOAD ${instr.arg}</code> copia M[${instr.arg}] = ${mem[instr.arg]} nell'accumulatore <b>ACC</b>.` }); }
        else if (instr.op === "ADD") { acc = acc + mem[instr.arg]; push({ phase: "execute", acc, hl: instr.arg, msg: `<b>Execute</b>: <code>ADD ${instr.arg}</code> somma M[${instr.arg}] = ${mem[instr.arg]} ad ACC, che diventa ${acc}.` }); }
        else if (instr.op === "STORE") { mem = Object.assign({}, mem, { [instr.arg]: acc }); push({ phase: "execute", acc, hl: instr.arg, mem, msg: `<b>Execute</b>: <code>STORE ${instr.arg}</code> scrive ACC = ${acc} nella cella M[${instr.arg}].` }); }
        else if (instr.op === "HLT") { push({ phase: "halt", msg: "<b>HLT</b>: il programma è finito, la CPU si ferma. ACC contiene il risultato e M[8] è stato aggiornato." }); break; }
      }
      return F;
    }

    function memTable(f) {
      let h = `<table><tr><th>ind.</th><th>contenuto</th></tr>`;
      ROWS.forEach(a => {
        if (a === null) { h += `<tr><td colspan="2" style="border:none;background:none">·</td></tr>`; return; }
        const isInstr = PROG[a] && a <= 4;
        const content = isInstr ? PROG[a].txt : (f.mem[a] != null ? f.mem[a] : "");
        const cls = [];
        if (f.hl === a) cls.push("hlcell");
        if (f.pc === a) cls.push("reccell");
        h += `<tr><td>${f.pc === a ? "▸ " : ""}${a}</td><td class="${cls.join(" ")}">${content}</td></tr>`;
      });
      return h + "</table>";
    }

    function cpuBox(f) {
      const ph = { fetch: "FETCH", decode: "DECODE", execute: "EXECUTE", interrupt: "INTERRUPT", ISR: "ISR", IRET: "IRET", halt: "HALT", avvio: "—" }[f.phase] || f.phase;
      return `<div class="sim-cols">
        <div><b>CPU</b><br>PC = <code>${f.pc}</code><br>IR = <code>${f.ir || "—"}</code><br>ACC = <code>${f.acc}</code></div>
        <div><b>fase</b><br><span class="badge acc">${ph}</span><br>interrupt in attesa: ${f.intPending ? "<span class=\"badge deadcell\">sì</span>" : "no"}</div>
      </div>`;
    }

    window.SIMS.push({
      id: "sim_cpu_cycle", topic: "intro", name: "Ciclo fetch–decode–execute", icon: "CPU",
      title: "Come la CPU esegue un programma: preleva, decodifica, esegue (e le interruzioni)",
      desc: "Un piccolo programma in memoria, eseguito un passo alla volta: guarda PC, IR e accumulatore cambiare a ogni fase e, se lo attivi, un interrupt che sospende il programma e manda in esecuzione il gestore.",
      info: `<p><b>Come leggere la scena.</b> A sinistra la <b>memoria</b> (indirizzo → contenuto): le prime celle sono le istruzioni del programma, le ultime i dati. Il <b>▸</b> e la cella verde indicano dove punta il PC; la cella evidenziata è quella letta o scritta nel passo corrente. A destra i registri della CPU e la fase del ciclo.</p>
      <ul>
        <li><b>Il ciclo base.</b> Per ogni istruzione la CPU ripete tre fasi: <b>fetch</b> (l'istruzione va nell'IR, il PC avanza), <b>decode</b> (viene interpretata), <b>execute</b> (viene svolta, spesso toccando la memoria o l'ACC).</li>
        <li><b>Il PC.</b> Avanza durante il fetch, prima ancora di eseguire: per questo, quando arriva un salto o un'interruzione, ciò che si salva è già l'indirizzo dell'istruzione <i>successiva</i>.</li>
        <li><b>Le interruzioni.</b> Non si controllano nel mezzo di un'istruzione, ma al <b>confine</b> tra due istruzioni: se ce n'è una in attesa, la CPU salva il PC, salta al gestore e, con IRET, riprende esattamente da dove era. È il meccanismo che rende il sistema reattivo senza polling continuo.</li>
        <li><b>Modello.</b> Qui l'accumulatore è unico (macchina didattica): <code>LOAD</code> lo carica dalla memoria, <code>ADD</code> ci somma una cella, <code>STORE</code> lo riscrive in memoria.</li>
      </ul>`,
      mount(box) {
        box.innerHTML = `<div class="sim-params">
            <label>interruzione <select class="p-int">
              <option value="0">senza interrupt</option>
              <option value="1">con un interrupt</option>
            </select></label>
          </div>
          <div class="sim-player"></div>
          <p class="sim-hint">Programma: <code>LOAD 6</code> · <code>ADD 7</code> · <code>STORE 8</code> · <code>HLT</code>. Le celle 6 e 7 contengono i dati (5 e 3), la cella 8 raccoglie il risultato (8).</p>`;
        const q = s => box.querySelector(s);
        const render = (f) => K.msg(f.msg) + `<div class="sim-row" style="align-items:flex-start;gap:1.4rem">${memTable(f)}<div style="flex:1;min-width:200px">${cpuBox(f)}</div></div>`;
        const pl = K.player(q(".sim-player"), { build: () => build(q(".p-int").value === "1"), render });
        q(".p-int").addEventListener("change", () => pl.reload());
      }
    });
  })();
})();
