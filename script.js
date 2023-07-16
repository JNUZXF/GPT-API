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
            const botMessage = JSON.parse(result).choices[0].message.content;
            messagesElement.innerHTML += `<div>Bot: ${botMessage}</div>`;
            return;
          }
          result += decoder.decode(value);
          return reader.read().then(processText);
        });
      });
});
