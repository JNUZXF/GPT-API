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

                let start;
                // Check if there's a complete event in the buffer
                while ((start = buffer.indexOf('\n\n')) !== -1) {
                    let eventStr = buffer.slice(0, start).trim();
                    buffer = buffer.slice(start + 2);

                    // Check if the string begins with "data: " and, if so, remove it before parsing
                    if (eventStr.startsWith('data: ')) {
                        eventStr = eventStr.slice(6);
                    }

                    try {
                        const data = JSON.parse(eventStr);
                        // Check if the choice has content
                        if (data.choices[0].finish_reason === 'stop') {
                            contentElement.textContent += data.choices[0].finish.detail;
                        } else if (data.choices[0].delta.content) {
                            contentElement.textContent += data.choices[0].delta.content;
                        }
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
