
const verified = localStorage.getItem('verified');

if(verified!==null && JSON.parse(verified).value) {
    window.addEventListener('beforeunload', (event) => {
        RedirectToHome();
    })
    setTimeout(() => {
        RedirectToHome();
    }, 3600000); // 3600000 => 1 hour
}
else{
    setNotVerified();
}

const steps = document.querySelectorAll(".step");
const progressLine = document.querySelector(".progress-line");
const nextButton = document.querySelector(".next");
const cancelButton = document.querySelector(".cancel");
const stripe = Stripe("pk_live_51QKkDvG0ZquPZmE5PopBNbBkvy3zck19VtGmwLH6e8AolS2KRNaRsOclOgn5hPQtIW0MgHOsJGTFnvvEUFG4b9K700iy2x4QHh");
let elements;
LoadBookingInformation();
let currentStep = 0;
let lastStep = 0;
function updateProgressLine() {
    const progressPercentage = (currentStep / (steps.length - 1)) * 100;
    progressLine.style.width = `${progressPercentage}%`;
}

nextButton.addEventListener("click", async () => {
    let stepChanged = false;
    if(currentStep === 1){
        if(GetClientInformation()) {
            stepChanged = true;
            NextStep();
        }
    }
    else if(currentStep === 2)
    {
        await handleSubmit().then(result => {
            console.log(result);
            if(result)
            {
                cancelButton.classList.add("hidden");
                nextButton.textContent = "Finish";
                stepChanged = true;
                NextStep();
            }
        });

    }
    else if(currentStep === 3)
    {
        location.replace('index.html');
    }
    else{
        stepChanged = true;
        NextStep();
    }
    if(stepChanged) {
        if (currentStep === 1) {
            if(lastStep === 0)
            {
                lastStep = 1;
                LoadContactForm();
            }
            else{
                LoadContactFormWithSavedData();
            }
            cancelButton.textContent = "Back";
        } else if (currentStep === 2) {
            lastStep = 2;
            LoadPaymentForm();
            nextButton.textContent = "Pay";
            OnPayment();
        }
    }
});

function NextStep()
{
    if (currentStep < steps.length - 1) {
        steps[currentStep].classList.add("completed");
        steps[currentStep].classList.remove("active");
        currentStep++;
        steps[currentStep].classList.add("active");
        updateProgressLine();
    }
}

cancelButton.addEventListener("click", () => {
    if(currentStep === 2)
    {
        LoadContactFormWithSavedData();
    }
    else if (currentStep === 1)
    {
        LoadBookingInformation();
        cancelButton.textContent = "Cancel";
    }
    else if (currentStep === 0)
    {
        RedirectToHome();
    }
    if (currentStep > 0) {
        steps[currentStep].classList.remove("active");
        steps[currentStep - 1].classList.remove("completed");
        currentStep--;
        steps[currentStep].classList.add("active");
        updateProgressLine();
    }
});


function setNotVerified(){
    document.querySelector('#steps-container').style.display = 'none';
    document.querySelector('#session_expire_body').style.display = 'flex';
}

async function RedirectToHome(){
    let data = localStorage.getItem("data");
    data = JSON.parse(data);
    await fetch('https://europe-central2-luxurystayskapanaplovdiv.cloudfunctions.net/onBookingTermination', {
        method: "POST",
        body: JSON.stringify({
            id: data.id,
        })
    }).then((response) => {
        location.replace('index.html');
        localStorage.removeItem('data')
        localStorage.removeItem('verified');
        localStorage.removeItem('paymentId');
        localStorage.removeItem('clientInformation');
    }).catch((error) => {
        console.log(error);
    })
}

function OnPayment()
{
    initialize();
}
// Fetches a payment intent and captures the client secret
async function initialize() {
    setLoading(true);
    let data = localStorage.getItem("data");
    data = JSON.parse(data);
    fetch('https://europe-central2-luxurystayskapanaplovdiv.cloudfunctions.net/createPaymentIntent', {
        method: "POST",
        body: JSON.stringify({
            totalNights: data.totalNights,
        }),
    })
        .then(response=> response.json())
        .then(data => {
            const {clientSecret,paymentId, dpmCheckerLink} = data;
            console.log(paymentId);
            localStorage.setItem('paymentId',paymentId);
            const appearance = {
                theme: 'flat',
            };
            elements = stripe.elements({appearance, clientSecret});

            const paymentElementOptions = {
                layout: "tabs",
            };
            const paymentElement = elements.create("payment", paymentElementOptions);

            paymentElement.mount("#payment-element");
        });
    setLoading(false);
}

