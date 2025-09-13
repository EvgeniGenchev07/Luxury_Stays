const url = 'https://europe-central2-luxurystayskapanaplovdiv.cloudfunctions.net/api';
const params = new URLSearchParams(window.location.search);
const params_children = params.get('children');
const params_adults = params.get('adults');
const params_checkin = params.get('checkin');
const params_checkout = params.get('checkout');
document.addEventListener('DOMContentLoaded', function() {
  // Set minimum date for check-in to today
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const checkinInput = document.getElementById('checkin');
  const checkoutInput = document.getElementById('checkout');

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  checkinInput.min = formatDate(today);
  checkoutInput.min = formatDate(tomorrow);

  checkinInput.value = params_checkin || formatDate(today);
  checkoutInput.value = params_checkout || formatDate(tomorrow);
  const adults_children = document.querySelector('#adults_children_row');
  const adults = adults_children.querySelector('#adults');
  const children = adults_children.querySelector('#children');
  children.value = params_children || 0;
  adults.value = params_adults || 2;
  // Update checkout min date when checkin changes
  checkinInput.addEventListener('change', function() {
    const checkinDate = new Date(this.value);
    const newMinDate = new Date(checkinDate);
    newMinDate.setDate(newMinDate.getDate() + 1);

    checkoutInput.min = formatDate(newMinDate);

    // If checkout is before new min date, update it
    if (new Date(checkoutInput.value) < newMinDate) {
      checkoutInput.value = formatDate(newMinDate);
    }
  });

  document.getElementById('children').addEventListener('change', (event) => {
    const adults = document.querySelector('#adults');
    const value = document.getElementById('children').value;
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
  document.getElementById('adults').addEventListener('change', (event) => {
    const children = document.querySelector('#children');
    const value = document.getElementById('adults').value;
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

  // Handle children selection
  const childrenSelect = document.getElementById('children');
  const childAgesContainer = document.getElementById('child-ages');
  const getChildAges = () => {
    const selects = childAgesContainer.querySelectorAll('select');
    return Array.from(selects).map(select => parseInt(select.value));
  };
  childrenSelect.addEventListener('change', function() {
    const childCount = parseInt(this.value);
    childAgesContainer.innerHTML = '';

    for (let i = 1; i <= childCount; i++) {
      const ageDiv = document.createElement('div');
      ageDiv.className = 'guest-age';
      ageDiv.innerHTML = `
                        <label for="child${i}">Child ${i} Age</label>
                        <select id="child${i}" class="form-control contact-section-input" required>
                            <option hidden="hidden" value="">Select age</option>
                            <option value="1">1 year</option>
                            <option value="2">2 years</option>
                            <option value="3">3 years</option>
                            <option value="4">4 years</option>
                            <option value="5">5 years</option>
                            <option value="6">6 years</option>
                            <option value="7">7 years</option>
                            <option value="8">8 years</option>
                            <option value="9">9 years</option>
                            <option value="10">10 years</option>
                            <option value="11">11 years</option>
                            <option value="12">12 years</option>
                            <option value="13">13 years</option>
                            <option value="14">14 years</option>
                            <option value="15">15 years</option>
                            <option value="16">16 years</option>
                        </select>
                    `;
      childAgesContainer.appendChild(ageDiv);
    }
  });

  // Form navigation
  const formSteps = document.querySelectorAll('.form-step');
  const steps = document.querySelectorAll('.step');
  const prevButtons = document.querySelectorAll('.prev');
  const nextButtons = document.querySelectorAll('.next');
  const progressBar = document.querySelector('.step-progress');
  const step1NextBtn = document.getElementById('step1-next');
  const step2NextBtn = document.getElementById('step2-next');
  const dateConflictModal = document.getElementById('dateConflictModal');
  const loadingModal = document.getElementById('loadingModal');
  const modalOkBtn = document.getElementById('modal-ok-btn');
  const confirmationSuccess = document.getElementById('confirmation-success');
  const confirmationError = document.getElementById('confirmation-error');
  const retryBtn = document.getElementById('retry-btn');

  let currentStep = 0;

  // Update progress bar
  const updateProgress = () => {
    const progressPercentage = (currentStep / (steps.length - 1)) * 100;
    progressBar.style.setProperty('--progress', `${progressPercentage}%`);

    steps.forEach((step, index) => {
      if (index < currentStep) {
        step.classList.add('completed');
        step.classList.remove('active');
      } else if (index === currentStep) {
        step.classList.add('active');
        step.classList.remove('completed');
      } else {
        step.classList.remove('active', 'completed');
      }
    });
  };

  // Navigate to specific step
  const goToStep = (stepIndex) => {
    formSteps.forEach((step, index) => {
      step.classList.toggle('active', index === stepIndex);
    });

    currentStep = stepIndex;
    updateProgress();

    // Disable previous button on first step
    document.querySelectorAll('.prev').forEach(button => {
      button.disabled = currentStep === 0;
    });
  };

  // Show modal
  const showModal = (modal) => {
    modal.style.display = 'flex';
  };

  // Hide modal
  const hideModal = (modal) => {
    modal.style.display = 'none';
  };

  // Simulate server call for date validation
  const checkDateAvailability = async () => {
    try {
      const res = await fetch(url + '/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkin: checkinInput.value,
          checkout: checkoutInput.value,
          adults: adults.value,
          children: children.value,
          children_age: getChildAges()
        })
      });

      if (!res.ok) {
        return { available: false }; // server error
      }

      const data = await res.json();
      return { available: data.available };
    } catch (err) {
      console.error('Availability fetch error:', err);
      return { available: false };
    }
  };


  // Simulate server call for final reservation submission
  const submitReservation = async () => {
    try {
      const res = await fetch(url + '/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkin: checkinInput.value,
          checkout: checkoutInput.value,
          adults: parseInt(adults.value),
          children: parseInt(children.value),
          children_age: getChildAges(),
          firstName: document.getElementById('first_name').value,
          lastName: document.getElementById('last_name').value,
          email: document.getElementById('email').value,
          phone: document.getElementById('phone').value,
          note: document.getElementById('note').value
        })
      });

      if (!res.ok) {
        return { success: false, message: 'Server error' };
      }

      const data = await res.json();
      if (data.success) {
        return { success: true };
      }
      return { success: false, message: 'Dates are not available' };
    } catch (err) {
      console.error('Reservation error:', err);
      return { success: false, message: 'Network or server error' };
    }
  };


  // Step 1 Next button click
  step1NextBtn.addEventListener('click', async () => {
    // Validate current step before proceeding
    const currentFormStep = formSteps[currentStep];
    const inputs = currentFormStep.querySelectorAll('input, select, textarea');
    let isValid = true;

    inputs.forEach(input => {
      if (!input.checkValidity()) {
        input.reportValidity();
        isValid = false;
      }
    });

    if (isValid) {
      // Show loading modal
      showModal(loadingModal);

      try {
        // Check date availability with server
        const availability = await checkDateAvailability();

        // Hide loading modal
        hideModal(loadingModal);

        if (availability.available) {
          // Dates are available, proceed to next step
          goToStep(currentStep + 1);
        } else {
          // Dates are not available, show error modal
          showModal(dateConflictModal);
        }
      } catch (error) {
        // Hide loading modal
        hideModal(loadingModal);

        // Show error modal
        showModal(dateConflictModal);
      }
    }
  });

  // Step 2 Next button click
  step2NextBtn.addEventListener('click', async () => {
    // Validate current step before proceeding
    const currentFormStep = formSteps[currentStep];
    const inputs = currentFormStep.querySelectorAll('input, select, textarea');
    let isValid = true;

    inputs.forEach(input => {
      if (!input.checkValidity()) {
        input.reportValidity();
        isValid = false;
      }
    });

    if (isValid) {
      // Show loading modal
      showModal(loadingModal);

      try {
        // Submit reservation to server
        await submitReservation();

        // Hide loading modal
        hideModal(loadingModal);

        // Show success message
        confirmationSuccess.style.display = 'block';
        confirmationError.style.display = 'none';

        // Proceed to next step
        goToStep(currentStep + 1);
      } catch (error) {
        // Hide loading modal
        hideModal(loadingModal);

        // Show error message
        confirmationSuccess.style.display = 'none';
        confirmationError.style.display = 'block';

        // Proceed to next step (but show error)
        goToStep(currentStep + 1);
      }
    }
  });

  // Previous button click
  prevButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (currentStep > 0) {
        goToStep(currentStep - 1);
      }
    });
  });

  // Modal OK button
  modalOkBtn.addEventListener('click', () => {
    hideModal(dateConflictModal);
  });

  // Retry button
  retryBtn.addEventListener('click', async () => {
    // Show loading modal
    showModal(loadingModal);

    try {
      // Try to submit reservation again
      await submitReservation();

      // Hide loading modal
      hideModal(loadingModal);

      // Show success message
      confirmationSuccess.style.display = 'block';
      confirmationError.style.display = 'none';
    } catch (error) {
      // Hide loading modal
      hideModal(loadingModal);

      // Keep error message visible
      confirmationSuccess.style.display = 'none';
      confirmationError.style.display = 'block';
    }
  });

  // Initialize progress bar
  document.documentElement.style.setProperty('--progress', '0%');
  updateProgress();
});