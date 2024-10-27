/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./modules_js/client_validate.js

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
  console.log(input.value);
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


;// ./modules_js/header.js


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
  hide_pass.addEventListener('click', hidePass);
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
    hide_pass.removeEventListener('click', hidePass);
    resetForm();
  }

  function resetForm() {
    if (hide_pass.previousElementSibling.type == 'password') { hidePass({ passes: [hide_pass] }) };
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
        validatePhoneNums(phone);
      });
      phone.addEventListener('change', () => {
        validatePhoneLength(phone);
      });
    }

    if (email) {
      email.addEventListener('input', () => {
        spaceInputCheck(email);
      });
      email.addEventListener('change', () => {
        validateEmailLength(email);
      });
    }

    if (login) {
      login.addEventListener('input', () => {
        spaceInputCheck(login);
      });
      login.addEventListener('change', () => {
        validateLoginLength(login);
      });
    }

    if (pass && repeat_pass) {

      pass.addEventListener('input', () => {
        spaceInputCheck(pass);
      });
      repeat_pass.addEventListener('input', () => {
        spaceInputCheck(repeat_pass);
      });

      pass.addEventListener('change', () => {
        validatePasswordLength(pass);
      });
      repeat_pass.addEventListener('change', () => {
        if (repeat_pass.value.trim() != pass.value.trim()) {
          postAHint(repeat_pass, `Пароли должны совпадать`);
        }
      });
      repeat_pass.addEventListener('paste', (e) => {
        e.preventDefault();
        repeat_pass.value='';
        postAHint(repeat_pass, `Запрещено вставлять значение в поле`);
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
    hidePass({ passes: passes });
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
    validatePhoneNums(reset_pass_type);
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
        postAHint(login, "Заполните поле");
      }
      if (password.value.trim().length === 0) {
        postAHint(password, "Заполните поле");
      }
    } else {
      if (`${login.value.trim()}` in users && password.value.trim() != users[login.value.trim()].password) {
        postAHint(password, "Неверный пароль");
      }
      if (!(`${login.value.trim()}` in users)) {
        postAHint(login, "Неверный логин");
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
        postAHint(input, "Заполните поле");
      }
    } else {
      if (select.selectedIndex === 1 && input.classList.contains('login')) {
        `${input.value.trim()}` in users ? closeEntranceForm() : postAHint(input, "Данные не найдены");
      }
      if (select.selectedIndex === 2 && input.classList.contains('phone')) {
        const phones = Object.values(users).filter(el => {
          const temp = input.value.trim();
          return el.phone === temp.substring(0, 2) + temp.substring(3, 6) + temp.substring(7, 10) + temp.substring(11, 13) + temp.substring(14);
        });
        phones.length > 0 ? closeEntranceForm() : postAHint(input, "Данные не найдены");
      }
      if (select.selectedIndex === 3 && input.classList.contains('email')) {
        Object.values(users).filter(el => el.email === input.value.trim().toLowerCase()).length > 0 ? closeEntranceForm() : postAHint(input, "Данные не найдены");
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
        postAHint(pass_repeat, `Пароли должны совпасть`);
      } else {
        if (validateEmailLength(email) && validatePhoneLength(phone) && validateLoginLength(login) && validatePasswordLength(pass)) {
          const users_email = Object.values(users).filter(el => el.email === email.value.trim().toLowerCase());
          const users_phone = Object.values(users).filter(el => el.phone === phone.value.substring(0, 2) + phone.value.substring(3, 6) + phone.value.substring(7, 10) + phone.value.substring(11, 13) + phone.value.substring(14));
          if (`${login.value.trim()}` in users) {
            postAHint(login, `Логин занят, восстановите доступ`);
          } else if (users_phone.length > 0) {
            postAHint(phone, `Номер используется, восстановите доступ`);
          } else if (users_email.length > 0) {
            postAHint(email, `Почта используется, восстановите доступ`);
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
          postAHint(el, `Заполните поле`);
        }
      })
      if (!agreement[0].checked) {
        agreement[0].nextElementSibling.style.backgroundColor = '#e14234';
      }
    }

  }
}


;// ./modules_js/premiere.js

const premiere_slider = document.querySelector('.premiere_slider');
if(premiere_slider) getSliderVisible(premiere_slider.children);

