# 🍌 IMPOSOTORE - Nano Banana Edition

Piattaforma web premium per giocare a "Impostore" in compagnia (3-20 giocatori), utilizzando un solo dispositivo e l'intelligenza artificiale di Google Gemini per generare parole segrete infinite.

![Banner](hero_banana.png)

## 🎮 Gameplay
1. **Configura**: Inserisci i nomi e scegli il numero di impostori.
2. **Genera**: L'IA crea una parola segreta (Random, a Tema o tramite Prompt).
3. **Passa**: I giocatori si passano il telefono per scoprire il proprio ruolo in segreto.
4. **Gioca**: Il timer parte e la discussione inizia. Chi sta mentendo?

## 🛠️ Stack Tecnologico
- **Frontend**: HTML5, CSS3 (Dark Glassmorphism), Vanilla JS.
- **Backend**: Vercel Serverless Functions.
- **AI**: Google Gemini 2.5 Flash-Lite.

## 🚀 Deployment su Vercel

Questa applicazione è pronta per il cloud.

1.  **Importa**: Vai su [Vercel](https://vercel.com/new), clicca "Add New Project" e seleziona questo repository `impostor-game`.
2.  **Variabili d'ambiente**:
    Durante il setup (o in *Settings > Environment Variables*), aggiungi la tua chiave segreta:
    *   **Name**: `GEMINI_API_KEY`
    *   **Value**: `(La tua chiave API Google Gemini)`
3.  **Deploy**: Clicca su "Deploy" e l'app sarà online in pochi secondi.

---
*Created by Antigravity*
