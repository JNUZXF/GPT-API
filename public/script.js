document.getElementById('form').addEventListener('submit', function (event) {
    event.preventDefault();

    const inputElement = document.getElementById('input');
    const messagesElement = document.getElementById('messages');

    const userMessage = inputElement.value;
    inputElement.value = '';

    messagesElement.innerHTML += `<div>User: ${userMessage}</div>`;

    const contentElement = document.createElement('div');
    messagesElement.appendChild(contentElement);

    const es = new EventSource(`/api/chat?message=${encodeURIComponent(userMessage)}`);

    es.addEventListener('message', function (event) {
        const message = event.data;

        if (message) {
            const paragraph = document.createElement('p');
            paragraph.textContent = message;
            contentElement.appendChild(paragraph);
        }
    });

    es.addEventListener('error', function () {
        es.close();
    });

    es.addEventListener('end', function () {
        es.close();
    });
});
