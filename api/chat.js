const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { messages } = req.body;
  const model = 'gpt-3.5-turbo';
  const baseURL = 'api.openai.com';
  const key = process.env.OPENAI_API_KEY;

  try {
    const response = await fetch(`https://${baseURL}/v1/chat/completions`, {
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
        stream: True,
      }),
    });

    if (!response.ok) {
      res.status(response.status).json({ error: await response.text() });
      return;
    }

    const result = await response.json();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
};
