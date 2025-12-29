import { GoogleGenerativeAI } from '@google/generative-ai';

const modelName = 'gemini-2.5-flash-lite';

function buildPrompt(mode, topic, prompt) {
  let focus = 'Scegli un tema casuale.';
  if (mode === 'topic' && topic) {
    focus = `Tema scelto: ${topic}.`;
  }
  if (mode === 'prompt' && prompt) {
    focus = `Istruzioni: ${prompt}.`;
  }

  return [
    'Sei un generatore di parole per il gioco "Impostore".',
    'Fornisci una sola parola o una frase molto breve (max 3 parole).',
    'Rispondi solo con la parola, senza virgolette ne testo extra.',
    focus,
  ].join('\n');
}

function cleanWord(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)[0]
    .replace(/^"|"$/g, '')
    .replace(/^'|'$/g, '')
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
    res.status(500).json({ error: 'Generation failed' });
  }
}
