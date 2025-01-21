import { getNumOfPhone, postAHint, validatePhoneNums, validatePhoneLength, spaceInputCheck, validateEmailLength, validateLoginLength, validatePasswordLength } from './client_validate.js';

document.addEventListener('DOMContentLoaded', async () => {

const menu_main_list = document.querySelector('.menu_main_list');
const entrance_form_btn = document.querySelector('.entrance_form_btn');
const contacts = document.querySelector('.contacts');
const arenda = document.querySelector('.arenda');

if(arenda) {
  arenda.addEventListener('click', openArendaHallForm);
}


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
            openClientPage();
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

/* function createMessage(parent, className, message, close) {
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
} */

const account_form_btn = document.querySelector('.account_form_btn');
if (account_form_btn) {
  account_form_btn.addEventListener('click', openClientPage);
}

});

async function openClientPage() {
  window.location.href = `${window.origin}/open-client-page`;
  
}

async function openArendaHallForm() {
  try {
    // Получение и вставка формы
    const entranceFormResponse = await fetch(`${window.origin}/open-arenda-form`);
    const formContainer = await entranceFormResponse.text();
    document.body.children[0].insertAdjacentHTML('afterbegin', formContainer);

    // Закрытие формы
    const formCloseButton = document.querySelector('.entrance_form_close');
    formCloseButton?.addEventListener('click', () => {
      const bigContainer = document.querySelector('.entrance_form_big_container');
      if (bigContainer) {
        document.body.children[0].removeChild(bigContainer);
      }
    }, { once: true });
  } catch (error) {
    console.error('Ошибка при открытии формы аренды:', error);
    return;
  }

  // Работа с формой
  const hallArendaForm = document.querySelector('.hall_arenda_form');
  if (!hallArendaForm) {
    console.error('Форма аренды не найдена!');
    return;
  }

  hallArendaForm.addEventListener('click', async function (event) {
    // Проверяем, что нажата кнопка "Отправить"
    if (!event.target.classList.contains('btn_arenda_hall')) return;

    // Формируем объект для отправки
    const form = event.currentTarget;
    const obj = {
      app_rent_date: form.querySelector('.registration_form_data')?.value || null,
      hall_hall_id: form.querySelector('#hall_arenda_form_type_hall')?.value || null,
      app_rent_start_time: form.querySelector('.registration_form_timestart')?.value || null,
      app_rent_end_time: form.querySelector('.registration_form_timeend')?.value || null,
      app_rent_phone: form.querySelector('#hall_arenda_form_phone')?.value || null,
      app_rent_details: form.querySelector('#hall_arenda_form_description')?.value || null,
      type_client_type_client_id: form.querySelector('#hall_arenda_form_type_client')?.value || null,
    };

    // Проверка обязательных полей
    if (!obj.app_rent_date || !obj.app_rent_start_time || !obj.app_rent_end_time || !obj.app_rent_phone) {
      createMessage('.hall_arenda_form', 'entrance_form_container_error', 'Заполните все обязательные поля!', false);
      return;
    }

    // Отправка данных на сервер
    try {
      const response = await fetch(`${window.origin}/create-arenda-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj),
      });

      const answer = await response.json();

      if (answer.message) {
        createMessage('.hall_arenda_form', 'entrance_form_container_error', answer.message, false);
      } else if (answer.success === true) {
        createMessage('.hall_arenda_form', 'entrance_form_container_success', 'Заявка подана', true);
      }
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
      createMessage('.hall_arenda_form', 'entrance_form_container_error', 'Произошла ошибка. Попробуйте позже.', false);
    }
  });
}

function createMessage(parentSelector, className, message, close) {
  const parentElement = document.querySelector(parentSelector);
  if (!parentElement) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = className;
  messageDiv.textContent = message;

  // Сброс формы
  parentElement.reset?.();

  // Добавление сообщения перед формой
  parentElement.before(messageDiv);

  // Удаление сообщения
  setTimeout(() => {
    messageDiv.remove();
    if (close) {
      const bigContainer = document.querySelector('.entrance_form_big_container');
      if (bigContainer) {
        document.body.children[0].removeChild(bigContainer);
      }
    }
  }, 5000);
}