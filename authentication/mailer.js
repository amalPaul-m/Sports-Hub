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
      subject: 'Verify your SportsHub account', // Subject line
      text: `Your OTP for verification is: ${otp}`, // Plain text body
      html: `
    <div style="max-width: 500px; margin: 0 auto; padding: 30px; background-color: #ffffff; border-radius: 8px; font-family: Arial, sans-serif;">
      
      <h3 style="text-align: center; color: #000000ff;">OTP Verification</h3>
      <p style="text-align: center; font-size: 16px; color: #333333;">
        Hello <strong>Customer!</strong>,
      </p>
      <p style="text-align: center; font-size: 16px; color: #333333;">
        Your OTP for verification is:
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; background-color: #c2c2c2ff; color: #ffffff; font-size: 24px; letter-spacing: 4px; padding: 12px 24px; border-radius: 8px;">
          ${otp}
        </span>
      </div>
      <p style="text-align: center; font-size: 16px; color: #333333;">
        This OTP is valid for the next <strong>5 minutes</strong>.
      </p>
      <p style="text-align: center; font-size: 14px; color: #777777;">
        If you did not request this, please ignore this email.
      </p>
      <div style="text-align: center; font-size: 12px; color: #999999; margin-top: 30px;">
        &copy; 2025 Sports Hub. All rights reserved.
      </div>
    </div>
  `
    });
    return info.accepted.length > 0; // Return true if email was sent successfully

  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

module.exports = sendVerificationEmail;