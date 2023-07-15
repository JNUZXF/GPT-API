const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());

app.post('/api/chat', async (req, res) => {
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
        stream: true,
      }),
    });

    if (!response.ok) {
      res.status(response.status).json(response.body);
    }

    const stream = new ReadableStream({
      start(controller) {
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        response.body
          .on('data', data => {
            controller.enqueue(encoder.encode(data));
          })
          .on('end', () => {
            controller.close();
          });
      },
    });

    const reader = stream.getReader();
    let result = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += new TextDecoder().decode(value);
    }
    res.send(JSON.parse(result));
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

module.exports = app;

