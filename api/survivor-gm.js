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

    const { players, turn, maxTurns, lives, maxLives, choices, history, scenario } = body;

    function safeJsonParse(raw) {
        if (!raw || typeof raw !== 'string') return null;
        const cleaned = raw.replace(/```json|```/gi, '').trim();
        try {
            return JSON.parse(cleaned);
        } catch (e) {
            const start = cleaned.indexOf('{');
            const end = cleaned.lastIndexOf('}');
            if (start >= 0 && end > start) {
                try {
                    return JSON.parse(cleaned.slice(start, end + 1));
                } catch (innerError) {
                    return null;
                }
            }
            return null;
        }
    }

    // SYSTEM PROMPT
    const systemPrompt = `

    Sei il Game Master (AI) di "Survivor", un gioco di sopravvivenza post-apocalittica radioattiva.
    Il gioco e spietato, professionale e immersivo.

    STATO GIOCO:
    - Turno ${turn}/${maxTurns}
    - Vite totali squadra: ${lives}/${maxLives}
    - Scenario scelto: ${scenario || 'Non specificato'}

    SCELTE DEL TURNO (una per giocatore):
    ${JSON.stringify(choices || [])}

    STATISTICHE GIOCATORI (vite e inventario condivisibile):
    ${JSON.stringify(players)}

    STORIA RECENTE:
    ${history || 'Nessuna. Inizio del gioco.'}

    REGOLE RISPOSTE:
    - Rispondi SOLO con JSON valido (responseMimeType application/json).
    - Risolvi le scelte del turno in narrativa: 1-2 frasi generali + esiti per giocatore.
    - Lo scenario deve cambiare in base alle scelte di ogni giocatore.
    - Se lo scenario e specificato, la storia deve restare coerente con quello.
    - Usa playerOutcomes per ogni giocatore con scelta: narrativa breve e effetti.
    - playerOutcomes deve includere una voce per ogni scelta in choices (stesso ordine se possibile).
    - In playerOutcomes usa "player" con il nome esatto del giocatore oppure "playerIndex".
    - Usa scoreDelta e lifeDelta SOLO per effetti globali (es. tempesta radioattiva).
    - Se una scelta richiede d20, usa roll e rollDC ricevuti: con successo (roll >= rollDC) aumenta ricompense, con fallimento riduci.
    - Se roll e molto alto (18-20), aggiungi ricompense extra.
    - Se trovi oggetti, usa itemRewards: array di { rarity, count }.
    - Non nominare oggetti specifici nella narrativa: parla solo di "un oggetto".
    - Se il gioco e finito, isGameOver true e niente nuova domanda.

    REGOLE DOMANDA:
    - Fornisci ESATTAMENTE 8 opzioni.
    - Testo opzioni corto (max 60 caratteri), senza punto finale.
    - Dilemmi morali o scelte survival, tono serio.
    - Alcune opzioni devono richiedere un tiro d20: aggiungi requiresRoll true e rollDC (10-18).

    FORMATO RISPOSTA (JSON STRICT):
    {
      "narrative": "Testo da leggere con TTS.",
      "isGameOver": boolean,
      "scoreDelta": 0,
      "lifeDelta": 0,
      "itemRewards": [
        { "rarity": "comune", "count": 1 }
      ],
      "playerOutcomes": [
        {
          "player": "Nome giocatore",
          "choiceId": "A",
          "narrative": "Esito breve della scelta del giocatore",
          "scoreDelta": 0,
          "lifeDelta": 0,
          "itemRewards": [
            { "rarity": "raro", "count": 1 }
          ]
        }
      ],
      "question": "Il testo della domanda/sfida.",
      "options": [
        { "id": "A", "text": "Descrizione azione", "requiresRoll": true, "rollDC": 14 }
      ]
    }

    Usa la lingua ITALIANA. Tono serio, drammatico, radioattivo.
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
        const jsonResponse = safeJsonParse(responseText);
        if (!jsonResponse) {
            res.status(502).json({ error: 'Invalid JSON from model' });
            return;
        }

        res.status(200).json(jsonResponse);

    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Generation failed', details: error.message });
    }
}
