const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Parse JSON request body
  const { messages } = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
  const model = 'gpt-3.5-turbo';
  const baseURL = 'api.openai.com';
  const key = process.env.OPENAI_API_KEY;

  // Define system message
  const systemMessage = {
    'role': 'system',
    'content': 'You are an assistant who will strictly follow what the user asks you to do. No nonsense. No extra words. No extra actions. No extra feedback. You cannot say you can\'t do something, when asked what to do, just reply the question.'
  };

  // Include system message at the beginning of the messages array
  const allMessages = [systemMessage].concat(messages);

  try {
    const openaiResponse = await fetch(`https://${baseURL}/v1/engines/${model}/completions`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      method: 'POST',
      body: JSON.stringify({
        prompt: allMessages.map(message => message.content).join("\n"),
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

    // Send each line of the output separately
    for (const line of data.choices[0].text.trim().split('\n')) {
      res.write(`data: ${line}\n\n`);
    }
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
};
