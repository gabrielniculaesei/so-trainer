// Kata di laboratorio (C + pthread): un kata = un pattern della prova pratica.
// Ogni kata ha un gen(seed) che sceglie parametri casuali e restituisce
//   { seed, params, args, files, expected: { exact, set }, solution, levels: [l1, l2, l3] }
// - expected.exact: righe [MAIN] nell'ordine esatto; expected.set: righe dei thread (ordine libero)
// - files: file di input da scaricare ({ name, data: string | Uint8Array })
// - il sorgente C nasce da un solo template con marcatori di riga:
//     //@G suggerimento ... //@/G   lacuna del livello 1 (diventa /* TODO n: suggerimento */)
//     //@B stub ... //@/B           corpo tolto al livello 2 (resta /* TODO */ + stub)
//   la soluzione è il template senza marcatori, così livelli e soluzione non divergono.
// Nel lab si usano i nomi reali delle API POSIX (sem_wait, pthread_cond_wait, ...).
(function () {
  "use strict";

  // PRNG con seed (mulberry32): stessa variante a parità di seed
  function rng(seed) {
    let a = seed >>> 0;
    const f = () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    f.int = (lo, hi) => lo + Math.floor(f() * (hi - lo + 1));
    f.pick = arr => arr[Math.floor(f() * arr.length)];
    return f;
  }

  // mix(v) = v * 2654435761 mod 2^32, identico all'aritmetica unsigned del C
  const mix = v => Math.imul(v >>> 0, 2654435761) >>> 0;

  const isMarker = l => /^\s*\/\/@/.test(l);
  function solutionOf(tpl) { return tpl.split("\n").filter(l => !isMarker(l)).join("\n"); }
  function level1Of(tpl) {
    const out = []; let inG = false, n = 0;
    tpl.split("\n").forEach(l => {
      const g = l.match(/^(\s*)\/\/@G\s*(.*)$/);
      if (g) { inG = true; n++; out.push(`${g[1]}/* TODO ${n}: ${g[2]} */`); return; }
      if (/^\s*\/\/@\/G/.test(l)) { inG = false; return; }
      if (isMarker(l)) return;
      if (!inG) out.push(l);
    });
    return out.join("\n");
  }
  function level2Of(tpl) {
    const out = []; let inB = false;
    tpl.split("\n").forEach(l => {
      const b = l.match(/^(\s*)\/\/@B\s*(.*)$/);
      if (b) { inB = true; out.push(`${b[1]}/* TODO */`); if (b[2]) out.push(b[1] + b[2]); return; }
      if (/^\s*\/\/@\/B/.test(l)) { inB = false; return; }
      if (isMarker(l)) return;
      if (!inB) out.push(l);
    });
    return out.join("\n");
  }
  // commento di consegna in cima al file
  function header(id, seed, label, consegna) {
    const body = consegna.trim().split("\n").map(l => (" * " + l).replace(/\s+$/, "")).join("\n");
    return `/*\n * KATA ${id} · variante #${seed} · ${label}\n * ------------------------------------------------------------\n${body}\n * ------------------------------------------------------------\n */\n`;
  }
  function build(id, seed, consegna, tpl) {
    const t = tpl.replace(/^\n/, "");
    return {
      solution: header(id, seed, "soluzione di riferimento", consegna) + solutionOf(t),
      levels: [
        header(id, seed, "livello 1: completa le lacune TODO", consegna) + level1Of(t),
        header(id, seed, "livello 2: struct e firme, scrivi i corpi", consegna) + level2Of(t),
        header(id, seed, "livello 3: foglio bianco", consegna) +
          "\n/* Scrivi tutto da zero: include, struct, funzioni, main.\n   Niente variabili globali. Compila con -Wall -Wextra senza warning. */\n"
      ]
    };
  }
  const randSeed = () => 1 + Math.floor(Math.random() * 99999);

  // intestazione comune (stile lib-misc.h)
  const HEAD_CV = String.raw`#ifdef __linux__
#define _POSIX_C_SOURCE 200809L
#endif
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define exit_with_err(s, e) do { fprintf(stderr, "%s: %s\n", (s), strerror((e))); exit(EXIT_FAILURE); } while (0)`;

  // ====================================================================
  // 1. coda circolare con mutex + variabili condizione (pattern 6.2)
  // ====================================================================
  function genCodaCond(seed) {
    seed = seed || randSeed();
    const r = rng(seed);
    const P = r.int(2, 4), C = r.int(2, 4), CAP = r.int(2, 5), SALT = r.int(1, 999);
    const quanti = Array.from({ length: P }, () => r.int(150, 999));
    let tot = 0, somma = 0, impr = 0;
    quanti.forEach((k, i) => { for (let j = 0; j < k; j++) { const v = SALT + (i + 1) * 1000 + j; tot++; somma += v; impr = (impr ^ mix(v)) >>> 0; } });

    const consegna = `
CONSEGNA
${P} thread produttori PROD-1..PROD-${P} e ${C} thread consumatori CONS-1..CONS-${C}
condividono una coda FIFO circolare di QUEUE_CAP = ${CAP} interi.
- Il produttore i inserisce i valori SALT + i*1000 + j (SALT = ${SALT}),
  per j = 0 .. quanti[i]-1, con quanti = { ${quanti.join(", ")} };
  poi segnala la fine del proprio lavoro.
- Ogni consumatore estrae finché la coda non è vuota E nessun produttore
  è più attivo; accumula in privato conteggio, somma e impronta
  (XOR di mix(v) = v * 2654435761u, aritmetica unsigned a 32 bit).
- Il main crea i thread, fa la join di tutti e stampa il riepilogo.
Strumenti: un mutex e due variabili condizione (not_full, not_empty).
Niente variabili globali. Tutti i thread terminano spontaneamente.

OUTPUT (righe [MAIN] in quest'ordine, le altre in ordine qualsiasi):
[MAIN] creazione di ${P} thread produttori e ${C} thread consumatori
[PROD-i] terminazione con <quanti[i]> elementi prodotti
[CONS-j] terminazione
[MAIN] elementi consumati: <totale>
[MAIN] somma: <somma>
[MAIN] impronta: <XOR delle impronte>
[MAIN] terminazione`;

    const tpl = String.raw`
${HEAD_CV}

#define N_PROD ${P}
#define N_CONS ${C}
#define QUEUE_CAP ${CAP}
#define SALT ${SALT}

/* impronta di un valore: rivela elementi persi o duplicati */
static inline unsigned mix(unsigned v) { return v * 2654435761u; }

typedef struct {
    int buf[QUEUE_CAP];
    int head, tail, count;
    int active_producers;         /* produttori che possono ancora inserire */
    pthread_mutex_t mutex;
    pthread_cond_t not_full, not_empty;
} queue_t;

typedef struct {
    pthread_t tid;
    int id;                       /* 1..N_PROD */
    int quanti;
    queue_t *queue;
} prod_arg_t;

typedef struct {
    pthread_t tid;
    int id;                       /* 1..N_CONS */
    unsigned count;               /* risultati privati, letti dal main dopo la join */
    long long somma;
    unsigned impronta;
    queue_t *queue;
} cons_arg_t;

void queue_push(queue_t *q, int v) {
    //@B
    pthread_mutex_lock(&q->mutex);
    //@G attendi finché la coda è piena (if o while?)
    while (q->count == QUEUE_CAP)
        pthread_cond_wait(&q->not_full, &q->mutex);
    //@/G
    q->buf[q->tail] = v;
    q->tail = (q->tail + 1) % QUEUE_CAP;
    q->count++;
    //@G avvisa chi aspetta un elemento
    pthread_cond_signal(&q->not_empty);
    //@/G
    pthread_mutex_unlock(&q->mutex);
    //@/B
}

/* 1 = elemento estratto in *out; 0 = coda vuota e nessun produttore attivo */
int queue_pop(queue_t *q, int *out) {
    //@B return 0;
    pthread_mutex_lock(&q->mutex);
    //@G quando deve dormire il consumatore?
    while (q->count == 0 && q->active_producers > 0)
        pthread_cond_wait(&q->not_empty, &q->mutex);
    //@/G
    //@G quando la coda è finita davvero? (rilascia il mutex prima di uscire)
    if (q->count == 0) {
        pthread_mutex_unlock(&q->mutex);
        return 0;
    }
    //@/G
    *out = q->buf[q->head];
    q->head = (q->head + 1) % QUEUE_CAP;
    q->count--;
    pthread_cond_signal(&q->not_full);
    pthread_mutex_unlock(&q->mutex);
    return 1;
    //@/B
}

void queue_producer_done(queue_t *q) {
    //@B
    pthread_mutex_lock(&q->mutex);
    //@G l'ultimo produttore deve svegliare TUTTI i consumatori
    if (--q->active_producers == 0)
        pthread_cond_broadcast(&q->not_empty);
    //@/G
    pthread_mutex_unlock(&q->mutex);
    //@/B
}

void *producer(void *arg) {
    prod_arg_t *a = arg;
    //@B
    for (int j = 0; j < a->quanti; j++)
        queue_push(a->queue, SALT + a->id * 1000 + j);
    //@G segnala la fine del lavoro
    queue_producer_done(a->queue);
    //@/G
    printf("[PROD-%d] terminazione con %d elementi prodotti\n", a->id, a->quanti);
    //@/B
    return NULL;
}

void *consumer(void *arg) {
    cons_arg_t *a = arg;
    //@B
    int v;
    while (queue_pop(a->queue, &v)) {
        a->count++;
        a->somma += v;
        a->impronta ^= mix((unsigned)v);
    }
    printf("[CONS-%d] terminazione\n", a->id);
    //@/B
    return NULL;
}

int main(void) {
    const int quanti[N_PROD] = { ${quanti.join(", ")} };
    int err;
    queue_t *q = malloc(sizeof *q);
    prod_arg_t *pa = calloc(N_PROD, sizeof *pa);
    cons_arg_t *ca = calloc(N_CONS, sizeof *ca);
    if (q == NULL || pa == NULL || ca == NULL) { perror("malloc"); exit(EXIT_FAILURE); }

    //@B
    q->head = q->tail = q->count = 0;
    //@G quanti produttori sono attivi? (va fatto PRIMA di creare i thread)
    q->active_producers = N_PROD;
    //@/G
    if ((err = pthread_mutex_init(&q->mutex, NULL)) != 0) exit_with_err("pthread_mutex_init", err);
    if ((err = pthread_cond_init(&q->not_full, NULL)) != 0) exit_with_err("pthread_cond_init", err);
    if ((err = pthread_cond_init(&q->not_empty, NULL)) != 0) exit_with_err("pthread_cond_init", err);
    //@/B

    printf("[MAIN] creazione di %d thread produttori e %d thread consumatori\n", N_PROD, N_CONS);
    //@B
    for (int i = 0; i < N_PROD; i++) {
        pa[i].id = i + 1;
        pa[i].quanti = quanti[i];
        pa[i].queue = q;
        if ((err = pthread_create(&pa[i].tid, NULL, producer, &pa[i])) != 0) exit_with_err("pthread_create", err);
    }
    for (int i = 0; i < N_CONS; i++) {
        ca[i].id = i + 1;
        ca[i].queue = q;
        if ((err = pthread_create(&ca[i].tid, NULL, consumer, &ca[i])) != 0) exit_with_err("pthread_create", err);
    }
    for (int i = 0; i < N_PROD; i++)
        if ((err = pthread_join(pa[i].tid, NULL)) != 0) exit_with_err("pthread_join", err);
    for (int i = 0; i < N_CONS; i++)
        if ((err = pthread_join(ca[i].tid, NULL)) != 0) exit_with_err("pthread_join", err);
    //@/B

    unsigned count = 0, impronta = 0;
    long long somma = 0;
    for (int i = 0; i < N_CONS; i++) {
        count += ca[i].count;
        somma += ca[i].somma;
        impronta ^= ca[i].impronta;
    }
    printf("[MAIN] elementi consumati: %u\n", count);
    printf("[MAIN] somma: %lld\n", somma);
    printf("[MAIN] impronta: %u\n", impronta);

    //@B
    pthread_mutex_destroy(&q->mutex);
    pthread_cond_destroy(&q->not_full);
    pthread_cond_destroy(&q->not_empty);
    //@/B
    free(q); free(pa); free(ca);
    printf("[MAIN] terminazione\n");
    return EXIT_SUCCESS;
}
`;
    const src = build("coda-cond", seed, consegna, tpl);
    return Object.assign(src, {
      seed, args: "", files: [],
      params: `${P} produttori · ${C} consumatori · coda da ${CAP} · ${tot} elementi`,
      expected: {
        exact: [`[MAIN] creazione di ${P} thread produttori e ${C} thread consumatori`,
          `[MAIN] elementi consumati: ${tot}`, `[MAIN] somma: ${somma}`, `[MAIN] impronta: ${impr}`, "[MAIN] terminazione"],
        set: quanti.map((k, i) => `[PROD-${i + 1}] terminazione con ${k} elementi prodotti`)
          .concat(Array.from({ length: C }, (_, j) => `[CONS-${j + 1}] terminazione`))
      }
    });
  }

  // ====================================================================
  // 2. coda con semafori + mutex, terminazione multi-consumatore (6.3)
  // ====================================================================
  function genCodaSem(seed) {
    seed = seed || randSeed();
    const r = rng(seed);
    const P = r.int(2, 4), C = r.int(2, 4), CAP = r.int(2, 5), SALT = r.int(1, 999);
    const quanti = Array.from({ length: P }, () => r.int(150, 999));
    let tot = 0, somma = 0, impr = 0;
    quanti.forEach((k, i) => { for (let j = 0; j < k; j++) { const v = SALT + (i + 1) * 1000 + j; tot++; somma += v; impr = (impr ^ mix(v)) >>> 0; } });

    const consegna = `
CONSEGNA
${P} thread produttori PROD-1..PROD-${P} e ${C} thread consumatori CONS-1..CONS-${C}
condividono una coda FIFO circolare di QUEUE_CAP = ${CAP} interi.
- Il produttore i inserisce i valori SALT + i*1000 + j (SALT = ${SALT}),
  per j = 0 .. quanti[i]-1, con quanti = { ${quanti.join(", ")} };
  poi segnala la fine del proprio lavoro.
- Ogni consumatore estrae finché ci sono elementi o produttori attivi;
  accumula in privato conteggio, somma e impronta
  (XOR di mix(v) = v * 2654435761u, aritmetica unsigned a 32 bit).
- Il main crea i thread, fa la join di tutti e stampa il riepilogo.
Strumenti: semafori POSIX senza nome (empty, full) + un mutex.
Nessun broadcast con i semafori: l'ultimo produttore deve lasciare un
gettone extra per ciascun consumatore. Niente variabili globali.
Su macOS sem_init non funziona: prova con il comando Docker.

OUTPUT (righe [MAIN] in quest'ordine, le altre in ordine qualsiasi):
[MAIN] creazione di ${P} thread produttori e ${C} thread consumatori
[PROD-i] terminazione con <quanti[i]> elementi prodotti
[CONS-j] terminazione
[MAIN] elementi consumati: <totale>
[MAIN] somma: <somma>
[MAIN] impronta: <XOR delle impronte>
[MAIN] terminazione`;

    const tpl = String.raw`
#ifdef __linux__
#define _POSIX_C_SOURCE 200809L
#endif
#include <pthread.h>
#include <semaphore.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>

#define exit_with_sys_err(s) do { perror((s)); exit(EXIT_FAILURE); } while (0)
#define exit_with_err(s, e) do { fprintf(stderr, "%s: %s\n", (s), strerror((e))); exit(EXIT_FAILURE); } while (0)

#define N_PROD ${P}
#define N_CONS ${C}
#define QUEUE_CAP ${CAP}
#define SALT ${SALT}

/* impronta di un valore: rivela elementi persi o duplicati */
static inline unsigned mix(unsigned v) { return v * 2654435761u; }

typedef struct {
    int buf[QUEUE_CAP];
    int head, tail, count;
    int active_producers;         /* protetto da mutex */
    int done;                     /* 1 quando tutti i produttori hanno finito */
    sem_t empty;                  /* posti liberi: init QUEUE_CAP */
    sem_t full;                   /* gettoni da consumare: init 0 */
    pthread_mutex_t mutex;
} squeue_t;

typedef struct {
    pthread_t tid;
    int id;
    int quanti;
    squeue_t *queue;
} prod_arg_t;

typedef struct {
    pthread_t tid;
    int id;
    unsigned count;
    long long somma;
    unsigned impronta;
    squeue_t *queue;
} cons_arg_t;

void squeue_push(squeue_t *q, int v) {
    //@B
    //@G prima il posto libero, POI il mutex
    if (sem_wait(&q->empty) == -1) exit_with_sys_err("sem_wait");
    pthread_mutex_lock(&q->mutex);
    //@/G
    q->buf[q->tail] = v;
    q->tail = (q->tail + 1) % QUEUE_CAP;
    q->count++;
    pthread_mutex_unlock(&q->mutex);
    //@G pubblica il gettone dell'elemento
    if (sem_post(&q->full) == -1) exit_with_sys_err("sem_post");
    //@/G
    //@/B
}

/* 1 = elemento estratto in *out; 0 = gettone di terminazione */
int squeue_pop(squeue_t *q, int *out) {
    //@B return 0;
    if (sem_wait(&q->full) == -1) exit_with_sys_err("sem_wait");
    pthread_mutex_lock(&q->mutex);
    //@G si esce solo se la coda è vuota E i produttori hanno finito
    if (q->count == 0 && q->done) {
        pthread_mutex_unlock(&q->mutex);
        return 0;
    }
    //@/G
    *out = q->buf[q->head];
    q->head = (q->head + 1) % QUEUE_CAP;
    q->count--;
    pthread_mutex_unlock(&q->mutex);
    if (sem_post(&q->empty) == -1) exit_with_sys_err("sem_post");
    return 1;
    //@/B
}

/* chiamata da ogni produttore a fine lavoro */
void squeue_producer_done(squeue_t *q, int n_consumers) {
    //@B
    pthread_mutex_lock(&q->mutex);
    int last = (--q->active_producers == 0);
    if (last) q->done = 1;
    pthread_mutex_unlock(&q->mutex);
    //@G l'ultimo produttore: un gettone extra per OGNI consumatore
    if (last)
        for (int i = 0; i < n_consumers; i++)
            if (sem_post(&q->full) == -1) exit_with_sys_err("sem_post");
    //@/G
    //@/B
}

void *producer(void *arg) {
    prod_arg_t *a = arg;
    //@B
    for (int j = 0; j < a->quanti; j++)
        squeue_push(a->queue, SALT + a->id * 1000 + j);
    squeue_producer_done(a->queue, N_CONS);
    printf("[PROD-%d] terminazione con %d elementi prodotti\n", a->id, a->quanti);
    //@/B
    return NULL;
}

void *consumer(void *arg) {
    cons_arg_t *a = arg;
    //@B
    int v;
    while (squeue_pop(a->queue, &v)) {
        a->count++;
        a->somma += v;
        a->impronta ^= mix((unsigned)v);
    }
    printf("[CONS-%d] terminazione\n", a->id);
    //@/B
    return NULL;
}

int main(void) {
    const int quanti[N_PROD] = { ${quanti.join(", ")} };
    int err;
    squeue_t *q = malloc(sizeof *q);
    prod_arg_t *pa = calloc(N_PROD, sizeof *pa);
    cons_arg_t *ca = calloc(N_CONS, sizeof *ca);
    if (q == NULL || pa == NULL || ca == NULL) { perror("malloc"); exit(EXIT_FAILURE); }

    //@B
    q->head = q->tail = q->count = 0;
    q->active_producers = N_PROD;
    q->done = 0;
    //@G valori iniziali dei due semafori (0 = condiviso tra thread)
    if (sem_init(&q->empty, 0, QUEUE_CAP) == -1) exit_with_sys_err("sem_init");
    if (sem_init(&q->full, 0, 0) == -1) exit_with_sys_err("sem_init");
    //@/G
    if ((err = pthread_mutex_init(&q->mutex, NULL)) != 0) exit_with_err("pthread_mutex_init", err);
    //@/B

    printf("[MAIN] creazione di %d thread produttori e %d thread consumatori\n", N_PROD, N_CONS);
    //@B
    for (int i = 0; i < N_PROD; i++) {
        pa[i].id = i + 1;
        pa[i].quanti = quanti[i];
        pa[i].queue = q;
        if ((err = pthread_create(&pa[i].tid, NULL, producer, &pa[i])) != 0) exit_with_err("pthread_create", err);
    }
    for (int i = 0; i < N_CONS; i++) {
        ca[i].id = i + 1;
        ca[i].queue = q;
        if ((err = pthread_create(&ca[i].tid, NULL, consumer, &ca[i])) != 0) exit_with_err("pthread_create", err);
    }
    for (int i = 0; i < N_PROD; i++)
        if ((err = pthread_join(pa[i].tid, NULL)) != 0) exit_with_err("pthread_join", err);
    for (int i = 0; i < N_CONS; i++)
        if ((err = pthread_join(ca[i].tid, NULL)) != 0) exit_with_err("pthread_join", err);
    //@/B

    unsigned count = 0, impronta = 0;
    long long somma = 0;
    for (int i = 0; i < N_CONS; i++) {
        count += ca[i].count;
        somma += ca[i].somma;
        impronta ^= ca[i].impronta;
    }
    printf("[MAIN] elementi consumati: %u\n", count);
    printf("[MAIN] somma: %lld\n", somma);
    printf("[MAIN] impronta: %u\n", impronta);

    //@B
    sem_destroy(&q->empty);
    sem_destroy(&q->full);
    pthread_mutex_destroy(&q->mutex);
    //@/B
    free(q); free(pa); free(ca);
    printf("[MAIN] terminazione\n");
    return EXIT_SUCCESS;
}
`;
    const src = build("coda-sem", seed, consegna, tpl);
    return Object.assign(src, {
      seed, args: "", files: [],
      params: `${P} produttori · ${C} consumatori · coda da ${CAP} · ${tot} elementi`,
      expected: {
        exact: [`[MAIN] creazione di ${P} thread produttori e ${C} thread consumatori`,
          `[MAIN] elementi consumati: ${tot}`, `[MAIN] somma: ${somma}`, `[MAIN] impronta: ${impr}`, "[MAIN] terminazione"],
        set: quanti.map((k, i) => `[PROD-${i + 1}] terminazione con ${k} elementi prodotti`)
          .concat(Array.from({ length: C }, (_, j) => `[CONS-${j + 1}] terminazione`))
      }
    });
  }

  // ====================================================================
  // 3. slot rendezvous con stati, clienti e servitori con shutdown (6.5)
  // ====================================================================
  function genSlot(seed) {
    seed = seed || randSeed();
    const r = rng(seed);
    const N = r.int(3, 5), ADDK = r.int(2, 99), MULK = r.int(2, 9), SALT = r.int(1, 999);
    const quanti = Array.from({ length: N }, () => r.int(60, 300));
    let tot = 0, sommaTot = 0;
    const somme = quanti.map((k, i) => {
      let s = 0;
      for (let j = 0; j < k; j++) s += (SALT + (i + 1) * 1000 + j + ADDK) * MULK;
      tot += k; sommaTot += s; return s;
    });

    const consegna = `
CONSEGNA
${N} thread clienti CLIENT-1..CLIENT-${N} e 2 thread servitori ADD e MUL.
Ogni servitore ha il proprio slot (uno solo per servitore), usato in
modalità rendezvous con stato EMPTY / TO_PROCESS / DONE:
il cliente attende EMPTY, deposita il valore e mette TO_PROCESS, attende
DONE, ritira il risultato e rimette EMPTY.
- Il cliente i, per j = 0 .. quanti[i]-1 (quanti = { ${quanti.join(", ")} }),
  manda x = SALT + i*1000 + j (SALT = ${SALT}) prima ad ADD, poi il risultato
  a MUL, e somma i risultati finali.
- ADD calcola v + ${ADDK}, MUL calcola v * ${MULK}, sul posto nello slot.
- L'ultimo cliente che termina chiede lo shutdown di TUTTI gli slot;
  un servitore esce solo se non ha lavoro pendente.
Strumenti: per ogni slot un mutex e tre variabili condizione
(cond_free, cond_todo, cond_done); un mutex per il contatore dei clienti.
Niente variabili globali. Tutti i thread terminano spontaneamente.

OUTPUT (righe [MAIN] in quest'ordine, le altre in ordine qualsiasi):
[MAIN] creazione di ${N} thread clienti e 2 thread servitori
[CLIENT-i] terminazione con <quanti[i]> richieste, somma dei risultati <somma>
[ADD] terminazione con <n> richieste servite
[MUL] terminazione con <n> richieste servite
[MAIN] richieste totali: <totale>
[MAIN] somma complessiva: <somma di tutti i clienti>
[MAIN] terminazione`;

    const tpl = String.raw`
${HEAD_CV}

#define N_CLIENT ${N}
#define N_SERV 2
#define ADD_K ${ADDK}
#define MUL_K ${MULK}
#define SALT ${SALT}

typedef enum { EMPTY, TO_PROCESS, DONE } slot_state_t;

typedef struct {
    long long value;
    int client_id, seq;
    slot_state_t state;
    int shutdown;                 /* 1 = nessun cliente manderà più richieste */
    pthread_mutex_t mutex;        /* un mutex PER slot: gli slot lavorano in parallelo */
    pthread_cond_t cond_free;     /* clienti in fila che aspettano EMPTY */
    pthread_cond_t cond_todo;     /* servitore che aspetta TO_PROCESS */
    pthread_cond_t cond_done;     /* cliente proprietario che aspetta DONE */
} slot_t;

typedef struct {
    slot_t slots[N_SERV];         /* slots[0] = ADD, slots[1] = MUL */
    int active_clients;
    pthread_mutex_t mutex;        /* protegge active_clients */
} shared_t;

typedef struct {
    pthread_t tid;
    int id;
    int quanti;
    long long somma;
    shared_t *sh;
} client_arg_t;

typedef struct {
    pthread_t tid;
    const char *name;
    int op;                       /* 0 = ADD, 1 = MUL */
    unsigned served;
    slot_t *slot;
} serv_arg_t;

/* lato cliente: deposita, attende, ritira, libera */
long long slot_request(slot_t *s, long long value, int client_id, int seq) {
    //@B return 0;
    pthread_mutex_lock(&s->mutex);
    //@G aspetta che lo slot sia libero
    while (s->state != EMPTY)
        pthread_cond_wait(&s->cond_free, &s->mutex);
    //@/G
    s->value = value;
    s->client_id = client_id;
    s->seq = seq;
    //@G passa la richiesta al servitore
    s->state = TO_PROCESS;
    pthread_cond_signal(&s->cond_todo);
    //@/G
    //@G aspetta la risposta (il mutex lo rilascia solo la wait)
    while (s->state != DONE)
        pthread_cond_wait(&s->cond_done, &s->mutex);
    //@/G
    long long res = s->value;
    //@G libera lo slot per il prossimo cliente in fila
    s->state = EMPTY;
    pthread_cond_signal(&s->cond_free);
    //@/G
    pthread_mutex_unlock(&s->mutex);
    return res;
    //@/B
}

void slot_shutdown(slot_t *s) {
    //@B
    pthread_mutex_lock(&s->mutex);
    s->shutdown = 1;
    //@G sveglia il servitore che dorme su cond_todo
    pthread_cond_broadcast(&s->cond_todo);
    //@/G
    pthread_mutex_unlock(&s->mutex);
    //@/B
}

void *server(void *arg) {
    serv_arg_t *a = arg;
    slot_t *s = a->slot;
    //@B
    for (;;) {
        pthread_mutex_lock(&s->mutex);
        //@G dormi finché non c'è lavoro e non è arrivato lo shutdown
        while (s->state != TO_PROCESS && !s->shutdown)
            pthread_cond_wait(&s->cond_todo, &s->mutex);
        //@/G
        //@G esci SOLO se non c'è lavoro pendente
        if (s->state != TO_PROCESS) {
            pthread_mutex_unlock(&s->mutex);
            break;
        }
        //@/G
        if (a->op == 0) s->value += ADD_K;
        else s->value *= MUL_K;
        a->served++;
        s->state = DONE;
        pthread_cond_signal(&s->cond_done);
        pthread_mutex_unlock(&s->mutex);
    }
    printf("[%s] terminazione con %u richieste servite\n", a->name, a->served);
    //@/B
    return NULL;
}

void *client(void *arg) {
    client_arg_t *a = arg;
    shared_t *sh = a->sh;
    //@B
    for (int j = 0; j < a->quanti; j++) {
        long long v = SALT + a->id * 1000 + j;
        v = slot_request(&sh->slots[0], v, a->id, j + 1);
        v = slot_request(&sh->slots[1], v, a->id, j + 1);
        a->somma += v;
    }
    pthread_mutex_lock(&sh->mutex);
    int last = (--sh->active_clients == 0);
    pthread_mutex_unlock(&sh->mutex);
    //@G l'ultimo cliente chiude TUTTI gli slot
    if (last)
        for (int k = 0; k < N_SERV; k++)
            slot_shutdown(&sh->slots[k]);
    //@/G
    printf("[CLIENT-%d] terminazione con %d richieste, somma dei risultati %lld\n", a->id, a->quanti, a->somma);
    //@/B
    return NULL;
}

int main(void) {
    const int quanti[N_CLIENT] = { ${quanti.join(", ")} };
    const char *names[N_SERV] = { "ADD", "MUL" };
    int err;
    shared_t *sh = calloc(1, sizeof *sh);
    client_arg_t *ca = calloc(N_CLIENT, sizeof *ca);
    serv_arg_t *sa = calloc(N_SERV, sizeof *sa);
    if (sh == NULL || ca == NULL || sa == NULL) { perror("calloc"); exit(EXIT_FAILURE); }

    //@B
    sh->active_clients = N_CLIENT;
    if ((err = pthread_mutex_init(&sh->mutex, NULL)) != 0) exit_with_err("pthread_mutex_init", err);
    for (int k = 0; k < N_SERV; k++) {
        slot_t *s = &sh->slots[k];
        s->state = EMPTY;
        s->shutdown = 0;
        if ((err = pthread_mutex_init(&s->mutex, NULL)) != 0) exit_with_err("pthread_mutex_init", err);
        if ((err = pthread_cond_init(&s->cond_free, NULL)) != 0) exit_with_err("pthread_cond_init", err);
        if ((err = pthread_cond_init(&s->cond_todo, NULL)) != 0) exit_with_err("pthread_cond_init", err);
        if ((err = pthread_cond_init(&s->cond_done, NULL)) != 0) exit_with_err("pthread_cond_init", err);
    }
    //@/B

    printf("[MAIN] creazione di %d thread clienti e %d thread servitori\n", N_CLIENT, N_SERV);
    //@B
    for (int k = 0; k < N_SERV; k++) {
        sa[k].name = names[k];
        sa[k].op = k;
        sa[k].slot = &sh->slots[k];
        if ((err = pthread_create(&sa[k].tid, NULL, server, &sa[k])) != 0) exit_with_err("pthread_create", err);
    }
    for (int i = 0; i < N_CLIENT; i++) {
        ca[i].id = i + 1;
        ca[i].quanti = quanti[i];
        ca[i].sh = sh;
        if ((err = pthread_create(&ca[i].tid, NULL, client, &ca[i])) != 0) exit_with_err("pthread_create", err);
    }
    for (int i = 0; i < N_CLIENT; i++)
        if ((err = pthread_join(ca[i].tid, NULL)) != 0) exit_with_err("pthread_join", err);
    for (int k = 0; k < N_SERV; k++)
        if ((err = pthread_join(sa[k].tid, NULL)) != 0) exit_with_err("pthread_join", err);
    //@/B

    int totale = 0;
    long long somma = 0;
    for (int i = 0; i < N_CLIENT; i++) {
        totale += ca[i].quanti;
        somma += ca[i].somma;
    }
    printf("[MAIN] richieste totali: %d\n", totale);
    printf("[MAIN] somma complessiva: %lld\n", somma);

    //@B
    for (int k = 0; k < N_SERV; k++) {
        pthread_mutex_destroy(&sh->slots[k].mutex);
        pthread_cond_destroy(&sh->slots[k].cond_free);
        pthread_cond_destroy(&sh->slots[k].cond_todo);
        pthread_cond_destroy(&sh->slots[k].cond_done);
    }
    pthread_mutex_destroy(&sh->mutex);
    //@/B
    free(sh); free(ca); free(sa);
    printf("[MAIN] terminazione\n");
    return EXIT_SUCCESS;
}
`;
    const src = build("slot-rendezvous", seed, consegna, tpl);
    return Object.assign(src, {
      seed, args: "", files: [],
      params: `${N} clienti · 2 servitori · ${tot} richieste`,
      expected: {
        exact: [`[MAIN] creazione di ${N} thread clienti e 2 thread servitori`,
          `[MAIN] richieste totali: ${tot}`, `[MAIN] somma complessiva: ${sommaTot}`, "[MAIN] terminazione"],
        set: quanti.map((k, i) => `[CLIENT-${i + 1}] terminazione con ${k} richieste, somma dei risultati ${somme[i]}`)
          .concat([`[ADD] terminazione con ${tot} richieste servite`, `[MUL] terminazione con ${tot} richieste servite`])
      }
    });
  }

  // ====================================================================
  // 4. mmap + header uint32 little-endian + record a dimensione fissa (6.10)
  // ====================================================================
  function genMmap(seed) {
    seed = seed || randSeed();
    const r = rng(seed);
    // file binario: header uint32 LE (record dichiarati integri) + record da 16 byte
    // (15 byte di dati + 1 byte di checksum = somma dei 15 byte modulo 256)
    function makeFile(nrec, pCorrupt, declaredDelta, tail) {
      const size = 4 + nrec * 16 + tail, buf = new Uint8Array(size);
      let integri = 0;
      for (let i = 0; i < nrec; i++) {
        const o = 4 + i * 16; let s = 0;
        for (let k = 0; k < 15; k++) { buf[o + k] = r.int(0, 255); s += buf[o + k]; }
        if (r() < pCorrupt) buf[o + 15] = (s + r.int(1, 255)) % 256;
        else { buf[o + 15] = s % 256; integri++; }
      }
      for (let k = 0; k < tail; k++) buf[4 + nrec * 16 + k] = r.int(0, 255);
      const declared = integri + declaredDelta;
      buf[0] = declared & 255; buf[1] = (declared >>> 8) & 255; buf[2] = (declared >>> 16) & 255; buf[3] = (declared >>> 24) & 255;
      return { buf, nrec, integri, declared };
    }
    const delta = r.pick([-3, -2, -1, 1, 2]);
    const specs = [
      { name: "records-A.bin", f: makeFile(r.int(40, 120), 0.15, 0, 0) },
      { name: "records-B.bin", f: makeFile(r.int(300, 450), 0.1, 0, 0) },      // > 255: serve davvero il little-endian
      { name: "records-C-bad.bin", f: makeFile(r.int(60, 150), 0.2, delta, 13) }, // header sbagliato + 13 byte di coda
      { name: "vuoto.bin", empty: true }
    ];
    const args = specs.map(s => s.name).concat(["manca.bin"]);
    const set = [], exact = [`[MAIN] creazione di ${args.length} thread lettori`];
    let ok = 0;
    args.forEach((name, i) => {
      const s = specs.find(x => x.name === name), id = i + 1;
      if (!s) { set.push(`[READER-${id}] file '${name}': impossibile aprirlo`); exact.push(`[MAIN] file '${name}': non verificabile`); return; }
      if (s.empty) { set.push(`[READER-${id}] file '${name}': troppo corto (0 byte)`); exact.push(`[MAIN] file '${name}': non verificabile`); return; }
      const f = s.f, corr = f.nrec - f.integri;
      set.push(`[READER-${id}] file '${name}': ${f.nrec} record, ${f.declared} dichiarati integri`);
      if (f.integri === f.declared) { ok++; exact.push(`[MAIN] file '${name}': ${f.integri} integri e ${corr} corrotti su ${f.nrec} record -> verifica superata (dichiarati ${f.declared})`); }
      else exact.push(`[MAIN] file '${name}': ${f.integri} integri e ${corr} corrotti su ${f.nrec} record -> verifica fallita (dichiarati ${f.declared}, rilevati ${f.integri})`);
    });
    exact.push(`[MAIN] verifiche superate: ${ok}/${args.length}`, "[MAIN] terminazione");
    const files = specs.map(s => ({ name: s.name, data: s.empty ? new Uint8Array(0) : s.f.buf }));

    const consegna = `
CONSEGNA
Uso: ./kata <file-1> ... <file-N>   (qui: ${args.join(" ")})
Un thread lettore READER-i per ogni file, in parallelo. Ogni file binario ha:
- un header di 4 byte: intero senza segno little-endian (uint32_t) con il
  numero di record dichiarati integri;
- poi record da 16 byte: 15 byte di dati + 1 byte di checksum (uint8_t).
  Un record è integro se checksum == somma dei 15 byte modulo 256.
  Numero di record = (dimensione - 4) / 16 (eventuali byte in coda si ignorano).
Il file va letto SOLO con mmap: qualunque altro metodo è errato.
File più corto dell'header: niente mmap (mmap di 0 byte fallisce).
Il lettore salva i risultati nella propria struct; il main, dopo le join,
confronta integri rilevati e dichiarati per ogni file, nell'ordine di argv.
Niente variabili globali. Gli errori di sistema vanno su stderr (perror).

OUTPUT (righe [MAIN] in quest'ordine, le altre in ordine qualsiasi):
[MAIN] creazione di N thread lettori
[READER-i] file '<nome>': <R> record, <D> dichiarati integri
[READER-i] file '<nome>': troppo corto (<size> byte)
[READER-i] file '<nome>': impossibile aprirlo
[MAIN] file '<nome>': <I> integri e <C> corrotti su <R> record -> verifica superata (dichiarati <D>)
[MAIN] file '<nome>': <I> integri e <C> corrotti su <R> record -> verifica fallita (dichiarati <D>, rilevati <I>)
[MAIN] file '<nome>': non verificabile
[MAIN] verifiche superate: <P>/<N>
[MAIN] terminazione`;

    const tpl = String.raw`
#ifdef __linux__
#define _POSIX_C_SOURCE 200809L
#endif
#include <fcntl.h>
#include <pthread.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <unistd.h>

#define exit_with_err(s, e) do { fprintf(stderr, "%s: %s\n", (s), strerror((e))); exit(EXIT_FAILURE); } while (0)

#define HEADER_BYTES 4
#define REC_BYTES 16

typedef struct {
    pthread_t tid;
    int id;                       /* 1..N, per l'etichetta [READER-i] */
    const char *filename;
    int valid;                    /* 0 = file non apribile o troppo corto */
    uint32_t declared;
    unsigned records, integri, corrotti;
} reader_arg_t;

/* legge un uint32 little-endian byte per byte (niente cast non allineati) */
uint32_t read_u32_le(const uint8_t *p) {
    //@B return 0;
    //@G byte meno significativo all'indirizzo più basso
    return (uint32_t)p[0] | ((uint32_t)p[1] << 8) | ((uint32_t)p[2] << 16) | ((uint32_t)p[3] << 24);
    //@/G
    //@/B
}

void *reader(void *arg) {
    reader_arg_t *a = arg;
    //@B
    int fd = open(a->filename, O_RDONLY);
    if (fd == -1) {
        perror(a->filename);
        printf("[READER-%d] file '%s': impossibile aprirlo\n", a->id, a->filename);
        return NULL;
    }
    struct stat st;
    if (fstat(fd, &st) == -1) {
        perror("fstat");
        close(fd);
        printf("[READER-%d] file '%s': impossibile aprirlo\n", a->id, a->filename);
        return NULL;
    }
    size_t size = (size_t)st.st_size;
    //@G file più corto dell'header: niente mmap
    if (size < HEADER_BYTES) {
        close(fd);
        printf("[READER-%d] file '%s': troppo corto (%zu byte)\n", a->id, a->filename, size);
        return NULL;
    }
    //@/G
    uint8_t *data;
    //@G mappa il file in sola lettura e chiudi subito il descrittore
    data = mmap(NULL, size, PROT_READ, MAP_PRIVATE, fd, 0);
    close(fd);
    if (data == MAP_FAILED) {
        perror("mmap");
        printf("[READER-%d] file '%s': impossibile aprirlo\n", a->id, a->filename);
        return NULL;
    }
    //@/G

    a->declared = read_u32_le(data);
    //@G quanti record interi ci sono dopo l'header?
    a->records = (unsigned)((size - HEADER_BYTES) / REC_BYTES);
    //@/G
    for (unsigned i = 0; i < a->records; i++) {
        const uint8_t *rec;
        //@G dove inizia il record i?
        rec = data + HEADER_BYTES + (size_t)i * REC_BYTES;
        //@/G
        unsigned sum = 0;
        for (int k = 0; k < REC_BYTES - 1; k++)
            sum += rec[k];
        if (sum % 256 == rec[REC_BYTES - 1]) a->integri++;
        else a->corrotti++;
    }
    //@G rilascia la mappatura (stessa size di mmap)
    munmap(data, size);
    //@/G
    a->valid = 1;
    printf("[READER-%d] file '%s': %u record, %u dichiarati integri\n", a->id, a->filename, a->records, a->declared);
    //@/B
    return NULL;
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "uso: %s <file-1> ... <file-N>\n", argv[0]);
        exit(EXIT_FAILURE);
    }
    int n = argc - 1, err;
    reader_arg_t *ra = calloc(n, sizeof *ra);
    if (ra == NULL) { perror("calloc"); exit(EXIT_FAILURE); }

    printf("[MAIN] creazione di %d thread lettori\n", n);
    //@B
    for (int i = 0; i < n; i++) {
        ra[i].id = i + 1;
        ra[i].filename = argv[i + 1];
        if ((err = pthread_create(&ra[i].tid, NULL, reader, &ra[i])) != 0) exit_with_err("pthread_create", err);
    }
    for (int i = 0; i < n; i++)
        if ((err = pthread_join(ra[i].tid, NULL)) != 0) exit_with_err("pthread_join", err);
    //@/B

    int ok = 0;
    for (int i = 0; i < n; i++) {
        reader_arg_t *a = &ra[i];
        if (!a->valid)
            printf("[MAIN] file '%s': non verificabile\n", a->filename);
        else if (a->integri == a->declared) {
            ok++;
            printf("[MAIN] file '%s': %u integri e %u corrotti su %u record -> verifica superata (dichiarati %u)\n",
                   a->filename, a->integri, a->corrotti, a->records, (unsigned)a->declared);
        } else
            printf("[MAIN] file '%s': %u integri e %u corrotti su %u record -> verifica fallita (dichiarati %u, rilevati %u)\n",
                   a->filename, a->integri, a->corrotti, a->records, (unsigned)a->declared, a->integri);
    }
    printf("[MAIN] verifiche superate: %d/%d\n", ok, n);
    free(ra);
    printf("[MAIN] terminazione\n");
    return EXIT_SUCCESS;
}
`;
    const src = build("mmap-header", seed, consegna, tpl);
    return Object.assign(src, {
      seed, args: args.join(" "), files,
      params: `${specs.length} file binari (+ 1 inesistente) · ${specs.filter(s => !s.empty).reduce((x, s) => x + s.f.nrec, 0)} record`,
      expected: { exact, set }
    });
  }

  // ====================================================================
  // 5. parsing di righe di log con fgets / strcspn / strtok_r / sscanf (6.13)
  // ====================================================================
  function genParsing(seed) {
    seed = seed || randSeed();
    const r = rng(seed);
    const SEV = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"];
    const soglia = r.int(1, 3);
    const nfile = r.int(3, 4);
    const WORDS = ["richiesta", "ricevuta", "da", "utente", "admin", "timeout", "connessione", "chiusa", "disco", "pieno",
      "al", "90%", "cache", "invalidata", "porta", "8080", "errore", "di", "lettura", "su", "/var/log", "riprovo", "tra",
      "5s", "sessione", "scaduta", "id=4521", "memoria", "esaurita", "processo", "terminato", "con", "codice", "1",
      "10.0.0.7", "backup", "completato", "in", "12m", "checksum", "errato", "blocco", "42", "coda", "piena;", "scarto,", "'ok'"];
    const files = [], set = [];
    const perLvl = [0, 0, 0, 0, 0], perOra = new Array(24).fill(0);
    let chars = 0, lette = 0, acc = 0;
    for (let f = 1; f <= nfile; f++) {
      const n = r.int(200, 500), lines = [];
      let fAcc = 0;
      for (let i = 0; i < n; i++) {
        const hh = r.int(0, 23), lvl = r.pick([0, 1, 1, 1, 2, 2, 3, 4]);
        const ts = `2026-${String(r.int(1, 12)).padStart(2, "0")}-${String(r.int(1, 28)).padStart(2, "0")} ${String(hh).padStart(2, "0")}:${String(r.int(0, 59)).padStart(2, "0")}:${String(r.int(0, 59)).padStart(2, "0")}`;
        const msg = Array.from({ length: r.int(2, 9) }, () => r.pick(WORDS)).join(" ");
        lines.push(`${ts}|${SEV[lvl]}|${msg}`);
        if (lvl >= soglia) { fAcc++; perLvl[lvl]++; perOra[hh]++; chars += msg.length; }
      }
      lette += n; acc += fAcc;
      const name = `log-${f}.txt`;
      // l'ultimo file non termina con '\n': l'ultima riga va comunque letta per intero
      files.push({ name, data: lines.join("\n") + (f === nfile ? "" : "\n") });
      set.push(`[READER-${f}] file '${name}': ${n} righe lette, ${fAcc} accettate`);
    }
    let best = 0; for (let h = 1; h < 24; h++) if (perOra[h] > perOra[best]) best = h;
    const exact = [`[MAIN] creazione di ${nfile} thread lettori con soglia ${SEV[soglia]}`];
    for (let l = soglia; l < 5; l++) exact.push(`[MAIN] ${SEV[l]}: ${perLvl[l]} righe`);
    exact.push(`[MAIN] ora con più righe accettate: ${String(best).padStart(2, "0")} (${perOra[best]} righe)`,
      `[MAIN] caratteri nei messaggi accettati: ${chars}`,
      `[MAIN] totale: ${acc} righe accettate su ${lette} lette`, "[MAIN] terminazione");
    const args = [SEV[soglia]].concat(files.map(f => f.name)).join(" ");

    const consegna = `
CONSEGNA
Uso: ./kata <severità> <file-1> ... <file-N>   (qui: ${args})
Righe di log "timestamp|severità|messaggio", per esempio
  2026-02-11 08:00:24|INFO|richiesta ricevuta da 10.0.0.1
Severità in ordine crescente: DEBUG < INFO < WARNING < ERROR < CRITICAL.
Il messaggio può contenere spazi (non '|'). L'ultima riga di un file può
non terminare con '\\n'.
Un thread lettore READER-i per file, in parallelo: legge riga per riga
(fgets), toglie il newline, separa i campi (strtok_r, MAI strtok nei
thread), estrae l'ora dal timestamp con sscanf e accetta le righe con
severità >= soglia. Per ogni riga accettata aggiorna, sotto mutex, le
statistiche condivise: righe per severità, righe per ora (0..23), somma
delle lunghezze dei messaggi (strlen, senza newline).
A parità di righe vince l'ora più piccola. Niente variabili globali.

OUTPUT (righe [MAIN] in quest'ordine, le altre in ordine qualsiasi):
[MAIN] creazione di N thread lettori con soglia <SEV>
[READER-i] file '<nome>': <L> righe lette, <A> accettate
[MAIN] <SEV>: <n> righe          (una riga per ogni severità >= soglia)
[MAIN] ora con più righe accettate: <HH> (<n> righe)
[MAIN] caratteri nei messaggi accettati: <C>
[MAIN] totale: <A> righe accettate su <L> lette
[MAIN] terminazione`;

    const tpl = String.raw`
${HEAD_CV}

#define MAX_LINE 512
#define N_SEV 5

typedef struct {
    int soglia;                   /* indice della severità minima */
    unsigned per_livello[N_SEV];  /* righe accettate per severità */
    unsigned per_ora[24];         /* righe accettate per ora */
    unsigned long caratteri;      /* somma delle lunghezze dei messaggi accettati */
    pthread_mutex_t mutex;
} stats_t;

typedef struct {
    pthread_t tid;
    int id;
    const char *filename;
    unsigned lette, accettate;
    stats_t *st;
} reader_arg_t;

/* severità -> intero ordinato, -1 se sconosciuta */
int sev_level(const char *s) {
    //@B return -1;
    const char *names[N_SEV] = { "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL" };
    for (int i = 0; i < N_SEV; i++)
        if (strcmp(s, names[i]) == 0) return i;
    return -1;
    //@/B
}

void *reader(void *arg) {
    reader_arg_t *a = arg;
    //@B
    FILE *f = fopen(a->filename, "r");
    if (f == NULL) {
        perror(a->filename);
        printf("[READER-%d] file '%s': impossibile aprirlo\n", a->id, a->filename);
        return NULL;
    }
    char line[MAX_LINE];
    while (fgets(line, sizeof line, f) != NULL) {
        //@G togli il newline (se c'è)
        line[strcspn(line, "\n")] = '\0';
        //@/G
        a->lette++;
        char *save, *ts = NULL, *sev = NULL, *msg = NULL;
        //@G separa i tre campi: il messaggio è "tutto il resto"
        ts = strtok_r(line, "|", &save);
        sev = strtok_r(NULL, "|", &save);
        msg = strtok_r(NULL, "", &save);
        //@/G
        if (ts == NULL || sev == NULL || msg == NULL) continue;
        int lvl = sev_level(sev), hour;
        if (lvl < a->st->soglia) continue;
        //@G estrai l'ora da "AAAA-MM-GG hh:mm:ss"
        if (sscanf(ts, "%*d-%*d-%*d %d", &hour) != 1 || hour < 0 || hour > 23) continue;
        //@/G
        a->accettate++;
        //@G aggiorna le statistiche condivise
        pthread_mutex_lock(&a->st->mutex);
        a->st->per_livello[lvl]++;
        a->st->per_ora[hour]++;
        a->st->caratteri += strlen(msg);
        pthread_mutex_unlock(&a->st->mutex);
        //@/G
    }
    fclose(f);
    printf("[READER-%d] file '%s': %u righe lette, %u accettate\n", a->id, a->filename, a->lette, a->accettate);
    //@/B
    return NULL;
}

int main(int argc, char *argv[]) {
    if (argc < 3) {
        fprintf(stderr, "uso: %s <severità> <file-1> ... <file-N>\n", argv[0]);
        exit(EXIT_FAILURE);
    }
    const char *names[N_SEV] = { "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL" };
    int n = argc - 2, err;
    stats_t *st = calloc(1, sizeof *st);
    reader_arg_t *ra = calloc(n, sizeof *ra);
    if (st == NULL || ra == NULL) { perror("calloc"); exit(EXIT_FAILURE); }
    if ((st->soglia = sev_level(argv[1])) == -1) {
        fprintf(stderr, "severità sconosciuta: %s\n", argv[1]);
        exit(EXIT_FAILURE);
    }

    printf("[MAIN] creazione di %d thread lettori con soglia %s\n", n, names[st->soglia]);
    //@B
    if ((err = pthread_mutex_init(&st->mutex, NULL)) != 0) exit_with_err("pthread_mutex_init", err);
    for (int i = 0; i < n; i++) {
        ra[i].id = i + 1;
        ra[i].filename = argv[i + 2];
        ra[i].st = st;
        if ((err = pthread_create(&ra[i].tid, NULL, reader, &ra[i])) != 0) exit_with_err("pthread_create", err);
    }
    for (int i = 0; i < n; i++)
        if ((err = pthread_join(ra[i].tid, NULL)) != 0) exit_with_err("pthread_join", err);
    //@/B

    unsigned lette = 0, accettate = 0;
    for (int i = 0; i < n; i++) {
        lette += ra[i].lette;
        accettate += ra[i].accettate;
    }
    for (int l = st->soglia; l < N_SEV; l++)
        printf("[MAIN] %s: %u righe\n", names[l], st->per_livello[l]);
    int best = 0;
    for (int h = 1; h < 24; h++)
        if (st->per_ora[h] > st->per_ora[best]) best = h;
    printf("[MAIN] ora con più righe accettate: %02d (%u righe)\n", best, st->per_ora[best]);
    printf("[MAIN] caratteri nei messaggi accettati: %lu\n", st->caratteri);
    printf("[MAIN] totale: %u righe accettate su %u lette\n", accettate, lette);

    //@B
    pthread_mutex_destroy(&st->mutex);
    //@/B
    free(st); free(ra);
    printf("[MAIN] terminazione\n");
    return EXIT_SUCCESS;
}
`;
    const src = build("parsing", seed, consegna, tpl);
    return Object.assign(src, {
      seed, args, files,
      params: `${nfile} file di log · ${lette} righe · soglia ${SEV[soglia]}`,
      expected: { exact, set }
    });
  }

  // ====================================================================
  // 6. scansione di directory come produttore (6.12)
  // ====================================================================
  function genDirScan(seed) {
    seed = seed || randSeed();
    const r = rng(seed);
    const NAMES = ["report-2026.txt", "a.out", "dati.bin", "note con spazi.txt", "log-ottobre.txt", "matrice.bin", "README",
      "foto.jpg", "elenco.csv", "backup.tar", "config.ini", "lettera.txt", "x", "vettori-A.bin", "chiavi.txt"];
    const files = [], set = [];
    const bytes = n => { const b = new Uint8Array(n); for (let i = 0; i < n; i++) b[i] = r.int(0, 255); return b; };
    let tot = 0, nfile = 0, zeroDone = false;
    // d1: con un file nascosto e una sottocartella (da ignorare); d2: con un link simbolico; d3: vuota
    const dirs = ["dati/d1", "dati/d2/", "dati/d3", "dati/manca"];
    const statLines = [];
    files.push({ name: "dati/", dir: true });
    dirs.forEach((arg, i) => {
      const id = i + 1, base = arg.replace(/\/$/, "");
      if (arg === "dati/manca") { set.push(`[DIR-${id}] cartella '${arg}': impossibile aprirla`); return; }
      files.push({ name: base + "/", dir: true });
      let names = [];
      if (base === "dati/d1") names = r.pick([[".nascosto"], [".config"]]).concat(NAMES.filter(() => r() < 0.4)).slice(0, 8);
      if (base === "dati/d2") names = NAMES.filter(() => r() < 0.35).slice(0, 7);
      if (base === "dati/d2" && !names.length) names = ["unico.txt"];
      names = [...new Set(names)];
      names.forEach(n => {
        let size = r.int(1, 3000);
        if (!zeroDone) { size = 0; zeroDone = true; }
        files.push({ name: `${base}/${n}`, data: bytes(size) });
        statLines.push(`[STAT] il file '${base}/${n}' ha dimensione ${size} byte`);
        tot += size; nfile++;
      });
      if (base === "dati/d1") {
        files.push({ name: "dati/d1/sottocartella/", dir: true });
        for (let k = 1; k <= r.int(1, 3); k++) files.push({ name: `dati/d1/sottocartella/annidato-${k}.txt`, data: bytes(r.int(10, 500)) });
      }
      if (base === "dati/d2") files.push({ name: "dati/d2/collegamento", link: names[0] });
      set.push(`[DIR-${id}] cartella '${arg}': ${names.length} file regolari`);
    });
    set.push(...statLines, `[STAT] terminazione con ${nfile} file esaminati`);
    const args = dirs.join(" ");
    const exact = [`[MAIN] creazione di ${dirs.length} thread scanner e 1 thread STAT`, `[MAIN] totale: ${tot} byte in ${nfile} file`, "[MAIN] terminazione"];

    const consegna = `
CONSEGNA
Uso: ./kata <dir-1> ... <dir-n>   (qui: ${args})
Un thread DIR-i per cartella, in parallelo, scansiona la propria cartella
SENZA ricorsione e inserisce il pathname di ogni FILE REGOLARE in una coda
condivisa di QUEUE_CAP = 10 pathname (char[PATH_MAX]).
- Si saltano solo "." e ".."; i file nascosti contano.
- Sottocartelle e link simbolici non sono file regolari (lstat + S_ISREG).
- Path costruito senza doppio slash: 'dati/d2/' + 'x' -> 'dati/d2/x'.
- Una cartella che non si apre: messaggio e fine lavori del thread
  (il consumatore non deve restare bloccato).
Un thread STAT estrae un pathname alla volta, ne ricava la dimensione e
tiene il totale. Il main crea, attende e stampa il riepilogo.
La coda (mutex + due variabili condizione) è già pronta: si usa e basta.
Niente variabili globali. Estrai i file con unzip: il link deve restare link.

OUTPUT (righe [MAIN] in quest'ordine, le altre in ordine qualsiasi):
[MAIN] creazione di N thread scanner e 1 thread STAT
[DIR-i] cartella '<dir>': <F> file regolari
[DIR-i] cartella '<dir>': impossibile aprirla
[STAT] il file '<path>' ha dimensione <B> byte
[STAT] terminazione con <T> file esaminati
[MAIN] totale: <B> byte in <T> file
[MAIN] terminazione`;

    const tpl = String.raw`
#ifdef __linux__
#define _POSIX_C_SOURCE 200809L
#endif
#include <dirent.h>
#include <errno.h>
#include <limits.h>
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>

#ifndef PATH_MAX
#define PATH_MAX 4096
#endif

#define exit_with_err(s, e) do { fprintf(stderr, "%s: %s\n", (s), strerror((e))); exit(EXIT_FAILURE); } while (0)

#define QUEUE_CAP 10

typedef struct {
    char buf[QUEUE_CAP][PATH_MAX];
    int head, tail, count;
    int active_producers;
    pthread_mutex_t mutex;
    pthread_cond_t not_full, not_empty;
} path_queue_t;

typedef struct {
    pthread_t tid;
    int id;
    const char *dirname;
    unsigned found;
    path_queue_t *queue;
} dir_arg_t;

typedef struct {
    pthread_t tid;
    unsigned files;
    long long total;
    path_queue_t *queue;
} stat_arg_t;

/* ---- coda di pathname già pronta (pattern 6.2) ---- */
void queue_push(path_queue_t *q, const char *path) {
    pthread_mutex_lock(&q->mutex);
    while (q->count == QUEUE_CAP)
        pthread_cond_wait(&q->not_full, &q->mutex);
    snprintf(q->buf[q->tail], PATH_MAX, "%s", path);
    q->tail = (q->tail + 1) % QUEUE_CAP;
    q->count++;
    pthread_cond_signal(&q->not_empty);
    pthread_mutex_unlock(&q->mutex);
}

/* 1 = pathname copiato in out (PATH_MAX byte); 0 = coda vuota e scanner finiti */
int queue_pop(path_queue_t *q, char *out) {
    pthread_mutex_lock(&q->mutex);
    while (q->count == 0 && q->active_producers > 0)
        pthread_cond_wait(&q->not_empty, &q->mutex);
    if (q->count == 0) {
        pthread_mutex_unlock(&q->mutex);
        return 0;
    }
    snprintf(out, PATH_MAX, "%s", q->buf[q->head]);
    q->head = (q->head + 1) % QUEUE_CAP;
    q->count--;
    pthread_cond_signal(&q->not_full);
    pthread_mutex_unlock(&q->mutex);
    return 1;
}

void queue_producer_done(path_queue_t *q) {
    pthread_mutex_lock(&q->mutex);
    if (--q->active_producers == 0)
        pthread_cond_broadcast(&q->not_empty);
    pthread_mutex_unlock(&q->mutex);
}

/* ---- da scrivere ---- */
void *dir_thread(void *arg) {
    dir_arg_t *a = arg;
    //@B
    DIR *dp = opendir(a->dirname);
    //@G cartella non apribile: messaggio e comunque fine lavori
    if (dp == NULL) {
        perror(a->dirname);
        printf("[DIR-%d] cartella '%s': impossibile aprirla\n", a->id, a->dirname);
        queue_producer_done(a->queue);
        return NULL;
    }
    //@/G
    size_t len = strlen(a->dirname);
    const char *sep = (len > 0 && a->dirname[len - 1] == '/') ? "" : "/";
    struct dirent *e;
    errno = 0;
    while ((e = readdir(dp)) != NULL) {
        //@G salta solo "." e ".." (i file nascosti contano)
        if (strcmp(e->d_name, ".") == 0 || strcmp(e->d_name, "..") == 0) continue;
        //@/G
        char path[PATH_MAX];
        //@G costruisci il path senza doppio slash
        snprintf(path, sizeof path, "%s%s%s", a->dirname, sep, e->d_name);
        //@/G
        struct stat st;
        //@G solo file regolari: niente link simbolici né sottocartelle
        if (lstat(path, &st) == -1) { perror(path); errno = 0; continue; }
        if (S_ISREG(st.st_mode)) {
            queue_push(a->queue, path);
            a->found++;
        }
        //@/G
        errno = 0;
    }
    if (errno != 0) perror("readdir");
    closedir(dp);
    queue_producer_done(a->queue);
    printf("[DIR-%d] cartella '%s': %u file regolari\n", a->id, a->dirname, a->found);
    //@/B
    return NULL;
}

void *stat_thread(void *arg) {
    stat_arg_t *a = arg;
    //@B
    char path[PATH_MAX];
    while (queue_pop(a->queue, path)) {
        struct stat st;
        if (stat(path, &st) == -1) { perror(path); continue; }
        printf("[STAT] il file '%s' ha dimensione %lld byte\n", path, (long long)st.st_size);
        a->files++;
        a->total += (long long)st.st_size;
    }
    printf("[STAT] terminazione con %u file esaminati\n", a->files);
    //@/B
    return NULL;
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "uso: %s <dir-1> ... <dir-n>\n", argv[0]);
        exit(EXIT_FAILURE);
    }
    int n = argc - 1, err;
    path_queue_t *q = calloc(1, sizeof *q);
    dir_arg_t *da = calloc(n, sizeof *da);
    stat_arg_t *sa = calloc(1, sizeof *sa);
    if (q == NULL || da == NULL || sa == NULL) { perror("calloc"); exit(EXIT_FAILURE); }

    //@B
    //@G quanti produttori? (prima di creare i thread)
    q->active_producers = n;
    //@/G
    if ((err = pthread_mutex_init(&q->mutex, NULL)) != 0) exit_with_err("pthread_mutex_init", err);
    if ((err = pthread_cond_init(&q->not_full, NULL)) != 0) exit_with_err("pthread_cond_init", err);
    if ((err = pthread_cond_init(&q->not_empty, NULL)) != 0) exit_with_err("pthread_cond_init", err);
    //@/B

    printf("[MAIN] creazione di %d thread scanner e 1 thread STAT\n", n);
    //@B
    for (int i = 0; i < n; i++) {
        da[i].id = i + 1;
        da[i].dirname = argv[i + 1];
        da[i].queue = q;
        if ((err = pthread_create(&da[i].tid, NULL, dir_thread, &da[i])) != 0) exit_with_err("pthread_create", err);
    }
    sa->queue = q;
    if ((err = pthread_create(&sa->tid, NULL, stat_thread, sa)) != 0) exit_with_err("pthread_create", err);
    for (int i = 0; i < n; i++)
        if ((err = pthread_join(da[i].tid, NULL)) != 0) exit_with_err("pthread_join", err);
    if ((err = pthread_join(sa->tid, NULL)) != 0) exit_with_err("pthread_join", err);
    //@/B

    printf("[MAIN] totale: %lld byte in %u file\n", sa->total, sa->files);
    pthread_mutex_destroy(&q->mutex);
    pthread_cond_destroy(&q->not_full);
    pthread_cond_destroy(&q->not_empty);
    free(q); free(da); free(sa);
    printf("[MAIN] terminazione\n");
    return EXIT_SUCCESS;
}
`;
    const src = build("dir-scan", seed, consegna, tpl);
    return Object.assign(src, {
      seed, args, files,
      params: `${dirs.length} cartelle (una vuota, una inesistente) · ${nfile} file regolari · ${tot} byte`,
      expected: { exact, set }
    });
  }

  // ====================================================================
  // 7. scheletro del main: struct condivise, niente globali, pipeline a due stadi (6.1)
  // ====================================================================
  function genScheletro(seed) {
    seed = seed || randSeed();
    const r = rng(seed);
    const M = r.int(2, 4), SALT = r.int(1, 999), DIV = r.int(3, 7);
    // N diverso da M: confondere i produttori delle due code deve sempre lasciare un segno
    const N = r.pick([2, 3, 4, 5].filter(x => x !== M));
    const quanti = Array.from({ length: N }, () => r.int(100, 999));
    let validi = 0, somma = 0, impr = 0;
    quanti.forEach((k, i) => { for (let j = 0; j < k; j++) { const v = SALT + (i + 1) * 1000 + j; if (v % DIV === 0) { validi++; somma += v; impr = (impr ^ mix(v)) >>> 0; } } });
    const args = [M].concat(quanti).join(" ");

    const consegna = `
CONSEGNA
Uso: ./kata <M-verificatori> <K-1> ... <K-N>   (qui: ${args})
Pipeline a due stadi, tutta da coordinare nel main:
  N lettori READER-i --> coda intermedia (Q1_CAP = 10) --> M verificatori
  VERIF-j --> coda finale (Q2_CAP = 3) --> MAIN
- Il lettore i inserisce K-i valori SALT + i*1000 + j (SALT = ${SALT}), j = 0..K-i-1.
- Ogni verificatore estrae valori e inoltra alla coda finale solo quelli
  divisibili per DIVISORE = ${DIV}.
- Il MAIN, mentre i thread lavorano, consuma la coda finale: conta, somma
  e calcola l'impronta (XOR di mix(v)) dei valori validi.
- La libreria della coda è già pronta: queue_init(q, cap, produttori),
  queue_push, queue_pop, queue_producer_done, queue_destroy.
  I verificatori sono i produttori della coda finale.
Da scrivere: il main (argomenti, allocazioni, inizializzazioni, un argomento
distinto per ogni thread, create, consumo, join di tutti, riepilogo,
rilascio delle risorse) e la fine lavori nei thread.
Niente variabili globali. Messaggio d'uso su stderr.

OUTPUT (righe [MAIN] in quest'ordine, le altre in ordine qualsiasi):
[MAIN] creazione di N thread lettori e M thread verificatori
[READER-i] terminazione con <K-i> valori letti
[VERIF-j] terminazione
[MAIN] valori validi ricevuti: <V>
[MAIN] somma dei valori validi: <S>
[MAIN] impronta: <X>
[MAIN] terminazione`;

    const tpl = String.raw`
${HEAD_CV}

#define Q1_CAP 10
#define Q2_CAP 3
#define SALT ${SALT}
#define DIVISORE ${DIV}

/* impronta di un valore: rivela elementi persi o duplicati */
static inline unsigned mix(unsigned v) { return v * 2654435761u; }

/* ---- libreria della coda già pronta (pattern 6.2): non va modificata ---- */
typedef struct {
    int *buf;
    int cap, head, tail, count;
    int active_producers;
    pthread_mutex_t mutex;
    pthread_cond_t not_full, not_empty;
} queue_t;

void queue_init(queue_t *q, int cap, int producers) {
    int err;
    q->buf = malloc(cap * sizeof *q->buf);
    if (q->buf == NULL) { perror("malloc"); exit(EXIT_FAILURE); }
    q->cap = cap;
    q->head = q->tail = q->count = 0;
    q->active_producers = producers;
    if ((err = pthread_mutex_init(&q->mutex, NULL)) != 0) exit_with_err("pthread_mutex_init", err);
    if ((err = pthread_cond_init(&q->not_full, NULL)) != 0) exit_with_err("pthread_cond_init", err);
    if ((err = pthread_cond_init(&q->not_empty, NULL)) != 0) exit_with_err("pthread_cond_init", err);
}

void queue_push(queue_t *q, int v) {
    pthread_mutex_lock(&q->mutex);
    while (q->count == q->cap)
        pthread_cond_wait(&q->not_full, &q->mutex);
    q->buf[q->tail] = v;
    q->tail = (q->tail + 1) % q->cap;
    q->count++;
    pthread_cond_signal(&q->not_empty);
    pthread_mutex_unlock(&q->mutex);
}

/* 1 = valore estratto in *out; 0 = coda vuota e nessun produttore attivo */
int queue_pop(queue_t *q, int *out) {
    pthread_mutex_lock(&q->mutex);
    while (q->count == 0 && q->active_producers > 0)
        pthread_cond_wait(&q->not_empty, &q->mutex);
    if (q->count == 0) {
        pthread_mutex_unlock(&q->mutex);
        return 0;
    }
    *out = q->buf[q->head];
    q->head = (q->head + 1) % q->cap;
    q->count--;
    pthread_cond_signal(&q->not_full);
    pthread_mutex_unlock(&q->mutex);
    return 1;
}

void queue_producer_done(queue_t *q) {
    pthread_mutex_lock(&q->mutex);
    if (--q->active_producers == 0)
        pthread_cond_broadcast(&q->not_empty);
    pthread_mutex_unlock(&q->mutex);
}

void queue_destroy(queue_t *q) {
    pthread_mutex_destroy(&q->mutex);
    pthread_cond_destroy(&q->not_full);
    pthread_cond_destroy(&q->not_empty);
    free(q->buf);
}

/* ---- strutture condivise e private ---- */
typedef struct {
    queue_t q1;                   /* lettori -> verificatori */
    queue_t q2;                   /* verificatori -> MAIN */
} shared_t;

typedef struct {
    pthread_t tid;
    int id;
    int quanti;
    shared_t *sh;
} reader_arg_t;

typedef struct {
    pthread_t tid;
    int id;
    shared_t *sh;
} verif_arg_t;

void *reader(void *arg) {
    reader_arg_t *a = arg;
    for (int j = 0; j < a->quanti; j++)
        queue_push(&a->sh->q1, SALT + a->id * 1000 + j);
    //@G fine lavori del lettore
    queue_producer_done(&a->sh->q1);
    //@/G
    printf("[READER-%d] terminazione con %d valori letti\n", a->id, a->quanti);
    return NULL;
}

void *verifier(void *arg) {
    verif_arg_t *a = arg;
    int v;
    while (queue_pop(&a->sh->q1, &v))
        if (v % DIVISORE == 0)
            queue_push(&a->sh->q2, v);
    //@G il verificatore è un produttore della coda finale
    queue_producer_done(&a->sh->q2);
    //@/G
    printf("[VERIF-%d] terminazione\n", a->id);
    return NULL;
}

int main(int argc, char *argv[]) {
    //@B
    //@G controllo degli argomenti: messaggio d'uso su stderr ed exit
    if (argc < 3) {
        fprintf(stderr, "uso: %s <M-verificatori> <K-1> ... <K-N>\n", argv[0]);
        exit(EXIT_FAILURE);
    }
    //@/G
    int m = atoi(argv[1]), n = argc - 2, err;
    if (m <= 0) {
        fprintf(stderr, "numero di verificatori non valido: %s\n", argv[1]);
        exit(EXIT_FAILURE);
    }
    //@G struct condivisa e argomenti dei thread: nel main, niente globali
    shared_t *sh = malloc(sizeof *sh);
    reader_arg_t *ra = calloc(n, sizeof *ra);
    verif_arg_t *va = calloc(m, sizeof *va);
    if (sh == NULL || ra == NULL || va == NULL) { perror("malloc"); exit(EXIT_FAILURE); }
    //@/G
    //@G quanti produttori ha ciascuna coda?
    queue_init(&sh->q1, Q1_CAP, n);
    queue_init(&sh->q2, Q2_CAP, m);
    //@/G

    printf("[MAIN] creazione di %d thread lettori e %d thread verificatori\n", n, m);
    //@G un argomento DISTINTO per ogni thread, poi la create
    for (int i = 0; i < n; i++) {
        ra[i].id = i + 1;
        ra[i].quanti = atoi(argv[i + 2]);
        ra[i].sh = sh;
        if ((err = pthread_create(&ra[i].tid, NULL, reader, &ra[i])) != 0) exit_with_err("pthread_create", err);
    }
    for (int j = 0; j < m; j++) {
        va[j].id = j + 1;
        va[j].sh = sh;
        if ((err = pthread_create(&va[j].tid, NULL, verifier, &va[j])) != 0) exit_with_err("pthread_create", err);
    }
    //@/G

    unsigned validi = 0, impronta = 0;
    long long somma = 0;
    int v;
    //@G il MAIN consuma la coda finale PRIMA delle join (o la coda piena blocca tutto)
    while (queue_pop(&sh->q2, &v)) {
        validi++;
        somma += v;
        impronta ^= mix((unsigned)v);
    }
    //@/G
    //@G attendi TUTTI i thread
    for (int i = 0; i < n; i++)
        if ((err = pthread_join(ra[i].tid, NULL)) != 0) exit_with_err("pthread_join", err);
    for (int j = 0; j < m; j++)
        if ((err = pthread_join(va[j].tid, NULL)) != 0) exit_with_err("pthread_join", err);
    //@/G

    printf("[MAIN] valori validi ricevuti: %u\n", validi);
    printf("[MAIN] somma dei valori validi: %lld\n", somma);
    printf("[MAIN] impronta: %u\n", impronta);
    //@G rilascia le risorse
    queue_destroy(&sh->q1);
    queue_destroy(&sh->q2);
    free(sh); free(ra); free(va);
    //@/G
    printf("[MAIN] terminazione\n");
    //@/B
    return EXIT_SUCCESS;
}
`;
    const src = build("scheletro-main", seed, consegna, tpl);
    return Object.assign(src, {
      seed, args, files: [],
      params: `${N} lettori · ${M} verificatori · code da 10 e 3 · ${validi} valori validi`,
      expected: {
        exact: [`[MAIN] creazione di ${N} thread lettori e ${M} thread verificatori`,
          `[MAIN] valori validi ricevuti: ${validi}`, `[MAIN] somma dei valori validi: ${somma}`, `[MAIN] impronta: ${impr}`, "[MAIN] terminazione"],
        set: quanti.map((k, i) => `[READER-${i + 1}] terminazione con ${k} valori letti`)
          .concat(Array.from({ length: M }, (_, j) => `[VERIF-${j + 1}] terminazione`))
      }
    });
  }

  // --------------------------------------------------------------------
  // Catalogo. funzioni = id delle schede in window.LAB_FUNZIONI.
  // check: controlli euristici sul codice incollato (vedi LABCORE.heuristics)
  //   need: [regex, etichetta]  (deve comparire)   ban: [regex, etichetta] (non deve comparire)
  // --------------------------------------------------------------------
  window.LAB_KATA = [
    {
      id: "coda-cond", titolo: "Coda con variabili condizione", icon: "CV",
      obiettivo: "Coda circolare multi-produttore e multi-consumatore con mutex + cond var, terminazione corretta di tutti i consumatori.",
      sezione: "6.2", tempi: [10, 20, 35], sem: false,
      funzioni: ["pthread_create", "pthread_join", "pthread_mutex_init", "pthread_mutex_lock", "pthread_mutex_unlock",
        "pthread_cond_init", "pthread_cond_wait", "pthread_cond_signal", "pthread_cond_broadcast", "c-active-producers", "c-no-globali"],
      check: {
        need: [["pthread_cond_wait", "pthread_cond_wait"], ["pthread_cond_broadcast", "pthread_cond_broadcast (sveglia di terminazione)"], ["pthread_join", "pthread_join"]],
        ban: [["\\bsem_(init|wait|post)\\b", "semafori (qui la primitiva è mutex + cond var)"], ["pthread_cancel", "pthread_cancel"], ["\\bexit\\s*\\(\\s*0\\s*\\)", "exit(0) per chiudere"]]
      },
      gen: genCodaCond
    },
    {
      id: "coda-sem", titolo: "Coda con semafori", icon: "SEM",
      obiettivo: "Coda circolare con empty/full + mutex e terminazione multi-consumatore con un gettone extra per consumatore.",
      sezione: "6.3", tempi: [10, 20, 35], sem: true,
      funzioni: ["sem_init", "sem_wait", "sem_post", "sem_destroy", "pthread_mutex_lock", "pthread_mutex_unlock",
        "pthread_create", "pthread_join", "c-gettoni-extra", "c-poison-pill", "c-sem-macos"],
      check: {
        need: [["\\bsem_wait\\b", "sem_wait"], ["\\bsem_post\\b", "sem_post"], ["\\bsem_init\\b", "sem_init"], ["pthread_join", "pthread_join"]],
        ban: [["pthread_cond_", "variabili condizione (qui la primitiva è il semaforo)"], ["pthread_cancel", "pthread_cancel"]]
      },
      gen: genCodaSem
    },
    {
      id: "slot-rendezvous", titolo: "Slot rendezvous con shutdown", icon: "RDV",
      obiettivo: "Clienti che chiedono un servizio a due servitori in catena tramite slot EMPTY/TO_PROCESS/DONE, con shutdown di tutti gli slot.",
      sezione: "6.5", tempi: [15, 25, 40], sem: false,
      funzioni: ["pthread_mutex_lock", "pthread_cond_wait", "pthread_cond_signal", "pthread_cond_broadcast",
        "pthread_mutex_init", "pthread_cond_init", "pthread_create", "pthread_join", "c-slot-stati", "c-active-producers"],
      check: {
        need: [["pthread_cond_wait", "pthread_cond_wait"], ["TO_PROCESS", "stato TO_PROCESS"], ["shutdown", "flag di shutdown"], ["pthread_cond_broadcast", "pthread_cond_broadcast nello shutdown"]],
        ban: [["\\bsem_(init|wait|post)\\b", "semafori"], ["pthread_cancel", "pthread_cancel"]]
      },
      gen: genSlot
    },
    {
      id: "mmap-header", titolo: "mmap + header little-endian", icon: "MAP",
      obiettivo: "Leggere file binari solo con mmap: header uint32 little-endian, record da 16 byte, file vuoti o mancanti.",
      sezione: "6.10", tempi: [10, 20, 30], sem: false,
      funzioni: ["open", "fstat", "mmap", "munmap", "close", "uint8_t", "uint32_t", "little-endian", "pthread_create", "pthread_join"],
      check: {
        need: [["\\bmmap\\s*\\(", "mmap"], ["MAP_FAILED", "controllo con MAP_FAILED"], ["\\bmunmap\\s*\\(", "munmap"], ["\\bfstat\\s*\\(", "fstat"]],
        ban: [["\\b(fread|fgets|fopen|getline)\\s*\\(", "fread/fgets/fopen (il file va letto con mmap)"], ["\\bread\\s*\\(\\s*fd", "read(fd, ...)"], ["\\*\\s*\\(\\s*(const\\s+)?uint32_t\\s*\\*\\s*\\)", "cast *(uint32_t *) non allineato"]]
      },
      gen: genMmap
    },
    {
      id: "parsing", titolo: "Parsing di righe di log", icon: "TXT",
      obiettivo: "Lettori paralleli che leggono riga per riga con fgets, tolgono il newline e separano i campi con strtok_r e sscanf.",
      sezione: "6.13", tempi: [10, 20, 30], sem: false,
      funzioni: ["fopen", "fgets", "strcspn", "strtok_r", "sscanf", "pthread_mutex_lock", "pthread_create", "pthread_join"],
      check: {
        need: [["\\bfgets\\s*\\(", "fgets"], ["\\bstrtok_r\\s*\\(", "strtok_r"], ["\\bsscanf\\s*\\(", "sscanf"], ["pthread_mutex_lock", "mutex sulle statistiche"]],
        ban: [["\\bstrtok\\s*\\(", "strtok (non rientrante)"], ["\\bgets\\s*\\(", "gets"]]
      },
      gen: genParsing
    },
    {
      id: "dir-scan", titolo: "Scansione di directory", icon: "DIR",
      obiettivo: "Thread che scansionano una cartella senza ricorsione e passano i file regolari a un thread STAT: lstat, S_ISREG, path senza doppio slash.",
      sezione: "6.12", tempi: [10, 20, 35], sem: false,
      funzioni: ["opendir", "readdir", "closedir", "lstat", "S_ISREG", "snprintf", "c-active-producers", "pthread_create", "pthread_join"],
      check: {
        need: [["\\bopendir\\s*\\(", "opendir"], ["\\breaddir\\s*\\(", "readdir"], ["\\bclosedir\\s*\\(", "closedir"], ["\\blstat\\s*\\(", "lstat"], ["S_ISREG", "S_ISREG"]],
        ban: [["\\bsem_(init|wait|post)\\b", "semafori"], ["d_name\\s*\\[\\s*0\\s*\\]\\s*==\\s*'", "confronto di d_name[0] con un carattere: se salti tutti i nomi che iniziano con '.', perdi i file nascosti"], ["\\bnftw\\s*\\(|\\bscandir\\s*\\(", "nftw/scandir"]]
      },
      gen: genDirScan
    },
    {
      id: "scheletro-main", titolo: "Scheletro del main (pipeline a due stadi)", icon: "MAIN",
      obiettivo: "Scrivere il main di una pipeline lettori, verificatori e MAIN: struct condivise senza globali, argomenti distinti, contatori dei produttori, consumo prima delle join.",
      sezione: "6.1", tempi: [10, 20, 30], sem: false,
      funzioni: ["c-no-globali", "pthread_create", "pthread_join", "c-active-producers", "exit_with_err_msg", "exit_with_err", "pthread_mutex_destroy"],
      check: {
        need: [["pthread_join", "pthread_join"], ["queue_producer_done\\s*\\(\\s*&[^;]*q2", "fine lavori sulla coda finale (q2)"], ["argc", "controllo di argc"], ["\\bfree\\s*\\(", "free delle allocazioni"]],
        ban: [["pthread_cancel", "pthread_cancel"], ["\\bsleep\\s*\\(", "sleep per \"aspettare\" i thread"]]
      },
      gen: genScheletro
    }
  ];
})();
