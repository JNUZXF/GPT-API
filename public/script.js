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
  console.log(response);
  
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
  while (lastMessage.includes('\n\n')) {
    // Find the first complete message
    const endOfMessage = lastMessage.indexOf('\n\n');
    const completeMessage = lastMessage.slice(0, endOfMessage);

    // Parse the JSON object and get the AI's message
    const messageObj = JSON.parse(completeMessage.replace(/^data: /, '').trim());
    const aiMessage = messageObj.choices[0].delta.content;

    // Append the AI's message to the messages container, if it's not empty
    if (aiMessage) {
      messagesContainer.innerHTML += `<div class="message ai-message">${aiMessage}</div>`;
      window.scrollTo(0, document.body.scrollHeight);
    }

    // Start a new message with any remaining text
    lastMessage = lastMessage.slice(endOfMessage + 2);
  }

  // Keep reading the stream
  readStream();
}



  readStream().catch((error) => {
    console.error('Error while reading the response stream', error);
  });
});
