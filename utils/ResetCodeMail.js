const nodemailer = require("nodemailer");

const sendCodeEmail = async (options) => {

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  
    const mailOpts = {
      from: `${process.env.FOUNDATION_NAME}`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };
  
    await transporter.sendMail(mailOpts);
  };
  
  module.exports = sendCodeEmail;