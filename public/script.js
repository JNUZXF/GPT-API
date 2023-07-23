document.getElementById('form').addEventListener('submit', function (event) {
    event.preventDefault();

    const inputElement = document.getElementById('input');
    const messagesElement = document.getElementById('messages');

    const userMessage = inputElement.value;
    inputElement.value = '';

    messagesElement.innerHTML += `<div>User: ${userMessage}</div>`;

    const contentElement = document.createElement('div');
    messagesElement.appendChild(contentElement);

    fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: userMessage }] })
    })
        .then(response => {
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

        function processText({ done, value }) {
          buffer += decoder.decode(value, { stream: true });
          let start = 0;
          let end;
          while ((end = buffer.indexOf('\n', start)) !== -1) {
            const event = buffer.slice(start, end).trim();
            if (event.startsWith('data: ')) {
              const line = event.slice(6).trim();
              // Check if the line might be JSON
              if (line.startsWith('{') && line.endsWith('}')) {
                const isDone = processEvent(line);
                if (isDone) {
                  break;
                }
              }
            }
            start = end + 1;
          }
          buffer = buffer.slice(start);
        
          if (!done) {
            return reader.read().then(processText);
          }
        }


            return reader.read().then(processText);
        });
});
