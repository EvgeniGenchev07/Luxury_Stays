require('dotenv').config();
const mailtrap = require('mailtrap');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const admin = require('firebase-admin');
const { onRequest } = require('firebase-functions/v2/https');
const { Seam } = require('seam');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const ical = require('node-ical');
const logger = require('firebase-functions/logger');
admin.initializeApp();
const db = getFirestore('orders-payments');
db.settings({ ignoreUndefinedProperties: true });
const seam = new Seam({ apiKey: process.env.SEAM_API_KEY });
const app = express();
const client = new mailtrap.MailtrapClient({ token: process.env.MAILTRAP_API_KEY });
const recaptcha_secrets = process.env.RECAPTCHA_SECRETS;
const domains = ['https://luxurystayskapanaplovdiv.web.app', 'https://luxurystays.bg'];
const corsOptions = {
  origin: domains,
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const price_per_night = 100;
const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const checkInTimeRegion = '15:00';
const checkOutTimeRegion = '12:00';
const lock_device_id = 'b40baeff-9d6d-4f24-98d5-ef14f41b4d6e';
const airbnb_ical = 'https://www.airbnb.com/calendar/ical/1383334985601570255.ics?s=f8b8b382af45dd8c91b2903582f332ee';
const booking_ical = 'https://ical.booking.com/v1/export?t=47f76e8c-7038-42c3-840e-3e67866829bc';
const apartmentsContext = db.collection('apartments');
const reservationRequestContext = db.collection('reservationRequests');
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
           <!-- <li>🏠 <strong>Main Door Code:</strong> <code style="background: #ecf0f1; padding: 3px 8px; border-radius: 5px;">#147890#</code></li>-->
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
  return fetch({
    method: 'POST',
    body: JSON.stringify({
      secret: recaptcha_secrets,
      response: response,
      remoteip: ip
    })
  })
    .then(res => res.json())
    .then(data => {
      logger.info(data);
      return data.success;
    })
    .catch(() => {
      return false;
    });
}

/*function FormatDate(date) {
  date = date.split(' ');
  let months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return new Date(`${date[3]}-${months.indexOf(date[2]) + 1}-${date[1]}`);
}*/


// Email sending functionality
app.post('/sendMail', async (req, res) => {
  const obj = JSON.parse(req.body);
  const recap = verifyRecaptcha(obj.grecaptcha_response, req.ip);
  logger.info(recap);
  if (recap) {
    const msg = {
      to: [{ email: 'luxurystays.help@gmail.com' }],
      from: { name: 'Luxury Stays', email: 'service@luxurystays.bg' },
      subject: obj.subject,
      html: '<p>' + obj.message + '\n from ' + obj.name + ' (' + obj.email + ')</p>'
    };
    client
      .send(msg)
      .then(() => {
        let output = { response: 'email sent successfully', verified: true };
        res.status(200).json(output);
        logger.info(output, { structuredData: true });
      })
      .catch((error) => {
        logger.error('Error sending email', error);
        res.status(500).json({ error: 'Failed to send email', details: error.message, verified: true });
      });
  } else {
    logger.info('recaptcha not verified');
    res.status(500).send({ verified: false });
  }
});