async function handleSubmit() {
    setLoading(true);
        const {error} = await stripe.confirmPayment({
            elements,
            confirmParams: {

            },
            redirect: 'if_required',
        });

        if (error) {
            setLoading(false);
            console.log(error.message);
            return false;
        } else {
            let data = localStorage.getItem("data");
            data = JSON.parse(data);
            let clientInformation = localStorage.getItem("clientInformation");
            clientInformation = JSON.parse(clientInformation);
            let paymentId = localStorage.getItem("paymentId");
            await fetch('https://europe-central2-luxurystayskapanaplovdiv.cloudfunctions.net/saveBooking', {
                method: "POST",
                body: JSON.stringify({
                    id: data.id,
                    first_name: clientInformation.first_name,
                    last_name: clientInformation.last_name,
                    email: clientInformation.email,
                    phone: clientInformation.phone,
                    paymentId: paymentId,
                    dateIn: data.dateIn,
                    dateOut: data.dateOut,
                    totalNights: data.totalNights,
                    totalDays: data.totalDays,
                    adults: data.adults,
                    children: data.children,
                }),
            }).then(res =>
            {
                localStorage.removeItem("data");
                localStorage.removeItem("clientInformation");
                localStorage.removeItem('verified');
                localStorage.removeItem("paymentId");
                document.querySelector("#success").classList.remove('hidden')
            })
                .catch(err => document.querySelector("#failure").classList.remove('hidden'));
            setLoading(false);
            return true;
        }
}

function setLoading(isLoading) {
    if (isLoading) {
        // Disable the button and show a spinner
        document.querySelector("#spinner").classList.remove("hidden");
    } else {
        document.querySelector("#spinner").classList.add("hidden");
    }
}
function LoadContactFormWithSavedData(){
    LoadContactForm();
    let clientInformation = localStorage.getItem("clientInformation");
    clientInformation = JSON.parse(clientInformation);
    document.querySelector("#first-name-1").value = clientInformation.first_name;
    document.querySelector('#last-name-1').value = clientInformation.last_name;
    document.querySelector('#email').value = clientInformation.email;
    document.querySelector('#phone').value = clientInformation.phone;
}
function GetClientInformation() {
        const firstName = document.querySelector('#first-name-1').value;
        const lastName = document.querySelector('#last-name-1').value;
        const email = document.querySelector('#email').value;
        const phone = document.querySelector('#phone').value;
        const form = document.querySelector('#contactForm');
        if(form.reportValidity()) {
            localStorage.setItem('clientInformation', JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phone,
            }));
            return true;
        }
        return false;
}
function LoadContactForm(){
    document.querySelector("#step-heading").innerText = "Contact information";
    document.querySelector("#step-description").innerHTML=`<div class="inner">
                <form method="post" id="contactForm">
                  <div class="form-row">
                    <div class="form-holder">
                      <label class="form-row-inner">
                        <input type="text" class="form-control" id="first-name-1" name="first-name-1" required>
                        <span class="label">First Name</span>
                        <span class="border"></span>
                      </label>
                    </div>
                    <div class="form-holder">
                      <label class="form-row-inner">
                        <input type="text" class="form-control" id="last-name-1" name="last-name-1" required>
                        <span class="label">Last Name</span>
                        <span class="border"></span>
                      </label>
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-holder form-holder-2">
                      <label class="form-row-inner">
                        <input type="email" class="form-control" id="email" name="email" required>
                        <span class="label">Email</span>
                        <span class="border"></span>
                      </label>
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-holder form-holder-2">
                      <label class="form-row-inner">
                        <input type="tel" class="form-control" id="phone" name="phone" required>
                        <span class="label">Phone</span>
                        <span class="border"></span>
                      </label>
                    </div>
                  </div>
                </form>
              </div>`;
}
function LoadBookingInformation(){
    let data = localStorage.getItem("data");
    data = JSON.parse(data);
    document.querySelector("#step-heading").textContent="Booking";
    document.querySelector("#step-description").innerHTML = `<div class="inner">
<div class="booking-description">
<p>You are about to book the apartment from ${data.dateIn} to ${data.dateOut} for ${data.adults==1?data.adults+ ' adult':data.adults+' adults'}${data.children==0?'':data.children==1?' and '+data.children+' child':' and '+data.children+' children'}.</p>
<p>Summary Days: ${data.totalDays}, Nights: ${data.totalNights}</p>
</div>
</div>`;
}
function LoadPaymentForm(){
    document.querySelector("#step-heading").innerText = "Payment";
    document.querySelector("#step-description").innerHTML=`<form id="paymentForm">
                <div id="payment-element">
                  <!--Stripe.js injects the Payment Element-->
                </div>
                  <div class="spinner hidden" id="spinner"></div>
                <div id="payment-message" class="hidden"></div>
              </form>`;
}
