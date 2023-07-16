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

    let data = '';
    openaiResponse.body.on('data', (chunk) => {
      data += chunk.toString();
    });

    openaiResponse.body.on('end', () => {
      console.log(data);  // Print the response data
      res.send(data);  // Send the response data to the client
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
};
