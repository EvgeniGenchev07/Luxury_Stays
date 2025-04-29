let personCount = 0;
let guests = [];
/*<div class="form-group">
                      <input type="date" class="form-control" id="checkInDate-${personCount}" name="checkInDate[]" required>
                      <label for="checkInDate-${personCount}" class="floating-label">Date of Check-in</label>
                  </div>
                  <div class="form-group">
                      <input type="date" class="form-control" id="checkOutDate-${personCount}" name="checkOutDate[]" required>
                      <label for="checkOutDate-${personCount}" class="floating-label">Date of Check-out</label>
                  </div>*/
// Function to add a new person form
function addPerson() {
  personCount++;
  const personForm = `
                <div class="person-form" id="person-${personCount}">
                    <h5 class="text-center">Guest</h5>
                    <div class="form-group">
                        <input type="text" class="form-control" id="nationality-${personCount}" name="nationality[]" placeholder=" " required>
                        <label for="nationality-${personCount}" class="floating-label">Citizenship</label>
                    </div>
                    <div class="form-group">
                        <input type="text" class="form-control" id="firstName-${personCount}" name="firstName[]" placeholder=" " required>
                        <label for="firstName-${personCount}" class="floating-label">First Name</label>
                    </div>
                    <div class="form-group">
                        <input type="text" class="form-control" id="middleName-${personCount}" name="middleName[]" placeholder=" ">
                        <label for="middleName-${personCount}" class="floating-label">Middle Name</label>
                    </div>
                    <div class="form-group">
                        <input type="text" class="form-control" id="lastName-${personCount}" name="lastName[]" placeholder=" " required>
                        <label for="lastName-${personCount}" class="floating-label">Last Name</label>
                    </div>
                    <div class="form-group">
                        <select class="form-control" id="gender-${personCount}" name="gender[]" required>
                            <option value="" disabled selected hidden>Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <input type="number" class="form-control" id="id-${personCount}" name="id[]" placeholder=" " required>
                        <label for="id-${personCount}" class="floating-label">Unified Civil Number</label>
                    </div>
                    <div class="form-group">
                        <input type="date" class="form-control" id="dateOfBirth-${personCount}" name="dateOfBirth[]" required>
                        <label for="dateOfBirth-${personCount}" class="floating-label">Date of Birth</label>
                    </div>
                    <div class="form-group">
                        <select class="form-control"  id="documentType-${personCount}" name="documentType[]" required>
                            <option value="" disabled selected hidden>Select a Document</option>
                            <option value="passport">Passport</option>
                            <option value="id_card">National ID Card</option>
                            <option value="driver_license">Driver’s License</option>
                        </select>
                        <label for="documentType-${personCount}" class="floating-label">Document Type</label>
                    </div>
                    <div class="form-group">
                        <input type="number" class="form-control" id="documentNumber-${personCount}" name="documentNumber[]" placeholder=" " required>
                        <label for="documentNumber-${personCount}" class="floating-label">Document Number</label>
                    </div>

                    <div class="form-check mt-3">
    <input class="form-check-input" type="checkbox" id="touristPacket-${personCount}" name="touristPacket[]" value="yes">
    <label class="form-check-label" for="touristPacket-${personCount}">
        Tourist Packet
    </label>
</div>

                   <div class="d-flex justify-content-center mt-1">
    <button type="button" class="btn btn-remove-person" onclick="removePerson(${personCount})">
        Remove Guest
    </button>
</div>
</div>
            `;
  document.getElementById('people-forms').insertAdjacentHTML('beforeend',personForm);
}
//initialize the first guest
addPerson();
guests.push(personCount);
function removePerson(personId) {
  document.getElementById(`person-${personId}`).remove();
}
document.getElementById('add-person-btn').addEventListener('click', (e) => {
  addPerson();
});
const params = new URLSearchParams(window.location.search);

const propertyName = params.get('p');
const checkInDate = params.get('chi');
const checkOutDate = params.get('cho');
const channelManager = params.get('chm');

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
        const people = [];
        const personForms = document.querySelectorAll('.person-form');

        personForms.forEach((form, index) => {
          const person = {
            nationality: form.querySelector(`[name="nationality[]"]`)?.value || '',
            firstName: form.querySelector(`[name="firstName[]"]`)?.value || '',
            middleName: form.querySelector(`[name="middleName[]"]`)?.value || '',
            lastName: form.querySelector(`[name="lastName[]"]`)?.value || '',
            gender: form.querySelector(`[name="gender[]"]`)?.value || '',
            id: form.querySelector(`[name="id[]"]`)?.value || '',
            dateOfBirth: form.querySelector(`[name="dateOfBirth[]"]`)?.value || '',
            documentType: form.querySelector(`[name="documentType[]"]`)?.value || '',
            documentNumber: form.querySelector(`[name="documentNumber[]"]`)?.value || '',
            phone: form.querySelector(`[name="phone[]"]`)?.value || '',
            touristPacket: form.querySelector(`[name="touristPacket[]"]`)?.checked || false
          };
          people.push(person);
        });
        const email = document.getElementById('email').value;
          const bundle = JSON.stringify({
            propertyName: propertyName,
            channelManager: channelManager,
            checkInDate: convertDate(checkInDate),
            checkOutDate: convertDate(checkOutDate),
            email: email,
            guests: people
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
                          window.location.replace('../en/index.html');

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
    }, false);

function convertDate(dateString) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

document.getElementById('resubmit-btn').addEventListener('click', (e) => {
    form.requestSubmit();
});
