const mongoose = require("mongoose");
const POST = mongoose.Schema(
  {
    Userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "USER",
      required: true,
    },
    postid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "USER",
      required: true,
    },
    post: {
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
    Comment:{
      type:Boolean,
      default:false
    }
  },

  {
    timestamps: true,
  }
);
module.exports = mongoose.model("POST", POST);
