/*require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const admin = require('firebase-admin');
const { onRequest } = require('firebase-functions/v2/https');
const functions = require('firebase-functions');
const sgMail = require('@sendgrid/mail');
const { Seam } = require('seam');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const ical = require('node-ical');
const logger = require('firebase-functions/logger');

admin.initializeApp();
const db = getFirestore('orders-payments');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const seam = new Seam({ apiKey: process.env.SEAM_API_KEY });

const app = express();

const domains = ['https://luxurystayskapanaplovdiv.web.app', 'https://luxurystays.bg'];
const corsOptions = {
  origin: domains,
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const price_per_night = 100;
const digits = ['0','1','2','3','4','5','6','7','8','9'];
const checkInTimeRegion = '15:00';
const checkOutTimeRegion = '12:00';
const checkInTime = '12:00';
const seam_api_key = process.env.SEAM_API_KEY;
const checkOutTime = '09:00';
const lock_device_id = 'b40baeff-9d6d-4f24-98d5-ef14f41b4d6e';
const url = 'https://www.airbnb.com/calendar/ical/1383334985601570255.ics?s=f8b8b382af45dd8c91b2903582f332ee';
const reservationMessage = (name, ApartmentDoorCode, chi, cho, chiTime, choTime, companyName) => `
Hello ${name},

Thank you for your reservation! We're excited to welcome you.

Here are your access details:
🏠 Main Door Code: #147890#
🚪 Apartment Door Code: ${ApartmentDoorCode}

➡️ Important Instructions:

    After entering your apartment code, please press the Yale button to unlock the door.

    The apartment door will auto-lock 5 seconds after closing, so always make sure you have your code with you.

🗓️ Your codes are active from ${chi} ${chiTime} until ${cho} ${choTime}.

🏢 Apartment Info:
Your apartment is located on Floor 2, Apartment No. 6.

🅿️ Garage Access:
The garage keys are placed on the bench inside the apartment.
The chip provided works for:

    - The main entrance door

    - The door connecting the building to the garage area, located on the right side.

🚫 Please Note:
Do not leave your car parked on the street, as this may result in fines issued by local authorities. Please always use the garage provided.

If you need any assistance, feel free to contact us.

Enjoy your stay!
— The ${companyName} Team
`;

const reservationMessageHtml = (
  name,
  ApartmentDoorCode,
  chi,
  cho,
  chiTime,
  choTime,
  companyName
) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reservation Details</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f4f4f8; color: #333;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 650px; margin: auto; padding: 20px;">
    <tr>
      <td>
        <div style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 30px;">
          <h2 style="color: #2c3e50; margin-top: 0;">👋 Hello <span style="color: #2980b9;">${name}</span>,</h2>
          <p style="font-size: 16px; line-height: 1.6;">Thank you for your reservation! We're excited to welcome you.</p>

          <h3 style="margin-top: 30px; color: #2c3e50;">🔑 Access Details</h3>
          <ul style="font-size: 16px; line-height: 1.6; list-style: none; padding: 0;">
            <li>🏠 <strong>Main Door Code:</strong> <code style="background: #ecf0f1; padding: 3px 8px; border-radius: 5px;">#147890#</code></li>
            <li>🚪 <strong>Apartment Door Code:</strong> <code style="background: #ecf0f1; padding: 3px 8px; border-radius: 5px;">${ApartmentDoorCode}</code></li>
          </ul>

          <h3 style="margin-top: 30px; color: #2c3e50;">📌 Important Instructions</h3>
          <ul style="font-size: 16px; line-height: 1.6; padding-left: 20px;">
            <li>After entering your apartment code, please press the Yale button to unlock the door.</li>
            <li>The apartment door auto-locks after 5 seconds when closed—always keep your code with you.</li>
          </ul>

          <p style="font-size: 16px; margin-top: 20px;">🗓️ <strong>Your codes are active:</strong><br>
            From <strong>${chi} ${chiTime}</strong> to <strong>${cho} ${choTime}</strong>.
          </p>

          <h3 style="margin-top: 30px; color: #2c3e50;">🏢 Apartment Info</h3>
          <p style="font-size: 16px;">Your apartment is located on <strong>Floor 2, Apartment No. 6</strong>.</p>

          <h3 style="margin-top: 30px; color: #2c3e50;">🅿️ Garage Access</h3>
          <ul style="font-size: 16px; line-height: 1.6; padding-left: 20px;">
            <li>The garage keys are placed on the bench inside the apartment.</li>
            <li>The provided chip works for:
              <ul>
                <li>The main entrance door</li>
                <li>The door connecting the building to the garage area (on the right side)</li>
              </ul>
            </li>
          </ul>

          <p style="font-size: 16px; color: #e74c3c;"><strong>🚫 Parking Notice:</strong><br>
            Please do <strong>not</strong> leave your car on the street. This may result in fines from local authorities. Always use the garage provided.
          </p>

          <p style="font-size: 16px; margin-top: 30px;">If you need any assistance, feel free to contact us.</p>

          <p style="font-size: 16px; margin-top: 20px;">Enjoy your stay!<br>
          — <strong style="color: #2980b9;">${companyName} Team</strong></p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
function verifyRecaptcha(response, ip) {
  return fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.RECAPTCHA_SECRET}&response=${response}&remoteip=${ip}`
  })
    .then(res => res.json())
    .then(data => data.success)
    .catch(() => false);
}

function authenticateUser(req, res, next) {
  const sessionCookie = req.cookies.session || '';
  admin.auth().verifySessionCookie(sessionCookie, true)
    .then(() => next())
    .catch(() => res.status(401).send('Unauthorized'));
}

function FormatDate(date) {
  date = date.split(' ');
  let months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return new Date(`${date[3]}-${months.indexOf(date[2]) + 1}-${date[1]}`);
}

function getCheckInOutDates() {
  return new Promise((resolve, reject) => {
    ical.fromURL(url, {}, (err, data) => {
      if (err) return reject(err);
      const dates = [];

      for (let key in data) {
        const event = data[key];
        if (event.type === 'VEVENT') {
          const date = new Date(event.start);
          const newDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0));
          dates.push(newDate.toISOString());

          const date2 = new Date(event.end);
          const newDate2 = new Date(Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate(), 9, 0, 0));
          dates.push(newDate2.toISOString());
        }
      }

      dates.sort((a, b) => new Date(a) - new Date(b));
      let index = dates.findIndex(d => new Date(d).getUTCDate() >= new Date(Date.now()).getUTCDate());
      index = index % 2 === 0 ? index : index + 1;
      const checkInDate = dates[index];
      const checkOutDate = dates[index + 1];
      resolve({ checkInDate, checkOutDate });
    });
  });
}

// Email sending functionality
app.post('/sendMail', async (req, res) => {
  const obj = JSON.parse(req.body);
  if(verify(obj.grecaptcha_response,req.ip)) {
    const msg = {
      to: 'luxurystays.help@gmail.com',
      from: 'service@luxurystays.bg',
      subject: obj.subject,
      text: obj.message + '\n from ' + obj.name + '(' + obj.email + ')',
      html: '<p>' + obj.message + '\n from ' + obj.name + ' (' + obj.email + ')</p>',
    }
    sgMail
      .send(msg)
      .then(() => {
        let output = {response: 'email sent successfully',verified: true};
        res.status(200).json(output);
        logger.info(output, {structuredData: true});
      })
      .catch((error) => {
        logger.error("Error sending email", error);
        res.status(500).json({error: "Failed to send email", details: error.message,verified: true});
      })
  }
  else{
    res.status(500).send({verified: false});
  }
});

// Registration request handler
app.post('/registrationRequest', async (req, res) => {
  try {
    const data = JSON.parse(req.body);
    let msg_text = '';
    let msg_html = '';
    let count = 1;
    const email = data.email;
    const propertyName = data.propertyName;
    const channelManager = data.channelManager;
    const guests = data.guests;
    for (let obj of guests) {
      const nationality = obj.nationality;
      const firstName = obj.firstName;
      const middleName = obj.middleName;
      const lastName = obj.lastName;
      const gender = obj.gender;
      const id = obj.id;
      const dateOfBirth = obj.dateOfBirth;
      const documentType = obj.documentType;
      const documentNumber = obj.documentNumber;
      const touristPacket = obj.touristPacket ? 'Да' : 'Не';

      msg_text +=
        '👤 Гост ' + count + '\n' +
        '-----------------------------\n' +
        'Националност:         ' + nationality + '\n' +
        'Име:                  ' + firstName + '\n' +
        'Презиме:              ' + middleName + '\n' +
        'Фамилия:              ' + lastName + '\n' +
        'Пол:                  ' + gender + '\n' +
        'ЕГН:                  ' + id + '\n' +
        'Дата на раждане:      ' + dateOfBirth + '\n' +
        'Документ:             ' + documentType + '\n' +
        'Номер на документа:   ' + documentNumber + '\n' +
        'Туристически пакет:   ' + touristPacket + '\n\n';

      msg_html += `
              <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-bottom: 20px; background-color: #f9f9f9; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <h3 style="margin-top: 0; color: #333;">👤 Гост ${count}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 4px 0; width: 160px;"><strong>Националност:</strong></td><td>${nationality}</td></tr>
                  <tr><td style="padding: 4px 0;"><strong>Име:</strong></td><td>${firstName}</td></tr>
                  <tr><td style="padding: 4px 0;"><strong>Презиме:</strong></td><td>${middleName}</td></tr>
                  <tr><td style="padding: 4px 0;"><strong>Фамилия:</strong></td><td>${lastName}</td></tr>
                  <tr><td style="padding: 4px 0;"><strong>Пол:</strong></td><td>${gender}</td></tr>
                  <tr><td style="padding: 4px 0;"><strong>ЕГН:</strong></td><td>${id}</td></tr>
                  <tr><td style="padding: 4px 0;"><strong>Дата на раждане:</strong></td><td>${dateOfBirth}</td></tr>
                  <tr><td style="padding: 4px 0;"><strong>Документ:</strong></td><td>${documentType}</td></tr>
                  <tr><td style="padding: 4px 0;"><strong>Номер на документа:</strong></td><td>${documentNumber}</td></tr>
                  <tr><td style="padding: 4px 0;"><strong>Туристически пакет:</strong></td><td>${touristPacket}</td></tr>
                </table>
              </div>`;

      count++;
    }

    const msg = {
      to: 'luxurystays.help@gmail.com',
      from: 'service@luxurystays.bg',
      subject: 'Registration',
      text: msg_text,
      html: msg_html,
    }
    logger.info(msg, {structuredData: true});
    sgMail
      .send(msg)
      .then(async () => {
        let output = {response: 'email sent successfully', verified: true};
        res.status(200).json(output);
        logger.info(output, {structuredData: true});
        const shuffled = digits.sort(() => 0.5 - Math.random());
        const code =  shuffled.slice(0, 4).join('');
        const seam = new Seam({
          apiKey: seam_api_key,
        });
        getCheckInOutDates().then(async ([checkInDate,checkOutDate])=>{
          logger.info(checkInDate, {structuredData: true});
          logger.info(checkOutDate, {structuredData: true});
          const code_res = await seam.accessCodes.create({
            device_id: lock_device_id,
            name: guests[0].lastName+' '+guests[0].firstName,
            code: code,
            is_external_modification_allowed: true,
            starts_at: checkInDate,
            ends_at: checkOutDate,
          });
          if(code_res.errors.length > 0) {
            logger.error('Something went wrong',code_res.errors);
          }else {
            const checkInDateOnly = checkInDate.split('T')[0];
            const checkOutDateOnly = checkOutDate.split('T')[0];
            const msg_to_guest_text = reservationMessage(guests[0].firstName,code,checkInDateOnly,checkOutDateOnly,checkInTimeRegion,checkOutTimeRegion,'Luxury Stays')
            const msg_to_guest_html = reservationMessageHtml(guests[0].firstName,code,checkInDateOnly,checkOutDateOnly,checkInTimeRegion,checkOutTimeRegion,'Luxury Stays');
            const msg_to_guest = {
              to: email,
              from: 'booking@luxurystays.bg',
              subject: 'Successful Registration',
              text: msg_to_guest_text,
              html: msg_to_guest_html,
            }
            sgMail.send(msg_to_guest).then(()=>{
              logger.info('successfully issued code');
            }).catch(err=>{
              logger.error('Unable to issue code',err.message);
            });
          }
        });
      });
  }
  catch (error) {
    res.status(500).send({ error: "Failed to send the data", details: error.message });
  }
});

// Reservation request
app.post('/reservationRequest', async (req, res) => {
  try {
    const { checkInDate, checkOutDate } = await getCheckInOutDates();
    res.status(200).json({ checkInDate, checkOutDate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Book request
app.post('/bookRequest', async (req, res) => {
  const { email, phoneNumber, nights, firstName, lastName } = req.body;
  try {
    const { checkInDate, checkOutDate } = await getCheckInOutDates();
    const amount = nights * price_per_night * 100;

    const customer = await stripe.customers.create({ email, phone: phoneNumber, name: `${firstName} ${lastName}` });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'Luxury Stays Booking' },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
      customer: customer.id,
      metadata: {
        email,
        checkInDate,
        checkOutDate,
        nights,
        firstName,
        lastName
      }
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Save booking
app.post('/saveBooking', async (req, res) => {
  const data = req.body;
  try {
    await db.collection('booked').add({
      ...data,
      createdAt: Timestamp.now()
    });
    res.status(200).send('Saved');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel booking
app.post('/cancelBooking', async (req, res) => {
  const { id } = req.body;
  try {
    await db.collection('booked').doc(id).delete();
    res.status(200).send('Deleted');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Archive reservations
app.post('/archive_reservations', authenticateUser, async (req, res) => {
  const { ids } = req.body;
  try {
    const batch = db.batch();
    for (let id of ids) {
      const docRef = db.collection('booked').doc(id);
      const snapshot = await docRef.get();
      if (snapshot.exists) {
        const archivedRef = db.collection('archived').doc(id);
        batch.set(archivedRef, snapshot.data());
        batch.delete(docRef);
      }
    }
    await batch.commit();
    res.status(200).send('Archived');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all data
app.get('/getAllData', authenticateUser, async (req, res) => {
  try {
    const snapshot = await db.collection('booked').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login session
app.post('/loginSession', async (req, res) => {
  const idToken = req.body.idToken;
  const expiresIn = 60 * 60 * 1000; // 1 hour

  try {
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
    res.setHeader('Set-Cookie', `session=${sessionCookie}; Max-Age=${expiresIn / 1000}; Path=/; HttpOnly; SameSite=Strict; Secure`);
    res.status(200).send({ status: 'success' });
  } catch (error) {
    res.status(401).send('UNAUTHORIZED');
  }
});

// Final export
exports.api = onRequest({
  cors: corsOptions,
  region: 'europe-central2',
}, app);
*/