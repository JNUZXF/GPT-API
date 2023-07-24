// api/chat.js
const fetch = require('node-fetch');

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
        model: "gpt-3.5-turbo",
        messages: messages.map(message => ({
          role: message.role,
          content: message.content,
        })),
        temperature: 0.5,
        max_tokens: 9999,
        stream: true,
      }),
    });

    if (!openaiResponse.ok) {
      res.status(openaiResponse.status).json({ error: await openaiResponse.text() });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    
    // Instead of waiting for the entire response to arrive, start processing the data as soon as it arrives
    openaiResponse.body.on('data', (chunk) => {
      // Convert the Buffer to a string and send it to the client
      const text = chunk.toString();
      res.write(`data: ${text}\n\n`);
    });

    openaiResponse.body.on('end', () => {
      res.end();
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
};
