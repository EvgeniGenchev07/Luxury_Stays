const isBG = window.location.pathname.includes('/bg');
const lang = isBG ? 'bg' : 'en';
document.addEventListener('DOMContentLoaded', function() {
  const langButtonsContainer = document.querySelector('#lang_button_container');
  langButtonsContainer.querySelector('#' + lang).classList.add("preferred");
  langButtonsContainer.querySelectorAll('.btn-lang').forEach(el => {
    el.addEventListener('click', () => {
      console.log(el.id);
      if (el.id !== lang) {
        langButtonsContainer.querySelector('.preferred').classList.remove("preferred");
        el.classList.add("preferred");
        if (window.location.pathname === '/' || window.location.pathname.length === 0) window.location.replace(window.location.pathname.replace('/', '/' + el.id));
        else window.location.replace(window.location.pathname.replace('/' + lang, '/' + el.id));
      }
    });
  });

  const form = document.getElementById('newsletter-form');
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      form.reset();
    });
  }

  document.querySelector('.site-menu-toggle').addEventListener('click', function() {
    const body = document.body;
    const navbar = document.querySelector('.js-site-navbar');

    if (body.classList.contains('menu-open')) {
      this.classList.remove('open');
      navbar.style.transition = 'opacity 0.4s ease';
      navbar.style.opacity = '0';
      setTimeout(() => {
        navbar.style.display = 'none';
      }, 400);
      body.classList.remove('menu-open');
    } else {
      this.classList.add('open');
      navbar.style.display = 'block';
      navbar.style.opacity = '0';
      setTimeout(() => {
        navbar.style.transition = 'opacity 0.4s ease';
        navbar.style.opacity = '1';
      }, 10);
      body.classList.add('menu-open');
    }
  });
  AOS.init({
    duration: 1000
  });

  document.querySelectorAll('a.smoothscroll[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  window.addEventListener('scroll', function() {
    const header = document.querySelector('.js-site-header');
    if (!header) return;
    if (window.scrollY > 200) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });


  var emblaGalleryNode = document.querySelector('.embla-gallery__viewport');

  if(emblaGalleryNode) {
    var emblaGallery = EmblaCarousel(emblaGalleryNode, { loop: true, dragFree: true });
    document.querySelector('.embla-gallery__prev').addEventListener('click', emblaGallery.scrollPrev, false);
    document.querySelector('.embla-gallery__next').addEventListener('click', emblaGallery.scrollNext, false);
  }
  var emblaTestimonialNode = document.querySelector('.embla-testimonial__viewport');

  if(emblaTestimonialNode) {
    var emblaTestimonial = EmblaCarousel(emblaTestimonialNode, { loop: true, dragFree: true });
    document.querySelector('.embla-testimonial__prev').addEventListener('click', emblaTestimonial.scrollPrev, false);
    document.querySelector('.embla-testimonial__next').addEventListener('click', emblaTestimonial.scrollNext, false);
  }
});

function initParallax() {
  if (window.innerWidth <= 768) return; // disable on mobile

  const parallaxEls = document.querySelectorAll(".parallax");

  function updateParallax() {
    const scrollY = window.scrollY;
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0.5;
      el.style.backgroundPositionY = `${scrollY * speed}px`;
    });
    requestAnimationFrame(updateParallax);
  }

  requestAnimationFrame(updateParallax);
}

initParallax();

window.addEventListener("resize", () => {
  initParallax();
});