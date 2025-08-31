import { onAuthStateChanged, onIdTokenChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import {auth} from './firebase.js';
const url = 'https://europe-central2-luxurystayskapanaplovdiv.cloudfunctions.net/api/';
// Data storage
const data = {
  apartments: [
    {
      id: 1,
      name: "Apartment 1A",
      location: "downtown",
      beds: 2,
      status: "active",
      hasElectronicLock: true,
      lockId: "LK-1234",
      reservations: [
        {
          id: "45678",
          checkIn: "2025-07-25T15:00:00",
          checkOut: "2025-07-27T12:00:00",
          guestName: "dsada saokda",
          guestEmail: "za65@gmail.com",
          status: "confirmed",
          revenue: 450.00,
          doorCode: "3428"
        }
      ]
    },
    {
      id: 2,
      name: "Apartment 2B",
      location: "beachfront",
      beds: 3,
      status: "active",
      hasElectronicLock: false,
      lockId: "",
      reservations: []
    },
    {
      id: 3,
      name: "Apartment 3C",
      location: "city-center",
      beds: 1,
      status: "inactive",
      hasElectronicLock: true,
      lockId: "LK-5678",
      reservations: []
    }
  ],
  users: [
    {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      lastLogin: "2025-07-26T09:15:00"
    },
    {
      id: 2,
      name: "Manager User",
      email: "manager@example.com",
      role: "manager",
      lastLogin: "2025-07-25T16:30:00"
    },
    {
      id: 3,
      name: "Cleaner User",
      email: "cleaner@example.com",
      role: "cleaner",
      lastLogin: "2025-07-24T11:20:00"
    }
  ],
  contacts: [
    {
      name: "dsada saokda",
      email: "za65@gmail.com",
      phone: "+359 123 4567",
      type: "guest",
      lastContact: "2025-07-26T10:30:00"
    },
    {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+359 987 6543",
      type: "guest",
      lastContact: "2025-07-25T15:45:00"
    },
    {
      name: "Michael Brown",
      email: "michael@example.com",
      phone: "+359 555 1234",
      type: "owner",
      lastContact: "2025-07-24T00:00:00"
    }
  ],
  templates: [
    {
      id: 1,
      name: "Welcome Email",
      subject: "Your Upcoming Stay at [Apartment Name]",
      message: "Dear [Guest Name], welcome to your stay at [Apartment Name]. Your check-in is scheduled for [Check-In Date] and check-out on [Check-Out Date]. Your door code is [Door Code]."
    },
    {
      id: 2,
      name: "Check-In Instructions",
      subject: "Check-In Instructions for [Apartment Name]",
      message: "Here are your check-in instructions for [Apartment Name]. The address is [Apartment Address]. Your door code is [Door Code] which will be active from [Code Start] to [Code End]."
    },
    {
      id: 3,
      name: "Check-Out Instructions",
      subject: "Check-Out Instructions for [Apartment Name]",
      message: "As your stay comes to an end, please follow these check-out instructions. Check-out time is by [Check-Out Time]. Please ensure all windows are closed and keys are left in the designated place."
    },
    {
      id: 4,
      name: "Payment Confirmation",
      subject: "Payment Confirmation for [Apartment Name]",
      message: "Thank you for your payment of [Amount] for your stay at [Apartment Name] from [Check-In Date] to [Check-Out Date]. Your reservation is now confirmed."
    }
  ],
  currentApartmentId: null,
  currentReservationId: null,
  currentTemplateId: null,
  currentUserId: null,
  currentContactId: null
};

// ✅ Wait until Firebase restores the user
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const token = await user.getIdToken();
    console.log("Got token:", token);

    fetch(url + 'authentication', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8', // ✅ fixed Content-Type
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({})
    })
      .then(async (response) => {
        if (response.ok) {
          const resp = await response.json();
          data.apartments = resp;
          data.users = resp;
          data.contacts = resp;
          data.templates = resp;
          console.log(resp);
          onIdTokenChanged(auth, async (user) => {
            if (!user) {
              window.location.replace('login');
              console.log("User signed out");
            }
          });
        } else {
          console.log("Auth failed, redirecting to login...");
          window.location.replace("/admin/login");
        }
      })
      .catch((error) => {
        console.error(error);
        window.location.replace("/admin/login");
      });

  } else {
    console.log("No user logged in, redirecting...");
    window.location.replace("/admin/login");
  }
});


// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Load all data
  loadApartments();
  loadReservations();
  loadUsers();
  loadContacts();
  loadTemplates();

  // Initialize chart
  initChart();

  // Set up event listeners
  setupEventListeners();
});

