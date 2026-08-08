const nodemailer = require('nodemailer');
const axios = require('axios');

const sendEmail = async (options) => {
  if (process.env.SENDGRID_API_KEY) {
    // Send email using SendGrid's Web API (HTTPS - never blocked by cloud firewalls)
    await axios.post('https://api.sendgrid.com/v3/mail/send', {
      personalizations: [{
        to: [{ email: options.to }]
      }],
      from: {
        email: process.env.EMAIL_USER || 'devhubapp.support@gmail.com',
        name: 'DevHub'
      },
      subject: options.subject,
      content: [{
        type: 'text/html',
        value: options.html
      }]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
  } else {
    // Fallback to SMTP/Nodemailer for local environment
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Bypass some SSL handshake failures
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });

    const mailOptions = {
      from: `"DevHub Auth" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
  }
};

module.exports = sendEmail;
