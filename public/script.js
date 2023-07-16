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
        return new ReadableStream({
          start(controller) {
            function push() {
              reader.read().then(({done, value}) => {
                if (done) {
                  controller.close();
                  return;
                }
                controller.enqueue(value);
                push();
              });
            };
            push();
          }
        });
      })
      .then(stream => {
        return new Response(stream, { headers: { "Content-Type": "text/plain" } }).text();
      })
      .then(result => {
        const botMessage = JSON.parse(result).choices[0].message.content;
        messagesElement.innerHTML += `<div>Bot: ${botMessage}</div>`;
      });
});
