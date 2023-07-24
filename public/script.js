document.getElementById('form').addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const inputField = document.getElementById('input');
  const messagesContainer = document.getElementById('messages');
  
  const message = {
    role: 'system',
    content: inputField.value,
  };
  
  inputField.value = '';
  messagesContainer.innerHTML += `<div class="message user-message">${message.content}</div>`;

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages: [message] }),
  });

  const reader = response.body.getReader();

  // This function handles the stream of data
  async function readStream() {
    const { value, done } = await reader.read();

    if (done) {
      return;
    }

    // Convert the Uint8Array to a string and append it to the messages container
    const text = new TextDecoder().decode(value);
    messagesContainer.innerHTML += `<div class="message ai-message">${text}</div>`;
    window.scrollTo(0, document.body.scrollHeight);

    // Keep reading the stream
    readStream();
  }

  readStream().catch((error) => {
    console.error('Error while reading the response stream', error);
  });
});
