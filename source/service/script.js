const params = new URLSearchParams(window.location.search);

const propertyName = params.get('p');
const channelManager = params.get('chm');

const form = document.getElementById('guestForm');
    form.addEventListener('submit', function (event) {
        event.preventDefault()
        event.stopPropagation()

      if (form.checkValidity()) {
        const statusModal = new bootstrap.Modal(document.getElementById('statusModal'));
        const loader = document.getElementById('loader-popup');
        const success = document.getElementById('success-popup');
        const error = document.getElementById('error-popup');

        loader.classList.remove('d-none');
        success.classList.add('d-none');
        error.classList.add('d-none');
        statusModal.show();
        const guests = [];
        const guest_card = document.querySelectorAll('.guest-card');

        guest_card.forEach((form, index) => {
          const guest = {
            nationality: form.querySelector(`[name="nationality"]`)?.value || 'None',
            firstName: form.querySelector(`[name="firstName"]`)?.value || 'None',
            middleName: form.querySelector(`[name="middleName"]`)?.value || 'None',
            lastName: form.querySelector(`[name="lastName"]`)?.value || 'None',
            gender: form.querySelector(`[name="gender"]`)?.value || 'None',
            id: form.querySelector(`[name="id"]`)?.value || 'None',
            dateOfBirth: form.querySelector(`[name="dateOfBirth"]`)?.value || 'None',
            documentType: form.querySelector(`[name="documentType"]`)?.value || 'None',
            documentNumber: form.querySelector(`[name="documentNumber"]`)?.value || 'None',
            touristPacket: form.querySelector(`[name="touristPacket"]`)?.checked || false
          };
          guests.push(guest);
        });
        const email = document.getElementById('email').value;
          const bundle = JSON.stringify({
            propertyName: propertyName,
            channelManager: channelManager,
            email: email,
            guests: guests
          });
          const https_address = 'https://europe-central2-luxurystayskapanaplovdiv.cloudfunctions.net/registrationRequest'
          fetch(https_address, {
              method: 'POST',
              body: bundle
          }).then(response => {
              if (response.ok) {
                success.classList.remove('d-none');
                form.reset();
                document.getElementById('additionalGuests').innerHTML = '';
                  const counter = document.getElementById('counter');
                  let timeLeft = 5;
                  counter.innerText = timeLeft.toString();
                  const countdown = setInterval(() => {
                      timeLeft--;
                      counter.innerText = timeLeft.toString();

                      if (timeLeft < 0) {
                          clearInterval(countdown);
                          counter.innerText = '0'
                          window.location.replace('../en/index.html');

                      }
                  }, 1000);
              }else {
                  error.classList.remove('d-none');
              }
              document.getElementById('loader-popup').classList.add('d-none');
          }).catch(error => {
              document.getElementById('error-popup').classList.remove('d-none');
              document.getElementById('loader-popup').classList.add('d-none');
          });
      }
    }, false);
document.getElementById('error-try-again-btn').addEventListener('click', (e) => {
    form.requestSubmit();
});