// Load apartments into the table
function loadApartments(filter = {}) {
  const tableBody = document.getElementById('apartmentsTableBody');
  tableBody.innerHTML = '';

  const filteredApartments = data.apartments.filter(apartment => {
    let matches = true;

    if (filter.search && !apartment.name.toLowerCase().includes(filter.search.toLowerCase())) {
      matches = false;
    }

    if (filter.status && apartment.status !== filter.status) {
      matches = false;
    }

    if (filter.location && apartment.location !== filter.location) {
      matches = false;
    }

    return matches;
  });

  filteredApartments.forEach(apartment => {
    const row = document.createElement('tr');
    row.setAttribute('data-apartment-id', apartment.id);

    row.innerHTML = `
                    <td>${apartment.name}</td>
                    <td>${formatLocation(apartment.location)}</td>
                    <td>${apartment.beds}</td>
                    <td><span class="badge ${apartment.status === 'active' ? 'badge-success' : 'badge-danger'}">${apartment.status.charAt(0).toUpperCase() + apartment.status.slice(1)}</span></td>
                    <td>${apartment.hasElectronicLock ? `Yes (${apartment.lockId})` : 'No'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary view-apartment">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-sm btn-warning edit-apartment">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </td>
                `;

    tableBody.appendChild(row);
  });

  // Update apartment dropdown in reservations
  updateApartmentDropdowns();
}

// Load reservations into the table
function loadReservations(filter = {}) {
  const tableBody = document.getElementById('reservationsTableBody');
  tableBody.innerHTML = '';

  let allReservations = [];
  data.apartments.forEach(apartment => {
    apartment.reservations.forEach(reservation => {
      allReservations.push({
        ...reservation,
        apartmentId: apartment.id,
        apartmentName: apartment.name
      });
    });
  });

  const filteredReservations = allReservations.filter(reservation => {
    let matches = true;

    if (filter.search && !reservation.guestName.toLowerCase().includes(filter.search.toLowerCase())) {
      matches = false;
    }

    if (filter.apartment && reservation.apartmentId.toString() !== filter.apartment) {
      matches = false;
    }

    if (filter.status && reservation.status !== filter.status) {
      matches = false;
    }

    if (filter.dateFrom && new Date(reservation.checkIn) < new Date(filter.dateFrom)) {
      matches = false;
    }

    if (filter.dateTo && new Date(reservation.checkOut) > new Date(filter.dateTo)) {
      matches = false;
    }

    return matches;
  });

  filteredReservations.forEach(reservation => {
    const row = document.createElement('tr');
    row.setAttribute('data-reservation-id', reservation.id);

    row.innerHTML = `
                    <td>#${reservation.id}</td>
                    <td>${reservation.apartmentName}</td>
                    <td>${formatDate(reservation.checkIn)}</td>
                    <td>${formatDate(reservation.checkOut)}</td>
                    <td>${reservation.guestName}</td>
                    <td><span class="badge ${getStatusBadgeClass(reservation.status)}">${formatStatus(reservation.status)}</span></td>
                    <td>$${reservation.revenue.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-sm btn-primary view-reservation">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning edit-reservation">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                `;

    tableBody.appendChild(row);
  });
}

// Load users into the table
function loadUsers(filter = {}) {
  const tableBody = document.getElementById('usersTableBody');
  tableBody.innerHTML = '';

  const filteredUsers = data.users.filter(user => {
    let matches = true;

    if (filter.search && !user.name.toLowerCase().includes(filter.search.toLowerCase())) {
      matches = false;
    }

    if (filter.role && user.role !== filter.role) {
      matches = false;
    }

    return matches;
  });

  filteredUsers.forEach(user => {
    const row = document.createElement('tr');
    row.setAttribute('data-user-id', user.id);

    row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${formatRole(user.role)}</td>
                    <td>${formatDateTime(user.lastLogin)}</td>
                    <td>
                        <button class="btn btn-sm btn-primary view-user">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning edit-user">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                `;

    tableBody.appendChild(row);
  });
}

