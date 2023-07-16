document.getElementById('form').addEventListener('submit', function (event) {
    event.preventDefault();

    const inputElement = document.getElementById('input');
    const messagesElement = document.getElementById('messages');

    const userMessage = inputElement.value;
    inputElement.value = '';

    messagesElement.innerHTML += `<div>User: ${userMessage}</div>`;

    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages: [{role: 'user', content: userMessage}] })
    })
      .then(response => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let result = '';

        reader.read().then(function processText({ done, value }) {
          if (done) {
            const lines = result.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);  // Remove the "data: " prefix
                try {
                  const botMessage = JSON.parse(data).choices[0].message.content;
                  messagesElement.innerHTML += `<div>Bot: ${botMessage}</div>`;
                } catch (error) {
                  console.error('Error parsing JSON', error);
                }
              }
            }
            return;
          }
          result += decoder.decode(value);
          return reader.read().then(processText);
        });
      });
});
