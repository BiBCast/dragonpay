# Installazione dell’applicativo Full‑Stack

Questa guida descrive i passaggi per preparare e avviare sia il frontend Angular sia il backend Python/Flask del progetto.

---

## Prerequisiti

Prima di procedere, assicurati di avere installato:

- **Node.js** (versione 14 o superiore)
- **npm** (versione 6 o superiore)
- **Python** (versione 3.8 o superiore)
- **Git** (per clonare il repository)

---

## 1. Clonazione del repository

Apri un terminale e esegui i comandi seguenti per clonare il repository e posizionarti nella cartella di progetto:

```bash
git clone https://github.com/BiBCast/satispay.git
cd satispay
```

---

## 2. Installazione e avvio del frontend

1. Spostati nella cartella del frontend:

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

4. Avvia l’applicazione Angular in modalità di sviluppo:

   ```bash
   npm run start
   ```

L’applicazione sarà disponibile su `http://localhost:4200`.

---

## 3. Installazione e avvio del backend

1. Apri un secondo terminale e spostati nella cartella del backend:

   ```bash
   cd ../backend
   ```

2. Esegui lo script di setup per preparare l’ambiente Python e installare le dipendenze:

   ```bash
   ./setup.bat
   ```

3. Attiva l’ambiente virtuale creato dallo script:

   ```bash
   source .venv/bin/activate
   ```

4. Avvia il server Flask:

   ```bash
   python main.py
   ```

Il backend sarà in ascolto su `http://localhost:8000` e fornirà la documentazione Swagger UI su `http://localhost:8000/docs`.

---

## 4. Verifica del funzionamento

- Apri il browser su `http://localhost:4200` per interagire con il frontend.
- Controlla la console del browser per eventuali errori di rete.
- Visita `http://localhost:8000/docs` per esplorare le API tramite Swagger UI.

---

**Nota:**

Ogni volta che il backend viene modificato, ricorda di rigenerare i tipi TypeScript nel frontend eseguendo nuovamente:

```bash
npm run gen:api
```
