import { GoogleGenAI } from '@google/genai';

const modelPrimary = 'gemini-2.5-flash-preview-tts';
const modelFallback = 'gemini-2.5-flash-tts';

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

async function synthesizeGoogleCloud(text, context = {}) {
    const ttsKey = process.env.GOOGLE_TTS_API_KEY;
    if (!ttsKey) return null;

    const voiceName = typeof context.ttsVoice === 'string' ? context.ttsVoice : 'it-IT-Neural2-C';
    const speakingRate = toNumber(context.ttsRate, 0.97);
    const pitch = toNumber(context.ttsPitch, 0);

    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${ttsKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            input: { text },
            voice: {
                languageCode: 'it-IT',
                name: voiceName
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate,
                pitch
            }
        })
    });

    const responseText = await response.text();
    if (!response.ok) {
        throw new Error(responseText || 'Google TTS failed');
    }

    let data = null;
    try {
        data = JSON.parse(responseText);
    } catch (parseError) {
        throw new Error('Google TTS invalid response');
    }

    if (!data?.audioContent) {
        throw new Error('Google TTS missing audio');
    }

    return {
        audio: data.audioContent,
        mimeType: 'audio/mpeg'
    };
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const googleTtsKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey && !googleTtsKey) {
        res.status(500).json({ error: 'Missing GEMINI_API_KEY or GOOGLE_TTS_API_KEY' });
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

    const voiceName = typeof context.voice === 'string' ? context.voice : 'Kore';

    const requestConfigPrimary = {
        responseModalities: ['AUDIO'],
        speechConfig: {
            voiceConfig: {
                prebuiltVoiceConfig: {
                    voiceName
                }
            }
        }
    };

    const requestConfigFallback = {
        response_modalities: ['AUDIO'],
        speech_config: {
            voice_config: {
                prebuilt_voice_config: {
                    voice_name: voiceName
                }
            }
        }
    };

    try {
        let result = null;
        if (apiKey) {
            const client = new GoogleGenAI({ apiKey });
            const runRequest = async (model, config) =>
                client.models.generateContent({
                    model,
                    contents: [{ role: 'user', parts: [{ text: buildPrompt(text, context) }] }],
                    config
                });

            try {
                result = await runRequest(modelPrimary, requestConfigPrimary);
            } catch (primaryError) {
                console.error('Gemini TTS primary error:', primaryError);
                try {
                    result = await runRequest(modelPrimary, requestConfigFallback);
                } catch (secondaryError) {
                    console.error('Gemini TTS primary fallback error:', secondaryError);
                    result = await runRequest(modelFallback, requestConfigPrimary);
                }
            }
        }

        if (result) {
            const payload = extractAudioPayload(result);
            const audioBase64 = toBase64(payload?.audio);
            if (audioBase64) {
                res.status(200).json({
                    audio: audioBase64,
                    mimeType: payload?.mimeType || 'audio/wav'
                });
                return;
            }
        }

        if (googleTtsKey) {
            const fallback = await synthesizeGoogleCloud(text, context);
            if (fallback?.audio) {
                res.status(200).json(fallback);
                return;
            }
        }

        res.status(500).json({ error: 'Empty audio response' });
    } catch (error) {
        console.error('Gemini TTS Error:', error);
        if (googleTtsKey) {
            try {
                const fallback = await synthesizeGoogleCloud(text, context);
                if (fallback?.audio) {
                    res.status(200).json(fallback);
                    return;
                }
            } catch (fallbackError) {
                console.error('Google TTS Error:', fallbackError);
                res.status(500).json({
                    error: 'TTS failed',
                    details: fallbackError.message || error.message || String(error)
                });
                return;
            }
        }

        res.status(500).json({
            error: 'TTS failed',
            details: error.message || String(error)
        });
    }
}
