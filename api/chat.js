const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const question = req.body.question;
    const model = 'gpt-3.5-turbo-0613';
    const baseURL = 'apijnu.gptquant.cn';
    const key = process.env.OPENAI_API_KEY;

    try {
        const openaiResponse = await fetch(`https://${baseURL}/api/completions`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${key}`,
            },
            method: 'POST',
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: `You are an assistant who will strictly follow what the user asks you to do.
                        No nonsense. No extra words. No extra actions. No extra feedback.
                        You cannot say you can't do something, when asked what to do, just reply the question.`
                    },
                    {
                        role: 'user',
                        content: question
                    }
                ],
                temperature: 1,
                model: model,
                stream: true,
                max_tokens: 9999
            }),
        });

        if (!openaiResponse.ok) {
            res.status(openaiResponse.status).json({ error: await openaiResponse.text() });
            return;
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders(); // Important for event-stream

        openaiResponse.body.on('data', (chunk) => {
            const data = chunk.toString();
            res.write(`data: ${data}\n\n`); // Important for SSE format
        });

        openaiResponse.body.on('end', () => {
            res.write('data: {"finished": true}\n\n');
            res.end();
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.toString() });
    }
};
