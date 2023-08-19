const mongoose = require("mongoose");
const SHOP = mongoose.Schema(
  {
    Userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "USER",
      required: true,
    },
    post: {
      type: String,
      required: [true, "please add a name "],
    },
    likescount: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);
module.exports = mongoose.model("SHOP", SHOP);
