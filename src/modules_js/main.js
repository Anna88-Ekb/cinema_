//ПЕРЕМЕННЫЕ
const section_premiere = document.querySelector('.premiere');
const about_us = document.querySelector('.about_us');
const premiere_slider_prev = document.querySelector('.premiere_slider_prev');
const premiere_slider_next = document.querySelector('.premiere_slider_next');
/* const menu_main_list = document.querySelector('.menu_main_list');
const entrance_form_btn = document.querySelector('.entrance_form_btn');
const contacts = document.querySelector('.contacts'); */
const footer = document.querySelector('#footer');
const pages = document.querySelectorAll('.pages');
const main_page = menu_main_list.querySelectorAll('.main_page');
const second_page = menu_main_list.querySelectorAll('.second_page');
const spider_man_img = document.querySelector('.spider-man');
const today_buy_btn = document.querySelector('.today_buy_btn');
const main_container = document.querySelectorAll('.container');
//СОЗДАНИЕ ЭЛЕМЕНТОВ
const div = document.createElement('div');
const p = document.createElement('p');
const h3 = document.createElement('h3');
const h4 = document.createElement('h4');
const span = document.createElement('span');
const ul = document.createElement('ul');
const li = document.createElement('li');
const input = document.createElement('input');
const table = document.createElement('table');
const thead = document.createElement('thead');
const tbody = document.createElement('tbody');
const tr = document.createElement('tr');
const th = document.createElement('th');
const td = document.createElement('td');
//ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ДЛЯ ЧАСТОГО ИСП.
const months = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
];
const all_nums = '0123456789';
const abc = 'abcdefghijklmnopqrstuvwxyz';
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const rus_abc = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
const RUS_ABC = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
const symbols = './?><!@#$%^&*()-_=+';
const symbols_mini = '.-_';
//СОБЫТИЯ
/* entrance_form_btn.addEventListener('click', openEntranceForm);
contacts.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({
    top: footer.parentElement.clientHeight,
    behavior: "smooth"
  });
}) */

/* movie_list_btn.addEventListener('click', getVisibleMovieList); */

//Подменю меню
Array.from(menu_main_list.children).forEach(el => {
  let li_child = el.querySelector('ul');
  if (li_child) {
    el.addEventListener('mouseover', () => {
      li_child.classList.toggle('visibility');
    })
    el.addEventListener('mouseout', () => {
      li_child.classList.toggle('visibility');
    })
  }
});

//Навигация по страницам

/* main_page.forEach(link => link.addEventListener('click', openMainPage)); */
