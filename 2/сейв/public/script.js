// scripts.js

// Проверяем роль пользователя
const currentUser = { role: 'admin' }; // Здесь подтягивается роль из сессии

if (currentUser.role === 'admin') {
  document.getElementById('admin-controls').style.display = 'block';
}

// Функция редактирования
function editContent() {
  const texts = document.querySelectorAll('[id^="text-"]');
  const images = document.querySelectorAll('[id^="img-"]');

  texts.forEach((text) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = text.textContent;
    text.replaceWith(input);
    input.id = text.id;
  });

  images.forEach((image) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.dataset.oldSrc = image.src;
    image.replaceWith(input);
    input.id = image.id;
  });
}

// Функция сохранения
function saveContent() {
  const texts = document.querySelectorAll('input[type="text"]');
  const images = document.querySelectorAll('input[type="file"]');

  const updatedData = {
    texts: Array.from(texts).map((input) => ({
      id: input.id,
      content: input.value,
    })),
    images: Array.from(images).map((input) => ({
      id: input.id,
      src: input.dataset.oldSrc,
      file: input.files[0],
    })),
  };

  // Отправляем обновленные данные на сервер
  const formData = new FormData();
  updatedData.texts.forEach((text) => formData.append(text.id, text.content));
  updatedData.images.forEach((image) => {
    if (image.file) {
      formData.append(image.id, image.file);
    }
  });

  fetch('/update-dashboard', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert('Контент обновлен!');
        location.reload();
      } else {
        alert('Ошибка обновления!');
      }
    })
    .catch((err) => console.error('Ошибка:', err));
}
