const {onRequest,onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey("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")
const stripe = require("stripe")('sk_test_51QKkDvG0ZquPZmE5yzmwY0TSDefu7sgCBuArVA1dHisak3wboBHXwflWTDdIG1tXWlfY141UN6HW0C5wrfH5XA0Q00TMGOYShG');
exports.sendMail = onRequest(
    {cors:['https://luxurystayskapanaplovdiv.web.app'],
    region: "europe-central2"}
    ,(req, res) => {
    const obj = JSON.parse(req.body);
    const msg = {
        to: 'borislava_ilieva@abv.bg',
        from: 'zakg665@gmail.com',
        subject: obj.subject,
        text: obj.message + '\n from ' + obj.name + '(' + obj.email + ')',
        html: '<p>' + obj.message + '\n from ' + obj.name + ' (' + obj.email + ')</p>',
    }
    sgMail
        .send(msg)
        .then(() => {
            let output = {response: 'email sent successfully'};
            res.json(output);
            logger.info(output, { structuredData: true });
        })
        .catch((error) => {
            logger.error("Error sending email", error);
            res.json({error: "Failed to send email", details: error.message});
        })
});
exports.createPaymentIntent = onRequest(
    {cors:['https://luxurystayskapanaplovdiv.web.app'],
        region: "europe-central2"}
    ,async (req, res)=>{

            //const {items} = req.body;

            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                amount: 100,
                currency: "bgn",
                // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
                // [DEV]: For demo purposes only, you should avoid exposing the PaymentIntent ID in the client-side code.
                dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
            });
    });