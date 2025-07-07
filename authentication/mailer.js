const e = require('express');
const nodemailer = require('nodemailer');
const { use } = require('passport');

async function sendVerificationEmail(email, otp) {

  try {

    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use your email service provider
      port: 587, // Port for secure SMTP
      secure: false,
      requireTLS: true, // Use TLS
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS // Your email password or app password
      }
    });

    const info = await transporter.sendMail({
      from: `"Sports Hub" <${process.env.EMAIL_USER}>`, // Sender address
      to: email, // List of recipients
      subject: 'Verify', // Subject line
      text: `Your OTP for verification is: ${otp}`, // Plain text body
      html: `<p>Your OTP for verification is: <strong>${otp}</strong></p>` // HTML body
    });
    return info.accepted.length > 0; // Return true if email was sent successfully

  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

module.exports = sendVerificationEmail;