// Load contacts into the table
function loadContacts(filter = {}) {
  const tableBody = document.getElementById('contactsTableBody');
  tableBody.innerHTML = '';

  const filteredContacts = data.contacts.filter(contact => {
    let matches = true;

    if (filter.search && !contact.name.toLowerCase().includes(filter.search.toLowerCase())) {
      matches = false;
    }

    if (filter.type && contact.type !== filter.type) {
      matches = false;
    }

    return matches;
  });

  filteredContacts.forEach(contact => {
    const row = document.createElement('tr');
    row.setAttribute('data-contact-id', contact.email);

    row.innerHTML = `
                    <td>${contact.name}</td>
                    <td>${contact.email}</td>
                    <td>${contact.phone}</td>
                    <td>${formatContactType(contact.type)}</td>
                    <td>${formatDateTime(contact.lastContact)}</td>
                    <td>
                        <button class="btn btn-sm btn-primary view-contact">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning edit-contact">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-info send-contact-email">
                            <i class="fas fa-envelope"></i>
                        </button>
                    </td>
                `;

    tableBody.appendChild(row);
  });
}

// Load templates into the list
function loadTemplates() {
  const templatesList = document.getElementById('templatesList');
  templatesList.innerHTML = '';

  data.templates.forEach(template => {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.setAttribute('data-template-id', template.id);

    card.innerHTML = `
                    <h4>${template.name}</h4>
                    <div class="template-preview">
                        ${template.message.substring(0, 100)}...
                    </div>
                    <div class="template-actions">
                        <button class="btn btn-sm btn-primary send-template">
                            <i class="fas fa-envelope"></i> Send
                        </button>
                        <button class="btn btn-sm btn-warning edit-template">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                `;

    templatesList.appendChild(card);
  });
}

// Update apartment dropdowns in reservation forms
function updateApartmentDropdowns() {
  const dropdowns = [
    document.getElementById('reservationApartment'),
    document.getElementById('reservationApartmentFilter')
  ];

  dropdowns.forEach(dropdown => {
    if (dropdown) {
      dropdown.innerHTML = '<option value="">Select Apartment</option>';
      data.apartments.forEach(apartment => {
        const option = document.createElement('option');
        option.value = apartment.id;
        option.textContent = apartment.name;
        dropdown.appendChild(option);
      });
    }
  });
}

// Show apartment detail view
function showApartmentDetail(apartmentId) {
  const apartment = data.apartments.find(a => a.id == apartmentId);
  if (!apartment) return;

  data.currentApartmentId = apartmentId;

  // Update detail view
  document.getElementById('detailApartmentName').textContent = apartment.name;
  document.getElementById('detailLocation').textContent = formatLocation(apartment.location);
  document.getElementById('detailBeds').textContent = apartment.beds;
  document.getElementById('detailStatus').textContent = apartment.status.charAt(0).toUpperCase() + apartment.status.slice(1);
  document.getElementById('detailStatus').className = `badge badge-${apartment.status === 'active' ? 'success' : 'danger'}`;
  document.getElementById('detailElectronicLock').textContent = apartment.hasElectronicLock ? `Yes (ID: ${apartment.lockId})` : 'No';

  // Update reservation list
  const reservationList = document.getElementById('reservationList');
  reservationList.innerHTML = '';

  if (apartment.reservations.length > 0) {
    apartment.reservations.forEach(reservation => {
      const row = document.createElement('tr');
      row.setAttribute('data-reservation-id', reservation.id);

      row.innerHTML = `
                        <td>#${reservation.id}</td>
                        <td>${formatDate(reservation.checkIn)}</td>
                        <td>${formatDate(reservation.checkOut)}</td>
                        <td>${reservation.guestName}</td>
                        <td><span class="badge ${getStatusBadgeClass(reservation.status)}">${formatStatus(reservation.status)}</span></td>
                        <td>
                            <button class="btn btn-sm btn-primary view-reservation">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-warning edit-reservation">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    `;
      reservationList.appendChild(row);
    });
  } else {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="6" class="text-center">No reservations found</td>';
    reservationList.appendChild(row);
  }

  // Toggle electronic lock section
  if (apartment.hasElectronicLock) {
    document.getElementById('electronicLockSection').style.display = 'block';
    document.getElementById('lockIdDisplay').textContent = apartment.lockId;

    // Load door codes
    const doorCodesList = document.getElementById('doorCodesList');
    doorCodesList.innerHTML = '';

    apartment.reservations.forEach(reservation => {
      if (reservation.doorCode) {
        const row = document.createElement('tr');
        row.innerHTML = `
                            <td><span class="door-code">${reservation.doorCode}</span></td>
                            <td>${formatDateTime(reservation.checkIn)}</td>
                            <td>${formatDateTime(reservation.checkOut)}</td>
                            <td>${reservation.guestName}</td>
                            <td>
                                <button class="btn btn-sm btn-primary send-code">
                                    <i class="fas fa-envelope"></i>
                                </button>
                                <button class="btn btn-sm btn-danger delete-code">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        `;
        doorCodesList.appendChild(row);
      }
    });
  } else {
    document.getElementById('electronicLockSection').style.display = 'none';
  }

  // Show detail view
  document.getElementById('apartmentListCard').style.display = 'none';
  document.getElementById('apartmentDetail').style.display = 'block';
  document.getElementById('apartmentForm').style.display = 'none';
}

