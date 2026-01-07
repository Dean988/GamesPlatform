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

  const { players, turn, maxTurns, lives, maxLives, choices, history, scenario, finaleRequired } = body;

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

    Sei il Game Master (AI) di "Survivor", un survival RPG post-apocalittico.
    TUA PRIORITÀ ASSOLUTA: SINTESI ESTREMA. I giocatori si annoiano se leggono troppo.
    
    CRITICO:
    1. LE STORIE DEVONO ESSERE DI MASSIMO 2 FRASI BREVI.
    2. VAI SUBITO ALL'AZIONE O ALLA DOMANDA.
    3. TONO SERRATO, VELOCE, "ACTION-MOVIE".

    GAMEPLAY & COMBATTIMENTI:
    - Crea FREQUENTI combattimenti (almeno il 50% dei turni). I mostri/nemici devono essere vari.
    - Se i giocatori hanno ARMI o OGGETTI OFFENSIVI nell'inventario, DEVI generare opzioni per usarli (es. "Spara con Fucile Laser"). Queste opzioni devono essere molto efficaci.
    - Le scelte "Giuste" (basate su logica, stats alte o uso oggetti) devono premiare subito (niente danni, loot extra).
    - Le scelte "Errate" o stupide puniscono duramente (danni vita).

    STATO GIOCO:
    - Turno ${turn}/${maxTurns}
    - Vite totali: ${lives}/${maxLives}
    - Scenario: ${scenario || 'Ignoto'}
    - Finale Richiesto: ${Boolean(finaleRequired)}

    SCELTE DEL TURNO PRECEDENTE:
    ${JSON.stringify(choices || [])}

    SQUADRA (Stats & Inventario):
    ${JSON.stringify(players.map(p => ({
    name: p.name,
    stats: p.stats,
    inventory: p.inventory.map(i => i.name),
    life: p.life
  })))}

    REGOLE RISPOSTE (JSON STRICT):
    - Narrative: MAX 2 FRASI.
    - isGameOver: true se siamo all'ultimo turno o tutti morti.
    - Domanda: MAX 50 CARATTERI.

    OGGETTI & ABILITÀ:
    - Inventa armi e oggetti potenti se i giocatori vincono fight difficili.
    - Dai abilità passive ("Berserker", "Cecchino") se usano spesso certe stats.

    FINE PARTITA:
    - Se finaleRequired = true, compila playerFinale.
    - Per ogni giocatore determina se è VITTORIA (è sopravvissuto e ha ottenuto qualcosa) o SCONFITTA (morto o fallito male).

    FORMATO REPLY:
    {
      "narrative": "Orda di mutanti! Vi circondano ringhiando.",
      "isGameOver": boolean,
      "scoreDelta": 0,
      "lifeDelta": 0,
      "itemRewards": [],
      "playerOutcomes": [
        {
          "player": "Nome",
          "choiceId": "A",
          "narrative": "Hai decapitato il mostro.",
          "scoreDelta": 100,
          "lifeDelta": 0,
          "statDeltas": [{ "stat": "forza", "value": 1 }]
        }
      ],
      "playerFinale": [ 
        { "player": "Nome", "result": "Ha fondato una nuova colonia.", "status": "VITTORIA" },
        { "player": "Nome", "result": "Divorato dai ratti.", "status": "SCONFITTA" }
      ],
      "question": "Cosa fate?",
      "options": [
        { 
            "id": "A", 
            "text": "Usa Fucile Plasma", 
            "requiresRoll": true, 
            "rollType": "d20", 
            "rollDC": 10,
            "rollStat": "tecnica" 
        },
        { 
            "id": "B", 
            "text": "Carica a testa bassa", 
            "requiresRoll": true, 
            "rollType": "d20", 
            "rollDC": 16,
            "rollStat": "forza" 
        }
      ]
    }
    `;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

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
