/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 294:
/***/ (() => {

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




/***/ }),

/***/ 978:
/***/ ((__webpack_module__, __unused_webpack___webpack_exports__, __webpack_require__) => {

__webpack_require__.a(__webpack_module__, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
const cinema_sessions_filter = document.querySelector('.cinema_sessions_filter');
const cinema_sessions_halls = document.querySelector('.cinema_sessions_halls');

if (cinema_sessions_filter) {
  cinema_sessions_filter.addEventListener('click', async function (e) {
    const input = cinema_sessions_filter.querySelector('input[type="text"]');
    input.addEventListener('input', findTextOverlap);

    if (e.target.classList.contains('movie_list_btn') || (e.target.tagName === 'SPAN' &&  e.target.parentElement.classList.contains('movie_list_btn')) ) {
      cinema_sessions_filter.children[1].classList.contains('block') ?
        (cinema_sessions_filter.children[1].classList.remove('block'),
          cinema_sessions_filter.children[1].classList.add('unblock'),
          cinema_sessions_filter.classList.remove('gradient')) :
        (cinema_sessions_filter.children[1].classList.remove('unblock'),
          cinema_sessions_filter.children[1].classList.add('block'),
          cinema_sessions_filter.classList.add('gradient'));
    }

    if (e.target === input) {
      if (!cinema_sessions_filter.children[1].classList.contains('block')) {
        cinema_sessions_filter.children[1].classList.add('block');
        cinema_sessions_filter.children[1].classList.remove('unblock');
        cinema_sessions_filter.classList.add('gradient');
      }
    }

    if (e.target.tagName === "LI") {
      input.value = e.target.textContent;
    }

    if(e.target.classList.contains('search_list_btn') || (e.target.tagName == 'SPAN' && e.target.parentElement.classList.contains('search_list_btn'))) {
      if(input.value.trim()!='') {
        const tables = document.querySelectorAll('.cinema_sessions_calendar_slider_container table');
        const response = await fetch(`${window.origin}/api/movie-days/${input.value.toLowerCase()}`, {
          method: 'GET',
          headers: {'Content-Type': 'application/json'} 
        });
        const days = await response.json();
        if(tables) {
          tables.forEach(table=> {
            const a = table.querySelectorAll('a');
            a.forEach(el=> el.style='');
          });
  
          tables.forEach((table) => {;
            let table_month = table.dataset.monthNum;
            table_month = table_month.length==1 ? '0'+ table_month:table_month;
            const table_year = table.dataset.year;
            const start_date = new Date(+table_year, +table_month - 1, 1).getDay();
            const start_index = start_date == 0 ? 6 : start_date - 1;
            const filtered_days = [...days].filter(el => {
              if(el.session.substring(0, 4) === table_year && el.session.substring(5, 7) === table_month) {
                return el;
              };
            });
    
            if(filtered_days.length>0) {
              const tds = table.querySelectorAll('tbody td');
              filtered_days.forEach(el => {
                tds[+el.session.substring(8) - 1 + start_index].children[0].style.backgroundImage = `url(/posters/${el.cinema_path})`;
              });}
          });
        }
      }
    }
  })
}

function findTextOverlap() {
  const search_value = this.value.toLowerCase();
  const list = document.querySelectorAll('.cinema_sessions_filter ul li');
  const list_text = [...list].map(el => el.textContent.toLowerCase());
  const marks = document.querySelectorAll('.cinema_sessions_filter ul li mark');
  if (marks) { marks.forEach(el => el.parentElement.textContent = el.parentElement.textContent) }

  if (search_value.length > 1) {
    const check = list_text.some(el => el.includes(search_value));
    if (check) {
      list_text.forEach((el, i) => {
        if (el.includes(search_value)) {
          const index = el.indexOf(search_value);
          const before = list[i].textContent.substring(0, index);
          const match = list[i].textContent.substring(index, index + search_value.length);
          const after = list[i].textContent.substring(index + search_value.length);
          list[i].innerHTML = before + '<mark class="marked"><b>' + match + '</b></mark>' + after;
          this.setAttribute('maxlength', `${search_value.length + 1}`);
        }
        list[i].scrollIntoView({
          behavior: 'instant',
          block: 'nearest'
        });
      })
    } else {
      this.setAttribute('maxlength', '2')
    }
  }

}

createTableSlider('cinema_sessions_calendar_slider_container', 'cinema_sessions_calendar_prev', 'cinema_sessions_calendar_next');

function createTableSlider(parent_class, class_prev, class_next) {
  const prev = document.querySelector(`.${class_prev}`);
  const next = document.querySelector(`.${class_next}`);
  let tables = document.querySelectorAll(`.${parent_class} table`);
  prev.style.display = 'none';
  let i = 0;
  next.addEventListener('click', function () {
    if (i < tables.length) {
      tables = document.querySelectorAll(`.${parent_class} table`);
      tables[0].parentElement.insertAdjacentElement('beforeend', tables[0]);
      prev.style.display = 'block';
      i++;
    }
    if (i === tables.length - 1) {
      this.style.display = 'none';
    }
  });
  prev.addEventListener('click', function () {
    if (i < tables.length) {
      tables = document.querySelectorAll(`.${parent_class} table`);
      tables[tables.length - 1].parentElement.insertAdjacentElement('afterbegin', tables[tables.length - 1]);
      next.style.display = 'block';
      i--;
    }
    if (i === 0) {
      this.style.display = 'none';
    }
  });
};

const tables = document.querySelectorAll('.cinema_sessions_calendar_slider_container table');
if (tables) {
  const response = await fetch(`${window.origin}/api/movies-calendar-days`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json'}
  });
  const sessions = await response.json();
  const date = new Date();
  tables.forEach(table => {
    const all_td = table.querySelectorAll('tbody td');
    const table_month = table.dataset.monthNum;
    const table_year = table.dataset.year;
    const start_date = new Date(+table_year, +table_month - 1, 1).getDay();
    const start_index = start_date == 0 ? 6 : start_date - 1;
    const filtered_response = sessions.filter(el => el.month === table_month);
    filtered_response.forEach((el, i) => {
      all_td[el.day - 1 + start_index].innerHTML = `<a title="Расписание"><span>${el.day}</span></a>`;
    });
    table.addEventListener('click', async (e) => {
      if (e.target.tagName === 'A' || e.target.tagName === 'SPAN' && e.target.parentElement.tagName === 'A') {
        const day = e.target.textContent.trim() || e.target.children[0].textContent.trim();
        if (+day >= 1 && +day <= 31 && cinema_sessions_halls) {
          const params = {
            'year': e.currentTarget.dataset.year || '', 
            'month': e.currentTarget.dataset.monthNum || '', 
            'day': day || ''
          };
          const param = new URLSearchParams(params).toString();
          const response = await fetch(`${window.origin}/schedule-day/?${param}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const halls = await response.text();
        cinema_sessions_halls.innerHTML = halls;
        [...cinema_sessions_halls.children].forEach(hall => addSortType(hall, 4));
        }
      }
    });
  })
}

function addSortType(hall, td_num) {
  const table = hall.querySelector('table');
  const trs_length = table.querySelectorAll('tbody tr').length;
  const tds_last = table.querySelectorAll(`tbody tr td:nth-child(${td_num})`);
  const check = [...tds_last].every(el=> el.textContent == tds_last[0].textContent);
  const th_title = table.querySelector(`th:nth-child(${td_num})`);
  if (trs_length > 1 && !check) {
    th_title.title = 'Сортировать';
    th_title.className = 'down';
    th_title.addEventListener('click', () => {
      sortingTable(table, th_title, td_num);
    });
  }
}

function sortingTableAlg(trs, name_class, td_num) {

  let trs_sorted = Array.from(trs).sort((a, b) => {
    let A, B;
      A = a.children[td_num-1].innerHTML;
      B = b.children[td_num-1].innerHTML;

    if (name_class === 'down') {
      if (A > B) return 1;
      if (A < B) return -1;
      return 0;
    }

    if (name_class === 'up') {
      if (A > B) return -1;
      if (A < B) return 1;
      return 0;
    }
  });

  return trs_sorted;
}

function sortingTable(table, th_title, td_num) {
  let tbody = table.querySelector('tbody');
  let new_tbody = document.createElement('tbody');
  let trs = Array.from(tbody.querySelectorAll('tr'));
  let sortedTrs = sortingTableAlg(trs, th_title.className, td_num);
  new_tbody.append(...sortedTrs);
  table.replaceChild(new_tbody, tbody);
  th_title.className = th_title.className === 'down' ? 'up' : 'down';
}
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } }, 1);

/***/ }),

/***/ 70:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HP: () => (/* binding */ spaceInputCheck),
/* harmony export */   KC: () => (/* binding */ validateLoginLength),
/* harmony export */   Kc: () => (/* binding */ hidePass),
/* harmony export */   Lv: () => (/* binding */ validateEmailLength),
/* harmony export */   Yt: () => (/* binding */ validatePhoneNums),
/* harmony export */   eX: () => (/* binding */ validatePasswordLength),
/* harmony export */   xI: () => (/* binding */ validatePhoneLength),
/* harmony export */   zM: () => (/* binding */ postAHint)
/* harmony export */ });
/* unused harmony export returnErrorText */

const months = (/* unused pure expression or super */ null && ([
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
]));
const all_nums = '0123456789';
const abc = 'abcdefghijklmnopqrstuvwxyz';
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const rus_abc = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
const RUS_ABC = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
const symbols = './?><!@#$%^&*()-_=+';
const symbols_mini = '.-_';

function hidePass({ passes = false }) {
  if (!passes) { this.previousElementSibling.type == 'text' ? this.previousElementSibling.type = 'password' : this.previousElementSibling.type = 'text'; }
  else {
    passes.forEach(el => {
      el.previousElementSibling.type == "text" ? el.previousElementSibling.type = "password" : el.previousElementSibling.type = "text";
    });
  }
}

//разместить подсказку
function postAHint(input, text_error) {
  const p = document.createElement('p');
  p.textContent = text_error;
  if (input.parentElement.lastElementChild.tagName === 'P') {
    input.parentElement.removeChild(input.parentElement.lastElementChild);
  }
  input.parentElement.append(p);
  input.addEventListener('input', function () {
    if (this.parentElement.lastElementChild.tagName === 'P') {
      this.parentElement.removeChild(this.parentElement.lastElementChild);
    }
  }, { once: true });
}

function validatePhoneNums(input) {
  const start_phone = '+7';
  let value = input.value.trim();

  if (!value.startsWith(start_phone)) {
    value = start_phone + '()';
  }

  let after_start_phone_nums = value.substring(3);

  if (after_start_phone_nums[0] === '0') {
    value = start_phone + '()';
  } else {
    let res = [];
    for (let i = 0; i < after_start_phone_nums.length; i++) {
      if (all_nums.includes(after_start_phone_nums[i])) {
        res.push(after_start_phone_nums[i]);
      }
    }

    let formatted = start_phone;

    if (res.length > 0) {
      formatted += '(' + res.slice(0, 3).join('') + ')';
    } else {
      formatted += '()';
    }

    if (res.length > 3) {
      formatted += res.slice(3, 6).join('');
    }

    if (res.length > 6) {
      formatted += '-' + res.slice(6, 8).join('');
    }

    if (res.length > 8) {
      formatted += '-' + res.slice(8, 10).join('');
    }

    value = formatted;
  }

  input.value = value;
}

function validatePhoneLength(input) {
  let arr_nums = Array.from(input.value).filter(el => all_nums.includes(el));
  if (arr_nums.length < 11) {
    return postAHint(input, "Номер телефона должен содержать 11 цифр");
  }
  if (input.value.includes(' ')) {
    return postAHint(input, "Пробелы не допускаются");
  }
  return true;
}

function returnErrorText(parent, text, time) {
  const parent_start_text = parent.textContent;
  parent.textContent = text;
  setTimeout(function () {
    text === parent_start_text ? parent.textContent = "" : parent.textContent = parent_start_text;
  }, time);
}

function spaceInputCheck(input) {
  if (input.value.indexOf(' ') != -1) { input.value = input.value.split(' ').join('') };
}

function validateEmailLength(input) {
  if (input.value.length < 6) {
    return postAHint(input, "Не менее 6 символов");
  }

  if (input.value.length > 30) {
    input.value = input.value.substring(0, 30);
    return postAHint(input, "Допускается 30 символов к вводу");
  };

  if (input.value.includes(' ')) {
    return postAHint(input, "Пробелы не допускаются");
  }

  if (!abc.includes(input.value[input.value.length - 1]) && !ABC.includes(input.value[input.value.length - 1])
    && !rus_abc.includes(input.value[input.value.length - 1]) && !RUS_ABC.includes(input.value[input.value.length - 1]) && !all_nums.includes(input.value[input.value.length - 1])) {
    return postAHint(input, "Доменная зона не может заканчиваться на символ");
  }

  let temp = input.value.split('@');

  if (temp.length != 2) {
    return postAHint(input, "Поле почты должно содержать @");
  }


  let check_temp_rus = temp[0].split('').some(el => {
    if (rus_abc.includes(el) || RUS_ABC.includes(el)) {
      return true;
    }
  })

  if (check_temp_rus) {
    return postAHint(input, "Имя почты не должно содержать кириллицу");
  }


  let domain = input.value.substring(input.value.lastIndexOf('@') + 1);
  let check_ru = [...domain].every(el => rus_abc.includes(el) || RUS_ABC.includes(el) || all_nums.includes(el) || '._-'.includes(el));
  let check_en = [...domain].every(el => abc.includes(el) || ABC.includes(el) || all_nums.includes(el) || '._-'.includes(el));

  if (!check_en && !check_ru) {
    return postAHint(input, "В доменной зоне должен быть один алфавит");
  }


  if (!rus_abc.includes(domain[0]) && !RUS_ABC.includes(domain[0]) && !abc.includes(domain[0]) && !ABC.includes(domain[0]) && !all_nums.includes(domain[0])) {
    return postAHint(input, "За знаком @ только буквенно-числовые символы");
  }


  if (!domain.includes('.')) {
    return postAHint(input, "Доменная зона должна разделяться точкой");
  }

  let domain_zone = domain.substring(domain.lastIndexOf('.') + 1);
  if (domain_zone.length < 2) {
    return postAHint(input, "Доменная зона должна содержать два символа и больше");
  }

  return true;

};

function validateLoginLength(input) {
  if (input.value.length < 8) {
    return postAHint(input, "Не менее 8 символов");
  }

  if (input.value.length > 20) {
    input.value = input.value.substring(0, 20);
    return postAHint(input, "Допускается 20 символов к вводу");
  };

  if (input.value.includes(' ')) {
    return postAHint(input, "Пробелы не допускаются");
  }

  [...input.value].forEach(el => {
    if (!abc.includes(el) && !ABC.includes(el) && !all_nums.includes(el) && !symbols.includes(el)) {
      return postAHint(input, `Логин должен состоять из латинских символов, цифр или ${symbols}`);
    }
  })
  return true;
}

function validatePasswordLength(input) {
  if (input.value.length < 10) {
    return postAHint(input, "Не менее 10 символов");
  }

  if (input.value.length > 30) {
    input.value = input.value.substring(0, 30);
    return postAHint(input, "Допускается 30 символов к вводу");
  };

  if (input.value.includes(' ')) {
    return postAHint(input, "Пробелы не допускаются");
  }

  [...input.value].forEach(el => {
    if (!abc.includes(el) && !ABC.includes(el) && !all_nums.includes(el) && !symbols.includes(el)) {
      return postAHint(input, `Пароль должен состоять из латинских символов, цифр или ${symbols}`);
    }
  })

  let temp_abc = [...input.value].every(el => abc.includes(el));
  let temp_ABC = [...input.value].every(el => ABC.includes(el));
  let temp_nums = [...input.value].every(el => all_nums.includes(el));
  let temp_symbols = [...input.value].every(el => symbols.includes(el));

  if (temp_abc || temp_ABC || temp_nums || temp_symbols) {
    return postAHint(input, `Пароль должен состоять из различного типа символов`);
  }

  return true;
}



/***/ }),

/***/ 647:
/***/ ((__unused_webpack___webpack_module__, __unused_webpack___webpack_exports__, __webpack_require__) => {

/* harmony import */ var _client_validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(70);


const menu_main_list = document.querySelector('.menu_main_list');
const entrance_form_btn = document.querySelector('.entrance_form_btn');
const contacts = document.querySelector('.contacts');

Array.from(menu_main_list.children).forEach(el => {
  let li_child = el.querySelector('ul');
  if (li_child) {
    el.addEventListener('mouseover', () => {
      li_child.classList.add('visibility');
    })
    el.addEventListener('mouseout', () => {
      li_child.classList.remove('visibility');
    })
  }
});

contacts.addEventListener('click', (e) => {
  const footer = document.querySelector('#footer');
  e.preventDefault();
  window.scrollTo({
    top: footer.parentElement.clientHeight,
    behavior: "smooth"
  });
})

entrance_form_btn.addEventListener('click', openEntranceForm);

function openEntranceForm() {
  // ПЕРЕМЕННЫЕ ФОРМ
  const forms = document.querySelectorAll('.entrance_form_big_container form');
  const [entrance_form, registration_form, restore_password_form] = forms;
  const form_close = document.querySelector('.entrance_form_close');
  const entrance_form_menu = entrance_form.querySelectorAll('a');
  const [registration_btn, restore_password_btn] = entrance_form_menu;
  let select = document.querySelector('.restore_password_form select');
  const reset_pass_type = select.nextElementSibling.querySelector('input');
  const entrance = entrance_form.querySelector('input[type="button"]');
  const hide_pass = entrance_form.querySelector('.password+svg');
  let prev_form_btn;
  entrance_form.parentElement.parentElement.style.display = 'block';
  entrance_form.style.display = 'block';
  document.body.style.overflowY = 'hidden';

  //СОБЫТИЯ
  // Закрыть форму входа и регистрации
  form_close.addEventListener('click', closeEntranceForm, { once: true });
  //Смена пароля в первой форме
  hide_pass.addEventListener('click', _client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .hidePass */ .Kc);
  // Обработчик кнопки регистрации
  registration_btn.addEventListener('click', handleRegistrationBtnClick);
  // Обработчик кнопки восстановления пароля
  restore_password_btn.addEventListener('click', handleRestorePasswordBtnClick);
  //Проверка вводимых данных для входа в аккаунт
  entrance.addEventListener('click', openUserAccount);


  //ФУНКЦИИ
  function closeEntranceForm() {
    entrance_form.parentElement.parentElement.style.display = 'none';
    forms.forEach(el => { el.style.display = 'none'; el.reset(); });
    document.body.style.overflowY = 'scroll';
    registration_btn.removeEventListener('click', handleRegistrationBtnClick);
    restore_password_btn.removeEventListener('click', handleRestorePasswordBtnClick);
    if (prev_form_btn) {
      prev_form_btn.removeEventListener('click', handlePrevFormBtnClick);
    }
    hide_pass.removeEventListener('click', _client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .hidePass */ .Kc);
    resetForm();
  }

  function resetForm() {
    if (hide_pass.previousElementSibling.type == 'password') { (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .hidePass */ .Kc)({ passes: [hide_pass] }) };
    const pass = registration_form.querySelector('#registration_form_pass');
    const repeat_pass = registration_form.querySelector('#registration_form_repeat_pass');
    const passes = [pass, repeat_pass];
    const agreement = document.querySelectorAll('.agreement input[type="checkbox"]');
    if (agreement[0]) {
      agreement[0].nextElementSibling.style.backgroundColor = '';
    }
    if (pass.type == 'password' || repeat_pass.type == 'password') {
      pass.type = 'text';
      repeat_pass.type = 'text';
    }
    passes.forEach(el => el.removeEventListener('click', hidePasses));
    const entrance_form_errors = document.querySelectorAll('.entrance_form>div>p');
    const registration_form_errors = registration_form.querySelectorAll('.registration_form fieldset>div>label+div>input');
    if (entrance_form_errors) { entrance_form_errors.forEach(el => el.parentElement.removeChild(el)); };
    select = document.querySelector('.restore_password_form select');
    if (select.classList.contains('red_color')) { select.classList.remove('red_color') };
    select.removeEventListener('change', installInputType);
    if (reset_pass_type.parentElement.lastElementChild.tagName === 'P') {
      reset_pass_type.parentElement.removeChild(reset_pass_type.parentElement.lastElementChild);
    }
    if (reset_pass_type) { reset_pass_type.className = ''; }
    registration_form_errors.forEach(el => {
      if (el.parentElement.lastElementChild.tagName === 'P') {
        el.parentElement.removeChild(el.parentElement.lastElementChild);
      }
    })
  }

  function returnBack(prev) {
    entrance_form.reset();
    prev.parentElement.reset();
    prev.parentElement.style.display = 'none';
    entrance_form.style.display = 'block';
    prev.removeEventListener('click', handlePrevFormBtnClick);
    resetForm();
  }

  function handleRegistrationBtnClick(e) {
    e.preventDefault();
    openRegistrationForm();
  }

  function openRegistrationForm() {
    const phone = registration_form.querySelector('.phone');
    const email = registration_form.querySelector('.email');
    const login = registration_form.querySelector('#registration_form_login');
    const pass = document.querySelector('#registration_form_pass');
    const repeat_pass = document.querySelector('#registration_form_repeat_pass');
    const reg_btn = registration_form.querySelector('input[type="button"]');
    const passes = [pass.nextElementSibling, repeat_pass.nextElementSibling];
    passes.forEach(el => el.addEventListener('click', hidePasses));
    //МЕТКА
    if (phone) {
      phone.addEventListener('input', () => {
        (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .validatePhoneNums */ .Yt)(phone);
      });
      phone.addEventListener('change', () => {
        (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .validatePhoneLength */ .xI)(phone);
      });
    }

    if (email) {
      email.addEventListener('input', () => {
        (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .spaceInputCheck */ .HP)(email);
      });
      email.addEventListener('change', () => {
        (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .validateEmailLength */ .Lv)(email);
      });
    }

    if (login) {
      login.addEventListener('input', () => {
        (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .spaceInputCheck */ .HP)(login);
      });
      login.addEventListener('change', () => {
        (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .validateLoginLength */ .KC)(login);
      });
    }

    if (pass && repeat_pass) {

      pass.addEventListener('input', () => {
        (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .spaceInputCheck */ .HP)(pass);
      });
      repeat_pass.addEventListener('input', () => {
        (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .spaceInputCheck */ .HP)(repeat_pass);
      });

      pass.addEventListener('change', () => {
        (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .validatePasswordLength */ .eX)(pass);
      });
      repeat_pass.addEventListener('change', () => {
        if (repeat_pass.value.trim() != pass.value.trim()) {
          (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .postAHint */ .zM)(repeat_pass, `Пароли должны совпадать`);
        }
      });
      repeat_pass.addEventListener('paste', (e) => {
        e.preventDefault();
        repeat_pass.value='';
        (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .postAHint */ .zM)(repeat_pass, `Запрещено вставлять значение в поле`);
      });
    }

    entrance_form.style.display = 'none';
    registration_form.style.display = 'block';
    prev_form_btn = registration_form.querySelector('.prev_form_btn');
    prev_form_btn.addEventListener('click', handlePrevFormBtnClick);
    reg_btn.addEventListener('click', userRegistration);
  }

  function hidePasses() {
    let pass = document.querySelector('#registration_form_pass');
    let repeat_pass = document.querySelector('#registration_form_repeat_pass');
    const passes = [pass.nextElementSibling, repeat_pass.nextElementSibling];
    (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .hidePass */ .Kc)({ passes: passes });
  }

  function handleRestorePasswordBtnClick(e) {
    e.preventDefault();
    openRestorePasswordForm();
  }

  function openRestorePasswordForm() {
    entrance_form.style.display = 'none';
    restore_password_form.style.display = 'block';
    prev_form_btn = restore_password_form.querySelector('.prev_form_btn');
    prev_form_btn.addEventListener('click', handlePrevFormBtnClick);
    select.addEventListener('change', installInputType);
    const restore_password_form_btn = restore_password_form.querySelector('input[type="button"]');
    restore_password_form_btn.addEventListener('click', sendResetPasswData);
  }

  function handlePrevFormBtnClick(e) {
    e.preventDefault();
    returnBack(prev_form_btn);
  }

  function installInputType() {
    reset_pass_type.className = `${select[select.selectedIndex].value}`;
    /* if(reset_pass_type.value.length>0) {reset_pass_type.value=''}; */
    if (reset_pass_type.classList.contains('phone')) {
      if (reset_pass_type.value.length > 0) { reset_pass_type.value = '' };
      reset_pass_type.addEventListener('input', validatePhoneNumsResetPass);
    } else {
      reset_pass_type.removeEventListener('input', validatePhoneNumsResetPass);
    }
  }

  function validatePhoneNumsResetPass() {
    (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .validatePhoneNums */ .Yt)(reset_pass_type);
  }

  if (select) {
    select.addEventListener('change', installInputType);
  }

  function openUserAccount() {
    const errors = document.querySelectorAll('.entrance_form>div>p');
    if (errors) { errors.forEach(el => el.parentElement.removeChild(el)); };
    const login = this.parentElement.querySelector('.login');
    const password = this.parentElement.querySelector('.password');
    if (`${login.value.trim()}` in users && password.value.trim() === users[login.value.trim()].password) {
      entrance_form_btn.removeEventListener('click', openEntranceForm);
      entrance_form_btn.textContent = login.value.trim();
      entrance_form_btn.title = "Личный кабинет находится на техническом обслуживании";
      closeEntranceForm();
    }

    if (login.value.trim().length === 0 || password.value.trim().length === 0) {
      if (login.value.trim().length === 0) {
        (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .postAHint */ .zM)(login, "Заполните поле");
      }
      if (password.value.trim().length === 0) {
        (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .postAHint */ .zM)(password, "Заполните поле");
      }
    } else {
      if (`${login.value.trim()}` in users && password.value.trim() != users[login.value.trim()].password) {
        (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .postAHint */ .zM)(password, "Неверный пароль");
      }
      if (!(`${login.value.trim()}` in users)) {
        (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .postAHint */ .zM)(login, "Неверный логин");
      }
    }
  }

  function sendResetPasswData() {
    const input = reset_pass_type;
    if (select.classList.contains('red_color')) {
      select.classList.remove('red_color');
    }
    if (input.parentElement.lastElementChild.tagName === 'P') {
      input.parentElement.removeChild(input.parentElement.lastElementChild);
    }

    if (select.selectedIndex === 0 || input.value.trim().length === 0) {
      if (select.selectedIndex === 0) {
        select.classList.add('red_color');
        select.addEventListener('click', function () {
          select.classList.remove('red_color');
        })
      }
      if (input.value.trim().length === 0) {
        (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .postAHint */ .zM)(input, "Заполните поле");
      }
    } else {
      if (select.selectedIndex === 1 && input.classList.contains('login')) {
        `${input.value.trim()}` in users ? closeEntranceForm() : (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .postAHint */ .zM)(input, "Данные не найдены");
      }
      if (select.selectedIndex === 2 && input.classList.contains('phone')) {
        const phones = Object.values(users).filter(el => {
          const temp = input.value.trim();
          return el.phone === temp.substring(0, 2) + temp.substring(3, 6) + temp.substring(7, 10) + temp.substring(11, 13) + temp.substring(14);
        });
        phones.length > 0 ? closeEntranceForm() : (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .postAHint */ .zM)(input, "Данные не найдены");
      }
      if (select.selectedIndex === 3 && input.classList.contains('email')) {
        Object.values(users).filter(el => el.email === input.value.trim().toLowerCase()).length > 0 ? closeEntranceForm() : (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .postAHint */ .zM)(input, "Данные не найдены");
      }
    }
  }

  function userRegistration() {
    const registration_form = document.querySelectorAll('.registration_form fieldset>div>label+div>input');
    const [email, phone, login, pass, pass_repeat] = registration_form;
    const contacts = document.querySelectorAll('.send_ticket_type input[type="checkbox"]');
    const agreement = document.querySelectorAll('.agreement input[type="checkbox"]');
    let temp = [...registration_form].every(el => el.value.trim().length > 0);
    if (temp && agreement[0].checked) {
      if (pass.value.trim() != pass_repeat.value.trim()) {
        (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .postAHint */ .zM)(pass_repeat, `Пароли должны совпасть`);
      } else {
        if ((0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .validateEmailLength */ .Lv)(email) && (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .validatePhoneLength */ .xI)(phone) && (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .validateLoginLength */ .KC)(login) && (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .validatePasswordLength */ .eX)(pass)) {
          const users_email = Object.values(users).filter(el => el.email === email.value.trim().toLowerCase());
          const users_phone = Object.values(users).filter(el => el.phone === phone.value.substring(0, 2) + phone.value.substring(3, 6) + phone.value.substring(7, 10) + phone.value.substring(11, 13) + phone.value.substring(14));
          if (`${login.value.trim()}` in users) {
            (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .postAHint */ .zM)(login, `Логин занят, восстановите доступ`);
          } else if (users_phone.length > 0) {
            (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .postAHint */ .zM)(phone, `Номер используется, восстановите доступ`);
          } else if (users_email.length > 0) {
            (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .postAHint */ .zM)(email, `Почта используется, восстановите доступ`);
          } else {
            users[login.value.trim()] = {
              'password': `${pass.value.trim()}`,
              'tickets': [],
              'email': `${email.value.trim().toLowerCase()}`,
              'phone': `${phone.value.substring(0, 2) + phone.value.substring(3, 6) + phone.value.substring(7, 10) + phone.value.substring(11, 13) + phone.value.substring(14)}`,
              'preferred_contcts': { 'mail': `${contacts[0].checked}`, 'phone': `${contacts[1].checked}`, 'account': 'true' },
              'pdn': `${agreement[0].checked}`,
              'newsletter': `${agreement[1].checked}`
            };
            closeEntranceForm();
          }
        }
      }
    } else {
      registration_form.forEach(el => {
        if (el.value.trim().length < 1) {
          (0,_client_validate_js__WEBPACK_IMPORTED_MODULE_0__/* .postAHint */ .zM)(el, `Заполните поле`);
        }
      })
      if (!agreement[0].checked) {
        agreement[0].nextElementSibling.style.backgroundColor = '#e14234';
      }
    }

  }
}

function addSortType(hall, td_num) {
  const table = hall.querySelector('table');
  const trs_length = table.querySelectorAll('tbody tr').length;
  const tds_last = table.querySelectorAll(`tbody tr td:nth-child(${td_num})`);
  const check = [...tds_last].every(el => el.textContent === tds_last[0].textContent);
  const th_title = table.querySelector(`th:nth-child(${td_num})`);

  if (trs_length > 1 && !check) {
    th_title.title = 'Сортировать';
    th_title.className = 'down';
    th_title.addEventListener('click', () => {
      sortingTable(table, th_title, td_num);
    });
  }
}

function sortingTableAlg(trs, name_class, td_num) {
  let trs_sorted = Array.from(trs).sort((a, b) => {
    const A = a.children[td_num - 1].textContent.trim();
    const B = b.children[td_num - 1].textContent.trim();

    if (name_class === 'down') {
      if (A > B) return 1;
      if (A < B) return -1;
      return 0;
    }

    if (name_class === 'up') {
      if (A > B) return -1;
      if (A < B) return 1;
      return 0;
    }
  });

  return trs_sorted;
}

function sortingTable(table, th_title, td_num) {
  const tbody = table.querySelector('tbody');
  const new_tbody = document.createElement('tbody');
  const trs = Array.from(tbody.querySelectorAll('tr'));
  const sortedTrs = sortingTableAlg(trs, th_title.className, td_num);

  new_tbody.append(...sortedTrs);
  table.replaceChild(new_tbody, tbody);
  th_title.className = th_title.className === 'down' ? 'up' : 'down';
}


/***/ }),

/***/ 599:
/***/ ((__webpack_module__, __unused_webpack___webpack_exports__, __webpack_require__) => {

__webpack_require__.a(__webpack_module__, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony import */ var _modules_js_header_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(647);
/* harmony import */ var _modules_js_cinema_session_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(978);
/* harmony import */ var _modules_js_afisha_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(294);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_modules_js_cinema_session_js__WEBPACK_IMPORTED_MODULE_1__]);
_modules_js_cinema_session_js__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];














__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/async module */
/******/ 	(() => {
/******/ 		var webpackQueues = typeof Symbol === "function" ? Symbol("webpack queues") : "__webpack_queues__";
/******/ 		var webpackExports = typeof Symbol === "function" ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 		var webpackError = typeof Symbol === "function" ? Symbol("webpack error") : "__webpack_error__";
/******/ 		var resolveQueue = (queue) => {
/******/ 			if(queue && queue.d < 1) {
/******/ 				queue.d = 1;
/******/ 				queue.forEach((fn) => (fn.r--));
/******/ 				queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 			}
/******/ 		}
/******/ 		var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 			if(dep !== null && typeof dep === "object") {
/******/ 				if(dep[webpackQueues]) return dep;
/******/ 				if(dep.then) {
/******/ 					var queue = [];
/******/ 					queue.d = 0;
/******/ 					dep.then((r) => {
/******/ 						obj[webpackExports] = r;
/******/ 						resolveQueue(queue);
/******/ 					}, (e) => {
/******/ 						obj[webpackError] = e;
/******/ 						resolveQueue(queue);
/******/ 					});
/******/ 					var obj = {};
/******/ 					obj[webpackQueues] = (fn) => (fn(queue));
/******/ 					return obj;
/******/ 				}
/******/ 			}
/******/ 			var ret = {};
/******/ 			ret[webpackQueues] = x => {};
/******/ 			ret[webpackExports] = dep;
/******/ 			return ret;
/******/ 		}));
/******/ 		__webpack_require__.a = (module, body, hasAwait) => {
/******/ 			var queue;
/******/ 			hasAwait && ((queue = []).d = -1);
/******/ 			var depQueues = new Set();
/******/ 			var exports = module.exports;
/******/ 			var currentDeps;
/******/ 			var outerResolve;
/******/ 			var reject;
/******/ 			var promise = new Promise((resolve, rej) => {
/******/ 				reject = rej;
/******/ 				outerResolve = resolve;
/******/ 			});
/******/ 			promise[webpackExports] = exports;
/******/ 			promise[webpackQueues] = (fn) => (queue && fn(queue), depQueues.forEach(fn), promise["catch"](x => {}));
/******/ 			module.exports = promise;
/******/ 			body((deps) => {
/******/ 				currentDeps = wrapDeps(deps);
/******/ 				var fn;
/******/ 				var getResult = () => (currentDeps.map((d) => {
/******/ 					if(d[webpackError]) throw d[webpackError];
/******/ 					return d[webpackExports];
/******/ 				}))
/******/ 				var promise = new Promise((resolve) => {
/******/ 					fn = () => (resolve(getResult));
/******/ 					fn.r = 0;
/******/ 					var fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
/******/ 					currentDeps.map((dep) => (dep[webpackQueues](fnQueue)));
/******/ 				});
/******/ 				return fn.r ? promise : getResult();
/******/ 			}, (err) => ((err ? reject(promise[webpackError] = err) : outerResolve(exports)), resolveQueue(queue)));
/******/ 			queue && queue.d < 0 && (queue.d = 0);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(599);
/******/ 	
/******/ })()
;