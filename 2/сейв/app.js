const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST'], 
  allowedHeaders: ['Content-Type'], 
  credentials: true,  // Разрешаем отправку куков
}));
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

// Обслуживание статических файлов (например, HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB подключена'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Модели
const CarouselItem = mongoose.model('CarouselItem', new mongoose.Schema({
  title: String,
  description: String,
  image: String,
}));

const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
}));

// Моковый пользователь (для теста)
let mockUser = {
  username: 'admin',
  password: '$2a$10$Y2J0sEx6TBGhjDlYFn2qv.H1.A1K7ofzZ9eRey1y2fuI9J9gH.YkW', // 'admin123'
  role: 'admin',
};

// Проверка авторизации
app.get('/check-auth', (req, res) => {
  if (req.session.user) {
    res.json({ isAuthenticated: true, user: req.session.user });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Страница входа
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Вход (POST)
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Проверка правильности логина и пароля
    if (username === mockUser.username && await bcrypt.compare(password, mockUser.password)) {
      req.session.user = { username: mockUser.username, role: mockUser.role };
      return res.json({ message: 'Успешный вход', user: req.session.user });
    } else {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Страница регистрации
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Регистрация (POST)
app.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Проверка, если такой пользователь уже существует
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ error: 'Пользователь с таким именем уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание нового пользователя
    const newUser = new User({
      username,
      password: hashedPassword,
      role: role || 'user',
    });

    await newUser.save();
    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Страница Dashboard
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Получение данных карусели
app.get('/carousel', async (req, res) => {
  const items = await CarouselItem.find();
  res.json(items);
});

// Добавление элемента в карусель
app.post('/carousel', async (req, res) => {
  if (!req.session.user) {
    return res.status(403).json({ error: 'Пользователь не авторизован' });
  }

  const { title, description, image } = req.body;

  if (!title || !description || !image) {
    return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
  }

  const newItem = new CarouselItem({ title, description, image });
  await newItem.save();
  res.status(201).json(newItem);
});

// Редактирование элемента карусели
app.put('/carousel/:id', async (req, res) => {
  const { title, description, image } = req.body;
  const { id } = req.params;

  const updatedItem = await CarouselItem.findByIdAndUpdate(id, { title, description, image }, { new: true });

  if (!updatedItem) {
    return res.status(404).json({ error: 'Элемент не найден' });
  }

  res.json(updatedItem);
});

// API для получения текущего времени
app.get('/api/time', (req, res) => {
  const currentTime = new Date();
  res.json({
    currentTime: currentTime.toISOString(), // Время в формате ISO
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер работает на http://localhost:${PORT}`);
});
