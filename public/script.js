// public/script.js
document.getElementById('form').addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const inputField = document.getElementById('input');
  const messagesContainer = document.getElementById('messages');
  
  const message = {
    role: 'user',
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
  // console.log(await response.text());

  const reader = response.body.getReader();
  let lastMessage = '';

  // This function handles the stream of data
  async function readStream() {
    const { value, done } = await reader.read();

    if (done) {
      return;
    }

    // Convert the Uint8Array to a string and add it to the last message
    lastMessage += new TextDecoder().decode(value);

    // Check if the last message is complete (ends with two newline characters)
    while (lastMessage.endsWith('\n\n')) {
      // If it is, remove the trailing newline characters and append it to the messages container
      const completeMessage = lastMessage.slice(0, -2);
      messagesContainer.innerHTML += `<div class="message ai-message">${completeMessage}</div>`;
      window.scrollTo(0, document.body.scrollHeight);

      // Start a new message with any remaining text
      lastMessage = lastMessage.slice(completeMessage.length + 2);
    }

    // Keep reading the stream
    readStream();
  }

  readStream().catch((error) => {
    console.error('Error while reading the response stream', error);
  });
});
