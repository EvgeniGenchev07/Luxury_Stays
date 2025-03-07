const {onRequest,onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const sgMail = require('@sendgrid/mail');
const functions = require('firebase-functions');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const {onDocumentDeleted} = require("firebase-functions/firestore");
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
initializeApp();
const db = getFirestore('orders-payments');
const domains = ['https://luxurystayskapanaplovdiv.web.app','https://luxurystays.bg'];
const price_per_night = 100;


exports.sendMail = onRequest(
    {cors:domains,
    region: "europe-central2"}
    ,(req, res) => {
    const obj = JSON.parse(req.body);
    if(verify(obj.grecaptcha_response,req.ip)) {
        const msg = {
            to: 'luxurystays.help@gmail.com',
            from: 'zakg665@gmail.com',
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
                res.status(500).json({error: "Failed to send email", details: error.message,verified: false});
            })
    }
    else{
        res.status(500).send({verified: false});
    }
});




exports.createPaymentIntent = onRequest(
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
                });*/
            await reservation.delete();
            completed = true;
            res.status(200).json({operation: 'success'});
            const outer_msg = {
                to: reservation_data.email,
                from: 'luxurystays.help@gmail.com',
                subject: 'Reservation cancelled',
                text: 'Your reservation from ' +reservation_data.arrival.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' to ' + reservation_data.departure.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + 'has been cancelled. Reservation id: '+reservation.id,
                html: '<p>' + 'Your reservation from ' +reservation_data.arrival.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' to ' + reservation_data.departure.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + 'has been cancelled. Reservation id: '+reservation.id+'</p>',
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
                text: 'Your apartment has been cancelled from ' +reservation_data.arrival.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' to ' + reservation_data.departure.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '!\n Refund status: '+refund+'\n Id:'+reservation.id,
                html: '<p>' + 'Your apartment has been cancelled from ' + reservation_data.arrival.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' to ' + reservation_data.departure.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '!\n Refund status: '+refund + '\n Id:'+reservation.id+'</p>',
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