// Show apartment form (for add/edit)
function showApartmentForm(apartmentId = null) {
  if (apartmentId) {
    // Edit mode
    const apartment = data.apartments.find(a => a.id == apartmentId);
    if (!apartment) return;

    data.currentApartmentId = apartmentId;
    document.getElementById('formTitle').textContent = 'Edit Apartment';

    // Fill form
    document.getElementById('apartmentName').value = apartment.name;
    document.getElementById('apartmentLocation').value = apartment.location;
    document.getElementById('apartmentBeds').value = apartment.beds;
    document.getElementById('apartmentStatus').value = apartment.status;
    document.getElementById('hasElectronicLock').checked = apartment.hasElectronicLock;
    document.getElementById('lockId').value = apartment.lockId;

    if (apartment.hasElectronicLock) {
      document.getElementById('lockIdGroup').style.display = 'block';
    }
  } else {
    // Add mode
    data.currentApartmentId = null;
    document.getElementById('formTitle').textContent = 'Add New Apartment';

    // Reset form
    document.getElementById('apartmentFormData').reset();
    document.getElementById('lockIdGroup').style.display = 'none';
  }

  document.getElementById('apartmentListCard').style.display = 'none';
  document.getElementById('apartmentDetail').style.display = 'none';
  document.getElementById('apartmentForm').style.display = 'block';
}

// Save apartment (add or edit)
function saveApartment() {
  const form = document.getElementById('apartmentFormData');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const apartmentData = {
    name: document.getElementById('apartmentName').value,
    location: document.getElementById('apartmentLocation').value,
    beds: parseInt(document.getElementById('apartmentBeds').value),
    status: document.getElementById('apartmentStatus').value,
    hasElectronicLock: document.getElementById('hasElectronicLock').checked,
    lockId: document.getElementById('hasElectronicLock').checked ? document.getElementById('lockId').value : '',
    reservations: []
  };

  if (data.currentApartmentId) {
    // Edit existing apartment
    const index = data.apartments.findIndex(a => a.id == data.currentApartmentId);
    if (index !== -1) {
      // Preserve reservations
      apartmentData.reservations = data.apartments[index].reservations;
      apartmentData.id = data.currentApartmentId;
      data.apartments[index] = apartmentData;
    }
  } else {
    // Add new apartment
    const newId = data.apartments.length > 0 ? Math.max(...data.apartments.map(a => a.id)) + 1 : 1;
    apartmentData.id = newId;
    data.apartments.push(apartmentData);
  }

  // Reload data
  loadApartments();

  // Return to list view
  document.getElementById('apartmentListCard').style.display = 'block';
  document.getElementById('apartmentDetail').style.display = 'none';
  document.getElementById('apartmentForm').style.display = 'none';
}

// Show reservation modal (for add/edit)
function showReservationModal(reservationId = null, apartmentId = null) {
  const modal = document.getElementById('reservationModal');
  const form = document.getElementById('reservationForm');

  if (reservationId) {
    // Edit mode
    data.currentReservationId = reservationId;
    document.getElementById('reservationModalTitle').textContent = 'Edit Reservation';

    // Find reservation
    let reservation = null;
    let apartment = null;

    for (const apt of data.apartments) {
      const res = apt.reservations.find(r => r.id == reservationId);
      if (res) {
        reservation = res;
        apartment = apt;
        break;
      }
    }

    if (!reservation) return;

    // Fill form
    document.getElementById('reservationApartment').value = apartment.id;
    document.getElementById('reservationStatus').value = reservation.status;
    document.getElementById('reservationCheckIn').value = formatDateTimeForInput(reservation.checkIn);
    document.getElementById('reservationCheckOut').value = formatDateTimeForInput(reservation.checkOut);
    document.getElementById('reservationGuestName').value = reservation.guestName;
    document.getElementById('reservationGuestEmail').value = reservation.guestEmail;
    document.getElementById('reservationRevenue').value = reservation.revenue;
  } else {
    // Add mode
    data.currentReservationId = null;
    document.getElementById('reservationModalTitle').textContent = 'Add Reservation';

    // Reset form
    form.reset();

    // Set apartment if provided
    if (apartmentId) {
      document.getElementById('reservationApartment').value = apartmentId;
    }
  }

  // Show modal
  modal.style.display = 'flex';
}

