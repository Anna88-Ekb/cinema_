document.addEventListener('DOMContentLoaded', async () => {
  const filter_films_container = document.querySelector('.filter_films_container');
const filtered_films_container = document.querySelector('.filtered_films_container');

if (filter_films_container) {
  filter_films_container.addEventListener('click', (e) => {
    if (e.target.tagName === 'INPUT') {
      const filter_films = e.currentTarget.querySelectorAll(`input[name="${e.target.name}"]`);
      const all_filter_films = filter_films_container.querySelectorAll('input[type="checkbox"]:checked');
      filter_films.forEach(element => {
        if (element !== e.target && e.target.checked) {
          element.disabled = true;
          element.style.cursor = 'auto';
          element.nextElementSibling.style.backgroundColor = '#e14234';
          element.title = 'Можно применить только один фильтр';
        }
        if (!e.target.checked) {
          element.disabled = false;
          element.style.cursor = 'pointer';
          element.nextElementSibling.style.backgroundColor = '';
          element.title = 'Нажмите для применения фильтра';
        }
      });

      let type, country, age;
      all_filter_films.forEach((el) => {
        if (el.name === 'type') type = el.value;
        if (el.name === 'country') country = el.value;
        if (el.name === 'age') age = el.value;
      });

      const params = {
        type: type || false,
        country: country || false,
        age: age || false
      }
      createdListofFilters(params);
    }
  });
}

if (filtered_films_container) {
  filtered_films_container.addEventListener('click', async (e) => {
    if (e.target.classList.contains('filtered_films_resize_toBig')) {
      const name = e.target.parentElement.dataset.movieName;
      const filtered_films_cards = e.currentTarget.querySelectorAll('.filtered_films_cards');
      filtered_films_cards.forEach(el => {
        el.parentElement.removeChild(el);
      });

      const response = await fetch(`${window.origin}/api/movie/${name}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        filtered_films_container.innerHTML = '<p style = "color: var(--light_violet)">Произошла ошибка при загрузке</p>';
        throw new Error(`HTTP error! Status: ${response.status}`);
      } else {
        const movie = await response.json();
        const filtered_films = document.createElement('div');
        filtered_films.className = 'filtered_films filtered_films_full_screen';
        filtered_films.style.backgroundImage = `url('/posters/${movie.cinema_path}')`;
        filtered_films.innerHTML = `
        <button class="filtered_films_resize filtered_films_resize_toSmall" title="Свернуть"></button>
        <div class="filtered_films_descr">
        <h4>${movie.cinema_name}</h4>
        <div>
        <p>${movie.cinema_desc}</p>  
        <p>Страна:<span>${movie.country_desc}</span></p>
        <p>Возрастные ограничения:<span>${movie.age_desc}</span></p>
        <p>Длительность:<span>${movie.cinema_duration} мин.</span></p>
        </div><button class="btn_main_style btn_ordinary afisha_btn">Приобрести билет</button></div>`
        filtered_films_container.append(filtered_films);
        const filtered_films_resize_toSmall = filtered_films.querySelector('.filtered_films_resize_toSmall');
        filtered_films_resize_toSmall.addEventListener('click', async () => {
          const resize_films = filtered_films_container.querySelector('.filtered_films_full_screen');
          const result = await fetch('/filtered-movie');
          const new_content = await result.text();
          filtered_films_container.removeChild(resize_films);
          filtered_films_container.innerHTML = new_content;
        }, { once: true });
      }
    }
  })
};

async function createdListofFilters(params) {
  const query_str = new URLSearchParams(params).toString();
     const response = await fetch(`/filtered-movie?${query_str}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
});
const filtered_films_container = document.querySelector('.filtered_films_container');
const new_content = await response.text();
filtered_films_container.innerHTML = new_content;
}
});


