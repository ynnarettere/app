const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Нет токена авторизации' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Верификация токена
    req.user = decoded; // Добавляем информацию о пользователе в запрос
    next(); // Передаем выполнение дальше
  } catch (err) {
    return res.status(401).json({ message: 'Неверный токен' });
  }
};

module.exports = { protect };
