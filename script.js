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
                buffer += decoder.decode(value, { stream: !done });

                // Process all complete event stream messages in the buffer
                let start;
                while ((start = buffer.indexOf('\n\n')) !== -1) {
                    const eventStr = buffer.slice(0, start).trim();
                    buffer = buffer.slice(start + 2);
                    try {
                        const data = JSON.parse(eventStr);
                        contentElement.textContent += data.choices[0].delta.content;
                    } catch (error) {
                        console.error('Error parsing JSON', error);
                    }
                }

                // If stream is done and there's remaining buffer, process it as well
                if (done && buffer.trim().length > 0) {
                    try {
                        const data = JSON.parse(buffer.trim());
                        contentElement.textContent += data.choices[0].delta.content;
                    } catch (error) {
                        console.error('Error parsing JSON', error);
                    }
                }

                if (!done) {
                    return reader.read().then(processText);
                }
            }

            return reader.read().then(processText);
        });
});
