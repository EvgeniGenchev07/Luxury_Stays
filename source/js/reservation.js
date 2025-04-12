document.getElementById("reservation-form").addEventListener("submit", function (event)
{
    event.preventDefault();
    let output = document.getElementById("form-output-global");
    output.classList.remove("error","success");
    this.classList.add('form-in-process');
    output.innerHTML='<p><span class="icon text-middle fa fa-circle-o-notch fa-spin icon-xxs"></span><span>Sending</span></p>';
    output.classList.add("active");
    if(this.checkValidity()) {
        const grecaptcha_response = grecaptcha.getResponse();
        if(grecaptcha_response === "") {
            output.innerHTML = ' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' + 'reCAPTCHA is not verified' + '</span></p>';
            output.classList.add('error');
            setTimeout(() => output.classList.remove("active", "error"), 2000);
        }
        else {
            const https_address = 'https://europe-central2-luxurystayskapanaplovdiv.cloudfunctions.net/reservationRequest'
            let name = document.getElementById('name').value;
            let phone = document.getElementById('phone').value;
            let email = document.getElementById('email').value;
            let message = document.getElementById('message').value;
            let adults = document.getElementById('adults').value;
            let children = document.getElementById('children').value;
            let dateIn = document.getElementById('checkin_date').value;
            let dateOut = document.getElementById('checkout_date').value;
            dateIn = dateFormatChanger(dateIn);
            dateOut = dateFormatChanger(dateOut);
            dateIn = new Date(dateIn.getTime() - dateIn.getTimezoneOffset() * 60000);
            dateOut = new Date(dateOut.getTime() - dateOut.getTimezoneOffset() * 60000);
            dateIn = dateIn.toISOString().split('T')[0];
            dateOut = dateOut.toISOString().split('T')[0];
            const bundle = JSON.stringify(
                {
                    name: name,
                    phone: phone,
                    email: email,
                    dateIn: dateIn,
                    dateOut: dateOut,
                    adults: adults,
                    children: children,
                    message: message,
                    grecaptcha_response: grecaptcha_response,
                });
            fetch(https_address, {
                method: 'POST',
                body: bundle,
            })
                .then((res) => {
                    if(res.ok) {
                        output.innerHTML = ' <p class="snackbars-left"><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + 'Successfully sent!' + '</span></p>';
                        output.classList.add('success');
                        this.reset();
                        setTimeout(() => output.classList.remove("active", "success"), 2000);
                        window.open(`https://www.booking.com/hotel/bg/luxury-stays-kapana-plovdiv.html?aid=390156&label=duc511jc-1FCAsobEIbbHV4dXJ5c3RheXMtaW1wZXJpYWwtc3VpdGVzSDNYA2gXiAEBmAExuAEYyAEP2AEB6AEB-AECiAIBqAIEuAKZvrS_BsACAdICJGEyNzIzY2ZiLTMyOWItNGI2Ni04MjA1LTZlNmZlMjFlZWI3NtgCBeACAQ&sid=572c465057440bc89a55a1e29348ab72&all_sr_blocks=1376798401_409804318_2_0_0_857973&checkin=${dateIn}&checkout=${dateOut}&dest_id=13767984&dest_type=hotel&dist=0&group_adults=${adults}&group_children=${children}&hapos=1&highlighted_blocks=1376798401_409804318_2_0_0_857973&hpos=1&matching_block_id=1376798401_409804318_2_0_0_857973&no_rooms=1&req_adults=${adults}&req_children=${children}&room1=A%2CA&sb_price_type=total&sr_order=popularity&sr_pri_blocks=1376798401_409804318_2_0_0_857973_17157&srepoch=1743593322&srpvid=b99e50b58c8803cb&type=total&ucfs=1&`, '_blank');
                    }
                    else{
                        output.innerHTML = ' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' + 'reCAPTCHA is not verified' + '</span></p>';
                        output.classList.add('error');
                        setTimeout(() => output.classList.remove("active", "error"), 2000);
                    }
                })
                .catch(() => {
                    output.innerHTML = ' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' + 'Aw, snap! Something went wrong.' + '</span></p>';
                    output.classList.add('error');
                    setTimeout(() => output.classList.remove("active", "error"), 2000);
                })
        }
    }
    else{
        output.innerHTML = ' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' + 'Please, enter correct data.' + '</span></p>';
        output.classList.add('error');
        setTimeout(() => output.classList.remove("active","error"), 2000);
    }
});
document.getElementById('children').addEventListener('change',(event)=>{
    const adults = document.querySelector('#adults');
    const value = document.getElementById('children').value
    if(value == 1|| value == 2){
        const options = adults.options;
        for(let i=0; i<options.length; i++){
            if(options[i].value != 3){
                adults.options[i].disabled = false;
                continue;
            }
            adults.options[i].disabled = true;
        }
    }
    else if(value == 3){
        const options = adults.options;
        for(let i=0; i<options.length; i++){
            if(options[i].value != 1){
                options[i].disabled = true;
                continue;
            }
            options[i].disabled = false;
        }
    }
    else{
        const options = adults.options;
        for(let i=0; i<options.length; i++){
            adults.options[i].disabled = false;
        }
    }
})
document.getElementById('adults').addEventListener('change',(event)=>{
    const children = document.querySelector('#children');
    const value = document.getElementById('adults').value
    if(value == 2){
        const options = children.options;
        for(let i=0; i<options.length; i++){
            if(options[i].value != 3){
                children.options[i].disabled = false;
                continue;
            }
            children.options[i].disabled = true;
        }
    }
    else if(value == 3){
        const options = children.options;
        for(let i=0; i<options.length; i++){
            if(options[i].value != 0){
                options[i].disabled = true;
                continue;
            }
            options[i].disabled = false;
        }
    }
    else{
        const options = children.options;
        for(let i=0; i<options.length; i++){
            children.options[i].disabled = false;
        }
    }
})

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
function dateFormatChanger(date){
    date = date.split(' ');
    date[1] = date[1].replace(',', '');
    return new Date(date[2]+'-'+(months.indexOf(date[1])+1)+'-'+date[0]);
}