// Save reservation (add or edit)
function saveReservation() {
  const form = document.getElementById('reservationForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const reservationData = {
    id: data.currentReservationId || 'R' + Math.floor(10000 + Math.random() * 90000),
    checkIn: document.getElementById('reservationCheckIn').value,
    checkOut: document.getElementById('reservationCheckOut').value,
    guestName: document.getElementById('reservationGuestName').value,
    guestEmail: document.getElementById('reservationGuestEmail').value,
    status: document.getElementById('reservationStatus').value,
    revenue: parseFloat(document.getElementById('reservationRevenue').value),
    doorCode: document.getElementById('reservationStatus').value === 'confirmed' ? Math.floor(1000 + Math.random() * 9000).toString() : null
  };

  const apartmentId = parseInt(document.getElementById('reservationApartment').value);
  const apartment = data.apartments.find(a => a.id == apartmentId);

  if (!apartment) return;

  if (data.currentReservationId) {
    // Edit existing reservation
    const index = apartment.reservations.findIndex(r => r.id == data.currentReservationId);
    if (index !== -1) {
      apartment.reservations[index] = reservationData;
    }
  } else {
    // Add new reservation
    apartment.reservations.push(reservationData);
  }

  // Reload data
  loadReservations();
  if (data.currentApartmentId) {
    showApartmentDetail(data.currentApartmentId);
  }

  // Close modal
  closeModal('reservationModal');
}

// Show user modal (for add/edit)
function showUserModal(userId = null) {
  const modal = document.getElementById('userModal');
  const form = document.getElementById('userForm');

  if (userId) {
    // Edit mode
    data.currentUserId = userId;
    document.getElementById('userModalTitle').textContent = 'Edit User';

    // Find user
    const user = data.users.find(u => u.id == userId);
    if (!user) return;

    // Fill form
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userPassword').value = 'password'; // In a real app, you wouldn't show the actual password
  } else {
    // Add mode
    data.currentUserId = null;
    document.getElementById('userModalTitle').textContent = 'Add User';

    // Reset form
    form.reset();
  }

  // Show modal
  modal.style.display = 'flex';
}

// Save user (add or edit)
function saveUser() {
  const form = document.getElementById('userForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const userData = {
    name: document.getElementById('userName').value,
    email: document.getElementById('userEmail').value,
    role: document.getElementById('userRole').value,
    lastLogin: new Date().toISOString()
  };

  if (data.currentUserId) {
    // Edit existing user
    const index = data.users.findIndex(u => u.id == data.currentUserId);
    if (index !== -1) {
      userData.id = data.currentUserId;
      data.users[index] = userData;
    }
  } else {
    // Add new user
    const newId = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
    userData.id = newId;
    data.users.push(userData);
  }

  // Reload data
  loadUsers();

  // Close modal
  closeModal('userModal');
}

// Show template form (for add/edit)
function showTemplateForm(templateId = null) {
  if (templateId) {
    // Edit mode
    data.currentTemplateId = templateId;
    document.getElementById('templateFormTitle').textContent = 'Edit Template';

    // Find template
    const template = data.templates.find(t => t.id == templateId);
    if (!template) return;

    // Fill form
    document.getElementById('templateName').value = template.name;
    document.getElementById('templateSubject').value = template.subject;
    document.getElementById('templateMessage').value = template.message;
  } else {
    // Add mode
    data.currentTemplateId = null;
    document.getElementById('templateFormTitle').textContent = 'Add New Template';

    // Reset form
    document.getElementById('templateFormData').reset();
  }

  document.getElementById('templatesListCard').style.display = 'none';
  document.getElementById('templateForm').style.display = 'block';
}

// Save template (add or edit)
function saveTemplate() {
  const form = document.getElementById('templateFormData');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const templateData = {
    name: document.getElementById('templateName').value,
    subject: document.getElementById('templateSubject').value,
    message: document.getElementById('templateMessage').value
  };

  if (data.currentTemplateId) {
    // Edit existing template
    const index = data.templates.findIndex(t => t.id == data.currentTemplateId);
    if (index !== -1) {
      templateData.id = data.currentTemplateId;
      data.templates[index] = templateData;
    }
  } else {
    // Add new template
    const newId = data.templates.length > 0 ? Math.max(...data.templates.map(t => t.id)) + 1 : 1;
    templateData.id = newId;
    data.templates.push(templateData);
  }

  // Reload data
  loadTemplates();

  // Return to list view
  document.getElementById('templatesListCard').style.display = 'block';
  document.getElementById('templateForm').style.display = 'none';
}

