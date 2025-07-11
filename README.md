# PROJECT WORK – Applicazione Full‑Stack API‑Based per un Servizio Finanziario

**Studente:** Pietro Castelli  
**Matricola:** 0312201796  
**Corso di Laurea:** Informatica per le Aziende Digitali (L‑31)  
**Tema n. 1:** La digitalizzazione dell’impresa – Sviluppo di una applicazione full‑stack API‑based per un’impresa del settore finanziario  
**Scadenza:** 22 set 2025 (Sessione Ordinaria Autunnale)

---

## PARTE PRIMA – DESCRIZIONE DEL PROCESSO

### 1. Utilizzo delle conoscenze e abilità derivate dal percorso di studio

Nel realizzare questo elaborato sono state applicate competenze acquisite in diversi insegnamenti del percorso L‑31, in particolare:

- **Programmazione avanzata (INF/01):** principi di object‑oriented programming in Python per la progettazione di classi e metodi back‑end, uso di SQLAlchemy per il mapping ORM su SQLite.
- **Sistemi informativi e basi di dati (ING‑IND/35):** modellazione ER del database, normalizzazione delle tabelle (accounts, users, transactions, payment_requests) e ottimizzazione di indici e query.
- **Sicurezza informatica:** applicazione di JWT per l’autenticazione stateless, gestione sicura delle password e delle intestazioni HTTP.
- **Sviluppo Web (HTML, CSS, JavaScript):** uso di un framework front‑end (Angular Standalone Components) per realizzare interfacce reattive, reactive forms e interceptor HTTP.
- **Architetture software:** separazione dei livelli logici (presentation, application, data), progettazione di API RESTful conforme a best practice (status code, naming degli endpoint, documentazione swagger).
- **DevOps di base:** creazione di script di setup (.bat) per l’ambiente virtuale e installazione delle dipendenze, preparazione di Dockerfile (in prospettiva).

### 2. Fasi di lavoro e relativi tempi di implementazione

| Fase                                       |    Durata stimata | Attività principali                                                                                  | Difficoltà incontrate                               | Soluzioni adottate                                                     |
| ------------------------------------------ | ----------------: | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------- |
| 1. Analisi dei requisiti                   |       2 settimane | Raccolta requisiti, definizione user stories, stesura CRUD principali                                | Ambiguità nei casi d’uso “payment request”          | Workshop con il docente per chiarire flusso accettazione/rifiuto       |
| 2. Progettazione architetturale            |       1 settimana | ER diagram, UML dei principali componenti, schema endpoint REST                                      | Scelta tra architettura monolite vs microservice    | Scelta di un monolite modulare per semplicità e focus didattico        |
| 3. Implementazione back‑end (Python/Flask) |       3 settimane | Setup Flask‑RESTX, JWT auth, CRUD per utenti, conti, ne front‑end (Angular)	3 settimane	Componenti standalone, routing, HTTP interceptors, moduli di profilo, wallet, transazioni, richieste	Gestione dello stato modale e asincrtransazioni, payment_requests                   | Gestione transazioni atomiche e rollback            | Uso di BEGIN/COMMIT/ROLLBACK e creazione funzione `create_transaction` |
| 4. Implementazione front‑end (Angular)     |       3 settimane | Componenti standalone, routing, HTTP interceptors, moduli di profilo, wallet, transazioni, richieste | Gestione dello stato modale e asincrono con RxJS    | Uso di `@Input()/@Output()` e pattern service per Auth                 |
| 5. Test funzionali e unitari               |       2 settimane | Test componenti Angular, test manuale di flussi end‑to‑end, screenshot per report                    | Configurazione di TestBed per standalone components | Adattamento di Angular Testing Module                                  |
| 6. Documentazione e stesura report         |       2 settimane | Redazione della tesi, generazione Swagger/OpenAPI, UML, ER, screenshot                               | Uniformità stile e coerenza terminologica           | Adozione di template Pegaso, revisione linguistica                     |
| **Totale**                                 | **~13 settimane** |                                                                                                      |                                                     |                                                                        |

### 3. Risorse e strumenti impiegati

- **Bibliografia e tutorial online**: documentazione ufficiale Flask‑RESTX, Angular 15+, JWT.io, SQLite docs.
- **Repository GitHub**: controllo di versione con branching feature‑based, GitHub Actions per linting front‑end.
- **Strumenti software**: VS Code, Python 3.10, Node 16, Angular CLI, SQLite Browser.
- **Modelli teorici**: pattern MVC, REST constraints, principi SOLID, design by contract.
- **Motivazioni**: scelta di tecnologie open‑source e ampliamente documentate per facilitare apprendimento e futura manutenzione.
- **Difficoltà**: iniziale sincronizzazione tra API e interfaccia; risolte definendo contratti JSON e usando Swagger UI per testare gli endpoint.

---

## PARTE SECONDA – PREDISPOSIZIONE DELL’ELABORATO

### 4. Obiettivi del progetto

L’obiettivo principale è stato realizzare un proof‑of‑concept di un’applicazione web full‑stack per la gestione di conti e richieste di pagamento in un’ipotetica fintech, rispondendo pienamente alla traccia:

