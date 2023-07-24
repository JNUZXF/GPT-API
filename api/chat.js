const fetch = require('node-fetch');
const { Readable } = require('stream');

module.exports = async (req, res) => {
    const { question } = req.body;
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
                model,
                messages: [
                    {
                        role: 'system',
                        content: 
                            'You are an assistant who will strictly follow what the user asks you to do. No nonsense. No extra words. No extra actions. No extra feedback. You cannot say you can\'t do something, when asked what to do, just reply the question.'
                    },
                    {
                        role: 'user',
                        content: question
                    }
                ],
                temperature: 1,
                stream: true,
                max_tokens: 9999,
            }),
        });

        if (!openaiResponse.ok) {
            res.status(openaiResponse.status).json({ error: await openaiResponse.text() });
            return;
        }

        const stream = new Readable();
        stream._read = () => {};

        res.setHeader('Content-Type', 'text/event-stream');

        openaiResponse.body.on('data', (chunk) => {
            try {
                let data = chunk.toString('utf-8').replace("\n", "</br>");
                stream.push(`data: ${data}\n\n`);
            } catch (error) {
                console.error("Error decoding chunk:", chunk);
            }
        });

        openaiResponse.body.on('end', () => {
            stream.push('data: end\n\n');
            stream.push(null);
        });

        stream.pipe(res);

    } catch (error) {
        console.error("Error during processing:", error.toString());
        res.status(500).json({ error: error.toString() });
    }
};
