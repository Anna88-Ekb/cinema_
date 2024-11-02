export async function openBuyForm(params) {

  if(('movie_name') in params && !(('movie_date') in params)) {
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




  }

  if(('movie_name') in params && (('movie_date') in params)
  && ('hall_num') in params && (('movie_time') in params)
  ) {
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




