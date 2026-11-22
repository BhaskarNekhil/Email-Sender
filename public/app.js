const form = document.querySelector('#email-form');
const button = document.querySelector('#send-button');
const status = document.querySelector('#status');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  status.textContent = 'Sending…';
  status.className = '';
  button.disabled = true;

  const formData = new FormData(form);
  try {
    const response = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipients: formData.get('recipients'),
        subject: formData.get('subject'),
        message: formData.get('message')
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Email could not be sent.');
    status.textContent = result.message;
    status.className = 'success';
    form.reset();
  } catch (error) {
    status.textContent = error.message || 'Unable to reach the server.';
    status.className = 'error';
  } finally {
    button.disabled = false;
  }
});
