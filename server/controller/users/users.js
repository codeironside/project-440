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
          width: 500px;
          margin: 0 auto;
           background-color: #063455;
          border: 2px solid  #063455;
          border-radius: 5px;
        }
        .email-header {
          /* background-color: #007bff; */
          color:  #063455;
          padding: 20px;
        }
        .email-body {
          background-color: #fff;
          padding: 20px;
        }
        .email-footer {
          /* background-color: #007bff; */
          color: #000;
          padding: 20px;
        }
      
        img {

            width: 150px;
            height: 100px;
            box-shadow: 0 4px 8px 0 rgba(209, 198, 198, 0.5), 0 6px 20px 0 rgba(240, 240, 241, 0.19);
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
          /* background-color: #007bff; */
          color: #fff;
          text-align: center;
          font-size: 20px;
          margin-bottom: 10px;
          line-height: 50px;
        }
      </style>
    </head>
    <body>
      <div class=" row email-container p-2 mt-3">
            <div class="row email-header">
            <img src="https://res.cloudinary.com/code-blooded/image/upload/v1692903564/Property_tael_leedc5.png" />

            <!--            <h5 class="justify-content-center text-align-center align-items-center">Welcome to Campulse</h5>
            <div class="creative-icon">🎉</div> -->
            </div>
            <div class="email-body ">
                <p><b>Hi ${firstName},</b></p>
                <p><b>We're so excited to have you join our blog+vlog community!</b></p>
                <p>We hope you enjoy our content and find it helpful.</p>
                <p>Here are a few things you can do to get started:</p>
                <ul>
                    <li><b>Browse our blog posts and watch our videos.</b></li>
                    <li><b>Leave comments and interact with other users.</b></li>
                    <li><b>Subscribe to our newsletter to stay up-to-date on the latest content.</b></li>
                </ul>
                <p>We're always looking for new ways to improve our blog+vlog, so please don't hesitate to give us feedback.</p>
                <p><b>Thanks for joining us!</b></p>
            </div>
            <div class="email-footer">
                <p style="color:#FEBC80;"><b>Sincerely,</b></p>
                <h6 style="color:#FEBC80;">Campulse</h6>
                <a href=""  style="color:#FEBC80;">login</a>
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
    res.status(202).json({otp:otp})
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
