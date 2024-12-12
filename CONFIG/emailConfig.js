const dotenv = require("dotenv");
dotenv.config();
const config = require('../config')
const nodemailer = require("nodemailer");

//============= < SENG SMG GMAIL >===================//
const transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: false,
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
    },
});

//============= < VERIFY GMAIL >===================//
transporter.verify(function (error, success) {
    if (error) {
        console.error('Error while verifying transporter:', error);
    } else {
        console.log('Transporter ready for sending emails');
    }
});


module.exports = transporter;