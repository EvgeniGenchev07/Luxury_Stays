console.log('reservation.js loaded');

// Modern Reservation Wizard with Flatpickr Calendar

// Price table for different dates (YYYY-MM-DD: price)
const priceTable = {
  // July 2024
  "2024-07-01": 120,
  "2024-07-02": 120,
  "2024-07-03": 140,
  "2024-07-04": 140,
  "2024-07-05": 160,
  "2024-07-06": 160,
  "2024-07-07": 140,
  "2024-07-08": 120,
  "2024-07-09": 120,
  "2024-07-10": 140,
  "2024-07-11": 140,
  "2024-07-12": 160,
  "2024-07-13": 160,
  "2024-07-14": 140,
  "2024-07-15": 120,
  "2024-07-16": 120,
  "2024-07-17": 140,
  "2024-07-18": 140,
  "2024-07-19": 160,
  "2024-07-20": 160,
  "2024-07-21": 140,
  "2024-07-22": 120,
  "2024-07-23": 120,
  "2024-07-24": 140,
  "2024-07-25": 140,
  "2024-07-26": 160,
  "2024-07-27": 160,
  "2024-07-28": 140,
  "2024-07-29": 120,
  "2024-07-30": 120,
  "2024-07-31": 140,
  
  // August 2024
  "2024-08-01": 140,
  "2024-08-02": 160,
  "2024-08-03": 160,
  "2024-08-04": 140,
  "2024-08-05": 120,
  "2024-08-06": 120,
  "2024-08-07": 140,
  "2024-08-08": 140,
  "2024-08-09": 160,
  "2024-08-10": 160,
  "2024-08-11": 140,
  "2024-08-12": 120,
  "2024-08-13": 120,
  "2024-08-14": 140,
  "2024-08-15": 140,
  "2024-08-16": 160,
  "2024-08-17": 160,
  "2024-08-18": 140,
  "2024-08-19": 120,
  "2024-08-20": 120,
  "2024-08-21": 140,
  "2024-08-22": 140,
  "2024-08-23": 160,
  "2024-08-24": 160,
  "2024-08-25": 140,
  "2024-08-26": 120,
  "2024-08-27": 120,
  "2024-08-28": 140,
  "2024-08-29": 140,
  "2024-08-30": 160,
  "2024-08-31": 160,
  
  // September 2024
  "2024-09-01": 140,
  "2024-09-02": 120,
  "2024-09-03": 120,
  "2024-09-04": 140,
  "2024-09-05": 140,
  "2024-09-06": 160,
  "2024-09-07": 160,
  "2024-09-08": 140,
  "2024-09-09": 120,
  "2024-09-10": 120,
  "2024-09-11": 140,
  "2024-09-12": 140,
  "2024-09-13": 160,
  "2024-09-14": 160,
  "2024-09-15": 140,
  "2024-09-16": 120,
  "2024-09-17": 120,
  "2024-09-18": 140,
  "2024-09-19": 140,
  "2024-09-20": 160,
  "2024-09-21": 160,
  "2024-09-22": 140,
  "2024-09-23": 120,
  "2024-09-24": 120,
  "2024-09-25": 140,
  "2024-09-26": 140,
  "2024-09-27": 160,
  "2024-09-28": 160,
  "2024-09-29": 140,
  "2024-09-30": 120
};

// Apartment data
const apartments = [
  {
    id: 1,
    name: 'Deluxe Studio',
    description: 'Modern studio with city view',
    image: '../images/bedroom_3.jpg',
    maxGuests: 2,
    amenities: ['WiFi', 'Kitchen', 'Balcony', 'TV']
  },
  {
    id: 2,
    name: 'Family Apartment',
    description: 'Spacious 2-bedroom apartment',
    image: '../images/living_room_1.jpg',
    maxGuests: 4,
    amenities: ['WiFi', 'Kitchen', 'Balcony', 'TV', 'Washing Machine']
  },
  {
    id: 3,
    name: 'Premium Suite',
    description: 'Luxury suite with panoramic view',
    image: '../images/bedroom_1.jpg',
    maxGuests: 3,
    amenities: ['WiFi', 'Kitchen', 'Balcony', 'TV', 'Jacuzzi']
  }
];

// Reservation state
let reservationState = {
  checkIn: null,
  checkOut: null,
  selectedApartment: null,
  guestDetails: {}
};

