const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', function(event) {
  event.preventDefault();
  let output = document.getElementById('form-output-global');
  output.classList.remove('error', 'success');
  this.classList.add('form-in-process');
  output.innerHTML = '<p><span class="icon text-middle spin icon-spin icon-xxs"></span><span>Sending</span></p>';
  output.classList.add('active');
  if (this.checkValidity()) {
    const grecaptcha_response = grecaptcha.getResponse();
    if (grecaptcha_response === '') {

    } else {
      const https_address = 'https://europe-central2-luxurystayskapanaplovdiv.cloudfunctions.net/api/sendMail';
      let subject = contactForm.querySelector('#subject').value;
      let name = contactForm.querySelector('#name').value;
      let email = contactForm.querySelector('#email').value;
      let message = contactForm.querySelector('#message').value;
      fetch(https_address, {
        method: 'POST',
        body:
          JSON.stringify(
            {
              name: name,
              email: email,
              subject: subject,
              message: message,
              grecaptcha_response: grecaptcha_response
            })
      })
        .then((res) => {
          if (res.ok) {
            output.innerHTML = ' <p class="snackbars-left"><span>' + 'Successfully sent!' + '</span></p>';
            output.classList.add('success');
            this.reset();
            setTimeout(() => output.classList.remove('active', 'success'), 2000);
          } else {
            output.innerHTML = ' <p class="snackbars-left"></span><span>' + 'reCAPTCHA is not verified' + '</span></p>';
            output.classList.add('error');
            setTimeout(() => output.classList.remove('active', 'error'), 2000);
          }
        })
        .catch(() => {
          output.innerHTML = ' <p class="snackbars-left"></span><span>' + 'Aw, snap! Something went wrong.' + '</span></p>';
          output.classList.add('error');
          setTimeout(() => output.classList.remove('active', 'error'), 2000);
        });
    }
  } else {
    output.innerHTML = ' <p class="snackbars-left"><span>' + 'Please, enter correct data.' + '</span></p>';
    output.classList.add('error');
    setTimeout(() => output.classList.remove('active', 'error'), 2000);
  }
});
