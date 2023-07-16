const fetch = require('node-fetch');
const { PassThrough } = require('stream');

module.exports = async (req, res) => {
  const { messages } = req.body;
  const model = 'gpt-3.5-turbo';
  const baseURL = 'api.openai.com';
  const key = process.env.OPENAI_API_KEY;

  try {
    const openaiResponse = await fetch(`https://${baseURL}/v1/chat/completions`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      method: 'POST',
      body: JSON.stringify({
        model,
        messages: messages.map(message => ({
          role: message.role,
          content: message.content,
        })),
        temperature: 0.5,
        stream: true,
      }),
    });

    if (!openaiResponse.ok) {
      res.status(openaiResponse.status).json({ error: await openaiResponse.text() });
      return;
    }

    openaiResponse.body.pipe(new PassThrough()).pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
};
