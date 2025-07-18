import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorDiv = document.getElementById('login-error');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.textContent = '';
    if(form.checkValidity()) {
      const email = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      try {
        const userCredential = await signInWithEmailAndPassword(window.firebaseAuth, email, password);
        const idToken = await userCredential.user.getIdToken();
        console.log(idToken);
        // Send token to backend to create a secure session cookie
        await fetch('https://europe-central2-luxurystayskapanaplovdiv.cloudfunctions.net/loginSession', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ idToken }),
        });
        window.location.assign('/dashboard');
      } catch (err) {
        errorDiv.textContent = err.message;
      }
    }
  });
});