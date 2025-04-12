
const form = document.getElementById('registrationForm');
    form.addEventListener('submit', function (event) {
        event.preventDefault()
        event.stopPropagation()
      if (form.checkValidity()) {
          const statusModal = new bootstrap.Modal(document.getElementById('statusModal'));
          document.getElementById('loader-popup').classList.remove('hidden');
          document.getElementById('error-popup').classList.add('hidden');
          document.getElementById('success-popup').classList.add('hidden');
          statusModal.show();
          const nationality = document.querySelector('input[name="nationality"]')?.value;
        const firstName = document.querySelector('input[name="first_name"]')?.value;
          const middleName = document.querySelector('input[name="middle_name"]')?.value;
          const lastName = document.querySelector('input[name="last_name"]')?.value;
          const gender = document.querySelector('input[name="gender"]:checked')?.value;
          const id = document.querySelector('input[name="id"]')?.value;
          const dateOfBirth = document.querySelector('input[id="date_of_birth"]')?.value;
          const documentType = document.querySelector('#document_type').value;
          const documentNumber = document.querySelector('input[name="doc_number"]').value;
          const phone = document.querySelector('input[name="phone"]')?.value;
          const touristPacket = document.querySelector('input[id="tourist_packet"]')?.checked;
          const bundle = JSON.stringify({
              nationality: nationality,
              firstName: firstName,
              middleName: middleName,
              lastName: lastName,
              gender: gender,
              id: id,
              dateOfBirth: dateOfBirth,
              documentType: documentType,
              documentNumber: documentNumber,
              phone: phone,
              touristPacket: touristPacket,
          });
          const https_address = 'https://europe-central2-luxurystayskapanaplovdiv.cloudfunctions.net/registrationRequest'
          fetch(https_address, {
              method: 'POST',
              body: bundle
          }).then(response => {
              if (response.ok) {
                  const popup = document.getElementById('success-popup');
                  popup.classList.remove('hidden');
                  const counter = document.getElementById('counter');
                  let timeLeft = 3;
                  counter.innerText = timeLeft.toString();
                  const countdown = setInterval(() => {
                      timeLeft--;
                      counter.innerText = timeLeft.toString();

                      if (timeLeft < 0) {
                          clearInterval(countdown);
                          counter.innerText = '0'
                          window.location.replace('luxurystays.bg/en/index.html');
                      }
                  }, 1000);
              }else {
                  document.getElementById('title-error').innerText = 'Failed to register!';
                  document.getElementById('message-error').innerText = 'Some data may not be valid!';
                  document.getElementById('error-popup').classList.remove('hidden');
              }
              document.getElementById('loader-popup').classList.add('hidden');
          }).catch(error => {
              document.getElementById('title-error').innerText = 'Something went wrong!';
              document.getElementById('message-error').innerText = 'Please check your internet connection or try again later!';
              document.getElementById('error-popup').classList.remove('hidden');
              document.getElementById('loader-popup').classList.add('hidden');
          });
      }
        form.classList.add('was-validated');
    }, false);

const getDatePickerTitle = elem => {
    // From the label or the aria-label
    const label = elem.nextElementSibling;
    let titleText = '';
    if (label && label.tagName === 'LABEL') {
        titleText = label.textContent;
    } else {
        titleText = elem.getAttribute('aria-label') || '';
    }
    return titleText;
}

const elems = document.querySelectorAll('.datepicker_input');
for (const elem of elems) {
    const datepicker = new Datepicker(elem, {
        'format': 'dd-mm-yyyy',
        title: getDatePickerTitle(elem),
    });
}

document.getElementById('resubmit-btn').addEventListener('click', (e) => {
    form.requestSubmit();
});
