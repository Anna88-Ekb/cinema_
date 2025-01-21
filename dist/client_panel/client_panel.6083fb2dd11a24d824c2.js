/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./modules_js/client_page.js



document.addEventListener('DOMContentLoaded', async () => {

  const get_tickets = document.querySelector('.get_tickets');
  const start_page = document.querySelector('.start_page');

  const menu_left = document.querySelector('.menu-left__items');
  const get_settings = document.querySelector('.get_settings');

  get_tickets.addEventListener('click', getTickets);
  get_settings.addEventListener('click', getSettings)


  async function getTickets() {
    const req_tickets = await fetch(`${window.origin}/open-client-page/client-history-tickets`);
    const tickets = await req_tickets.text();
    changeData(tickets, get_tickets);
  }


  async function getSettings() {
    const req_settings = await fetch(`${window.origin}/open-client-page/client-settings`);
    const settings = await req_settings.text();
    changeData(settings, get_settings); // Проверьте определение get_settings
  
    const form = document.querySelector('.change_personality_data');
    form.addEventListener('click', async (e) => {
      e.preventDefault();
      if (e.target.classList.contains('change_confirm')) {
        e.target.previousElementSibling.classList.toggle('unblock');
        e.target.classList.toggle('violet');
        e.target.textContent = e.target.textContent === 'Нет' ? 'Да' : 'Нет';
      }
      if (e.target.classList.contains('form_btn_change')) {
        const mail = form.querySelector('[name="client_email"]');
        const old_pass = form.querySelector('[name="old_pass"]');
        const new_pass = form.querySelector('[name="new_pass"]');
        const phone = form.querySelector('[name="client_phone"]');
        const client_preference_email = form.querySelector('[name="client_preference_email"]');
        const client_agreement_newsletter= form.querySelector('[name="client_agreement_newsletter"]');
        const client_preference_phone = form.querySelector('[name="client_preference_phone"]');
        
        const formData = new FormData();
        formData.append('client_email', mail.value);
        formData.append('old_pass', old_pass.value);
        formData.append('new_pass', new_pass.value);
        formData.append('client_phone', phone.value);
        formData.append('client_preference_email', client_preference_email.checked);
        formData.append('client_agreement_newsletter', client_agreement_newsletter.checked);
        formData.append('client_preference_phone', client_preference_phone.checked);
        
        const jsonObject = {};
        formData.forEach((value, key) => {
          jsonObject[key] = value;
        });
  
        fetch('/open-client-page/client-change-settings', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonObject),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Ошибка запроса: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            console.log('Ответ сервера:', data);
          })
          .catch((error) => {
            console.error('Ошибка отправки данных:', error);
          });
      }
    });
  }
  


});


function changeData(el, c) {
  const accountView = document.querySelector('.account-view');
  accountView.removeChild(accountView.lastElementChild);
  accountView.insertAdjacentHTML("beforeend", el);
  const active = document.querySelector('.active');
  active.classList.remove('active');
  c.classList.add('active');
}




;// ./client-panel.js













/******/ })()
;