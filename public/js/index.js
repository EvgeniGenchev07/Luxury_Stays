const randomPosts = (firstId,secondId,thirdId,posts)=>{
    return `<div class="col-lg-4 col-md-6">
            <div class="blog-item blog-item-sm">
              <div class="blog-item-image">
                <a class="post_link_1">
                  <img src="${posts[firstId].main_image}" alt="Image">
                </a>
              </div>
              <div class="blog-item-info">
                <span class="fs-6 has-line">${posts[firstId].tag}</span>
                <h5><a class="post_link_1">${posts[firstId].title}</a></h5>
                <div class="blog-item-info-release">
                </div>
                <a class="btn btn-link post_link_1">Read Article
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none"
                       xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 1.5L17 6M17 6L12.5 10.5M17 6H1" stroke="currentColor"
                          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div class="col-lg-4 my-4 my-md-0 my-lg-0 col-md-6">
            <div class="blog-item blog-item-sm">
              <div class="blog-item-image">
                <a class="post_link_2">
                  <img src="${posts[secondId].main_image}" alt="Image">
                </a>
              </div>
              <div class="blog-item-info">
                <span class="fs-6 has-line">${posts[secondId].tag}</span>
                <h5><a class="post_link_2">${posts[secondId].title}</a></h5>
                <div class="blog-item-info-release">
                </div>
                <a class="btn btn-link post_link_2">Read Article
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none"
                       xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 1.5L17 6M17 6L12.5 10.5M17 6H1" stroke="currentColor"
                          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div class="col-lg-4 mt-0 mt-md-4 mt-lg-0 col-md-6">
            <div class="blog-item blog-item-sm">
              <div class="blog-item-image">
                <a class="post_link_3">
                  <img src="${posts[thirdId].main_image}" alt="Image">
                </a>
              </div>
              <div class="blog-item-info">
                <span class="fs-6 has-line">${posts[thirdId].tag}</span>
                <h5><a class="post_link_3">${posts[thirdId].title}</a></h5>
                <div class="blog-item-info-release">
                </div>
                <a class="btn btn-link post_link_3">Read Article
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none"
                       xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 1.5L17 6M17 6L12.5 10.5M17 6H1" stroke="currentColor"
                          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>`;
}
fetch('../blog.post.json')
    .then(response => response.json())
    .then(data => {
        let posts = data.posts;
        let firstId = Math.floor(Math.random() * 9);
        let secondId = 0;
        let thirdId = 0;
        while (true) {
            let num = Math.floor(Math.random() * 9);
            if (num != firstId) {
                secondId = num;
                break;
            }
        }
        while (true) {
            let num = Math.floor(Math.random() * 9);
            if (num != firstId && num != secondId) {
                thirdId = num;
                break;
            }
        }
        document.getElementById('posts').innerHTML = randomPosts(firstId, secondId, thirdId,posts);
        document.querySelectorAll(".post_link_1").forEach((link)=>
        {
            link.onclick = () => {
                localStorage.setItem("postId", (firstId+1).toString());
                window.open("blog-post.html", "_self");
            }
        });
        document.querySelectorAll(".post_link_2").forEach((link)=>
        {
            link.onclick = () => {
                localStorage.setItem("postId", (secondId+1).toString());
                window.open("blog-post.html", "_self");
            }
        });
        document.querySelectorAll(".post_link_3").forEach((link)=>
        {
            link.onclick = () => {
                localStorage.setItem("postId", (thirdId+1).toString());
                window.open("blog-post.html", "_self");
            }
        });
    });
