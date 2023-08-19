const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const USER = require("../../model/users/user");
const asyncHandler = require("express-async-handler");
const userlogger = require("../../utils/userlogger");
const jwt = require("jsonwebtoken");

//home page

const home = asyncHandler(async (req, res) => {
  if (!req.session.userid) {
    console.log(req.session.id);
    res.redirect("user/register");
  }
});

//@route GET/usersllogin
//desc login users
//access public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const id = await USER.findOne({ email: email });
  if (id) {
    if (id && bcrypt.compare(password, id.password)) {
      req.session.userid = req.session.id;
      req.session.role = id.role;
      const change = await USER.findByIdAndUpdate(
        id._id,
        { sessionStorage: req.session.id },
        { new: true }
      );
      if (change) {
        res.status(202).json({
          userid: req.session.userid,
          role: req.session.role,
          token: generateToken(id._id),
        });
        userlogger.info(
          ` user with userid: ${email} logged in coode:200 - ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip} `
        );
      }
    }
  } else {
    throw new Error("user not found");
  }
});

//@route POST/users/register
//desc register users
//access public
const register = asyncHandler(async (req, res) => {
  const { firstName, middlename, surname, email, password, phoneNumber } =
    req.body;

  const check = await USER.findOne({ email: email });
  if (check) {
    throw new Error("user exist");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedpassword = await bcrypt.hash(password, salt);
  const user = await USER.create({
    firstName,
    middlename,
    surname,
    email,
    password: hashedpassword,
    phoneNumber,
  });

  if (user) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.email,
        pass: process.env.password,
      },
    });

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
      <title>Welcome to [Blog+Vlog Name]</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.6.0/css/bootstrap.min.css">
      <style>
        /* Custom styles */
        .email-container {
          width: 600px;
          margin: 0 auto;
          background-color: #007bff;
        }
        .email-header {
          background-color: #007bff;
          color: #fff;
          padding: 20px;
        }
        .email-body {
          background-color: #fff;
          padding: 20px;
        }
        .email-footer {
          background-color: #007bff;
          color: #fff;
          padding: 20px;
        }
        img {
          width: 100%;
        }
        .demo-icon {
          width: 100%;
          display: block;
          margin-top: 20px;
        }
        .creative-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #007bff;
          color: #fff;
          text-align: center;
          font-size: 20px;
          margin-bottom: 10px;
          line-height: 50px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>Welcome to Campulse</h1>
          <div class="creative-icon">🎉</div>
        </div>
        <div class="email-body">
          <p>Hi ${firstName},</p>
          <p>We're so excited to have you join our blog+vlog community!</p>
          <p>We hope you enjoy our content and find it helpful.</p>
          <p>Here are a few things you can do to get started:</p>
          <ul>
            <li>Browse our blog posts and watch our videos.</li>
            <li>Leave comments and interact with other users.</li>
            <li>Subscribe to our newsletter to stay up-to-date on the latest content.</li>
          </ul>
          <p>We're always looking for new ways to improve our blog+vlog, so please don't hesitate to give us feedback.</p>
          <p>Thanks for joining us!</p>
        </div>
        <div class="email-footer">
          <p>Sincerely,</p>
          <p>Campulse</p>
        </div>
      </div>
    </body>
    </html>
    
    
  `;

    const mailOptions = {
      from: process.env.email,
      to: email,
      subject: "Welcome to Campulse",
      html: html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.status(400);
        console.log(error);
        throw new Error("email not sent");
      } else {
        console.log("Email sent: " + info.response);
        userlogger.info(
          `Email sent to ${email}:${req.session.id}:250 - ${res.statusMessage}  - ${req.originalUrl} - ${req.method} - ${req.ip}-${info.response}`
        );
      }
      res.status(202).json({
        firstname: firstName,
        middleName: middlename,
      });
      userlogger.info(
        `${email} account created ${res.statusCode} - ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip} `
      );
    });
  }
});

//@route GET/users/logout
//desc logout users
//access public
const logout = asyncHandler(async (req, res) => {
  req.session.destroy();
});

const forgottenpassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const findemail = USER.findOne({ email: email });

  if (findemail) {
    // Generate a secret
    const secret = speakeasy.generateSecret({ length: 16 }); // Using 16 characters for 8 digits

    // Get the current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);
    await USER.findOneAndUpdate({ email: email }, { secret: secret.base32 }, { new: true })
    .then(updatedUser => {
      if (!updatedUser) {
        console.log('User not found.');
        return;
      }
      
      console.log('User secret updated:', updatedUser);
    })
    .catch(err => {
      console.error('Error updating user:', err);
    });
    // Generate the OTP with a 30-second duration
    const otp = speakeasy.totp({
      secret: secret.base32,
      encoding: "base32",
      digits: 8,
      window: 30, // Set the time step to 30 seconds
    });

    console.log("Secret:", secret.base32);
    console.log("Current Time:", currentTime);
    console.log("Generated OTP:", otp);
  }
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const currentTime = Math.floor(Date.now() / 1000);

  const otpValidationResult = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: userEnteredOTP,
    digits: 8,
    window: 1, // Number of time steps the OTP can deviate
  });

  if (otpValidationResult) {
    if (currentTime + 30 >= Math.floor(Date.now() / 1000)) {
      return "OTP is valid and has not expired.";
    } else {
      return "OTP is valid but has expired.";
    }
  } else {
    return "OTP is invalid!";
  }
});
const generateToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );
};

module.exports = { register, login, home,forgottenpassword };