// Show email modal
function showEmailModal(recipient = '', subject = '', message = '') {
  const modal = document.getElementById('emailModal');

  document.getElementById('emailRecipient').value = recipient;
  document.getElementById('emailSubject').value = subject;
  document.getElementById('emailMessage').value = message;

  modal.style.display = 'flex';
}

// Send email
function sendEmail() {
  const recipient = document.getElementById('emailRecipient').value;
  const subject = document.getElementById('emailSubject').value;
  const message = document.getElementById('emailMessage').value;

  // In a real app, this would send the email via an API
  alert(`Email sent to ${recipient}\nSubject: ${subject}\n\n${message}`);

  closeModal('emailModal');
}

// Generate door code
function generateDoorCode() {
  const startDate = document.getElementById('codeStart').value;
  const endDate = document.getElementById('codeEnd').value;

  if (!startDate || !endDate) {
    alert('Please select both start and end dates');
    return;
  }

  const code = Math.floor(1000 + Math.random() * 9000).toString();

  document.getElementById('generatedDoorCode').textContent = code;
  document.getElementById('generatedCodeStart').textContent = formatDateTime(startDate);
  document.getElementById('generatedCodeEnd').textContent = formatDateTime(endDate);

  // Show modal
  document.getElementById('doorCodeModal').style.display = 'flex';
}

// Send door code to guest
function sendDoorCodeToGuest() {
  const code = document.getElementById('generatedDoorCode').textContent;
  const start = document.getElementById('generatedCodeStart').textContent;
  const end = document.getElementById('generatedCodeEnd').textContent;

  // Find the current apartment
  const apartment = data.apartments.find(a => a.id == data.currentApartmentId);
  if (!apartment) return;

  // In a real app, you would send this to the guest's email
  alert(`Door code ${code} (valid from ${start} to ${end}) would be sent to the guest for apartment ${apartment.name}`);

  closeModal('doorCodeModal');
}

// Close modal
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Initialize chart
function initChart() {
  const ctx = document.getElementById('reservationsChart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Reservations',
          data: [12, 19, 15, 20, 25, 30, 28, 24, 18, 22, 17, 14],
          backgroundColor: 'rgba(67, 97, 238, 0.7)',
          borderColor: 'rgba(67, 97, 238, 1)',
          borderWidth: 1
        },
        {
          label: 'Revenue ($)',
          data: [2400, 3800, 3000, 4000, 5000, 6000, 5600, 4800, 3600, 4400, 3400, 2800],
          backgroundColor: 'rgba(76, 201, 240, 0.7)',
          borderColor: 'rgba(76, 201, 240, 1)',
          borderWidth: 1,
          type: 'line',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Reservations'
          }
        },
        y1: {
          position: 'right',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Revenue ($)'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Format date and time for display
function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
}

// Format date and time for input field
function formatDateTimeForInput(dateTimeString) {
  const date = new Date(dateTimeString);
  const isoString = date.toISOString();
  return isoString.substring(0, isoString.length - 1);
}

