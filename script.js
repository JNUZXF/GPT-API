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
      .then(response => response.json())
      .then(result => {
        if (result.choices && result.choices.length > 0) {
          const botMessage = result.choices[0].message.content;
          messagesElement.innerHTML += `<div>Bot: ${botMessage}</div>`;
        } else {
          // Handle the case where there is no bot message
          console.error('No bot message received', result);
        }
      });
});
