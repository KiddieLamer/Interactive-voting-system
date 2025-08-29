const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (email, otp, voterName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '🔒 Your Voting OTP Code',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🗳️ Interactive Voting System</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Secure & Transparent</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Hello ${voterName}!</h2>
          <p style="color: #666; font-size: 16px;">Your One-Time Password (OTP) for voting is:</p>
          <div style="background: #f8f9fa; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 14px;">⏰ This code will expire in 10 minutes for security reasons.</p>
          <p style="color: #666; font-size: 14px;">🔒 Never share this code with anyone. Our team will never ask for your OTP.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #999; font-size: 12px;">Interactive Voting System - Making Democracy Digital & Secure</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

module.exports = { sendOTP };