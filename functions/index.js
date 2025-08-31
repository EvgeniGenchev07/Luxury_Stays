require('dotenv').config();
const mailtrap = require("mailtrap")
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
const url = 'https://www.airbnb.com/calendar/ical/1383334985601570255.ics?s=f8b8b382af45dd8c91b2903582f332ee';
const apartmentsContext = db.collection('apartments');
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

function FormatDate(date) {
  date = date.split(' ');
  let months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return new Date(`${date[3]}-${months.indexOf(date[2]) + 1}-${date[1]}`);
}

const getCheckInOutDates = () => new Promise((resolve, reject) => {
  ical.fromURL(url, {}, (err, data) => {
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
    let index = dates.findIndex(d => new Date(d).getUTCDate() >= new Date(Date.now()).getUTCDate());
    index = index % 2 === 0 ? index : index + 1;
    const checkInDate = dates[index];
    const checkOutDate = dates[index + 1];
    logger.info(dates, { structuredData: true });
    resolve([checkInDate, checkOutDate]);
  });
});

// Email sending functionality
app.post('/sendMail', async (req, res) => {
  const obj = JSON.parse(req.body);
  const recap = verifyRecaptcha(obj.grecaptcha_response, req.ip);
  logger.info(recap);
  if (recap) {
    const msg = {
      to: [{email:'luxurystays.help@gmail.com'}],
      from: { name: "Luxury Stays", email: 'service@luxurystays.bg'},
      subject: obj.subject,
      html: '<p>' + obj.message + '\n from ' + obj.name + ' (' + obj.email + ')</p>'
    };
    client
      .send(msg)
      .then(() => {
        let output = {response: 'email sent successfully',verified: true};
        res.status(200).json(output);
        logger.info(output, {structuredData: true});
      })
      .catch((error) => {
        logger.error("Error sending email", error);
        res.status(500).json({error: "Failed to send email", details: error.message,verified: true});
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
  const [checkInDate, checkOutDate] = await getCheckInOutDates().catch((err) => {
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
            to: [{email}],
            from: {name:'Luxury Stays', email:'booking@luxurystays.bg'},
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

// Reservation request
app.post('/reservationRequest', async (req, res) => {
  try {
    const { checkInDate, checkOutDate } = await getCheckInOutDates();
    res.status(200).json({ checkInDate, checkOutDate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login session
app.post('/login', async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (!token) {
    return res.status(401).send("Unauthorized: No token provided");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    await admin.auth().setCustomUserClaims(decodedToken.uid, { admin: true });
    logger.info("Authenticated user EMAIL:", decodedToken.email);
    if (decodedToken) {
      res.status(200).send();
    } else {
      return res.status(401).send("Unauthorized: No token provided");
    }
  } catch (error) {
    logger.error("Token verification failed:", error);
    res.status(401).send("Unauthorized: Invalid token");
  }
});

app.post('/authentication', async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (!token) {
    return res.status(401).send("Unauthorized: No token provided");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken) {
      logger.info('User authorized user EMAIL: ' + decodedToken.email);
      const data = {
        apartments: [],
        contacts: [],
        users:[],
        templates:[]
      };
      if(decodedToken.admin) {
        logger.info("User admin EMAIL:", decodedToken.admin);
      }
      res.status(200).send(data);
    } else {
      return res.status(401).send("Unauthorized: No token provided");
    }
  } catch (error) {
    logger.error("Token verification failed:", error);
    res.status(401).send("Unauthorized: Invalid token");
  }
});

// Final export
exports.api = onRequest({
  cors: corsOptions,
  region: 'europe-central2'
}, app);
