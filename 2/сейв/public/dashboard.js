document.addEventListener('DOMContentLoaded', () => {
    // Данные для карусели (статичные данные)
    const carouselData = [
      {
        title: 'Нью-Йорк',
        description: 'Город небоскребов и культуры.',
        image: '/uploads/nyc.jpg'
      },
      {
        title: 'Астана',
        description: 'Современная столица Казахстана.',
        image: '/uploads/astana.jpg'
      },
      {
        title: 'Майами',
        description: 'Солнечные пляжи и веселье.',
        image: '/uploads/miami.jpg'
      }
    ];
  
    // Получаем контейнер для карусели
    const carouselContainer = document.getElementById('carousel-container');
  
    // Динамически добавляем элементы карусели
    carouselData.forEach(item => {
      const card = document.createElement('div');
      card.classList.add('carousel-item');
      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      `;
      carouselContainer.appendChild(card);
    });
  });
  