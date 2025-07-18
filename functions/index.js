require('dotenv').config();
const {onRequest,onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const sgMail = require('@sendgrid/mail');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const {onDocumentDeleted} = require("firebase-functions/firestore");
const sendgrid_api_key = process.env.SENDGRID_API_KEY;
const { Seam } = require('seam');
const seam_api_key = process.env.SEAM_API_KEY;
const stripe_api_key = process.env.STRIPE_API_KEY;
const lock_device_id = 'b40baeff-9d6d-4f24-98d5-ef14f41b4d6e';
sgMail.setApiKey(sendgrid_api_key);
const stripe = require("stripe")(stripe_api_key);
admin.initializeApp();
const db = getFirestore('orders-payments');
const domains = ['https://luxurystayskapanaplovdiv.web.app','https://luxurystays.bg'];
const price_per_night = 100;
const digits = ['0','1','2','3','4','5','6','7','8','9'];
const checkInTimeRegion = '15:00'
const checkOutTimeRegion = '12:00'
const checkInTime = '12:00'
const checkOutTime = '09:00'
const ical = require('node-ical');
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


exports.sendMail = onRequest(
    {cors:domains,
    region: "europe-central2"}
    ,(req, res) => {
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
exports.registrationRequest = onRequest(
    {cors:domains,
        region: "europe-central2"}
    ,async (req, res) =>{

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
                   /* const shuffled = digits.sort(() => 0.5 - Math.random());
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
                  });*/
                });
        }
        catch (error) {
            res.status(500).send({error: "Failed to send the data", details: error.message});
        }
    });
exports.reservationRequest = onRequest(
    {cors:domains,
        region: "europe-central2"}
    ,(req, res) => {
        try {
            const obj = JSON.parse(req.body);
            const grecaptcha_response = obj.grecaptcha_response;
            if (verify(grecaptcha_response, req.ip)) {
                const name = obj.name;
                const phone = obj.phone;
                const email = obj.email;
                const dateIn = obj.dateIn;
                const dateOut = obj.dateOut;
                const adults = obj.adults;
                const children = obj.children;
                const message = obj.message;
                const msg = {
                    to: 'luxurystays.help@gmail.com',
                    from: 'zakg665@gmail.com',
                    subject: 'Reservation request',
                    text: 'Име: ' + name + '\nТелефон: ' + phone + '\nИмейл: ' + email + '\nНастаняване: ' + dateIn + '\nТръгване: ' + dateOut + '\nВъзрастни: ' + adults + '\nДеца: ' + children + '\nБележки: ' + message,
                    html: '<p>Име: ' + name + '<br>Телефон: ' + phone + '<br>Имейл: ' + email + '<br>Настаняване: ' + dateIn + '<br>Тръгване: ' + dateOut + '<br>Възрастни: ' + adults + '<br>Деца: ' + children + '<br>Бележки: ' + message + '</p>',
                }
                sgMail
                    .send(msg)
                    .then(() => {
                        let output = {response: 'email sent successfully', verified: true};
                        res.status(200).json(output);
                        logger.info(output, {structuredData: true});
                    });
            } else{
                res.status(500).send({verified: false});
            }
        }
        catch (error) {
            res.status(500).send({error: "Failed to send the data", details: error.message});
        }
    });

const getCheckInOutDates = () => new Promise((resolve, reject) => {
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
    index = index %2 === 0 ? index : index+1;
    const checkInDate = dates[index];
    const checkOutDate = dates[index + 1];
    logger.info(dates, {structuredData: true});
    resolve([checkInDate, checkOutDate]);
  });
});

