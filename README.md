# GamesPlatform

Piattaforma web con due giochi social:
- Impostor (Spyfall)
- Survivor AI (narrativa a scelte con vite, oggetti e d20)

Supporta sia la modalita "1 telefono" che "multi dispositivi" con codice stanza.

## Features
- UI moderna e mobile first
- Modalita multi device con codice stanza (Supabase Realtime)
- Survivor AI con turni, inventario condiviso, oggetti con rarita diverse
- Meccanica d20 con animazione e ricompense dinamiche
- TTS italiano via Google Cloud Text-to-Speech
- Serverless API su Vercel

## Stack
- Frontend: HTML, CSS, Vanilla JS
- Backend: Vercel Serverless Functions
- Realtime: Supabase Realtime (Broadcast + Presence)
- AI: Google Gemini (testo), Google Cloud TTS (voce)

## Configurazione
1. Clona il repository
2. Aggiungi la variabile di ambiente:
   - `GOOGLE_TTS_API_KEY` = API key di Google Cloud Text-to-Speech
3. (Opzionale) Se vuoi usare il tuo progetto Supabase, aggiorna `realtime.js` con:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Avvia in locale con un server statico (es: `npx serve`) oppure deploy su Vercel

## Deploy su Vercel
1. Vai su https://vercel.com/new e importa il repository `Dean988/GamesPlatform`
2. Imposta `GOOGLE_TTS_API_KEY` in Settings > Environment Variables
3. Deploy

## Struttura
- `index.html` UI principale
- `styles.css` stile e layout
- `survivor.js` logica Survivor AI
- `app.js` logica Impostor
- `api/` funzioni serverless Gemini/TTS
- `realtime.js` client Supabase Realtime

## Note
- La modalita multi device usa Supabase Realtime con Broadcast e Presence.
- Il TTS usa Google Cloud Text-to-Speech (voce italiana Neural2).
