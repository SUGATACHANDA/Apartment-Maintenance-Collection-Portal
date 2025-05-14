const nodemailer = require('nodemailer');

module.exports = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Maintenance Payment Login',
        html: `<p>Your OTP is <b>${otp}</b>. It will expire in 10 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);
};