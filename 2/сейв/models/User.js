const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});

// Указываем коллекцию 'users'
const User = mongoose.model('User', userSchema, 'users');

module.exports = User;
