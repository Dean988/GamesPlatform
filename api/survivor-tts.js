function toNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
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

    const googleTtsKey = process.env.GOOGLE_TTS_API_KEY;
    if (!googleTtsKey) {
        res.status(500).json({ error: 'Missing GOOGLE_TTS_API_KEY' });
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
        const response = await synthesizeGoogleCloud(text, context);
        if (!response?.audio) {
            res.status(500).json({ error: 'Empty audio response' });
            return;
        }
        res.status(200).json(response);
    } catch (error) {
        console.error('Google TTS Error:', error);
        res.status(500).json({
            error: 'TTS failed',
            details: error.message || String(error)
        });
    }
}