function getSliderVisible(obj) {
const premiere_slider_prev = premiere_slider.nextElementSibling.querySelector('.premiere_slider_prev');
const premiere_slider_next = premiere_slider.nextElementSibling.querySelector('.premiere_slider_next');
  let i = 0;
  let j = null;
  let pauseSlider = false;

  function installPauseOnSlider() {
    if (!pauseSlider) {
      pauseSlider = true;
      const elems = document.querySelectorAll('.centered');
      elems.forEach((el) => el.classList.remove('centered'));
      this.classList.add('centered');
    }
  }

  function unInstallPauseOnSlider() {
    if (pauseSlider) {
      this.classList.remove('centered');
      pauseSlider = false;
      showSlides();
    }
  }

  function showSlides() {
    if (j !== null) obj[j].classList.remove('centered');
    let arr = Array.from(obj).slice(i, i + 3);
    arr.forEach(el => {
      el.classList.remove("unblock");
      el.addEventListener('mouseenter', installPauseOnSlider);
      el.addEventListener('mouseleave', unInstallPauseOnSlider);
    });
    let centerIndex = Math.floor(arr.length / 2);
    arr[centerIndex].classList.add('centered');
  }

  function hideSlides(arr, next_el_visible = true) {
    arr.forEach(el => {
      el.classList.add("unblock");
      el.removeEventListener('mouseenter', installPauseOnSlider);
      el.removeEventListener('mouseleave', unInstallPauseOnSlider);
    });
    j = i + 1;
    if (next_el_visible) {
      ((i + 1) % (obj.length - 1) <= obj.length - 3) ? (i = (i + 1) % (obj.length - 1)) : (i = 0);
    } else {
      if (i > 0) { i-- }
      else { i = obj.length - 3; }
    }
    showSlides();
  }

  setInterval(function () {
    if (!pauseSlider) hideSlides(Array.from(obj).slice(i, i + 3));
  }, 8000);
  showSlides();

  function getNextSlider() {
    pauseSlider = true;
    hideSlides(Array.from(obj).slice(i, i + 3));
  }

  function getPrevSlider() {
    pauseSlider = true;
    if (i > 0) {
      i--;
      let view = document.querySelectorAll('.premiere_slider_item:not(.unblock)');
      view.forEach((el) => el.classList.remove('centered'));
      view[0].previousElementSibling.classList.remove('unblock');
      view[2].classList.add('unblock');
      view = document.querySelectorAll('.premiere_slider_item:not(.unblock)');
      view[1].classList.add('centered');
    }
    hideSlides(Array.from(obj).slice(i, i + 3), false);
  }
  premiere_slider_next.addEventListener('click', getNextSlider);
  premiere_slider_prev.addEventListener('click', getPrevSlider);
}
;// ./modules_js/today.js
const today_buy_btn = document.querySelector('.today_buy_btn');

today_buy_btn.addEventListener('click', function() {
  window.location.assign('/schedule-page');
});

const halls = document.querySelectorAll('.hall');

if(halls) {
  for (let i = 1; i < halls.length; i++) {
    let childs = Array.from(halls[i].children).some(el => el.tagName === 'TABLE');
    if (childs) { addSortType(halls[i]) };
  }
}


function addSortType(hall, last_child_prev = false) {
  const table = hall.querySelector('table');
  const trs_length = table.querySelectorAll('tbody tr').length;
  const tds_last = table.querySelectorAll('tbody tr td:last-child');
  const check = [...tds_last].every(el=> el.textContent == tds_last[0].textContent);
  const th_title = table.querySelector('th:last-child');
  if (trs_length > 1 && !check) {
    th_title.title = 'Сортировать';
    th_title.className = 'down';
    th_title.addEventListener('click', () => {
      sortingTable(table, th_title, last_child_prev);
    });
  }
}

function sortingTableAlg(trs, name_class, last_child_prev = false) {
  let trs_sorted = Array.from(trs).sort((a, b) => {
    let A, B;

    if (last_child_prev) {
      A = a.lastElementChild.previousElementSibling.innerHTML;
      B = b.lastElementChild.previousElementSibling.innerHTML;
    } else {
      A = a.lastElementChild.innerHTML;
      B = b.lastElementChild.innerHTML;
    }

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

function sortingTable(table, th_title) {
  let tbody = table.querySelector('tbody');
  let new_tbody = document.createElement('tbody');
  let trs = Array.from(tbody.querySelectorAll('tr'));
  let sortedTrs = sortingTableAlg(trs, th_title.className);
  new_tbody.append(...sortedTrs);
  table.replaceChild(new_tbody, tbody);
  th_title.className = th_title.className === 'down' ? 'up' : 'down';
}
;// ./index.js















/* import './modules_css/common.css';
import './modules_css/header.css'; */
/* import hello1 from './modules_js/hello1.js'; 
import hello2 from './modules_js/hello2.js'; */

/******/ })()
;