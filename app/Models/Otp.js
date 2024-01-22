const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
    required: true,
  },
});

const OTPModel = mongoose.model('OTP', otpSchema);

module.exports = OTPModel;