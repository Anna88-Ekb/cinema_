export async function openBuyForm(params) {
  console.log(params);
  if ('movie_name' in params && !('movie_date' in params) && !('hall_num' in params) && !('movie_time' in params)) {
    console.log(params.movie_name.textContent.toLowerCase());
    const request_params = await fetch(`/buy-ticket/?movie_name=${params.movie_name.textContent.toLowerCase()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    const buy_form = await request_params.text();
    document.body.children[0].insertAdjacentHTML('afterbegin', buy_form);

    const form = document.querySelector('.buy_form');
    if (form) {
      //закрытие формы
      form.previousElementSibling.addEventListener('click', function () {
        const buy_form_big_container = document.querySelector('.buy_form_big_container');
        document.body.children[0].removeChild(buy_form_big_container);
      })
    }

    const select_month = form.querySelector('#buy_form_select_month');


    if (select_month) {
      select_month.addEventListener('change', async function () {
        let buy_form_get = form.querySelector('.buy_form_get');
        if (buy_form_get.lastElementChild.classList.contains('buy_form_get_place')) {
          buy_form_get.removeChild(buy_form_get.lastElementChild);
        };
        let buy_form_choiсe_filter_hall_add = document.querySelector('.buy_form_choiсe_filter_hall_add');
        if (buy_form_choiсe_filter_hall_add) {
          buy_form_choiсe_filter_hall_add.parentElement.removeChild(buy_form_choiсe_filter_hall_add);
        }
        let date_input = form.querySelector('input[type="date"]');
        let select_time = form.querySelector('#buy_form_select_time');
        select_time.disabled = true;
        const req_params = {
          name: params.movie_name.textContent.toLowerCase(),
          month_num: select_month[select_month.selectedIndex].dataset.month,
          year: select_month[select_month.selectedIndex].dataset.year,
        }

        const req_params_url = new URLSearchParams(req_params).toString();
        const request = await fetch(`${window.origin}/buy-ticket-dates/?${req_params_url}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
        });

        const dates = await request.text();

        if (dates && date_input) {
          date_input.remove();
          select_month.insertAdjacentHTML('afterend', dates);
          date_input = form.querySelector('input[type="date"]');
          date_input.addEventListener('change', async function (e) {
            buy_form_get = form.querySelector('.buy_form_get');
            if (buy_form_get.lastElementChild.classList.contains('buy_form_get_place')) {
              buy_form_get.removeChild(buy_form_get.lastElementChild);
            };
            buy_form_choiсe_filter_hall_add = document.querySelector('.buy_form_choiсe_filter_hall_add');
            if (buy_form_choiсe_filter_hall_add) {
              buy_form_choiсe_filter_hall_add.parentElement.removeChild(buy_form_choiсe_filter_hall_add);
            }
            e.preventDefault();
            const request = await fetch(`${window.origin}/buy-ticket-times/?name=${params.movie_name.textContent.toLowerCase()}&date=${date_input.value}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              },
            });
            const times = await request.text();
            if (times) {
              buy_form_get = form.querySelector('.buy_form_get');
              if (buy_form_get.lastElementChild.classList.contains('buy_form_get_place')) {
                buy_form_get.removeChild(buy_form_get.lastElementChild);
              }
              buy_form_choiсe_filter_hall_add = document.querySelector('.buy_form_choiсe_filter_hall_add');
              if (buy_form_choiсe_filter_hall_add) {
                buy_form_choiсe_filter_hall_add.parentElement.removeChild(buy_form_choiсe_filter_hall_add);
              }
              select_time = form.querySelector('#buy_form_select_time');
              if (times === 'Выбирайте дату из предложенного списка') {
                const buy_form_choiсe_error = document.querySelector('.buy_form_choiсe_error');
                buy_form_choiсe_error.textContent = times;
                setTimeout(() => {
                  buy_form_choiсe_error.textContent = '';
                }, 8000);
              } else {
                select_time.remove();
                date_input.insertAdjacentHTML('afterend', times);
                select_time = form.querySelector('#buy_form_select_time');
                select_time.addEventListener('change', async function () {

                  const req_halls = await fetch(`${window.origin}/buy-ticket-halls/?movie_name=${params.movie_name.textContent.toLowerCase()}&movie_date=${date_input.value}&movie_time=${select_time[select_time.selectedIndex].textContent}`, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                  });
                  const halls = await req_halls.text();
                  if (halls.startsWith('<fieldset class="buy_form_get_place">')) {
                    buy_form_get = form.querySelector('.buy_form_get');
                    if (buy_form_get.lastElementChild.classList.contains('buy_form_get_place')) {
                      buy_form_get.removeChild(buy_form_get.lastElementChild);
                    }
                    buy_form_get.insertAdjacentHTML("beforeend", halls);
                  }
                  if (halls.startsWith('<fieldset class="buy_form_choiсe_filter_hall_add">')) {
                    buy_form_choiсe_filter_hall_add = document.querySelector('.buy_form_choiсe_filter_hall_add');
                    if (buy_form_choiсe_filter_hall_add) {
                      buy_form_choiсe_filter_hall_add.parentElement.removeChild(buy_form_choiсe_filter_hall_add);
                    }
                    buy_form_get.insertAdjacentHTML("beforebegin", halls);
                    buy_form_choiсe_filter_hall_add = document.querySelector('.buy_form_choiсe_filter_hall_add');
                  }

                  //////////////
                });
              }
            }
          })
        }



        /*       const req_months = await fetch(window.origin + '/buy-ticket/dates');   */

        /*   const request_days_of_month = await fetch() */
      })
    }





  }

  if ('movie_name' in params && 'movie_date' in params && 'hall_num' in params && 'movie_time' in params) {
    const request_params = new URLSearchParams(params).toString();
    const request = await fetch(`/buy-ticket/?${request_params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    const buy_form = await request.text();
    document.body.children[0].insertAdjacentHTML('afterbegin', buy_form);

    const form = document.querySelector('.buy_form');
    if (form) {
      //закрытие формы
      form.previousElementSibling.addEventListener('click', function () {
        const buy_form_big_container = document.querySelector('.buy_form_big_container');
        document.body.children[0].removeChild(buy_form_big_container);
      })

    }


  }
}




