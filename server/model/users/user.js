const mongoose = require("mongoose");
const USER = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "please add a name "],
    },
    middlename: {
      type: String,
    },
    surname: {
      type: String,
      required: [true, "please add a surname "],
    },
    // passport:{
    //     type:String,//will be a string,
    //     required:[true,"please add a photo"]
    // },
    role: {
      type: String,
      default: "default",
      required: [true, "please specify a role"],
      default:"user"
    },
    email: {
      type: String,
      unique: true,
      required: [true, "please specify an email"],
      
    },

    password: {
      type: String,
    },
    // phoneNumber: {
    //   type: String,
    //   required: [true, "please include phone number"],
    // },

    proofOfPayment: {
      type: String,
    },
    sessionStorage: {
      type: String,
    },
    address:{
      type:String
    }
  },

  {
    timestamps: true,
  }
);
module.exports = mongoose.model("USER", USER);