// Registration request handler
app.post('/registrationRequest', async (req, res) => {
  const data = JSON.parse(req.body);
  const { email, propertyName, channelManager, guests } = data;
  let codeIssued = false;
  const shuffled = digits.sort(() => 0.5 - Math.random());
  const code = shuffled.slice(0, 4).join('');
  logger.info(propertyName);

  const apartmentRef = apartmentsContext.doc(propertyName);
  const apartmentReservations = apartmentRef.collection('reservations');
  const [checkInDate, checkOutDate] = await getNearestCheckinOutDate().catch((err) => {
  });
  const checkInTs = Timestamp.fromDate(new Date(checkInDate));
  const checkOutTs = Timestamp.fromDate(new Date(checkOutDate));
  const reservationDbSnapshot = await apartmentReservations.where('checkIn', '==', checkInTs).limit(1).get();
  await db.runTransaction(async (transaction) => {

    if (reservationDbSnapshot.empty) {
      logger.info('new reservation undergoing');
      var reservationRef = apartmentReservations.doc();

      transaction.set(reservationRef, {
        channelManager,
        email,
        guests: guests.length,
        created: Timestamp.fromDate(new Date(Date.now())),
        checkIn: checkInTs,
        checkOut: checkOutTs,
        doorCode: code
      });
    } else {
      logger.info('existing reservation undergoing');
      var reservationRef = (reservationDbSnapshot.docs[0]).ref;
      codeIssued = true;
    }
    const reservationGuests = reservationRef.collection('guests');
    for (const guest of guests) {
      const guestSnapshot = await reservationGuests
        .where('documentNumber', '==', guest.documentNumber)
        .limit(1)
        .get();
      if (guestSnapshot.empty) {
        logger.info('new guest saving undergoing');
        const guestRef = reservationGuests.doc();
        transaction.set(guestRef, {
          ...guest,
          created: Timestamp.fromDate(new Date(Date.now()))
        });
      } else {
        logger.info('overriding guest');
        transaction.update((guestSnapshot.docs[0]).ref, {
          ...guest
        });
      }
    }
  })
    .then(async () => {
      let output = { response: 'data saved successfully' };
      res.status(200).json(output);
      logger.info(output, { structuredData: true });
      if (!codeIssued) {
        const code_res = await seam.accessCodes.create({
          device_id: lock_device_id,
          name: guests[0].lastName + ' ' + guests[0].firstName,
          code: code,
          is_external_modification_allowed: true,
          starts_at: checkInDate,
          ends_at: checkOutDate
        });
        if (code_res.errors.length > 0) {
          logger.error('Something went wrong during code generation: ', code_res.errors);
        } else {
          const checkInDateOnly = checkInDate.split('T')[0];
          const checkOutDateOnly = checkOutDate.split('T')[0];
          const msg_to_guest_html = reservationMessageHtml(guests[0].firstName, code, checkInDateOnly, checkOutDateOnly, checkInTimeRegion, checkOutTimeRegion, 'Luxury Stays');
          const msg_to_guest = {
            to: [{ email }],
            from: { name: 'Luxury Stays', email: 'booking@luxurystays.bg' },
            subject: 'Successful Registration',
            html: msg_to_guest_html
          };
          client
            .send(msg_to_guest).then(() => {
            logger.info('successfully issued code');
          }).catch(err => {
            logger.error('Unable to issue code', err.message);
          });
        }
      }
    }).catch(err => {
      logger.error('Transaction failed', err.message);
      res.status(500).send('Unable to save the data');

    });
});

app.post('/availability', async (req, res) => {
  const { checkin, checkout, adults, children, children_age } = req.body;
  try {
    const response = await checkIfDatesAvailable(checkin, checkout);
    logger.info
    (`Availability request from ${checkin} to ${checkout} for ${adults} adults and ${children} children at age ${children_age} with response: ${response}`);
    res.status(200).json({ available: response });
  } catch (err) {
    logger.error('Availability request error: ' + err.message);
    res.status(500).json({ error: err.message });
  }
});

// Reservation request
app.post('/reservation', async (req, res) => {
  try {
    const {
      propertyName,
      first_name,
      last_name,
      email,
      phone,
      checkin,
      checkout,
      adults,
      children,
      children_age,
      note
    } = req.body;
    const reservationRequestId = await reservationRequestContext.add(
      {
        propertyName,
        first_name,
        last_name,
        email,
        phone,
        checkin,
        checkout,
        adults,
        children,
        children_age,
        note
      }
    );
    const msg_to_admin = {
      to: [{ email:'luxurystays.help@gmail.com'}],
      from: { name: 'Luxury Stays Service', email: 'service@luxurystays.bg' },
      subject: 'One new reservation request',
      html: `<p>You have a new reservation request from ${first_name} ${last_name} (${email}) with id: ${reservationRequestId.id}</p>`
    };
    client
      .send(msg_to_admin).then(() => {
      logger.info('successfully sent message to admin');
    }).catch(err => {
      logger.error('Unable to send message to admin', err.message);
    });
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Reservation request error: ' + error.message);
    res.status(500).json({ error: error.message });
  }
});

