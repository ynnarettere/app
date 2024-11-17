const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Настройка сессий
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/yourDBName', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB подключена');
})
.catch((err) => {
  console.error('Ошибка подключения к MongoDB:', err);
});

// Подключаем статические файлы из папки public
app.use(express.static(path.join(__dirname, 'public')));

// Моковые данные для карусели
const carouselData = [
  { image: '1.jpg', title: 'New York', description: 'It is a vibrant and diverse metropolis, famous for its iconic landmarks such as Times Square and the Statue of Liberty.' },
  { image: '2.jpg', title: 'Astana', description: 'The city attracts tourists with its unusual buildings, such as Baiterek and the Palace of Peace and Reconciliation.' },
  { image: '3.jpg', title: 'Miami', description: 'Resort town on the Florida coast, famous for its beaches, vibrant nightlife and cultural diversity.' }
];

// Моковый пользователь для входа
let mockUser = {
  username: 'admin',
  password: '$2a$10$Y2J0sEx6TBGhjDlYFn2qv.H1.A1K7ofzZ9eRey1y2fuI9J9gH.YkW', // 'admin123'
  role: 'admin',
};

// Маршрут для страницы логина (GET)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Маршрут для страницы Dashboard (доступная всем)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Маршрут для входа (POST)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Проверка логина
  if (username === mockUser.username && await bcrypt.compare(password, mockUser.password)) {
    req.session.user = {
      username: mockUser.username,
      role: mockUser.role,
    };
    res.redirect('/dashboard');
  } else {
    res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
  }
});

// Маршрут для регистрации (GET)
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Маршрут для регистрации пользователя (POST)
app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  // Хешируем пароль перед сохранением
  const hashedPassword = await bcrypt.hash(password, 10);

  // Логика сохранения пользователя в базе данных (например, MongoDB)
  mockUser = {
    username,
    password: hashedPassword,
    role,
  };

  res.json({ message: 'Регистрация прошла успешно' });
});

// Маршрут для получения данных карусели
app.get('/carousel', (req, res) => {
  res.json(carouselData);
});

// Маршрут для обновления описания карусели (доступен только админам)
app.post('/update-carousel', (req, res) => {
  // Проверка на роль администратора
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { index, title, description } = req.body;
  if (index >= 0 && index < carouselData.length) {
    carouselData[index].title = title;
    carouselData[index].description = description;
    res.json({ message: 'Данные обновлены успешно!' });
  } else {
    res.status(400).json({ message: 'Неверный индекс' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер работает на http://localhost:${PORT}`);
});
