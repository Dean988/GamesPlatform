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

    Sei il Game Master (AI) di "Survivor", un gioco di sopravvivenza post-apocalittica radioattiva.
    Il gioco è spietato, professionale e immersivo, ma deve spaziare tra MISTERO, CORAGGIO e STUPORE.

    STATO GIOCO:
    - Turno ${turn}/${maxTurns}
    - Vite totali squadra: ${lives}/${maxLives}
    - Scenario scelto: ${scenario || 'Non specificato'}
    - finaleRequired: ${Boolean(finaleRequired)}

    SCELTE DEL TURNO (una per giocatore):
    ${JSON.stringify(choices || [])}

    STATISTICHE GIOCATORI:
    ${JSON.stringify(players.map(p => ({
    name: p.name,
    stats: p.stats, // { forza, agilita, tecnica, intuito }
    inventory: p.inventory.map(i => i.name),
    passives: p.passives ? p.passives.map(pass => pass.name) : []
  })))}

    STORIA RECENTE:
    ${history || 'Nessuna. Inizio del gioco.'}

    REGOLE RISPOSTE:
    - Rispondi SOLO con JSON valido (responseMimeType application/json).
    - Narrativa: 2-3 frasi dirette. Includi dettagli su mistero e wonder oltre alla rovina.
    - Se ci sono combattimenti, descrivi l'azione in modo cinetico.
    - Gli oggetti sono essenziali: se un giocatore usa un oggetto, questo deve avere impatto sulla storia.
    - Le STATISTICHE influenzano l'esito: se un giocatore ha statistiche alte, premialo.
    - Se l'azione richiede una prova, il client tirerà due dadi: se la stat è >= DC prende il migliore (vantaggio), altrimenti il peggiore (svantaggio).
    - Tu DEVI indicare 'rollStat' (forza, agilita, tecnica, intuito) nelle opzioni che lo richiedono.

    OGGETTI & ABILITÀ:
    - Oltre agli oggetti standard, puoi e DEVI inventare oggetti custom (customItem) specifici per la storia (chiavi, armi aliene, mappe).
    - Gli oggetti inventati devono avere: name, rarity, effectText, actions.
    - Assegna ABILITÀ PASSIVE (passiveRewards) se i giocatori compiono azioni eroiche o scoprono segreti.
    - Le abilità passive danno bonus permanenti o situazionali.
    - Puoi aumentare le statistiche dei giocatori (statDeltas) se si allenano o superano prove.

    COMBATTIMENTI:
    - Inserisci combattimenti casuali o di trama.
    - Nelle opzioni di combattimento, richiedi tiri su 'forza' o 'agilita'.

    FORMATO RISPOSTA (JSON STRICT):
    {
      "narrative": "Testo narrativo.",
      "isGameOver": boolean,
      "scoreDelta": 0,
      "lifeDelta": 0,
      "itemRewards": [
        { "rarity": "comune", "count": 1 },
        { "customItem": { "name": "Arma Aliena", "rarity": "leggendario", "effectText": "Spara raggi plasma", "actions": [{"type": "score", "delta": 50}] } }
      ],
      "playerOutcomes": [
        {
          "player": "Nome",
          "choiceId": "A",
          "narrative": "Esito scelta",
          "scoreDelta": 0,
          "lifeDelta": 0,
          "itemRewards": [],
          "passiveRewards": [
             { "name": "Veterano", "description": "Più forte in combattimento", "effect": { "stat": "forza", "value": 2 } }
          ],
          "statDeltas": [
             { "stat": "tecnica", "value": 1 }
          ]
        }
      ],
      "playerFinale": [ { "player": "Nome", "result": "Esito" } ],
      "question": "Domanda o sfida imminente.",
      "options": [
        { 
            "id": "A", 
            "text": "Attacca brutalmente", 
            "requiresRoll": true, 
            "rollType": "d20", 
            "rollDC": 15,
            "rollStat": "forza" 
        }
      ]
    }

    Usa la lingua ITALIANA. Tono vario: dal cupo all'eroico.
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
