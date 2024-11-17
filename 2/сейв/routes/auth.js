const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Регистрация нового пользователя
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Пожалуйста, заполните все поля.' });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: 'Пользователь уже существует' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    password: hashedPassword,
    role,
  });

  await newUser.save();

  // Генерация токена
  const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.status(201).json({ message: 'Пользователь зарегистрирован', token });
});

// Логин (получение токена)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Пожалуйста, заполните все поля.' });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: 'Пользователь не найден' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Неверный пароль' });
  }

  // Генерация токена
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.json({ message: 'Успешный вход', token });
});

module.exports = router;