// Format location
function formatLocation(location) {
  return location.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Format status
function formatStatus(status) {
  return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Get status badge class
function getStatusBadgeClass(status) {
  switch (status) {
  case 'confirmed': return 'badge-success';
  case 'checked-in': return 'badge-primary';
  case 'checked-out': return 'badge-info';
  case 'cancelled': return 'badge-danger';
  default: return 'badge-secondary';
  }
}

// Format role
function formatRole(role) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

// Format contact type
function formatContactType(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

// Set up event listeners
function setupEventListeners() {
  // Tab navigation
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
      // Remove active class from all menu items
      document.querySelectorAll('.menu-item').forEach(i => {
        i.classList.remove('active');
      });

      // Add active class to clicked menu item
      this.classList.add('active');

      // Hide all tab contents
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });

      // Show selected tab content
      const tabId = this.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');

      // Update header title
      document.querySelector('.header-title').textContent = this.querySelector('span').textContent;

      // Initialize chart if dashboard is selected
      if (tabId === 'dashboard') {
        initChart();
      }
    });
  });

  // Apartment list view buttons
  document.addEventListener('click', function(e) {
    // View apartment button
    if (e.target.closest('.view-apartment')) {
      const apartmentId = e.target.closest('tr').getAttribute('data-apartment-id');
      showApartmentDetail(apartmentId);
    }

    // Edit apartment button
    if (e.target.closest('.edit-apartment')) {
      const apartmentId = e.target.closest('tr').getAttribute('data-apartment-id');
      showApartmentForm(apartmentId);
    }

    // View reservation button
    if (e.target.closest('.view-reservation')) {
      const reservationId = e.target.closest('tr').getAttribute('data-reservation-id');
      // In a real app, this would show reservation details
      alert(`Viewing reservation ${reservationId}`);
    }

    // Edit reservation button
    if (e.target.closest('.edit-reservation')) {
      const reservationId = e.target.closest('tr').getAttribute('data-reservation-id');
      showReservationModal(reservationId);
    }

    // View user button
    if (e.target.closest('.view-user')) {
      const userId = e.target.closest('tr').getAttribute('data-user-id');
      // In a real app, this would show user details
      alert(`Viewing user ${userId}`);
    }

    // Edit user button
    if (e.target.closest('.edit-user')) {
      const userId = e.target.closest('tr').getAttribute('data-user-id');
      showUserModal(userId);
    }

    // View contact button
    if (e.target.closest('.view-contact')) {
      const contactId = e.target.closest('tr').getAttribute('data-contact-id');
      // In a real app, this would show contact details
      alert(`Viewing contact ${contactId}`);
    }

    // Edit contact button
    if (e.target.closest('.edit-contact')) {
      const contactId = e.target.closest('tr').getAttribute('data-contact-id');
      // In a real app, this would show edit form
      alert(`Editing contact ${contactId}`);
    }

    // Send email to contact button
    if (e.target.closest('.send-contact-email')) {
      const contactRow = e.target.closest('tr');
      const email = contactRow.querySelector('td:nth-child(2)').textContent;
      const name = contactRow.querySelector('td:nth-child(1)').textContent;

      showEmailModal(email, `Message for ${name}`, `Dear ${name},\n\n`);
    }

    // Send template button
    if (e.target.closest('.send-template')) {
      const templateId = e.target.closest('.template-card').getAttribute('data-template-id');
      const template = data.templates.find(t => t.id == templateId);

      showEmailModal('', template.subject, template.message);
    }

    // Edit template button
    if (e.target.closest('.edit-template')) {
      const templateId = e.target.closest('.template-card').getAttribute('data-template-id');
      showTemplateForm(templateId);
    }

    // Send door code button
    if (e.target.closest('.send-code')) {
      const row = e.target.closest('tr');
      const code = row.querySelector('.door-code').textContent;
      const guestName = row.querySelector('td:nth-child(4)').textContent;

      // Find the guest's email
      let guestEmail = '';
      const apartment = data.apartments.find(a => a.id == data.currentApartmentId);
      if (apartment) {
        const reservation = apartment.reservations.find(r => r.doorCode === code);
        if (reservation) {
          guestEmail = reservation.guestEmail;
        }
      }

      showEmailModal(
        guestEmail,
        `Door Code for ${apartment ? apartment.name : 'Your Stay'}`,
        `Dear ${guestName},\n\nYour door code is: ${code}\n\nThis code will be valid during your stay.\n\nBest regards,\nThe Management Team`
      );
    }

    // Delete door code button
    if (e.target.closest('.delete-code')) {
      const row = e.target.closest('tr');
      const code = row.querySelector('.door-code').textContent;

      // Find the apartment and reservation
      const apartment = data.apartments.find(a => a.id == data.currentApartmentId);
      if (apartment) {
        const reservationIndex = apartment.reservations.findIndex(r => r.doorCode === code);
        if (reservationIndex !== -1) {
          apartment.reservations[reservationIndex].doorCode = null;
          showApartmentDetail(data.currentApartmentId);
        }
      }
    }
  });

  // Add apartment button
  document.getElementById('addApartmentBtn').addEventListener('click', function() {
    showApartmentForm();
  });

  // Back to list button
  document.getElementById('backToList').addEventListener('click', function() {
    document.getElementById('apartmentListCard').style.display = 'block';
    document.getElementById('apartmentDetail').style.display = 'none';
    document.getElementById('apartmentForm').style.display = 'none';
  });

  // Cancel form button
  document.getElementById('cancelForm').addEventListener('click', function() {
    document.getElementById('apartmentListCard').style.display = 'block';
    document.getElementById('apartmentDetail').style.display = 'none';
    document.getElementById('apartmentForm').style.display = 'none';
  });

  document.getElementById('cancelFormBtn').addEventListener('click', function() {
    document.getElementById('apartmentListCard').style.display = 'block';
    document.getElementById('apartmentDetail').style.display = 'none';
    document.getElementById('apartmentForm').style.display = 'none';
  });

  // Save apartment form
  document.getElementById('apartmentFormData').addEventListener('submit', function(e) {
    e.preventDefault();
    saveApartment();
  });

  // Toggle lock ID field
  document.getElementById('hasElectronicLock').addEventListener('change', function() {
    document.getElementById('lockIdGroup').style.display = this.checked ? 'block' : 'none';
  });

  // Add reservation button (from apartment detail)
  document.getElementById('addReservationBtn').addEventListener('click', function() {
    showReservationModal(null, data.currentApartmentId);
  });

  // Add reservation button (global)
  document.getElementById('addReservationGlobalBtn').addEventListener('click', function() {
    showReservationModal();
  });

  // Save reservation form
  document.getElementById('reservationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveReservation();
  });

  // Add user button
  document.getElementById('addUserBtn').addEventListener('click', function() {
    showUserModal();
  });

  // Save user form
  document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveUser();
  });

  // Add template button
  document.getElementById('addTemplateBtn').addEventListener('click', function() {
    showTemplateForm();
  });

  // Add template button from contacts
  document.getElementById('addTemplateFromContactsBtn').addEventListener('click', function() {
    document.getElementById('templates').querySelector('.menu-item').click();
    showTemplateForm();
  });

  // Cancel template form button
  document.getElementById('cancelTemplateForm').addEventListener('click', function() {
    document.getElementById('templatesListCard').style.display = 'block';
    document.getElementById('templateForm').style.display = 'none';
  });

  document.getElementById('cancelTemplateFormBtn').addEventListener('click', function() {
    document.getElementById('templatesListCard').style.display = 'block';
    document.getElementById('templateForm').style.display = 'none';
  });

  // Save template form
  document.getElementById('templateFormData').addEventListener('submit', function(e) {
    e.preventDefault();
    saveTemplate();
  });

  // Send email button
  document.getElementById('sendEmailBtn').addEventListener('click', function() {
    showEmailModal();
  });

  // Send email now button
  document.getElementById('sendEmailNowBtn').addEventListener('click', function() {
    sendEmail();
  });

  // Generate door code button
  document.getElementById('generateCodeBtn').addEventListener('click', function() {
    generateDoorCode();
  });

  // Send door code button
  document.getElementById('sendDoorCodeBtn').addEventListener('click', function() {
    sendDoorCodeToGuest();
  });

  // Filter apartments
  document.getElementById('filterApartmentsBtn').addEventListener('click', function() {
    const filter = {
      search: document.getElementById('apartmentSearch').value,
      status: document.getElementById('apartmentStatusFilter').value,
      location: document.getElementById('apartmentLocationFilter').value
    };

    loadApartments(filter);
  });

  // Reset apartment filters
  document.getElementById('resetApartmentFiltersBtn').addEventListener('click', function() {
    document.getElementById('apartmentSearch').value = '';
    document.getElementById('apartmentStatusFilter').value = '';
    document.getElementById('apartmentLocationFilter').value = '';
    loadApartments();
  });

  // Filter reservations
  document.getElementById('filterReservationsBtn').addEventListener('click', function() {
    const filter = {
      search: document.getElementById('reservationSearch').value,
      apartment: document.getElementById('reservationApartmentFilter').value,
      status: document.getElementById('reservationStatusFilter').value,
      dateFrom: document.getElementById('reservationDateFrom').value,
      dateTo: document.getElementById('reservationDateTo').value
    };

    loadReservations(filter);
  });

  // Reset reservation filters
  document.getElementById('resetReservationFiltersBtn').addEventListener('click', function() {
    document.getElementById('reservationSearch').value = '';
    document.getElementById('reservationApartmentFilter').value = '';
    document.getElementById('reservationStatusFilter').value = '';
    document.getElementById('reservationDateFrom').value = '';
    document.getElementById('reservationDateTo').value = '';
    loadReservations();
  });

  // Filter users
  document.getElementById('filterUsersBtn').addEventListener('click', function() {
    const filter = {
      search: document.getElementById('userSearch').value,
      role: document.getElementById('userRoleFilter').value
    };

    loadUsers(filter);
  });

  // Reset user filters
  document.getElementById('resetUserFiltersBtn').addEventListener('click', function() {
    document.getElementById('userSearch').value = '';
    document.getElementById('userRoleFilter').value = '';
    loadUsers();
  });

  // Filter contacts
  document.getElementById('filterContactsBtn').addEventListener('click', function() {
    const filter = {
      search: document.getElementById('contactSearch').value,
      type: document.getElementById('contactTypeFilter').value
    };

    loadContacts(filter);
  });

  // Reset contact filters
  document.getElementById('resetContactFiltersBtn').addEventListener('click', function() {
    document.getElementById('contactSearch').value = '';
    document.getElementById('contactTypeFilter').value = '';
    loadContacts();
  });
}
