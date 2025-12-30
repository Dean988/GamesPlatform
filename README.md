# GamesPlatform

Piattaforma web con due giochi social da giocare in gruppo su un solo dispositivo:
- Impostor (Spyfall)
- Survivor AI (narrativa a scelte con vite, oggetti e d20)

## Features
- UI moderna e mobile responsive
- Survivor AI con turni, inventario condiviso, oggetti con rarita diverse
- Meccanica d20 con animazione e ricompense dinamiche
- TTS italiano con Gemini (voce adattiva al contesto)
- Serverless API su Vercel

## Stack
- Frontend: HTML, CSS, Vanilla JS
- Backend: Vercel Serverless Functions
- AI: Google Gemini

## Configurazione
1. Clona il repository
2. Aggiungi la variabile di ambiente:
   - `GEMINI_API_KEY` = la tua API key Gemini
3. Avvia in locale con un server statico (es: `npx serve`) oppure deploy su Vercel

## Deploy su Vercel
1. Vai su https://vercel.com/new e importa il repository `Dean988/GamesPlatform`
2. Imposta `GEMINI_API_KEY` in Settings > Environment Variables
3. Deploy

## Struttura
- `index.html` UI principale
- `styles.css` stile e layout
- `survivor.js` logica Survivor AI
- `app.js` logica Impostor
- `api/` funzioni serverless Gemini

## Note
- Il TTS usa il modello `gemini-2.5-flash-preview-tts`
- Il GM di Survivor usa `gemini-2.5-flash`

