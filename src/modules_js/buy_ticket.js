import { getNumOfPhone, postAHint, validatePhoneNums, validatePhoneLength, spaceInputCheck, validateEmailLength, validateLoginLength, validatePasswordLength } from './client_validate.js';

export async function openBuyForm(params) {
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
          movie: table.dataset.movie,
          day: table.dataset.day,
          time: table.dataset.time,
          price: table.dataset.price,
          type: table.dataset.type
        })
      });
      sale = await promotion_seans.json();
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
    buy_form_btn.addEventListener('click', function(e) {
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
          client_login: 
        }
        console.log(table);
        console.log(document.cookie);
      }
    })


  }
 }
}