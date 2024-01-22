const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  // RegisteredDate:{type: String,required: true},
  // KycStatus:{ type: String, unique: true, required: true },
  // EmailStatus:{ type: String, unique: true, required: true },
  // UserStatus:{ type: String, unique: true, required: true },
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
