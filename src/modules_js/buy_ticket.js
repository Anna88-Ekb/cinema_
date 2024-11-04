export async function openBuyForm(params) {

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
    if(form){
      //закрытие формы
      form.previousElementSibling.addEventListener('click',  function() {
        const buy_form_big_container = document.querySelector('.buy_form_big_container');
        document.body.children[0].removeChild(buy_form_big_container);
      })
    }

    const select_month = form.querySelector('#buy_form_select_month');
    const date_input = form.querySelector('input[type="date"]');
    const select_time = form.querySelector('#buy_form_select_time');

    if(select_month) {
      select_month.addEventListener('change', async function() {
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
    if(form){
      //закрытие формы
      form.previousElementSibling.addEventListener('click',  function() {
        const buy_form_big_container = document.querySelector('.buy_form_big_container');
        document.body.children[0].removeChild(buy_form_big_container);
      })

    }










  }
}




