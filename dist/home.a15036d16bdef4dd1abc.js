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

async function openEntranceForm() {
  try {
    //форма входа
    const entrance_form = await fetch(`${window.origin}/entarance-form/`);
    const form_container = await entrance_form.text();
    document.body.children[0].insertAdjacentHTML('afterbegin', form_container);

    const form_close = document.querySelector('.entrance_form_close');
    form_close.addEventListener('click', () => {
      const entrance_form_big_container = document.querySelector('.entrance_form_big_container');
      document.body.children[0].removeChild(entrance_form_big_container);
    }, { once: true });

    formFunc('.entrance_form');
    const btn = document.querySelector('.entrance_form input[type="button"]');

    btn.addEventListener('click', function checkClientvalue(e) {
      e.preventDefault();
      const login = document.querySelector('.login');
      const password = document.querySelectorAll('.password');
/*       if(validateLoginLength(login) &&  validatePasswordLength(password)) {
        console.log('tr');
        try{

        } catch(error) {
          console.log(error);
        }
      }; */
    })

    //форма регистрации
    const registration = document.querySelector('.registration a');
    registration.addEventListener('click', async (e) => {
      e.preventDefault();
      const registration_form = await fetch(`${window.origin}/registration-form/`);
      const form_container = await registration_form.text();
      const entrance_form_big_container = document.querySelector('.entrance_form_big_container');
      document.body.children[0].removeChild(entrance_form_big_container);
      document.body.children[0].insertAdjacentHTML('afterbegin', form_container);
      formFunc('.registration_form');
      const form_close = document.querySelector('.entrance_form_close');
      form_close.addEventListener('click', () => {
        const entrance_form_big_container = document.querySelector('.entrance_form_big_container');
        document.body.children[0].removeChild(entrance_form_big_container);
      }, { once: true });
      const back = document.querySelector('.prev_form_btn');
      const btn = document.querySelector('.registration_form input[type="button"]');
      btn.addEventListener('click', async (e)=>{
        e.preventDefault();
        const login = document.querySelector('.login');
        const phone = document.querySelector('.phone');
        const password = document.querySelectorAll('.password');
        const email = document.querySelector('.email');
        const check = [...password].every(el=> validatePasswordLength(el));
        const send_ticket_type = document.querySelectorAll('.send_ticket_type input[type="checkbox"]');
        const agreement = document.querySelectorAll('.agreement input[type="checkbox"]');
        if(password[0].value === password[1].value &&  validateEmailLength(email) && validateLoginLength(login) && validatePhoneLength(phone)
        && send_ticket_type[2].checked && agreement[0].checked && check){
          const client = {
          client_login: login.value.trim(),
          client_phone: getNumOfPhone(phone.value),
          client_password: password[0].value,
          client_email: email.value.trim(),
          client_preference: {
            client_preference_phone: send_ticket_type[1].checked, 
            client_preference_email: send_ticket_type[0].checked, 
            client_preference_account: send_ticket_type[2].checked
          }, 
          agrement: {
            client_agreement_processing: agreement[0].checked,
            client_agreement_newsletter: agreement[1].checked
          }
          }
          console.log(client);
          try{
            let response = await fetch(`${window.origin}/new-client`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(client)
            });
          } catch(error) {
            console.error(error);
          }
        }
      });
      back.addEventListener('click', async (e) => {
        e.preventDefault();
        const entrance_form_big_container = document.querySelector('.entrance_form_big_container');
        document.body.children[0].removeChild(entrance_form_big_container);
        openEntranceForm();
      }, { once: true });
    }, { once: true });

    //форма восттановления пароля
    const restore_password = document.querySelector('.restore_password a');
    restore_password.addEventListener('click', async (e) => {
      e.preventDefault();
      const restore_password = await fetch(`${window.origin}/restore-password-form/`);
      const form_container = await restore_password.text();
      const entrance_form_big_container = document.querySelector('.entrance_form_big_container');
      document.body.children[0].removeChild(entrance_form_big_container);
      document.body.children[0].insertAdjacentHTML('afterbegin', form_container);
      formFunc('.restore_password_form');
      const btn = document.querySelector('.restore_password_form input[type="button"]');
      btn.addEventListener('click', async (e)=>{
        e.preventDefault();
        const login = document.querySelector('.login');
        const phone = document.querySelector('.phone');
        const email = document.querySelector('.email');
        const elements = Array.from(document.querySelectorAll('.login, .phone, .email'));
        console.log(elements);
        if(email && validateEmailLength(email) || login && validateLoginLength(login) ||phone && validatePhoneLength(phone)){
          console.log('tr');
        }
      });
      const form_close = document.querySelector('.entrance_form_close');
      form_close.addEventListener('click', () => {
        const entrance_form_big_container = document.querySelector('.entrance_form_big_container');
        document.body.children[0].removeChild(entrance_form_big_container);
      }, { once: true });
      const back = document.querySelector('.prev_form_btn');
      back.addEventListener('click', async (e) => {
        e.preventDefault();
        const entrance_form_big_container = document.querySelector('.entrance_form_big_container');
        document.body.children[0].removeChild(entrance_form_big_container);
        openEntranceForm();
      }, { once: true });
    }, { once: true });

  } catch (error) {
    console.error(error);
  }
}

function formFunc(classname) {
  const parent = document.querySelector(`${classname}`)
  const hide_pass = parent.querySelectorAll(`.password+svg`);
  const select = parent.querySelector('select');
  const email = parent.querySelector('.email');
  const phone = parent.querySelector('.phone');
  const login = parent.querySelector('.login');
  const password = parent.querySelectorAll('.password');

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

  if (password[0]) {
    password[0].addEventListener('input', () => {
      spaceInputCheck(password[0]);
    });
    password[0].addEventListener('change', () => {
      validatePasswordLength(password[0]);
    });
  }

  if(password[1]) {
    password[1].addEventListener('input', () => {
      spaceInputCheck(password[1]);
    });
    password[1].addEventListener('change', () => {
      if (password[1].value.trim() != password[0].value.trim()) {
        postAHint(password[1], `Пароли должны совпадать`);
      }
    });
    password[1].addEventListener('paste', (e) => {
      e.preventDefault();
      password[1].value='';
      postAHint(password[1], `Запрещено вставлять значение в поле`);
    });
  }

  if (hide_pass.length) {
    hide_pass.forEach(el => {
      el.addEventListener('click', function() {
        hide_pass.forEach(e => {
          e.previousElementSibling.type == "text" ? e.previousElementSibling.type = "password" : e.previousElementSibling.type = "text";
        })
      })
    });
  }

  if(select){
    select.addEventListener('change', installInputType);
  }

}

function installInputType() {
  const reset_pass_type = this.parentElement.querySelector('input');
  reset_pass_type.className = this[this.selectedIndex].value;
  reset_pass_type.value = '';
  let new_inp = reset_pass_type.cloneNode(true);
  reset_pass_type.parentElement.replaceChild(new_inp, reset_pass_type);
  formFunc(`.${this.parentElement.className}`);
}


function getNumOfPhone(str) {
  return [...str].filter(el => !isNaN(+el)).join('');
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
    if (childs) { addSortType(halls[i], 3)};
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



;// ./index.js















/* import './modules_css/common.css';
import './modules_css/header.css'; */
/* import hello1 from './modules_js/hello1.js'; 
import hello2 from './modules_js/hello2.js'; */

/******/ })()
;