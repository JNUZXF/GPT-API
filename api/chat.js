// chat.js
import fetch from 'node-fetch';

export default async (req, res) => {
  const { messages } = req.body;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [...messages, { role: 'system', content: 'You are a helpful assistant.' }],
      stream: true,
    })
  });

  if (!response.ok) {
    res.status(response.status).json(await response.text());
    return;
  }

  res.set({
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked'
  });

  const decoder = new TextDecoder();
  const reader = response.body.getReader();
  let data;

  while (!(data = await reader.read()).done) {
    const text = decoder.decode(data.value);
    const match = text.match(/"content":"(.*?)"/);
    const content = match ? match[1] : '';

    res.write(content);
  }

  res.end();
};
