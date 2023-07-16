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
      .then(response => response.json()) // Get the result as JSON
      .then(result => {
        const botMessage = result.choices[0].message.content; // Extract the bot message from the result
        messagesElement.innerHTML += `<div>Bot: ${botMessage}</div>`; // Display the bot message
      });
});
