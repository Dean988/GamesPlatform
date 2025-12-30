import { GoogleGenerativeAI } from '@google/generative-ai';

const modelName = 'gemini-2.5-flash-preview-tts';

function toNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function buildVoiceStyle(context = {}) {
    const lifeDelta = toNumber(context.lifeDelta, 0);
    const scoreDelta = toNumber(context.scoreDelta, 0);
    const lives = toNumber(context.lives, 0);
    const maxLives = Math.max(1, toNumber(context.maxLives, 1));
    const itemCount = toNumber(context.itemCount, 0);
    const rollStats = context.rollStats || {};
    const critical = toNumber(rollStats.critical, 0);
    const successes = toNumber(rollStats.successes, 0);
    const failures = toNumber(rollStats.failures, 0);
    const healthRatio = lives / maxLives;

    let tone = 'neutro e lucido';
    let pace = 'ritmo medio';
    let intensity = 'intensita media';

    if (context.isGameOver) {
        tone = 'solenne e definitivo';
        pace = 'ritmo lento';
        intensity = 'intensita alta';
    } else if (healthRatio <= 0.34 || lifeDelta < 0) {
        tone = 'teso e cupo';
        pace = 'ritmo lento e grave';
        intensity = 'intensita alta';
    } else if (scoreDelta < 0 && lifeDelta < 0) {
        tone = 'drammatico e urgente';
        pace = 'ritmo rapido';
        intensity = 'intensita alta';
    } else if (critical > 0) {
        tone = 'esaltato ma controllato';
        pace = 'ritmo rapido';
        intensity = 'intensita alta';
    } else if (successes > failures && successes > 0) {
        tone = 'deciso e fiducioso';
        pace = 'ritmo medio';
        intensity = 'intensita medio-alta';
    } else if (failures > successes && failures > 0) {
        tone = 'inquieto e teso';
        pace = 'ritmo medio-lento';
        intensity = 'intensita alta';
    } else if (lifeDelta > 0 || scoreDelta > 15 || itemCount > 0) {
        tone = 'determinato e speranzoso';
        pace = 'ritmo medio-rapido';
        intensity = 'intensita medio-alta';
    }

    return `Voce italiana, tono ${tone}, ${intensity}, ${pace}.`;
}

function buildPrompt(text, context) {
    const style = buildVoiceStyle(context);
    return `
Sei il narratore vocale di Survivor.
Leggi solo il testo fornito, senza aggiungere nulla.
${style}

TESTO:
${text}
`.trim();
}

function extractAudioPayload(result) {
    const parts = result?.response?.candidates?.[0]?.content?.parts || [];
    const audioPart = parts.find((part) => part.inlineData);
    if (!audioPart || !audioPart.inlineData) return null;
    return {
        audio: audioPart.inlineData.data,
        mimeType: audioPart.inlineData.mimeType
    };
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
    try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
        body = {};
    }

    const text = typeof body.text === 'string' ? body.text.trim() : '';
    const context = body.context || {};
    if (!text) {
        res.status(400).json({ error: 'Missing text' });
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: buildPrompt(text, context) }] }],
            generationConfig: {
                responseModalities: ['AUDIO']
            }
        });

        const payload = extractAudioPayload(result);
        if (!payload || !payload.audio) {
            res.status(500).json({ error: 'Empty audio response' });
            return;
        }

        res.status(200).json({
            audio: payload.audio,
            mimeType: payload.mimeType || 'audio/wav'
        });
    } catch (error) {
        console.error('Gemini TTS Error:', error);
        res.status(500).json({ error: 'TTS failed', details: error.message });
    }
}
