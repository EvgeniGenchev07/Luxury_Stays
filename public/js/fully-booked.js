document.getElementById('information').innerText = `
We're sorry, but all available slots have been booked. Please be patient or select another date. We will send you an email at ${localStorage.getItem('email')??'\'not specified\''} if there is an available slot for these dates.`;
document.querySelector('#contact-button').addEventListener('click', ()=>{
    localStorage.removeItem('email');
    location.replace('contacts.html');
});
document.querySelector('#home-button').addEventListener('click', ()=>{
    localStorage.removeItem('email');
    location.replace('index.html');
});