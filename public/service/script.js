
const form = document.getElementById('registrationForm');
    form.addEventListener('submit', function (event) {
        event.preventDefault()
        event.stopPropagation()
      if (form.checkValidity()) {
          const nationality = document.querySelector('input[name="nationality"]:checked')?.value;
        const firstName = document.querySelector('input[name="first_name"]')?.value;
          const middleName = document.querySelector('input[name="middle_name"]')?.value;
          const lastName = document.querySelector('input[name="last_name"]')?.value;
          const gender = document.querySelector('input[name="gender"]:checked')?.value;
          const id = document.querySelector('input[name="id"]')?.value;
          const dateOfBirth = document.querySelector('input[id="date_of_birth"]')?.value;
          const documentType = document.querySelector('#document_type').value;
          const documentNumber = document.querySelector('input[name="doc_number"]').value;
          const dateOfArrival = document.querySelector('input[id="date_of_arrival"]')?.value;
          const dateOfDeparture = document.querySelector('input[id="date_of_departure"]')?.value;
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
              dateOfArrival: dateOfArrival,
              dateOfDeparture: dateOfDeparture,
              touristPacket: touristPacket,
          });
          const https_address = 'https://europe-central2-luxurystayskapanaplovdiv.cloudfunctions.net/registrationRequest'
          fetch(https_address, {
              method: 'POST',
              body: bundle
          }).then(response => {
              if (response.ok) {
                  alert("Successfully registered");
              }else {
                  alert("Failed to register");
              }
          }).catch(error => {
              alert("Something went wrong");
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
