/* =========================================================
   Contact page — validated form submission to /api/contact
========================================================= */

function showFieldError(id, isInvalid) {
  document.getElementById(id).closest('.form-group').classList.toggle('invalid', isInvalid);
}

function validateContactForm() {
  let valid = true;
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const emailPattern = /^\S+@\S+\.\S+$/;

  if (!name) { showFieldError('name', true); valid = false; } else showFieldError('name', false);
  if (!email || !emailPattern.test(email)) { showFieldError('email', true); valid = false; } else showFieldError('email', false);
  if (!message) { showFieldError('message', true); valid = false; } else showFieldError('message', false);

  return valid;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('successAlert').classList.remove('show');
    document.getElementById('errorAlert').classList.remove('show');

    if (!validateContactForm()) return;

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    const payload = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      subject: document.getElementById('subject').value.trim(),
      message: document.getElementById('message').value.trim(),
    };

    try {
      await api.sendMessage(payload);
      document.getElementById('successAlert').classList.add('show');
      document.getElementById('contactForm').reset();
    } catch (err) {
      const errorAlert = document.getElementById('errorAlert');
      errorAlert.textContent = err.message;
      errorAlert.classList.add('show');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
});
