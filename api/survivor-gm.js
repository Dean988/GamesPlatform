import { GoogleGenerativeAI } from '@google/generative-ai';

const modelName = 'gemini-2.5-flash';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
        return;
    }

    let body = {};
    try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
        body = {};
    }

    const { players, turn, maxTurns, lives, maxLives, lastChoice, history } = body;

    // SYSTEM PROMPT
    const systemPrompt = `

    Sei il Game Master (AI) di "Survivor", un gioco di sopravvivenza post-apocalittica radioattiva.
    Il gioco e spietato, professionale e immersivo.

    STATO GIOCO:
    - Turno ${turn}/${maxTurns}
    - Vite squadra: ${lives}/${maxLives}

    Il tuo compito:
    1. Analizzare la situazione attuale.
    2. Se c'e stata una scelta precedente ("lastChoice"), narrare le conseguenze di quella scelta (successo, fallimento, danni, oggetto trovato).
    3. Se il gioco non e finito, proporre una nuova situazione critica e una domanda difficile a risposta multipla (8 opzioni).
    4. Se turno > maxTurns o le vite sono a 0, dichiara il GAME OVER.

    INVENTARI GIOCATORI (oggetti condivisibili):
    ${JSON.stringify(players)}

    STORIA RECENTE:
    ${history || 'Nessuna. Inizio del gioco.'}

    REGOLE RISPOSTE:
    - Devi fornire ESATTAMENTE 8 alternative.
    - Le alternative devono essere difficili, dilemmi morali o test di conoscenza survival o logica.
    - Ogni risposta deve avere un punteggio (score) positivo o negativo.
    - Ogni risposta deve avere una variazione vite (lifeDelta), positiva o negativa.
    - Alcune risposte possono trovare OGGETTI (itemReward: true/false).
    - Se itemReward e true, puoi indicare itemRarity: comune, raro, epico, leggendario, supremo.
    - Non nominare oggetti specifici nella narrativa: parla solo di "un oggetto".

    FORMATO RISPOSTA (JSON STRICT):
    {
      "narrative": "Testo da leggere con TTS. Descrivi cosa succede in modo atmosferico.",
      "isGameOver": boolean,
      "question": "Il testo della domanda/sfida.",
      "options": [
        {
          "id": "A",
          "text": "Descrizione azione",
          "score": 10,
          "lifeDelta": -1,
          "itemReward": true,
          "itemRarity": "raro",
          "consequence": "Breve testo dell'esito immediato mostrato dopo il click"
        },
        ... (fino a 8 opzioni)
      ]
    }

    Usa la lingua ITALIANA. Tono serio, drammatico, radioattivo.
    Se i giocatori hanno oggetti nell'inventario, usali per sbloccare opzioni o modificare la narrazione (senza citare nomi specifici).
  `;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        // Force JSON output
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
        });

        const responseText = result.response.text();
        const jsonResponse = JSON.parse(responseText);

        res.status(200).json(jsonResponse);

    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Generation failed', details: error.message });
    }
}