localStorage.setItem('verified',JSON.stringify({value: false}))
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
document.getElementById('bookingForm').addEventListener('submit',function(event){
    event.preventDefault();
    const grecaptcha_response = grecaptcha.getResponse();
    if(grecaptcha_response === "") return;
    else {
        localStorage.setItem('verified',JSON.stringify({value: true}));
        const email = document.getElementById('contact-email').value;
        const dateIn = document.getElementById('date-in').value;
        const dateOut = document.getElementById('date-out').value;
        const adults = document.getElementById('adults').value;
        const children = document.getElementById('children').value;
        const totalDaysAndNights = DaysAndNightsCalculation(dateIn, dateOut);
        let output = document.getElementById("form-output-global");
        output.classList.remove("error", "success");
        this.classList.add('form-in-process');
        output.innerHTML = '<p><span class="icon text-middle fa fa-circle-o-notch fa-spin icon-xxs"></span><span>Sending</span></p>';
        output.classList.add("active");
        console.log(totalDaysAndNights[0]);
        console.log(totalDaysAndNights[1]);
        if (this.checkValidity() && dateChecker(dateIn, dateOut)) {
            const https_address = 'https://europe-central2-luxurystayskapanaplovdiv.cloudfunctions.net/bookRequest'
            fetch(https_address, {
                method: 'POST',
                body:
                    JSON.stringify(
                        {
                            email: email,
                            dateIn: dateIn,
                            dateOut: dateOut,
                            adults: adults,
                            children: children,
                            totalDays: totalDaysAndNights[0],
                            totalNights: totalDaysAndNights[1],
                            grecaptcha_response: grecaptcha_response,
                        })
            })
                .then(response => response.json())
                .then(data => {
                    if(data.verified) {
                        output.innerHTML = ' <p class="snackbars-left"><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + 'Successfully complieted!' + '</span></p>';
                        output.classList.add('success');
                        this.reset();
                        setTimeout(() => output.classList.remove("active", "success"), 2000);
                        if (data.vacant) {
                            localStorage.setItem("data", JSON.stringify({
                                id: data.id,
                                email: email,
                                dateIn: dateIn,
                                dateOut: dateOut,
                                adults: adults,
                                children: children,
                                totalDays: totalDaysAndNights[0],
                                totalNights: totalDaysAndNights[1],
                            }));
                            window.open("payment.html", "_self");
                        } else {
                            localStorage.setItem("email", email);
                            window.open("fully-booked.html", "_self");
                        }
                    }
                    else{
                        output.innerHTML = ' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' + 'reCAPTCHA is not verified' + '</span></p>';
                        output.classList.add('error');
                        setTimeout(() => output.classList.remove("active", "error"), 2000);
                    }
                })
                .catch(() => {
                    output.innerHTML = ' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' + 'Aw, snap! Something went wrong.' + '</span></p>';
                    output.classList.add("error");
                    setTimeout(() => output.classList.remove("active", "error"), 2000);
                })
        } else {
            output.innerHTML = ' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' + 'Please, enter correct data.' + '</span></p>';
            output.classList.add("error");
            setTimeout(() => output.classList.remove("active", "error"), 2000);
        }
    }
});
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
function dateChecker(dateIn,dateOut){
        dateIn = dateIn.split(' ');
        console.log(dateIn);
        console.log(dateOut)
        dateOut = dateOut.split(' ');
        const date1 = new Date(dateIn[3]+'-'+(months.indexOf(dateIn[2])+1)+'-'+dateIn[1]);
        const date2 = new Date(dateOut[3]+'-'+(months.indexOf(dateOut[2])+1)+'-'+dateOut[1]);
        return date1 < date2;
}
function  DaysAndNightsCalculation(dateIn,dateOut){
    dateIn = dateIn.split(' ');
    console.log(dateIn);
    console.log(dateOut)
    dateOut = dateOut.split(' ');
    const fromDate = dateIn[1]+' '+(months.indexOf(dateIn[2])+1)+' '+dateIn[3]; // day-month-year
    const toDate = dateOut[1]+' '+(months.indexOf(dateOut[2])+1)+' '+dateOut[3]; // day-month-year
    const nights = calculateDaysBetween(fromDate, toDate);
    const days = nights+1;
    console.log(`Number of days between ${fromDate} and ${toDate}:`, nights);
    console.log(nights)
    console.log(days)
    return [days, nights];
}
function calculateDaysBetween(fromDate, toDate) {
    // Parse the day-month-year format into Date objects
    const [day1, month1, year1] = fromDate.split(' ').map(Number);
    const [day2, month2, year2] = toDate.split(' ').map(Number);

    const firstDate = new Date(year1, month1 - 1, day1); // JS months are 0-based
    const secondDate = new Date(year2, month2 - 1, day2);

    // Calculate the difference in time (milliseconds)
    const diffInMs = secondDate - firstDate;

    // Convert milliseconds to days
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    return Math.abs(diffInDays); // Return the absolute value to avoid negatives
}
