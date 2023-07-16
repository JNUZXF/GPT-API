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
          result += decoder.decode(value);
          const lines = result.split('\n');
          for (let i = 0; i < lines.length - 1; i++) {  // Exclude the last line, because it might be incomplete
            const line = lines[i];
            try {
              const data = JSON.parse(line);
              const botMessage = data.choices[0].message.content;
              messagesElement.innerHTML += `<div>Bot: ${botMessage}</div>`;
            } catch (error) {
              console.error('Error parsing JSON', error);
            }
          }
          result = lines[lines.length - 1];  // The last line might be incomplete, save it for the next chunk

          if (!done) {
            return reader.read().then(processText);
          }
        });
      });
});
