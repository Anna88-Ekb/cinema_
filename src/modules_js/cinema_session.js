
const cinema_sessions_filter = document.querySelector('.cinema_sessions_filter');
if(cinema_sessions_filter){
  cinema_sessions_filter.addEventListener('click', function(e) {
    const input = cinema_sessions_filter.querySelector('input[type="text"]');
    input.addEventListener('input', findTextOverlap);

    if(e.target.classList.contains('movie_list_btn')) {
      cinema_sessions_filter.children[1].classList.contains('block') ? 
      (cinema_sessions_filter.children[1].classList.remove('block'),
      cinema_sessions_filter.children[1].classList.add('unblock'),
      cinema_sessions_filter.classList.remove('gradient')) :
      (cinema_sessions_filter.children[1].classList.remove('unblock'),
      cinema_sessions_filter.children[1].classList.add('block'),
      cinema_sessions_filter.classList.add('gradient'));
    }
    
    if (e.target === input) {
      if(!cinema_sessions_filter.children[1].classList.contains('block')) {
        cinema_sessions_filter.children[1].classList.add('block');
        cinema_sessions_filter.children[1].classList.remove('unblock');
        cinema_sessions_filter.classList.add('gradient');
      } 
    }
    
    if(e.target.tagName === "LI") {
      input.value = e.target.textContent;   
    }
    
    
    
  })
    
}

 function findTextOverlap() {
  const search_value = this.value.toLowerCase();
  const list = document.querySelectorAll('.cinema_sessions_filter ul li');
  const list_text = [...list].map(el => el.textContent.toLowerCase());
  const marks = document.querySelectorAll('.cinema_sessions_filter ul li mark');
  if(marks) {marks.forEach(el => el.parentElement.textContent = el.parentElement.textContent)}

  if(search_value.length > 1) {
    const check = list_text.some(el => el.includes(search_value));
    if(check) {
      list_text.forEach((el, i) => {
        if(el.includes(search_value)) {
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
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  console.log(data);

}



