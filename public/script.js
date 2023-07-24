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
        .then(response => response.text())
        .then(data => {
            const events = data.trim().split('\n');
            for (let event of events) {
                if (event.startsWith('data: ')) {
                    const line = event.slice(6).trim();
                    if (line.startsWith('{') && line.endsWith('}')) {
                        const output = JSON.parse(line);
                        if (output.role === 'system' || output.role === 'assistant') {
                            contentElement.innerHTML += `<div>${output.role}: ${output.content}</div>`;
                        }
                    }
                }
            }
        });
});