// Login session
app.post('/login', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) {
    return res.status(401).send('Unauthorized: No token provided');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    await admin.auth().setCustomUserClaims(decodedToken.uid, { admin: true });
    logger.info('Authenticated user EMAIL:', decodedToken.email);
    if (decodedToken) {
      res.status(200).send();
    } else {
      return res.status(401).send('Unauthorized: No token provided');
    }
  } catch (error) {
    logger.error('Token verification failed:', error);
    res.status(401).send('Unauthorized: Invalid token');
  }
});

app.post('/authentication', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) {
    return res.status(401).send('Unauthorized: No token provided');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken) {
      logger.info('User authorized user EMAIL: ' + decodedToken.email);
      const data = {
        apartments: [],
        contacts: [],
        users: [],
        templates: []
      };
      if (decodedToken.admin) {
        logger.info('User admin EMAIL:', decodedToken.admin);
      }
      res.status(200).send(data);
    } else {
      return res.status(401).send('Unauthorized: No token provided');
    }
  } catch (error) {
    logger.error('Token verification failed:', error);
    res.status(401).send('Unauthorized: Invalid token');
  }
});

const getCheckInOutDates = (ical_url) => new Promise((resolve, reject) => {
  ical.fromURL(ical_url, {}, (err, data) => {
    if (err) {
      return reject(err);
    }
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
    resolve(dates);
  });
});

const getNearestCheckinOutDate = () => new Promise(async (resolve, reject) => {
  const dates = await getCheckInOutDates(airbnb_ical);
  let index = dates.findIndex(d => new Date(d).getUTCDate() >= new Date(Date.now()).getUTCDate());
  index = index % 2 === 0 ? index : index + 1;
  const checkInDate = dates[index];
  const checkOutDate = dates[index + 1];
  logger.info(dates, { structuredData: true });
  resolve([checkInDate, checkOutDate]);
});
function toDateOnly(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
function getCalendarDates(url) {
  return new Promise((resolve, reject) => {
    ical.fromURL(url, {}, (err, data) => {
      if (err) return reject(err);

      const dates = [];

      for (let key in data) {
        const ev = data[key];
        if (ev.type === "VEVENT") {
          const start = toDateOnly(new Date(ev.start));
          const end = toDateOnly(new Date(ev.end));
          dates.push(start, end);
        }
      }

      dates.sort((a, b) => a - b);
      resolve(dates);
    });
  });
}
const checkIfDatesAvailable = (checkin, checkout) =>
  new Promise(async (resolve, reject) => {
    try {
      const booking_dates = await getCalendarDates(booking_ical);
      const airbnb_dates = await getCalendarDates(airbnb_ical);
      const allDates = [...booking_dates, ...airbnb_dates].sort((a, b) => a - b);

      if (!allDates.length) {
        return reject(new Error("No dates available (both calendars empty)"));
      }

      const ci = toDateOnly(new Date(checkin));
      const co = toDateOnly(new Date(checkout));

      for (let i = 0; i < allDates.length; i += 2) {
        const start = allDates[i];
        const end = allDates[i + 1];
        if (!end) continue;

        // overlap check
        if (ci < end && co > start) {
          // ✅ allow back-to-back
          if ((co.toISOString().split('T'))[0] === (start.toISOString().split('T'))[0] || (ci.toISOString().split('T'))[0] === (end.toISOString().split('T'))[0]) {
            continue;
          }
          return resolve(false); // ❌ real overlap
        }
      }

      resolve(true); // ✅ available
    } catch (err) {
      reject(err);
    }
  });





// Final export
exports.api = onRequest({
  cors: corsOptions,
  region: 'europe-central2'
}, app);
