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

function getNumOfPhone(str) {
  return [...str].filter(el => !isNaN(+el)).join('');
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
  const trs_sorted = Array.from(trs).sort((a, b) => {
    let A = a.children[td_num - 1].textContent.trim();
    let B = b.children[td_num - 1].textContent.trim();

    const numA = parseFloat(A);
    const numB = parseFloat(B);
    const isNumA = !isNaN(numA);
    const isNumB = !isNaN(numB);

    if (isNumA && isNumB) {
      A = numA;
      B = numB;
    }

    if (name_class === 'down') {
      if (A > B) return -1;
      if (A < B) return 1;
      return 0;
    }

    if (name_class === 'up') {
      if (A > B) return 1;
      if (A < B) return -1;
      return 0;
    }

    return 0;
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
;// ./modules_js/header.js


document.addEventListener('DOMContentLoaded', async () => {

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

if(entrance_form_btn){
  entrance_form_btn.addEventListener('click', openEntranceForm);
} 

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

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const login = document.querySelector('.login');
      const password = document.querySelector('.password');
      if (validateLoginLength(login) && validatePasswordLength(password)) {
        const client = {
          login: login.value,
          password: password.value
        }
        try {
          const check_client = await fetch(`${window.origin}/entrance-client/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(client)
          });
          const res = await check_client.json();
          if (res.message) {
            createMessage('.entrance_form', 'entrance_form_container_error', res.message, false);
          }
          if (res.entrance) {
            const entrance_form_big_container = document.querySelector('.entrance_form_big_container');
            if(entrance_form_btn.classList.contains('entrance_form_btn')) {
              entrance_form_btn.insertAdjacentHTML('beforebegin', `${res.entrance}`);
              entrance_form_btn.parentElement.removeChild(entrance_form_btn);
            }
            document.body.children[0].removeChild(entrance_form_big_container);
          }

        } catch (error) {
          console.log(error);
        }
      };
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
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const login = document.querySelector('.login');
        const phone = document.querySelector('.phone');
        const password = document.querySelectorAll('.password');
        const email = document.querySelector('.email');
        const check = [...password].every(el => validatePasswordLength(el));
        const send_ticket_type = document.querySelectorAll('.send_ticket_type input[type="checkbox"]');
        const agreement = document.querySelectorAll('.agreement input[type="checkbox"]');
        if (password[0].value === password[1].value && validateEmailLength(email) && validateLoginLength(login) && validatePhoneLength(phone)
          && send_ticket_type[2].checked && agreement[0].checked && check) {
          const client = {
            client_login: login.value.trim(),
            client_phone: getNumOfPhone(phone.value),
            client_password: password[0].value.trim(),
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

          try {
            const response = await fetch(`${window.origin}/new-client`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(client)
            });
            const answer = await response.json();
            if (answer.message) {
              createMessage('.registration_form', 'entrance_form_container_error', answer.message, false);
            }
            if (answer.success === true) {
              createMessage('.registration_form', 'entrance_form_container_success', `Регистрация пройдена.`, true);
            }
          } catch (error) {
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

    //форма восстановления пароля
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
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const login = document.querySelector('.login');
        const phone = document.querySelector('.phone');
        const email = document.querySelector('.email');

        if (email && validateEmailLength(email) || login && validateLoginLength(login) || phone && validatePhoneLength(phone)) {
          if (email && validateEmailLength(email)) {
            try {
              const check_email = await fetch(`${window.origin}/search-client-mail`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email.value })
              });
              const res = await check_email.json();
              if (res.message) {
                createMessage('.restore_password_form', 'entrance_form_container_success', res.message, true);
              }
              if (res.success) {
                createMessage('.restore_password_form', 'entrance_form_container_error', res.success, false);
              }
            } catch (error) {
              console.error(error.message);
            }
          }
          if (login && validateLoginLength(login)) {
            try {
              const check_login = await fetch(`${window.origin}/search-client-login`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ login: login.value })
              });
              const res = await check_login.json();
              if (res.message) {
                createMessage('.restore_password_form', 'entrance_form_container_success', res.message, true);
              }
              if (res.success) {
                createMessage('.restore_password_form', 'entrance_form_container_error', res.success, false);
              }
            } catch (error) {
              console.error(error.message);
            }
          }
          if (phone && validatePhoneLength(phone)) {
            try {
              const check_phone = await fetch(`${window.origin}/search-client-phone`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone: `${getNumOfPhone(phone.value)}` })
              });
              const res = await check_phone.json();
              if (res.message) {
                createMessage('.restore_password_form', 'entrance_form_container_success', res.message, true);
              }
              if (res.success) {
                createMessage('.restore_password_form', 'entrance_form_container_error', res.success, false);
              }
            } catch (error) {
              console.error(error.message);
            }
          }
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

  if (password[1]) {
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
      password[1].value = '';
      postAHint(password[1], `Запрещено вставлять значение в поле`);
    });
  }

  if (hide_pass.length) {
    hide_pass.forEach(el => {
      el.addEventListener('click', function () {
        hide_pass.forEach(e => {
          e.previousElementSibling.type == "text" ? e.previousElementSibling.type = "password" : e.previousElementSibling.type = "text";
        })
      })
    });
  }

  if (select) {
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

function createMessage(parent, className, message, close) {
  const div = document.createElement('div');
  div.className = className;
  div.insertAdjacentText('afterbegin', `${message}`);
  const form = document.querySelector(parent);
  form.reset();
  form.before(div);
  if (!close) {
    setTimeout(() => {
      div.remove();
    }, 5000);
  } else {
    setTimeout(() => {
      const entrance_form_big_container = document.querySelector('.entrance_form_big_container');
      document.body.children[0].removeChild(entrance_form_big_container);
    }, 5000);
  }
}

});
;// ./modules_js/buy_ticket.js


async function openBuyForm(params) {
  if ('movie_name' in params && !('movie_date' in params) && !('hall_num' in params) && !('movie_time' in params)) {

    const request_params = await fetch(`/buy-ticket/?movie_name=${params.movie_name.textContent.toLowerCase()}`);
    const buy_form = await request_params.text();
    document.body.children[0].insertAdjacentHTML('afterbegin', buy_form);
    afterFormAdded(params);
  }

  if ('movie_name' in params && 'movie_date' in params && 'hall_num' in params && 'movie_time' in params) {
    const request_params = new URLSearchParams(params).toString();
    const request = await fetch(`/buy-ticket/?${request_params}`);
    const buy_form = await request.text();
    document.body.children[0].insertAdjacentHTML('afterbegin', buy_form);
    afterFormAdded(params);
  }
}

async function afterFormAdded(params) {
  const form = document.querySelector('.buy_form');
  const choice_filter = form.querySelector('.buy_form_choiсe_filter_time_add');
  if (form) {
    //закрытие формы
  form.previousElementSibling.addEventListener('click', function () {
    const buy_form_big_container = document.querySelector('.buy_form_big_container');
    document.body.children[0].removeChild(buy_form_big_container);
  });

  buyTicket(form, choice_filter);

  
  if (choice_filter) {
    choice_filter.addEventListener('change', async function (e) {
      let buy_form_get_place = form.querySelector('.buy_form_get_place');
      if (buy_form_get_place) { buy_form_get_place.remove(); }
      let filter_hall_add = form.querySelector('.buy_form_choиce_filter_hall_add');
      if (filter_hall_add) { filter_hall_add.remove(); }
      resetForm(form);

      let month = form.querySelector('#buy_form_select_month');
      let days = form.querySelector('input[type="date"]');
      let times = form.querySelector('#buy_form_select_time');

      if (e.target == month) {
        if (times.disabled == false) { times.disabled = true; }
        try {
          const req_params = {
            name: params.movie_name.textContent.toLowerCase(),
            month: month[month.selectedIndex].dataset.month,
            year: month[month.selectedIndex].dataset.year
          };
          const req_dates = await fetch(`${window.origin}/buy-ticket-halls/${req_params.name}/${req_params.year}/${req_params.month}`);
          const dates = await req_dates.text();
          days.remove();
          month.insertAdjacentHTML('afterend', dates);
        } catch (error) {
          console.error('Ошибка при получении дат:', error);
        }
      }

      if (e.target == days) {
        try {
          const req_params = {
            name: params.movie_name.textContent.toLowerCase(),
            month: month[month.selectedIndex].dataset.month,
            year: month[month.selectedIndex].dataset.year,
            day: days.value.substring(8)
          };
          const req_times = await fetch(`${window.origin}/buy-ticket-halls/${req_params.name}/${req_params.year}/${req_params.month}/${req_params.day}`);
          const res_times = await req_times.text();

          if (!res_times.startsWith('<')) {
            const buy_form_choiсe_error = form.querySelector('.buy_form_choiсe_error');
            buy_form_choiсe_error.textContent = res_times;
            times.disabled = true;
            setTimeout(() => {
              buy_form_choiсe_error.textContent = '';
            }, 8000);
          } else {
            times.remove();
            days.insertAdjacentHTML('afterend', res_times);
          }
        } catch (error) {
          console.error('Ошибка при получении времени:', error);
        }
      }

      if (e.target == times) {
        try {
          const req_params = {
            name: params.movie_name.textContent.toLowerCase(),
            month: month[month.selectedIndex].dataset.month,
            year: month[month.selectedIndex].dataset.year,
            day: days.value.substring(8),
            time: times[times.selectedIndex].value
          };
          const req_halls = await fetch(`${window.origin}/buy-ticket-halls/${req_params.name}/${req_params.year}/${req_params.month}/${req_params.day}/${req_params.time}`);
          const res_halls = await req_halls.text();

          const buy_form_get = form.querySelector('.buy_form_get');
          if (res_halls.startsWith('<fieldset class="buy_form_get_place">')) {
            buy_form_get.insertAdjacentHTML('beforeend', res_halls);
            countSumm();
          }
          if (res_halls.startsWith('<fieldset class="buy_form_choiсe_filter_hall_add">')) {
            buy_form_get.insertAdjacentHTML('beforebegin', res_halls);
            filter_hall_add = form.querySelector('.buy_form_choiсe_filter_hall_add');
            if (filter_hall_add) {
              filter_hall_add.addEventListener('change', async function (event) {
                const inputs = form.querySelectorAll('input[type="checkbox"]');
                const inputs_checked = form.querySelector('input[type="checkbox"]:checked');
                if (event.target.tagName === 'INPUT') {
                  buy_form_get_place = form.querySelector('.buy_form_get_place');
                  if (buy_form_get_place) { buy_form_get_place.remove(); }
                  resetForm(form);

                  inputs.forEach(element => {
                    if (element !== event.target && event.target.checked) {
                      element.disabled = true;
                      element.style.cursor = 'auto';
                      element.nextElementSibling.style.backgroundColor = '#e14234';
                      element.title = 'Можно применить только один фильтр';
                    }
                    if (!event.target.checked) {
                      element.disabled = false;
                      element.style.cursor = 'pointer';
                      element.nextElementSibling.style.backgroundColor = '';
                      element.title = 'Нажмите для применения фильтра';
                    }
                  });
                }
                if (inputs_checked) {
                  try {
                    req_params['hall'] = inputs_checked.value;
                    const req_halls = await fetch(`${window.origin}/buy-ticket-halls/${req_params.name}/${req_params.year}/${req_params.month}/${req_params.day}/${req_params.time}/${req_params.hall}`);
                    const res_halls = await req_halls.text();
                    buy_form_get.insertAdjacentHTML('beforeend', res_halls);
                    countSumm();
                  } catch (error) {
                    console.error('Ошибка при получении залов:', error);
                  }
                }
              });
            }
          }
        } catch (error) {
          console.error('Ошибка при получении залов:', error);
        }
      }
    });
  }
  }
  countSumm();

}

async function countSumm() {
  const buy_form_get_place = document.querySelector('.buy_form_get_place');
  const table = document.querySelector('.buy_form_get_place table');
  const buy_form_get_place_checked = document.querySelector('.buy_form_get_place_checked');
  const total_price = document.querySelector('.total_price span');
  let basic_price = document.querySelector('.price_value');
  if (basic_price) {
    basic_price = parseFloat(basic_price.textContent) || 0; 
  }

  let sale = null;

  if (table) {
    try {
      const promotion_seans = await fetch(`${window.origin}/seance-promotion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hall: table.dataset.hall,
          day: table.dataset.day,
          time: table.dataset.time,
          price: table.dataset.price,
          seance: table.dataset.seance
        })
      });
      sale = await promotion_seans.json();
      if('promotion_id' in sale) {
        table.dataset.promotion = sale['promotion_id'];
      }
    } catch (error) {
      console.error('Ошибка при запросе промоакции:', error);
    }
  }
 

  if (buy_form_get_place && table) {
    buy_form_get_place.addEventListener('change', function (e) {
      if (e.target.tagName === "INPUT") {
        const input = e.target;
        let count = document.querySelectorAll('.buy_form_get_place_checked ul');
        //добавление/удаление из списка
        if (input.checked) {
          const ul = document.createElement('ul');
          ul.className = `${input.dataset.row}-${input.dataset.place}`;
          ul.append(...createListAboutPlace(input, table));
          buy_form_get_place_checked.append(ul);

          count = document.querySelectorAll('.buy_form_get_place_checked ul');
          updateTotalPrice(count, basic_price, sale, total_price, buy_form_get_place);
        } else {
          const buy_form_get_place_checked_uls = document.querySelectorAll('.buy_form_get_place_checked ul');
          buy_form_get_place_checked_uls.forEach(el => {
            if (el.className === `${input.dataset.row}-${input.dataset.place}`) {
              el.remove();
              count = document.querySelectorAll('.buy_form_get_place_checked ul');
              updateTotalPrice(count, basic_price, sale, total_price, buy_form_get_place);
            }
          });
        }
      }
    });
  }
}

// обновление стоимости
function updateTotalPrice(count, basic_price, sale, total_price, buy_form_get_place) {
  if (!sale || !sale.promotion_count || !sale.promotion_discount) {
    total_price.textContent = (count.length * basic_price).toFixed(2);
    const total_price_sale = document.querySelector('.total_price_sale');
    if (total_price_sale) total_price_sale.remove();
    return;
  }

  if (count.length < sale.promotion_count) {
    total_price.textContent = (count.length * basic_price).toFixed(2);
    const total_price_sale = document.querySelector('.total_price_sale');
    if (total_price_sale) total_price_sale.remove();
  } else {
    total_price.textContent = (count.length * basic_price * sale.promotion_discount).toFixed(2);
    if (!buy_form_get_place.parentElement.parentElement.querySelector('.total_price_sale')) {
      const p = document.createElement('p');
      let s = 100 - sale.promotion_discount * 100;
      parseFloat(s)==parseInt(s) ? parseInt(s) : s.toFixed(2);
      p.textContent = `Скидка ${s}%`;
      p.className = 'total_price_sale';
      buy_form_get_place.parentElement.parentElement.lastElementChild.append(p);
    }
  }
}

//генерация li
function createListAboutPlace(input, table) {
  let li1 = document.createElement('li');
  let span1 = document.createElement('span');
  li1.innerText = `Дата: `;
  span1.innerText = table.dataset.day;
  li1.append(span1);

  let li2 = document.createElement('li');
  let span2 = document.createElement('span');
  li2.innerText = `Время: `;
  span2.innerText = table.dataset.time;
  li2.append(span2);

  let li3 = document.createElement('li');
  let span3 = document.createElement('span');
  li3.innerText = `Ряд: `;
  span3.innerText = input.dataset.row;
  li3.append(span3);

  let li4 = document.createElement('li');
  let span4 = document.createElement('span');
  li4.innerText = `Место: `;
  span4.innerText = input.dataset.place;
  li4.append(span4);

  let li5 = document.createElement('li');
  let span5 = document.createElement('span');
  li5.innerText = `Цена: `;
  span5.innerText = table.previousElementSibling.querySelector('.price_value').textContent;
  li5.append(span5);
  return [li1, li2, li3, li4, li5];
}

//при смене чекбокса
function resetForm(form){
  let total_price_sale = form.querySelector('.total_price_sale');
  if(total_price_sale) {total_price_sale.remove()};
  let buy_form_get_place_checked = form.querySelectorAll('.buy_form_get_place_checked ul');
  if(buy_form_get_place_checked) {buy_form_get_place_checked.forEach(el=>el.remove())};
  let total_price = form.querySelector('.total_price span');
  if(total_price && total_price.textContent !== '0') {
    total_price.textContent = '0';
  }
}

async function buyTicket(form, choice_filter){
 const buy_form_btn = form.querySelector('.buy_form_btn');
 const buy_form_get_contacts = form.querySelector('.buy_form_get_contacts'); 

 if(buy_form_get_contacts) {
  const email= form.querySelector('.email');
  const phone = form.querySelector('.phone');


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
  
  if(buy_form_btn) {
    buy_form_btn.addEventListener('click', async function(e) {
      const table = form.querySelector('.buy_form_get_place table');
      const buy_form_choiсe_error = form.querySelector('.buy_form_choiсe_error');
      const buy_form_get_place_checked = form.querySelector('.buy_form_get_place_checked');
      const total_price = form.querySelector('.total_price span');
      e.preventDefault();

      if(!table) {
        buy_form_choiсe_error.textContent = 'Примените фильтры для подбора сеанса';
        setTimeout(() => {
          buy_form_choiсe_error.textContent = '';
        }, 8000);
        return
      } else if (phone && !validatePhoneLength(phone) || email && !validateEmailLength(email)) {
        buy_form_choiсe_error.textContent = 'Заполните контактные данные';
        setTimeout(() => {
          buy_form_choiсe_error.textContent = '';
        }, 8000);
        return
      } else if(total_price.textContent === '0') {
        buy_form_choiсe_error.textContent = 'Выберите билеты к покупке';
        setTimeout(() => {
          buy_form_choiсe_error.textContent = '';
        }, 8000);
        return
      } else {
        const req_params = {
          movie_name: table.dataset.movie,
          movie_hall: table.dataset.hall,
          movie_day: table.dataset.day,
          movie_time: table.dataset.time,
          movie_price: table.dataset.price,
          movie_type: table.dataset.type,
          movie_seance: table.dataset.seance,
          client_login: (() => {
            const cookies = document.cookie.trim();
            const match = cookies.match(/(?:^|;\s*)client_login=([^;]+)/);
            return match ? match[1] : false;
          })(),
          user_phone: phone && phone.value ? getNumOfPhone(phone.value) : false,
          user_email: email && email.value ? email.value : false,
          tickets: [...(() => {
            const checked = table.querySelectorAll('input[type="checkbox"]:checked');
            return Array.from(checked).map(checkbox => ({
              row: checkbox.dataset.row,
              place: checkbox.dataset.place
            }));
          })()], 
          total_price: total_price.textContent,
          total_price_promotion: table.dataset.promotion || false
        }
        try{
          const req_confirm = await fetch(`${window.origin}/buy-ticket-confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req_params) 
          });
          const confirm = await  req_confirm.json();
          const container = document.querySelector('.container');
          if(confirm.html) {
            container.remove();
            document.body.insertAdjacentHTML('afterbegin', confirm.html); 
          }
          if(confirm.message) {
            buy_form_choiсe_error.textContent = confirm.message;
            setTimeout(() => {
              buy_form_choiсe_error.textContent = '';
            }, 8000);
          }
          console.log(container);
        } catch(err) {
          console.error(err.message);
        }
      }
    })


  }
 }
}


;// ./modules_js/cinema_session.js



document.addEventListener('DOMContentLoaded', async () => {

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
  if(cinema_sessions_halls) {
    cinema_sessions_halls.addEventListener('click', async function(e) {
      if(e.target.tagName === 'A' && e.target.textContent==='Купить'){
        const parent = e.target.parentElement;
        const params = {
          movie_name: parent.dataset.movieName,
          hall_num: parent.dataset.hall,
          movie_date: parent.dataset.date,
          movie_time: parent.dataset.time,
        };
        openBuyForm(params);
      };
    });
  }
}

});
;// ./modules_js/afisha.js



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
        if(filtered_films_resize_toSmall) {
          filtered_films_resize_toSmall.addEventListener('click', async () => {
            const resize_films = filtered_films_container.querySelector('.filtered_films_full_screen');
            const result = await fetch('/filtered-movie');
            const new_content = await result.text();
            filtered_films_container.removeChild(resize_films);
            filtered_films_container.innerHTML = new_content;
          }, { once: true });
        }
        const afisha_btn = filtered_films.querySelector('.afisha_btn');
        if(afisha_btn){
          const name = afisha_btn.parentElement.querySelector('h4');
          openBuyForm({movie_name: name});
        }
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



;// ./schedule.js















/******/ })()
;