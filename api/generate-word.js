import { GoogleGenerativeAI } from '@google/generative-ai';

const modelName = 'gemini-2.5-flash-lite';

function buildPrompt(mode, topic, prompt) {
  // Base instructions to ensure variety and prevent repetition
  const baseInstruction = `
    Sei il motore di gioco per "Impostore" (Spyfall).
    Il tuo compito è generare UNA SOLA parola (luogo, oggetto, mestiere, concetto).
    
    REGOLE CRITICHE:
    1. NON rispondere MAI con "Spazio", "Astronauta", "Luna", "Marte" a meno che non sia esplicitamente richiesto. Sono parole banned.
    2. Varia molto le categorie: Cucina, Storia, Geografia, Animali, Oggetti di Casa, Hobby, Sport, Cinema.
    3. La parola deve essere in ITALIANO.
    4. Rispondi SOLO con la parola, niente punteggiatura.
  `;

  let specificInstruction = '';

  if (mode === 'topic' && topic) {
    specificInstruction = `Il tema è: "${topic}". Scegli una parola non banale collegata a questo tema.`;
  } else if (mode === 'prompt' && prompt) {
    specificInstruction = `Segui questa richiesta specifica dell'utente: "${prompt}".`;
  } else {
    // Mode Auto: Enforce high entropy
    const seed = Date.now().toString(36);
    const categories = ['Cucina', 'Sport Estremi', 'Antico Egitto', 'Giardinaggio', 'Tecnologia Retro', 'Strumenti Musicali', 'Mezzi di Trasporto', 'Animali Marini'];
    const randomCat = categories[Math.floor(Math.random() * categories.length)];

    specificInstruction = `
      Scegli una parola CASUALE.
      Per ispirazione, pesca dalla categoria: ${randomCat} (ma non sei obbligato).
      Assicurati che sia diversa dall'ultima volta.
      Seed entropia: ${seed}
    `;
  }

  return `${baseInstruction}\n${specificInstruction}`;
}

function cleanWord(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)[0]
    .replace(/^"|"$/g, '')
    .replace(/^'|'$/g, '')
    .replace(/\.$/, '') // Remove trailing dot
    .trim();
}

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
  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body || '{}');
    } catch (parseError) {
      body = {};
    }
  } else {
    body = req.body || {};
  }
  const mode = typeof body.mode === 'string' ? body.mode : 'auto';
  const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';

  const requestPrompt = buildPrompt(mode, topic, prompt);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(requestPrompt);
    const raw = result?.response?.text ? result.response.text() : '';
    const cleaned = cleanWord(raw);

    if (!cleaned) {
      res.status(500).json({ error: 'Empty response' });
      return;
    }

    res.status(200).json({ word: cleaned });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Generation failed' });
  }
}