/*exports.createPaymentIntent = onRequest(
    {cors:domains,
        region: "europe-central2"}
    ,async (req, res)=>{
            const data = JSON.parse(req.body);
            const amount = data.totalNights * price_per_night;

            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "bgn",
                // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            res.status(200).json({
                clientSecret: paymentIntent.client_secret,
                paymentId: paymentIntent.id,
                // [DEV]: For demo purposes only, you should avoid exposing the PaymentIntent ID in the client-side code.
                dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
            });
    });





exports.bookRequest = onRequest(
    {cors:domains,
        region: "europe-central2"},

    async (req, res)=>{
        try {

            const data = JSON.parse(req.body);
            const grecaptcha_response = data.grecaptcha_response;
            if(verify(grecaptcha_response,req.ip)) {
                const email = data.email;

                const arrival = data.dateIn;

                const departure = data.dateOut;

                const adults = parseInt(data.adults);

                const children = parseInt(data.children);

                const arrival_format = Timestamp.fromDate(new Date(FormatDate(arrival).setHours(0, 0, 0, 0)));

                const departure_format = Timestamp.fromDate(new Date(FormatDate(departure).setHours(0, 0, 0, 0)));

                const totalDays = data.totalDays;

                const totalNights = data.totalNights;

                let index = 0;

                let vacant = false;

                let id = '';

                let departure_negative;
                const orders_payments_ref = db.collection('booked');


                // Use compareTo() for accurate date comparison

                await orders_payments_ref.select('departure').orderBy('departure', 'desc')
                    .get()
                    .then((result) => {
                        index = result.docs.findIndex((doc) =>
                            doc.data().departure._seconds <= arrival_format._seconds
                        );
                        if (index === -1) departure_negative = result.docs[result.docs.length - 1].data().departure._seconds;
                        else if (result.docs[index].data().departure._seconds === arrival_format._seconds) index = -1;
                    });


                await orders_payments_ref.select('arrival').orderBy('arrival', 'desc').get()

                    .then((result) => {
                        if (index === -1
                            && result.docs[result.docs.length - 1].data().arrival._seconds > departure_negative) vacant = true;
                        else if (index === -1) vacant = false;
                        else if (index === 0) vacant = true;
                        else if (departure_format._seconds < result.docs[index - 1].data().arrival._seconds) vacant = true;
                        else vacant = false;
                    });


                if (vacant) {

                    id = (await orders_payments_ref.add({

                        type: "blocked",

                        status: "undergoing",

                        arrival: arrival_format,

                        total_nights: totalNights,

                        total_days: totalDays,

                        departure: departure_format,

                        email: email,

                    })).id;

                } else {

                    await db.collection('waiting-to-book').add({

                        email: email,

                        arrival: arrival_format,

                        departure: departure_format,

                        adults: adults,

                        children: children,

                    });

                }


                res.status(200).json({

                    vacant: vacant,

                    id: id,

                    verified: true,

                });
            }
            else{
                res.status(500).json({verified: false});
            }
        }
        catch (error){
            res.status(504).json({error: error.message});
        }

    });



exports.saveBooking = onRequest(
    {cors:domains,
        region: "europe-central2"},
    async (req, res)=>{
        try {
            const data = JSON.parse(req.body);
            const email = data.email;
            const arrival = data.dateIn;
            const departure = data.dateOut;
            const adults = parseInt(data.adults);
            const children = parseInt(data.children);
            const id = data.id;
            const paymentId = data.paymentId;
            const first_name = data.first_name;
            const last_name = data.last_name;
            const phone = data.phone;
            const totalDays = data.totalDays;
            const totalNights = data.totalNights;
            const arrival_format = Timestamp.fromDate(new Date(FormatDate(arrival).setHours(0, 0, 0, 0)));
            const departure_format = Timestamp.fromDate(new Date(FormatDate(departure).setHours(0, 0, 0, 0)));
            const total = price_per_night * totalNights;
            const orders_payments_ref = db.collection('booked');
            await orders_payments_ref.doc(id).update({
                status: "payed",
                type: "reserved",
                first_name: first_name,
                last_name: last_name,
                total_nights: totalNights,
                total_days: totalDays,
                phone: phone,
                email: email,
                paymentId: paymentId,
                arrival: arrival_format,
                departure: departure_format,
                adults: adults,
                children: children,
                total_cost: total,
            })
            const inner_msg = {
                to: email,
                from: 'luxurystays.help@gmail.com',
                subject: 'Reservation confirmed',
                text: 'Your reservation from '+arrival_format.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' to ' + arrival_format.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })+ ' has been confirmed. If you want to cancel it, click on the link '+ 'https://luxurystayskapanaplovdiv.web.app/cancellation?request='+id,
                html: '<p>' + 'Your reservation from '+arrival_format.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' to ' + arrival_format.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })+ ' has been confirmed. If you want to cancel it, click on the link '+ 'https://luxurystayskapanaplovdiv.web.app/cancellation?request='+id+'</p>',
            }
            sgMail
                .send(inner_msg)
                .then(() => {
                    let output = {response: 'inner email sent successfully'};
                    logger.info(output, {structuredData: true});
                    res.status(200).json({status: 'success'});
                })
                .catch((error) => {
                    logger.error("Error sending inner email", error);
                    res.status(500).json({status: error});
                })
        }
        catch (error){
            res.status(504).json({error: error.message,status: 'failure'});
        }
    });



exports.onBookingTermination = onRequest(
    {cors:domains,
        region: "europe-central2"},
    async (req, res)=>{
        try {
            const data = JSON.parse(req.body);
            const id = data.id;
            logger.info(id,{structuredData: true});
            res.status(200).send({status: 'success'});
            const reservation_ref = await db.collection('booked').doc(id);
            const doc = (await reservation_ref.get()).data();
            logger.info(doc,{structuredData: true});
            if(doc.type=="blocked" && doc.status == "undergoing")
            {
                await db.collection('booked').doc(id).delete();
                logger.info('success');
            }
        } catch (err) {
            logger.error("error:", err);
        }
    });




exports.cancelBooking = onRequest(
    {cors:domains,
        region: "europe-central2"},
    async (req, res)=>{
        let completed = false;
        try {
            const id = req.body;
            const reservation = await db.collection('booked').doc(id);
            const reservation_data = (await reservation.get()).data();
            await db.collection('cancelled').doc(id).set(reservation_data);
            let refund = '';
            /*await stripe.createRefund(reservation_data.paymentId)
                .then(result => {
                    refund = result;
                })
                .catch((error) => {
                    refund = error.message;
                });*
            await reservation.delete();
            completed = true;
            res.status(200).json({operation: 'success'});
            const outer_msg = {
                to: reservation_data.email,
                from: 'luxurystays.help@gmail.com',
                subject: 'Reservation cancelled',
                text: 'Your reservation from ' +reservation_data.arrival.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' to ' + reservation_data.departure.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + 'has been canceled. Reservation id: '+reservation.id,
                html: '<p>' + 'Your reservation from ' +reservation_data.arrival.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' to ' + reservation_data.departure.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + 'has been canceled. Reservation id: '+reservation.id+'</p>',
            }
            sgMail
                .send(outer_msg)
                .then(() => {
                    let output = {response: 'outer email sent successfully'};
                    logger.info(output, {structuredData: true});
                })
                .catch((error) => {
                    logger.error("Error sending inner email", error);
                })
            const inner_msg = {
                to: 'luxurystays.help@gmail.com',
                from: 'zakg665@gmail.com',
                subject: 'Cancellation',
                text: 'Your apartment has been canceled from ' +reservation_data.arrival.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' to ' + reservation_data.departure.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '!\n Refund status: '+refund+'\n Id:'+reservation.id,
                html: '<p>' + 'Your apartment has been canceled from ' + reservation_data.arrival.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' to ' + reservation_data.departure.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '!\n Refund status: '+refund + '\n Id:'+reservation.id+'</p>',
            }
            sgMail
                .send(inner_msg)
                .then(() => {
                    let output = {response: 'inner email sent successfully'};
                    logger.info(output, {structuredData: true});
                })
                .catch((error) => {
                    logger.error("Error sending inner email", error);
                })

                await db.collection('waiting-to-book')
                .where('arrival', '>=', reservation_data.arrival)
                .where('departure', '<=', reservation_data.departure)
                .get()
                .then(result => {
                    result.docs.forEach((doc) => {
                        const data = doc.data();
                        const msg = {
                            to: data.email,
                            from: 'luxurystays.help@gmail.com',
                            subject: 'Book the apartment now.',
                            text: 'Your dates (from ' + data.arrival.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' to ' + data.departure.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ') are now free, so you can book them.',
                            html: '<p>' + 'Your dates (from ' + data.arrival.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' to ' + data.departure.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ') are now free, so you can book them.' + '</p>',
                        }
                        sgMail
                            .send(msg)
                            .then(() => {
                                let output = {response: 'email sent successfully'};
                                logger.info(output, {structuredData: true});
                            })
                            .catch((error) => {
                                logger.error("Error sending email", error);
                            })
                    })
                }).catch(error => {
                    logger.error("Error", error);
                    });
        }
        catch (error){
            logger.error("Error cancellation booking function", error);
            if(!completed) res.status(500).json({ error: error.message });
        }
    });



exports.archive_reservations = onRequest(
    {region: "europe-central2",
    cors: domains},
    (req, res) => {
    try{
        const booked = db.collection('booked');
             booked
            .where('departure','<=',Timestamp.now())
            .get()
            .then(result=>{
                if(booked.count()>result.docs.length) {
                    result.docs.forEach((doc) => {
                        const id = doc.id;
                        db.collection('archived').doc(id).set(doc.data());
                        db.collection('booked').doc(id).delete();
                    })
                }
            })
            logger.log("Task executed successfully");
             res.status(200).json({operation: 'success'});
    }
    catch (error){
        logger.error("Error sending task", error);
        res.status(500).json({error: error.message});
    }
});


function  FormatDate(date) {
    date = date.split(' ');
    let months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return new Date(`${date[3]}-${months.indexOf(date[2])+1}-${date[1]}`);
}
*/


function verify(response,ip){
    return fetch({
        method: 'POST',
        body: JSON.stringify({
            secret: "6Let4oYqAAAAAHqadrypqzRpK8oh0A68H2-9z9DF",
            response: response,
            remoteip: ip
        }),
    })
        .then(res=>res.json())
        .then(data=>{
            return data.success;
        })
        .catch(()=>{
            return false
        })
}

exports.loginSession = onRequest(
    { cors: domains, region: "europe-central2" },
    async (req, res) => {
      logger.info(req.body);
      const idToken = req.body.idToken;
      const expiresIn = 60 * 60 * 1000; // 1 hour
  
      try {
        logger.info(req.headers);
        const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
        logger.info(sessionCookie);
  
        // Set cookie manually
        res.setHeader('Set-Cookie', `session=${sessionCookie}; Max-Age=${expiresIn/1000}; Path=/; HttpOnly; SameSite=Strict; Secure`);
  
        res.status(200).send({ status: 'success' });
      } catch (error) {
        logger.error(error);
        res.status(401).send('UNAUTHORIZED');
      }
    }
  );