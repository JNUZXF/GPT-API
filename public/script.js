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
        body: JSON.stringify({ question: userMessage })
    })
        .then(response => {
            const eventSource = new EventSource(response.url);
            eventSource.onmessage = (event) => {
                const message = JSON.parse(event.data);
                console.log(message); // Print out the message
                if (message.role !== 'system') {
                    handleNewMessage(contentElement, message.content);
                }
                if (message.finished) {
                    eventSource.close(); // Close the connection when the response is finished
                }
            };
        });

    function handleNewMessage(contentElement, message) {
        const paragraph = document.createElement('p');
        paragraph.textContent = message;
        contentElement.appendChild(paragraph);
    }
});
