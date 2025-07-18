const post_body = (position,id,tag,title,short_description,cover_image)=>{
    return `<div class="col-lg-4 col-md-6 col-sm-6 col-12 post" data-aos="fade-up" data-aos-delay="${position*100}">
            <div class="media media-custom d-block mb-4 h-100">
              <a data-post-id="${id}" class="mb-4 d-block post-link"><img src="images/${cover_image}" alt="" class="img-fluid"></a>
              <div class="media-body">
                <span class="meta-post">${tag}</span>
                <h2 class="mt-0 mb-3"><a class="post-link" data-post-id="${id}">${title}</a></h2>
                <p>${short_description}</p>
              </div>
            </div>
          </div>`;
};
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
document.addEventListener("DOMContentLoaded", function() {
    let lang = sessionStorage.getItem("lang");
    if(lang == null){
        lang = "en";
    }
    fetch(`../locales/${lang}.json`)
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
            let first_post = posts[firstId];
            let second_post = posts[secondId];
            let third_post = posts[thirdId];
            let container = document.getElementById('posts-container');
            container.innerHTML += post_body(1,first_post.id,first_post.tag,first_post.title,first_post.summarize,first_post.main_image);
            container.innerHTML += post_body(2,second_post.id,second_post.tag,second_post.title,second_post.summarize,second_post.main_image);
            container.innerHTML += post_body(3,third_post.id,third_post.tag,third_post.title,third_post.summarize,third_post.main_image);
            document.querySelectorAll('.post-link').forEach(el=>{
                el.addEventListener('click', ()=> {
                    let post_id = el.getAttribute('data-post-id');
                    window.open(`../${lang}/post.html?name=` + posts[parseInt(post_id) - 1].title.toLowerCase(), "_self");
                });
            });
        });
});
const tab_section = document.querySelector("#tab-section");
document.querySelectorAll('.tab-menu').forEach(el=>{
    el.addEventListener('click', ()=> {
        tab_section.style.setProperty("background-image", `url('${el.getAttribute('data-image')}')`);
    });
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
document.getElementById('vacancy-check-button').addEventListener('click', function (e) {
  e.preventDefault();
  e.stopPropagation();

  const form = document.getElementById('vacancy-check-form');
  if (form.checkValidity()) {
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

    const url = `https://www.booking.com/hotel/bg/luxury-stays-kapana-plovdiv.html?aid=390156&checkin=${dateIn}&checkout=${dateOut}&group_adults=${adults}&group_children=${children}`;

    // 🔥 iOS-proof link trick
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  } else {
    form.reportValidity();
  }
});




function dateFormatChanger(date){
    date = date.split(' ');
    date[1] = date[1].replace(',', '');
    return new Date(date[2]+'-'+(months.indexOf(date[1])+1)+'-'+date[0]);
}

/*function dateChecker(dateIn,dateOut){
    dateIn = dateIn.split(' ');
    console.log(dateIn);
    console.log(dateOut)
    dateOut = dateOut.split(' ');
    const date1 = dateFormatChanger(dateIn);
    const date2 = dateFormatChanger(dateOut);
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
}*/
function calculateDaysBetween(fromDate, toDate) {
    const [day1, month1, year1] = fromDate.split(' ').map(Number);
    const [day2, month2, year2] = toDate.split(' ').map(Number);

    const firstDate = new Date(year1, month1 - 1, day1); // JS months are 0-based
    const secondDate = new Date(year2, month2 - 1, day2);

    const diffInMs = secondDate - firstDate;

    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    return Math.abs(diffInDays);
}
