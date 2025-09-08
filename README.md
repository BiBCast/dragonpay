# Indice

- [Installazione dell’applicativo Full‑Stack](#installazione-dellapplicativo-full‑stack)
  - [Prerequisiti](#prerequisiti)
  - [1. Clonazione del repository](#1-clonazione-del-repository)
  - [2. Installazione e avvio del backend](#2-installazione-e-avvio-del-backend)
  - [3. Installazione e avvio del frontend](#3-installazione-e-avvio-del-frontend)
  - [4. Verifica del funzionamento](#4-verifica-del-funzionamento)
- [Link utili](#link-utili)
- [Relazione Tecnica sul Prototipo](#relazione-tecnica-sul-prototipo)
  - [1. Coerenza Progettuale e Scelte Tecnologiche](#1-coerenza-progettuale-e-scelte-tecnologiche)
    - [Esempi Concreti](#esempi-concreti)
  - [2. Debito Tecnico Consapevole e Vie di Evoluzione](#2-debito-tecnico-consapevole-e-vie-di-evoluzione)
    - [Esempi di Trade-off e Roadmap](#esempi-di-trade-off-e-roadmap)
  - [3. Strategie per l'Evoluzione Futura](#3-strategie-per-levoluzione-futura)
  - [4. Conclusione](#4-conclusione)

---

# Installazione dell'applicativo Full-Stack

Questa guida descrive i passaggi per preparare e avviare sia il frontend Angular sia il backend Python/Flask del progetto.

## Prerequisiti

Prima di procedere, assicurati di avere installato:

- **Node.js** (versione 14 o superiore)
- **npm** (versione 6 o superiore)
- **Python** (versione 3.8 o superiore)
- **Git** (per clonare il repository)

## 1. Clonazione del repository

Apri un terminale e esegui i comandi seguenti per clonare il repository e posizionarti nella cartella di progetto:

```bash
git clone https://github.com/BiBCast/satispay.git
cd satispay
```

## 2. Installazione e avvio del backend

1. Apri un secondo terminale e spostati nella cartella del backend:

   ```bash
   cd backend
   ```

2. Esegui lo script di setup per preparare l'ambiente Python e installare le dipendenze:

   - Su macOS/Linux:

     ```bash
     ./setup.sh
     ```

   - Su Windows (PowerShell):

     ```powershell
     .\setup.bat
     ```

3. Attiva l'ambiente virtuale creato dallo script:

   - macOS/Linux:

     ```bash
     source .venv/bin/activate
     ```

   - Windows (PowerShell):

     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```

4. Avvia il server Flask:

   ```bash
   python main.py
   ```

Il backend sarà in ascolto su `http://localhost:8000` e fornirà la documentazione Swagger UI su `http://localhost:8000/docs`.

## 3. Installazione e avvio del frontend

1. Apri un terzo terminale e spostati nella cartella del frontend:

   ```bash
   cd frontend
   ```

2. Installa le dipendenze Node:

   ```bash
   npm install
   ```

3. Genera i tipi TypeScript a partire dallo schema OpenAPI esposto dal backend:

   ```bash
   npm run gen:api
   ```

4. Avvia l'applicazione Angular in modalità di sviluppo:

   ```bash
   npm run start
   ```

L'applicazione sarà disponibile su `http://localhost:4200`.

## 4. Verifica del funzionamento

- Apri il browser su `http://localhost:4200` per interagire con il frontend
- Controlla la console del browser per eventuali errori di rete
- Visita `http://localhost:8000/docs` per esplorare le API tramite Swagger UI

---

# Link utili

- Diagramma UML: [uml.puml](https://github.com/BiBCast/satispay/blob/main/uml.puml)
- Diagramma ER: [ER.puml](https://github.com/BiBCast/satispay/blob/main/ER.puml)
- Documentazione Swagger: [swagger.json](https://github.com/BiBCast/satispay/blob/main/swagger.json)

---

# Relazione Tecnica sul Prototipo

## 1. Coerenza Progettuale e Scelte Tecnologiche

Nel progettare e implementare il prototipo, ho perseguito la coerenza tra contesto d'uso, vincoli funzionali e scelte tecnologiche. Ogni tecnologia adottata è stata scelta non come preferenza personale, ma come risposta diretta a requisiti verificabili di:

- **Interoperabilità**
- **Sicurezza**
- **Usabilità**
- **Riproducibilità**

L'approccio **API-first**, la definizione esplicita del contratto **OpenAPI** e l'adozione di best practice di sicurezza hanno costituito il filo rosso che collega le motivazioni progettuali alle realizzazioni tecniche.

### Esempi Concreti

- **API-first + OpenAPI**:

  - Il contratto OpenAPI 3.1 è stato usato come fonte di verità per endpoint, schemi e codici di stato
  - Ciò ha permesso di ridurre il drift tra documentazione e codice
  - Generazione automatica di client TypeScript per il front-end

- **REST come vincolo progettuale**:

  - Rilettura della tesi di Fielding e confronto con approcci alternativi
  - Uso disciplinato dei metodi HTTP, dello statelessness e dell'idempotenza dove necessario

- **Sicurezza motivata dal dominio fintech**:

  - Adozione di JWT per l'autenticazione (rif. RFC 7519)
  - Hashing delle password con `bcrypt`
  - Validazione di issuer/audience e politiche di error reporting non rivelatorie (rif. RFC 8725, OWASP API Top-10)

- **Stack tecnologico allineato ai requisiti**:

  - **Backend**: Flask-RESTX per l'esposizione delle API (facilita namespace e generazione Swagger)
  - **Frontend**: Angular (componenti standalone e Reactive Forms) per una UX responsive
  - **Documentazione**: PlantUML per diagrammi versionabili e riproducibili

- **Documentazione e verificabilità**:
  - Swagger UI per esplorare le API
  - Postman per test funzionali
  - Script di inizializzazione del DB per garantire la riproducibilità degli scenari di test

## 2. Debito Tecnico Consapevole e Vie di Evoluzione

Per rispettare vincoli temporali e didattici, ho adottato scelte progettuali semplificative, documentate esplicitamente come **debito tecnico consapevole**. Tali scelte — trade-off ben ponderati — mirano a favorire cicli di sviluppo rapidi e una base estensibile, capace di evolvere verso soluzioni più robuste in ambito produttivo.

### Esempi di Trade-off e Roadmap

- **Uso di SQLite in sviluppo**:

  - **Scelta**: Deliberata per velocità e semplicità
  - **Evoluzione**: Migrazione verso PostgreSQL/MySQL in produzione
  - **Preparazione**: Accesso ai dati centralizzato, query parametrizzate e vincoli dichiarativi per facilitare la migrazione

- **Assenza di RBAC completo e rate limiting**:

  - **Scelta**: Gestione basica dei permessi per contenere la complessità iniziale
  - **Roadmap**: Introduzione futura di RBAC, MFA (Multi-Factor Authentication) e meccanismi anti-brute force/rate limiting

- **Test manuali prevalenti**:

  - **Scelta**: Test funzionali eseguiti tramite Postman e test manuali
  - **Evoluzione**: Prioritizzazione di una suite estesa di test automatici e integrazione in una pipeline CI/CD

- **Semplificazioni architetturali**:

  - **Scelta**: Architettura monolitica/monorepo con separazione frontend/backend via API
  - **Preparazione**: Il progetto è organizzato in namespace e layer per facilitare una futura decomposizione in microservizi

- **Gestione dei tipi TypeScript**:
  - **Scelta**: Rigenerazione manuale dei tipi con `swagger-typescript-api` a ogni modifica del contratto
  - **Evoluzione**: Automatizzazione della pipeline di generazione per evitare errori e drift

## 3. Strategie per l'Evoluzione Futura

- **Migrazione Database**:

  - Definire un DAL (Data Access Layer) agnostico rispetto al driver del database
  - Eseguire migrazione degli schema con strumenti (es. Alembic/Flask-Migrate)
  - Introdurre test di integrazione su PostgreSQL

- **Sicurezza Avanzata**:

  - Introdurre RBAC, MFA, logging/auditing centralizzato, WAF e rate limiting
  - Integrare test di sicurezza e scansioni automatiche nelle pipeline CI

- **Testing e CI/CD**:

  - Creare suite di unit/integration/end-to-end test
  - Automatizzare test e deployment con GitHub Actions o simili
  - Aggiungere test di carico

- **Governance open source**:
  - Aggiungere LICENSE, CONTRIBUTING.md e linee guida per i contributori
  - Trasformare il repository in un progetto collaborativo

## 4. Conclusione

L' elaborato è stato progettato con una base estendibile e un piano di evoluzione ben chiaro ,questo approccio permette di avere un prodotto con basi solide e facilemente estendibile potendo realisticamente avere un prodotto finito professionale e appetibile al mercato. 


---
