const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { messages } = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
  const model = 'gpt-3.5-turbo';
  const baseURL = 'api.openai.com';
  const key = process.env.OPENAI_API_KEY;

  // Ensure all messages have a 'role' and 'content' property
  if (!messages.every(message => message.role && message.content)) {
    res.status(400).json({ error: "All messages must have a 'role' and 'content' property." });
    return;
  }

  try {
    const openaiResponse = await fetch(`https://${baseURL}/v1/engines/${model}/completions`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      method: 'POST',
      body: JSON.stringify({
        messages,
        temperature: 0.5,
        max_tokens: 9999
      }),
    });

    if (!openaiResponse.ok) {
      res.status(openaiResponse.status).json({ error: await openaiResponse.text() });
      return;
    }

    const data = await openaiResponse.json();
    res.setHeader('Content-Type', 'text/plain');

    // Get the response content
    const responseContent = data.choices[0].message.content;

    // Send each line of the output separately
    for (const line of responseContent.split('\n')) {
      res.write(`data: ${line}\n\n`);
    }
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
};