- **Gestione sicura dei conti**: autenticazione, visualizzazione bilanci, top‑up e trasferimenti.
- **Processo di Payment Request**: creazione, accettazione/declino, tracciatura transazioni correlate.
- **Separazione front‑end / back‑end**: API documentate, interfaccia reattiva.
- **Scalabilità futura**: architettura modulare, standard RESTful, JWT stateless.

### 5. Contestualizzazione

- **Contesto teorico**: architetture client‑server, software engineering, sicurezza informatica.
- **Contesto applicativo**: banche digitali e fintech che offrono wallet, trasferimenti peer‑to‑peer e gestione pagamenti con richieste.
- **Vantaggi aziendali**: riduzione tempi di sviluppo integrato, facilità di integrazione via API, esperienza utente unificata.

### 6. Descrizione dei principali aspetti progettuali

1. **Back‑end**

   - **Framework**: Flask‑RESTX con Blueprint per namespace (`auth_ns`, `wallet_ns`, `tx_ns`, `req_ns`, `contacts_ns`, `merch_ns`).
   - **Autenticazione**: JWT con `@jwt_required()`, `get_jwt_identity()`.
   - **DB**: SQLite gestito via `get_db_connection()`, tabelle normalizzate.
   - **Transazioni**: funzione `create_transaction()`, gestione `BEGIN/COMMIT/ROLLBACK`.
   - **API RESTful**: endpoint `POST /auth/login`, `GET /wallet`, `POST /wallet/topup`, `GET /transactions`, `GET/PUT /requests`, `POST /requests/create`, `GET /merchants`, `GET /contacts`.

2. **Front‑end**

   - **Framework**: Angular Standalone Components
   - **Routing**: `provideRouter(routes)` per navigazione sicura con `AuthGuard`.
   - **Componenti**: Home, Wallet, Transactions, Merchants, Contacts, Requests, Profile, Settings, Support, Layout, Login.
   - **Servizi**: `AuthService` con `login()`, `logout()`, `getUserProfile()`, `getUserAccount()`.
   - **Interceptor**: `JwtInterceptor` per aggiungere header Authorization, `ErrorInterceptor` per gestione 401/403.
   - **Modali**: componenti `SendMoneyModal`, `WalletModal`, `RequestCreateModal`.
   - **UI/UX**: design responsive con variabili CSS (palette Satispay), accessibilità (focus, aria).

3. **Documentazione**
   - **Swagger/OpenAPI**: definizione `api = Api(...)` e modello `api.model(...)`, generazione UI via `/swagger.json`.
   - **UML ed ER**: diagrammi inclusi in allegato.

### 7. Campi di applicazione

- **Fintech & Bancario**: integrazione con sistemi di pagamento, mobile wallet, gestione prestiti veloci.
- **Assicurazioni**: richiesta e gestione premi assicurativi via API.
- **Integrazioni B2B**: partner service, aggregatori di servizi finanziari.
- **Vantaggi**: time‑to‑market ridotto, elevata interoperabilità, manutenzione facilitata.

---

### 8. Valutazione dei risultati

L’elaborato ha mostrato risultati incoraggianti sia dal punto di vista tecnico che funzionale. La piattaforma sviluppata gestisce efficacemente il flusso completo delle richieste di pagamento, fornendo strumenti chiari e accessibili sia per l’utente finale che per gli operatori aziendali.

**Potenzialità principali**

- **Modularità architetturale:** facile estensione dei servizi;
- **Tecnologie moderne:** supporto a lungo termine e comunità attiva;
- **Sicurezza:** aderenza a best practice JWT e HTTPS;
- **Separazione API‑UI:** evolvibilità e integrazione.

**Limiti**

- Mancanza di test automatizzati end‑to‑end e di carico;
- Gestione ruoli e permessi base;
- Logica di valutazione “rule‑based” non predittiva;
- Deploy non configurato per ambienti cloud/produttivi.

Nel complesso, il progetto rappresenta un proof‑of‑concept solido con margini di evoluzione (CI/CD, microservizi, ML‑based credit scoring).

---

### 9. Ricchezza lessicale e/o padronanza del linguaggio disciplinare

Nel corso dell’elaborato è stato utilizzato un linguaggio tecnico coerente con il lessico della disciplina informatica, in particolare nell’ambito dello sviluppo software full‑stack e delle architetture API‑based. La terminologia specifica relativa a concetti come _endpoint_, _routing_, _middleware_, _serializzazione_, _framework_, _containerizzazione_, nonché riferimenti a librerie e tecnologie (Flask‑RESTX, Angular, SQLite, JWT), è stata impiegata in modo appropriato, dimostrando padronanza e consapevolezza dei contenuti trattati.

---

## Conclusioni

Questo lavoro ha permesso di applicare in modo integrato competenze di programmazione, progettazione di basi dati, sicurezza e sviluppo Web, realizzando un’applicazione full‑stack che risponde ai requisiti di una moderna fintech. Il proof‑of‑concept offre una base estendibile verso test automatizzati, gestione avanzata dei permessi, deployment cloud e componenti di intelligenza artificiale per il credit scoring.

---

**Repository GitHub** (front‑end e back‑end):  
https://github.com/pietro-castelli/satispay‑app‑pw

**Documentazione Swagger**:  
http://localhost:8000/swagger

**Allegati**: diagrammi ER, UML, screenshot dei test funzionali.

2025, Pietro Castelli
