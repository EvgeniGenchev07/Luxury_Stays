import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import {auth} from './firebase.js';
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorDiv = document.getElementById('login-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.textContent = '';

    if (form.checkValidity()) {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        const idToken = await userCredential.user.getIdToken(/* forceRefresh = */ true); // Optional: force refresh

        await fetch('https://europe-central2-luxurystayskapanaplovdiv.cloudfunctions.net/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({})
        }).then(async response => {
          if (response.ok) {
            window.location.replace('control');
          } else {
            const errorText = await response.text();
            errorDiv.textContent = `Login failed: ${errorText}`;
          }
        }).catch(err => {
          console.error(err);
          errorDiv.textContent = `Error: ${err.message}`;
        });
      }
  });
});
