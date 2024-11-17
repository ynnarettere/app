document.addEventListener('DOMContentLoaded', () => {
  const carouselContainer = document.getElementById('carousel-container');
  let carouselData = []; // Данные карусели

  const loadCarouselData = async () => {
    const res = await fetch('http://localhost:3000/carousel');
    carouselData = await res.json();
    renderCarousel();
  };

  const renderCarousel = () => {
    carouselContainer.innerHTML = '';
    carouselData.forEach(item => {
      const div = document.createElement('div');
      div.classList.add('carousel-item');
      div.innerHTML = `
        <img src="${item.image}" alt="${item.title}">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      `;
      carouselContainer.appendChild(div);
    });
  };

  loadCarouselData();

  // Добавление нового элемента
  document.getElementById('add-carousel-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('new-title').value;
    const description = document.getElementById('new-description').value;
    const image = document.getElementById('new-image').value;

    const res = await fetch('http://localhost:3000/carousel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, image }),
    });

    if (res.ok) {
      alert('Элемент добавлен');
      loadCarouselData();
    }
  });

  // Редактирование элемента
  document.getElementById('edit-carousel-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const title = document.getElementById('edit-title').value;
    const description = document.getElementById('edit-description').value;
    const image = document.getElementById('edit-image').value;

    const res = await fetch(`http://localhost:3000/carousel/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, image }),
    });

    if (res.ok) {
      alert('Элемент отредактирован');
      loadCarouselData();
    } else {
      alert('Ошибка редактирования');
    }
  });
});
