$(function(){
    var form = $("#form-total");
    form.steps({
        headerTag: "h2",
        bodyTag: "section",
        transitionEffect: "fade",
        autoFocus: true,
        enableAllSteps: false,
        enableKeyNavigation: false,
        enablePagination: true,
        suppressPaginationOnFocus: true,
        transitionEffectSpeed: 500,
        saveState: true,
        enableCancelButton: true,
        titleTemplate: '<div class="title">#title#</div>',
        labels: {
            cancel: 'Cancel',
            previous: 'Back',
            next: 'Next',
            finish: 'Submit',
            current: ''
        },
        onStepChanging: function (event, currentIndex, newIndex) {
            if (currentIndex == 1) {

            }
            return true;
        },
        onStepChanged: function (event, currentIndex, priorIndex) {
            if (currentIndex == 2) {
                $('#paymentForm').submit(handleSubmit);
            }
            OnPayment();
        },
        onFinished: function (event, currentIndex){
            RedirectToHome();
        },
        onCanceled: function (event) {
            window.open('index.html','_self');
        },
        onInit: function (event, currentIndex) {
            let cancelButton = $(".actions a[href='#cancel']").parent().detach().on("click", function (event) {
                RedirectToHome();
            });
            let customButtonContainer = $('<ul class="actions" id="cancelButtonCustom"></ul>');
            customButtonContainer.append(cancelButton);
            form.prepend(customButtonContainer);
        },
        });
});
function RedirectToHome(){
    window.open('index.html','_self');
    history.pushState(null, "", window.location.href);
}
function SendClientInformation(){
    let firstName = $('#first-name-1').value;
    let lastName = $('#last-name-1').value;
    let email = $('#email-name-1').value;
    let phone = $('#phone-name-1').value;
    const https_address = 'https://europe-central2-luxurystayskapanaplovdiv.cloudfunctions.net/saveContactData'
    fetch(https_address,{
        method: 'POST',
        body:
            JSON.stringify(
                {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    phone: phone,
                })
    })
        .then(response =>console.log(response.json()))
}
document.getElementById('first_step_information').innerText =
    "You are about to reserve the apartment for the period from 12.11.2024 to 21.11.2024";
let elements;
const stripe = Stripe("pk_test_51QKkDvG0ZquPZmE5y8X2XSnFGPAf395jTRuwetf3DKshaZ6ZpdeqnDK82GJVeMBTxmFXVmNl0vNPHF6O2gnQ1m3o00NgC9bDZy");

function OnPayment()
{
    initialize();
}
// Fetches a payment intent and captures the client secret
async function initialize() {
    fetch('https://europe-central2-luxurystayskapanaplovdiv.cloudfunctions.net/createPaymentIntent', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "xl-tshirt", amount: 1000 }),
    })
        .then(response=> response.json())
        .then(data => {
            const {clientSecret, dpmCheckerLink} = data;
            console.log(dpmCheckerLink)
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
}

async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
            // Make sure to change this to your payment completion page
            //return_url: "http://localhost:4242/complete.html",
        },
    });
    if (error.type === "card_error" || error.type === "validation_error") {
        showMessage(error.message);
    } else {
        showMessage("An unexpected error occurred.");
    }
    setLoading(false);
}

// ------- UI helpers -------

function showMessage(messageText) {
    const messageContainer = document.querySelector("#payment-message");

    messageContainer.classList.remove("hidden");
    messageContainer.innerText = messageText;

    setTimeout(function () {
        messageContainer.classList.add("hidden");
        messageContainer.textContent = "";
    }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
    if (isLoading) {
        // Disable the button and show a spinner
        document.querySelector("#submit").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        document.querySelector("#button-text").classList.add("hidden");
    } else {
        document.querySelector("#submit").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        document.querySelector("#button-text").classList.remove("hidden");
    }
}
