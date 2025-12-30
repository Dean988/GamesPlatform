import { GoogleGenAI } from '@google/genai';

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
    const candidates = result?.candidates || result?.response?.candidates || [];
    const parts = candidates?.[0]?.content?.parts || [];
    const audioPart = parts.find((part) => part.inlineData || part.inline_data);
    const inlineData = audioPart?.inlineData || audioPart?.inline_data;
    if (!inlineData) return null;
    return {
        audio: inlineData.data,
        mimeType: inlineData.mimeType || inlineData.mime_type
    };
}

function toBase64(data) {
    if (!data) return null;
    if (typeof data === 'string') return data;
    if (Buffer.isBuffer(data)) return data.toString('base64');
    if (data instanceof Uint8Array) return Buffer.from(data).toString('base64');
    if (Array.isArray(data)) return Buffer.from(data).toString('base64');
    return null;
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
        const client = new GoogleGenAI({ apiKey });
        const voiceName = typeof context.voice === 'string' ? context.voice : 'Kore';

        const result = await client.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: buildPrompt(text, context) }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName
                        }
                    }
                }
            }
        });

        const payload = extractAudioPayload(result);
        const audioBase64 = toBase64(payload?.audio);
        if (!audioBase64) {
            res.status(500).json({ error: 'Empty audio response' });
            return;
        }

        res.status(200).json({
            audio: audioBase64,
            mimeType: payload?.mimeType || 'audio/wav'
        });
    } catch (error) {
        console.error('Gemini TTS Error:', error);
        res.status(500).json({ error: 'TTS failed', details: error.message });
    }
}
