const isBG = window.location.pathname.includes('/bg');
const lang = isBG ? 'bg' : 'en';
const langButtonsContainer = document.querySelector('#lang_button_container');
langButtonsContainer.querySelector('#'+lang).classList.add("preferred");
langButtonsContainer.querySelectorAll('.btn-lang').forEach(el=>{
    el.addEventListener('click', ()=> {
      console.log(el.id);
      if(el.id !== lang) {
        langButtonsContainer.querySelector('.preferred').classList.remove("preferred");
        el.classList.add("preferred");
        if(window.location.pathname === '/' || window.location.pathname.length === 0) window.location.replace(window.location.pathname.replace('/', '/' + el.id));
        else window.location.replace( window.location.pathname.replace('/' + lang, '/' + el.id));
      }
    });
});

(function($) {

	'use strict';

  $('.site-menu-toggle').click(function(){
    var $this = $(this);
    if ( $('body').hasClass('menu-open') ) {
      $this.removeClass('open');
      $('.js-site-navbar').fadeOut(400);
      $('body').removeClass('menu-open');
    } else {
      $this.addClass('open');
      $('.js-site-navbar').fadeIn(400);
      $('body').addClass('menu-open');
    }
  });


	$('nav .dropdown').hover(function(){
		var $this = $(this);
		$this.addClass('show');
		$this.find('> a').attr('aria-expanded', true);
		$this.find('.dropdown-menu').addClass('show');
	}, function(){
		var $this = $(this);
			$this.removeClass('show');
			$this.find('> a').attr('aria-expanded', false);
			$this.find('.dropdown-menu').removeClass('show');
	});



	$('#dropdown04').on('show.bs.dropdown', function () {
	  console.log('show');
	});

  // aos
  AOS.init({
    duration: 1000
  });

	// home slider
  if ($.fn.owlCarousel) {
	$('.home-slider').owlCarousel({
    loop:true,
    autoplay: true,
    margin:10,
    animateOut: 'fadeOut',
    animateIn: 'fadeIn',
    nav:true,
    autoplayHoverPause: true,
    items: 1,
    autoHeight: true,
    navText : ["<span class='fa-solid fa-chevron-left'></span>","<span class='fa-solid fa-chevron-right'></span>"],
    responsive:{
      0:{
        items:1,
        nav:false
      },
      600:{
        items:1,
        nav:false
      },
      1000:{
        items:1,
        nav:true
      }
    }
	});
  }

	// owl carousel
  if ($.fn.owlCarousel) {
	var majorCarousel = $('.js-carousel-1');
	majorCarousel.owlCarousel({
    loop:true,
    autoplay: true,
    stagePadding: 7,
    margin: 20,
    animateOut: 'fadeOut',
    animateIn: 'fadeIn',
    nav: true,
    autoplayHoverPause: true,
    items: 3,
    navText : ["<span class='fa-solid fa-chevron-left'></span>","<span class='fa-solid fa-chevron-right'></span>"],
    responsive:{
      0:{
        items:1,
        nav:false
      },
      600:{
        items:2,
        nav:false
      },
      1000:{
        items:3,
        nav:true,
        loop:false
      }
  	}
	});
  }

	// owl carousel
  if ($.fn.owlCarousel) {
	var major2Carousel = $('.js-carousel-2');
	major2Carousel.owlCarousel({
    loop:true,
    autoplay: true,
    stagePadding: 7,
    margin: 20,
    nav: true,
    autoplayHoverPause: true,
    autoHeight: true,
    items: 3,
    navText : ["<span class='fa-solid fa-chevron-left'></span>","<span class='fa-solid fa-chevron-right'></span>"],
    responsive:{
      0:{
        items:1,
        nav:false
      },
      600:{
        items:2,
        nav:false
      },
      1000:{
        items:3,
        dots: true,
        nav:true,
        loop:false
      }
  	}
	});
  }

  var siteStellar = function() {
    if (window.innerWidth > 768) {
      $(window).stellar({
        responsive: true,
        parallaxBackgrounds: true,
        parallaxElements: true,
        horizontalScrolling: false,
        hideDistantElements: false,
        scrollProperty: 'scroll'
      });
    }
  }
  siteStellar();

  $(window).on('resize', function() {
    $(window).stellar('destroy');
    if (window.innerWidth > 768) {
      $(window).stellar({
        responsive: true,
        parallaxBackgrounds: true,
        parallaxElements: true,
        horizontalScrolling: false,
        hideDistantElements: false,
        scrollProperty: 'scroll'
      });
    }
  });

  var smoothScroll = function() {
    var $root = $('html, body');

    $('a.smoothscroll[href^="#"]').click(function () {
      $root.animate({
        scrollTop: $( $.attr(this, 'href') ).offset().top
      }, 500);
      return false;
    });
  }
  smoothScroll();

  var dateAndTime = function() {
    if ($.fn.datepicker) {
      $('#m_date').datepicker({
        'format': 'm/d/yyyy',
        'autoclose': true
      });
      $('#checkin_date, #checkout_date').datepicker({
        'format': 'd MM, yyyy',
        'autoclose': true
      });
    }
    if ($.fn.timepicker) {
      $('#m_time').timepicker();
    }
  };
  dateAndTime();


  var windowScroll = function() {

    $(window).scroll(function(){
      var $win = $(window);
      if ($win.scrollTop() > 200) {
        $('.js-site-header').addClass('scrolled');
      } else {
        $('.js-site-header').removeClass('scrolled');
      }

    });

  };
  windowScroll();

  var newsletterOnPress = function() {
    const form = $('#newsletter-form');
    form.on("submit", function(e) {
      e.preventDefault();
      form.trigger("reset");
    })
  }
  newsletterOnPress();
  /*var goToTop = function() {

    $('.js-gotop').on('click', function(event){

      event.preventDefault();

      $('html, body').animate({
        scrollTop: $('html').offset().top
      }, 500, 'easeInOutExpo');

      return false;
    });

    $(window).scroll(function(){

      var $win = $(window);
      if ($win.scrollTop() > 200) {
        $('.js-top').addClass('active');
      } else {
        $('.js-top').removeClass('active');
      }

    });

  };*/


})(jQuery);
