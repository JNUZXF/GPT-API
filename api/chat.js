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

    // Read the response data to a string
    const reader = openaiResponse.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let result = '';
    while (true) {
      const { done, value } = await reader.read();
      result += decoder.decode(value || new Uint8Array(), { stream: !done });
      if (done) break;
    }

    console.log(result);  // Print the response data

    res.send(result);  // Send the response data to the client
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
};