// Helper functions
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function dateFormatChanger(date) {
  date = date.split(' ');
  date[1] = date[1].replace(',', '');
  return new Date(date[2] + '-' + (months.indexOf(date[1]) + 1) + '-' + date[0]);
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getPriceForDate(date) {
  const dateStr = formatDate(date);
  return priceTable[dateStr] || 120; // Default price
}

function calculateTotalPrice(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  
  let total = 0;
  const currentDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  
  while (currentDate < endDate) {
    total += getPriceForDate(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return total;
}

function getNumberOfNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diffTime = Math.abs(checkOut - checkIn);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// --- Modern Dual Picker UI Logic ---
$(document).ready(function() {
  // State
  let dualGuests = { adults: 2, children: 0, rooms: 1 };
  let dualDates = { checkin: null, checkout: null };

  // --- STEP NAVIGATION LOGIC ---
  function showStep(step) {
    $('.reservation-step').hide();
    if (step === 1) $('#step-calendar').show();
    if (step === 2) $('#step-details').show();
    if (step === 3) $('#step-payment').show();
  }
  // Always start on calendar step
  showStep(1);

  // Next: Calendar -> Details
  $(document).on('click', '#to-details-step', function() {
    if (!$(this).prop('disabled')) showStep(2);
  });
  // Back: Details -> Calendar
  $(document).on('click', '#back-to-calendar', function() {
    showStep(1);
  });
  // Next: Details -> Payment
  $(document).on('click', '#to-payment-step', function(e) {
    e.preventDefault();
    showStep(3);
  });
  // Back: Payment -> Details
  $(document).on('click', '#back-to-details', function() {
    showStep(2);
  });

  // Guests picker logic (works for both dual picker and card)
  $(document).on('click', '#dual-guests-field', function(e) {
    e.stopPropagation();
    $('.picker-guests-popup').hide();
    $('#dual-guests-popup').show();
    $(this).addClass('active');
  });
  $(document).on('click', '#guests-done', function() {
    $('#dual-guests-popup').hide();
    $('#dual-guests-field').removeClass('active');
  });
  $(document).on('click', function(e) {
    if (!$(e.target).closest('#dual-guests-popup').length && !$(e.target).closest('#dual-guests-field').length) {
      $('#dual-guests-popup').hide();
      $('#dual-guests-field').removeClass('active');
    }
  });

  function updateGuestsDisplay() {
    $('#dual-guests-display').text(`${dualGuests.adults} adult${dualGuests.adults!==1?'s':''} · ${dualGuests.children} child${dualGuests.children!==1?'ren':' '} · ${dualGuests.rooms} room${dualGuests.rooms!==1?'s':''}`);
    $('#adults-count').text(dualGuests.adults);
    $('#children-count').text(dualGuests.children);
    $('#rooms-count').text(dualGuests.rooms);
  }
  updateGuestsDisplay();

  $(document).on('click', '#adults-plus', function() {
    if (dualGuests.adults < 10) { dualGuests.adults++; updateGuestsDisplay(); }
  });
  $(document).on('click', '#adults-minus', function() {
    if (dualGuests.adults > 1) { dualGuests.adults--; updateGuestsDisplay(); }
  });
  $(document).on('click', '#children-plus', function() {
    if (dualGuests.children < 10) { dualGuests.children++; updateGuestsDisplay(); }
  });
  $(document).on('click', '#children-minus', function() {
    if (dualGuests.children > 0) { dualGuests.children--; updateGuestsDisplay(); }
  });
  $(document).on('click', '#rooms-plus', function() {
    if (dualGuests.rooms < 5) { dualGuests.rooms++; updateGuestsDisplay(); }
  });
  $(document).on('click', '#rooms-minus', function() {
    if (dualGuests.rooms > 1) { dualGuests.rooms--; updateGuestsDisplay(); }
  });

  // Always initialize the main calendar in #date-range
  flatpickr('#date-range', {
    mode: 'range',
    minDate: 'today',
    dateFormat: 'Y-m-d',
    showMonths: 2,
    inline: true,
    onChange: function(selectedDates) {
      if (selectedDates.length === 2) {
        // Enable the next button
        $('#to-details-step').prop('disabled', false);
      } else {
        $('#to-details-step').prop('disabled', true);
      }
    },
    onDayCreate: function(dObj, dStr, fp, dayElem) {
      // Show price under each date
      const date = dayElem.dateObj;
      if (!date) return;
      const price = typeof getPriceForDate === 'function' ? getPriceForDate(date) : 120;
      if (price) {
        const priceDiv = document.createElement('div');
        priceDiv.className = 'calendar-price';
        priceDiv.innerText = price + ' BGN';
        dayElem.appendChild(priceDiv);
      }
    }
  });
});

// Initialize the reservation wizard
$(document).ready(function() {
  // Show apartment step first
  showApartmentStep();
  
  // Initialize Flatpickr calendar - always visible with multiple months
  const datePicker = flatpickr("#date-range", {
    mode: "range",
    minDate: "today",
    dateFormat: "Y-m-d",
    inline: true,
    showMonths: 3,
    disable: [
      // Add unavailable dates here
      // "2024-07-04", "2024-07-05"
    ],
    onChange: function(selectedDates, dateStr, instance) {
      if (selectedDates.length === 2) {
        reservationState.checkIn = selectedDates[0];
        reservationState.checkOut = selectedDates[1];
        $('#to-details-step').prop('disabled', false);
        $('#calendar-error').hide();
      } else {
        $('#to-details-step').prop('disabled', true);
      }
    },
    onDayCreate: function(dObj, dStr, fp, dayElem) {
      // Add price below each date
      const date = dayElem.dateObj;
      const price = getPriceForDate(date);
      
      if (price) {
        const priceDiv = document.createElement('div');
        priceDiv.className = "calendar-price";
        priceDiv.innerText = price + " BGN";
        dayElem.appendChild(priceDiv);
      }
    }
  });

  // Step navigation
  $('#to-calendar-step').click(function() {
    if (reservationState.selectedApartment) {
      showCalendarStep();
    }
  });

  $('#back-to-apartment').click(function() {
    showApartmentStep();
  });

  $('#to-details-step').click(function() {
    if (reservationState.checkIn && reservationState.checkOut) {
      showDetailsStep();
    }
  });

  $('#back-to-calendar').click(function() {
    showCalendarStep();
  });

  $('#to-payment-step').click(function() {
    if (validateGuestDetails()) {
      showPaymentStep();
    }
  });

  $('#back-to-details').click(function() {
    showDetailsStep();
  });

  // Payment
  $('#pay-now').click(function() {
    processPayment();
  });

  // Form validation
  $('#guest-details-form input, #guest-details-form select').on('input change', function() {
    validateGuestDetails();
  });
});

function showCalendarStep() {
  $('.reservation-step').hide();
  $('#step-calendar').show();
}

function showApartmentStep() {
  $('.reservation-step').hide();
  $('#step-apartment').show();
  renderApartments();
}

function showDetailsStep() {
  $('.reservation-step').hide();
  $('#step-details').show();
}

function showPaymentStep() {
  $('.reservation-step').hide();
  $('#step-payment').show();
  renderPaymentSummary();
}

function renderApartments() {
  const container = $('#apartments-list');
  container.empty();
  
  apartments.forEach(apartment => {
    const card = $(`
      <div class="col-md-4 mb-4">
        <div class="card apartment-card" data-apartment-id="${apartment.id}">
          <img src="${apartment.image}" class="card-img-top" alt="${apartment.name}">
          <div class="card-body">
            <h5 class="card-title">${apartment.name}</h5>
            <p class="card-text">${apartment.description}</p>
            <div class="apartment-amenities mb-3">
              ${apartment.amenities.map(amenity => `<span class="badge badge-light mr-1">${amenity}</span>`).join('')}
            </div>
            <div class="apartment-price">From 120 BGN/night</div>
            <small class="text-muted">Max ${apartment.maxGuests} guests</small>
          </div>
        </div>
      </div>
    `);
    
    card.click(function() {
      $('.apartment-card').removeClass('selected');
      $(this).find('.apartment-card').addClass('selected');
      reservationState.selectedApartment = apartment;
      $('#to-calendar-step').prop('disabled', false);
    });
    
    container.append(card);
  });
}

function validateGuestDetails() {
  const name = $('#name').val().trim();
  const phone = $('#phone').val().trim();
  const email = $('#email').val().trim();
  const adults = $('#adults').val();
  const children = $('#children').val();
  
  const isValid = name && phone && email && adults;
  
  if (isValid) {
    reservationState.guestDetails = {
      name, phone, email, adults, children,
      message: $('#message').val().trim()
    };
    $('#to-payment-step').prop('disabled', false);
  } else {
    $('#to-payment-step').prop('disabled', true);
  }
  
  return isValid;
}

function renderPaymentSummary() {
  const apartment = reservationState.selectedApartment;
  const details = reservationState.guestDetails;
  const totalPrice = calculateTotalPrice(reservationState.checkIn, reservationState.checkOut);
  const nights = getNumberOfNights(reservationState.checkIn, reservationState.checkOut);
  
  const summary = `
    <h4>Reservation Summary</h4>
    <div class="payment-item">
      <span>Apartment:</span>
      <span>${apartment.name}</span>
    </div>
    <div class="payment-item">
      <span>Check-in:</span>
      <span>${reservationState.checkIn.toLocaleDateString()}</span>
    </div>
    <div class="payment-item">
      <span>Check-out:</span>
      <span>${reservationState.checkOut.toLocaleDateString()}</span>
    </div>
    <div class="payment-item">
      <span>Nights:</span>
      <span>${nights}</span>
    </div>
    <div class="payment-item">
      <span>Guests:</span>
      <span>${details.adults} adults, ${details.children} children</span>
    </div>
    <div class="payment-item">
      <span>Guest:</span>
      <span>${details.name}</span>
    </div>
    <div class="payment-item">
      <span>Contact:</span>
      <span>${details.phone} / ${details.email}</span>
    </div>
    <div class="payment-item payment-total">
      <span>Total:</span>
      <span>${totalPrice} BGN</span>
    </div>
  `;
  
  $('#payment-summary').html(summary);
}

function processPayment() {
  // This is a placeholder for payment processing
  // In a real implementation, you would integrate with Stripe, PayPal, etc.
  
  $('#pay-now').prop('disabled', true).text('Processing...');
  
  setTimeout(() => {
    $('#payment-success').show();
    $('#pay-now').hide();
    
    // In a real implementation, you would send the reservation data to your server
    console.log('Reservation data:', {
      ...reservationState,
      totalPrice: calculateTotalPrice(reservationState.checkIn, reservationState.checkOut)
    });
  }, 2000);
}
