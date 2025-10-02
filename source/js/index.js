
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
document.addEventListener('DOMContentLoaded', function()
{
  const checkout_date_box = document.getElementById('checkout_box');
  const checkout_date_input = document.getElementById('checkout_date');
  const checkin_date_box = document.getElementById('checkin_box');
  const checkin_date_input = document.getElementById('checkin_date');
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  checkout_date_box.addEventListener('click', () => {
    checkout_date_input.showPicker?.();
    checkout_date_input.focus();
  });
  checkin_date_box.addEventListener('click', () => {
    checkin_date_input.showPicker?.();
    checkin_date_input.focus();
  });
  checkout_date_input.min = `${yyyy}-${mm}-${dd}`;
  checkin_date_input.min = `${yyyy}-${mm}-${dd}`;

  fetch(`../locales/${lang}.json`)
    .then(response => response.json())
    .then(data => {
      let posts = data.posts;
      let postIds = [];
      const max = posts.length-1;
      const getUniqueRandom = (ids) =>{
        let num;
        do {
          num = Math.floor(Math.random() * max);
        } while (ids.includes(num));
        return num;
      }
      for(let i = 0; i < 3; i++) {
        postIds.push(getUniqueRandom(postIds));
      }
      let container = document.getElementById('posts-container');
      let index = 0;
      container.querySelectorAll('img').forEach(el => {
        el.src = '../images/' + posts[postIds[index]].main_image;
        el.parentElement.setAttribute('href', '../' + lang + '/post.html?name=' + posts[postIds[index]].title.toLowerCase());
        ++index;
      });
      index = 0;
      container.querySelectorAll('h2 > a').forEach(el => {
        el.setAttribute('href', '../' + lang + '/post.html?name=' + posts[postIds[index]].title.toLowerCase());
        el.insertAdjacentText('beforeend',posts[postIds[index]].title);
        ++index;
      });
      index = 0;
      container.querySelectorAll('span').forEach(el => {
        el.insertAdjacentText('beforeend',posts[postIds[index]].tag);
        ++index;
      });
      index = 0;
      container.querySelectorAll('p').forEach(el => {
        el.insertAdjacentText('beforeend',posts[postIds[index]].paragraphs[0]);
        ++index;
      })
    });
});
const tab_section = document.getElementById('tab-section');
tab_section.querySelectorAll('.tab-menu').forEach(el => {
  el.addEventListener('click', () => {
    tab_section.style.setProperty('background-image', `url('${el.getAttribute('data-image')}')`);
  });
});
const form = document.getElementById('vacancy-check-form');
const children = form.querySelector('#children');
const adults = form.querySelector('#adults');
children.addEventListener('change', (event) => {
  const value = children.value;
  if (value == 1 || value == 2) {
    const options = adults.options;
    for (let i = 0; i < options.length; i++) {
      if (options[i].value != 3) {
        adults.options[i].disabled = false;
        continue;
      }
      adults.options[i].disabled = true;
    }
  } else if (value == 3) {
    const options = adults.options;
    for (let i = 0; i < options.length; i++) {
      if (options[i].value != 1) {
        options[i].disabled = true;
        continue;
      }
      options[i].disabled = false;
    }
  } else {
    const options = adults.options;
    for (let i = 0; i < options.length; i++) {
      adults.options[i].disabled = false;
    }
  }
});
adults.addEventListener('change', (event) => {
  const value = adults.value;
  if (value == 2) {
    const options = children.options;
    for (let i = 0; i < options.length; i++) {
      if (options[i].value != 3) {
        children.options[i].disabled = false;
        continue;
      }
      children.options[i].disabled = true;
    }
  } else if (value == 3) {
    const options = children.options;
    for (let i = 0; i < options.length; i++) {
      if (options[i].value != 0) {
        options[i].disabled = true;
        continue;
      }
      options[i].disabled = false;
    }
  } else {
    const options = children.options;
    for (let i = 0; i < options.length; i++) {
      children.options[i].disabled = false;
    }
  }
});
const formButton = form.querySelector('#vacancy-check-button');
formButton.addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation();

  if (form.checkValidity()) {
    let dateIn = form.querySelector('#checkin_date').value;
    let dateOut = form.querySelector('#checkout_date').value;
    console.log(dateIn);
    console.log(dateOut);
    dateIn = new Date(dateIn);
    dateOut = new Date(dateOut);
    dateIn = new Date(dateIn.getTime() - dateIn.getTimezoneOffset() * 60000);
    dateOut = new Date(dateOut.getTime() - dateOut.getTimezoneOffset() * 60000);

    dateIn = dateIn.toISOString().split('T')[0];
    dateOut = dateOut.toISOString().split('T')[0];

    window.open(`../${lang}/reservation.html?adults=${adults.value}&children=${children.value}&checkin=${dateIn}&checkout=${dateOut}`, '_self');

  } else {
    form.reportValidity();
  }
});

