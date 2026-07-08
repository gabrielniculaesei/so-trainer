# SO Trainer — Preparazione esame Sistemi Operativi (teoria)

Web app statica per prepararsi allo scritto e all'orale. Nessuna dipendenza, nessun build: **basta aprire `index.html` nel browser** (doppio click).

🔗 **Online**: <!-- TODO: link Vercel dopo il deploy -->

In alternativa, per servirla via HTTP:

```bash
cd webapp
python3 -m http.server 8080
# poi apri http://localhost:8080
```

## Contenuto

| File | Contenuto |
|---|---|
| `data/data_mcq_1..7.js` | Banca di 278 domande a risposta multipla in stile esame (opzioni A–E), divise per argomento |
| `data/data_other.js`, `data/data_other2.js` | 45 domande da orale con risposte modello + 33 esercizi risolti passo-passo |
| `data/data_extra.js` | 20 domande da orale aggiuntive + 17 domande aperte di teoria (risposta discorsiva con risposta modello) |
| `data/generators.js`, `data/generators2.js` | 25 generatori di esercizi con parametri casuali e soluzione calcolata (FAT, i-node, EAT/TLB, scheduling disco e CPU, sostituzione pagine, RAID/XOR, pipeline, semafori, aging…) |
| `app.js` | Logica: terminale interattivo, quiz, simulazione esame con timer, flashcard orale, domande aperte, statistiche (localStorage) |

## Modalità

- **Home**: un terminale interattivo — digita `quiz`, `./esercizi`, `orale`, `aperte`… (oppure `help`, `ls`, `neofetch`) per spostarti tra le sezioni. In alternativa clicca una voce dell'elenco.
- **Quiz**: feedback immediato con spiegazione, filtro per argomento, modalità "solo domande sbagliate". Tasti `1–5` per rispondere, `Invio` per proseguire.
- **Esercizi**: prova su carta, poi "Mostra soluzione". I generatori creano varianti sempre nuove.
- **Simulazione esame**: N crocette + M esercizi con timer; correzione automatica delle crocette, autovalutazione degli esercizi, voto indicativo secondo le fasce del syllabus.
- **Orale**: flashcard con risposte modello; le domande mai viste o sbagliate hanno priorità.
- **Domande aperte**: teoria da esporre per esteso; imposti la risposta e la confronti con quella modello (i punti chiave da toccare).
- **Statistiche**: prestazioni per argomento (salvate nel browser).

## Aggiungere domande

Aggiungi un oggetto all'array in uno dei `data/data_mcq_*.js`:

```js
{ id: "xx99", topic: "memoria",      // vedi window.TOPICS in data/data_mcq_1.js
  q: "Testo della domanda (HTML ok)",
  options: ["A", "B", "C", "D", "E"],
  correct: 2,                        // indice 0-based dell'opzione giusta
  expl: "Spiegazione mostrata dopo la risposta" },
```

Gli `id` devono essere univoci (le statistiche si agganciano all'id).

## Fonti

Riassunto del corso, slide (SO-merged), Tanenbaum, fac-simile della prova scritta, testimonianze d'esame ed esercizi svolti.
