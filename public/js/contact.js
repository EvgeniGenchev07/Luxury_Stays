function sendContactInfo()
{
    const https_address = 'https://europe-central2-luxurystayskapanaplovdiv.cloudfunctions.net/sendMail'
    let subject = document.getElementById('contact-subject').value;
    let name = document.getElementById('contact-name').value;
    let email = document.getElementById('contact-email').value;
    let message = document.getElementById('contact-message').value;
    fetch(https_address,{
        method: 'POST',
            body:
                JSON.stringify(
                    {
                        name: name,
                        email: email,
                        subject: subject,
                        message:message
                    })
    })
        .then(response =>console.log(response.json()))
}