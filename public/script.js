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

            function processEvent(event) {
                console.log(event);  // Print the event data
                try {
                    const data = JSON.parse(event);
                    console.log(data);  // Print the parsed data
                    contentElement.textContent += data.choices[0].delta.content;
                } catch (error) {
                    console.error('Error parsing JSON', error);
                }
            }

            function processText({ done, value }) {
                buffer += decoder.decode(value, { stream: true });
                let start = 0;
                let end;
                while ((end = buffer.indexOf('\n\n', start)) !== -1) {
                    const event = buffer.slice(start, end).trim();
                    if (event.startsWith('data: ')) {
                        processEvent(event.slice(6));
                    }
                    start = end + 2;
                }
                buffer = buffer.slice(start);

                if (!done) {
                    return reader.read().then(processText);
                }
            }

            return reader.read().then(processText);
        });
});
