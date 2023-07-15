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
      .then(response => response.body)
      .then(rb => {
        const reader = rb.getReader();
  
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
        return new Response(stream, { headers: { 'Content-Type': 'text/html' } }).text();
      })
      .then(result => {
        messagesElement.innerHTML += `<div>Bot: ${result}</div>`;
      });
  });
  