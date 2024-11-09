const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

const Users = mongoose.model("Users", userSchema);

module.exports = Users;