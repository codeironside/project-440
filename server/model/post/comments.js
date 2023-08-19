const mongoose = require("mongoose");
const COMMENT = mongoose.Schema(
  {
    Userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "USER",
      required: true,
    },
    postid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "POST",
      required: true,
    },
    COMMENT: {
      type: String,
      required: [true, "post cant be empty"],
    },
    likescount: {
      type: Number,
      default:0
    },
    
    status: {
      type: String,
      default:"pending"
    },
   
  },

  {
    timestamps: true,
  }
);
module.exports = mongoose.model("COMMENT", COMMENT);
