export async function openBuyForm(params) {

  if(('movie_name') in params && !(('movie_date') in params)) {
    console.log(params.movie_name.textContent.toLowerCase());
    const buy_form = await fetch(`/buy-ticket/?movie_name=${params.movie_name.textContent.toLowerCase()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    const res = await buy_form.text();
    document.body.children[0].insertAdjacentHTML('afterbegin', res);

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




