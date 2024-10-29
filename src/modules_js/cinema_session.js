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
}

function addSortType(hall, td_num) {
  const table = hall.querySelector('table');
  const trs_length = table.querySelectorAll('tbody tr').length;
  const tds_last = table.querySelectorAll(`tbody tr td:nth-child(${td_num})`);
  const check = [...tds_last].every(el=> el.textContent == tds_last[0].textContent);
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
    let A, B;
      A = a.children[td_num-1].innerHTML;
      B = b.children[td_num-1].innerHTML;

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
  let tbody = table.querySelector('tbody');
  let new_tbody = document.createElement('tbody');
  let trs = Array.from(tbody.querySelectorAll('tr'));
  let sortedTrs = sortingTableAlg(trs, th_title.className, td_num);
  new_tbody.append(...sortedTrs);
  table.replaceChild(new_tbody, tbody);
  th_title.className = th_title.className === 'down' ? 'up' : 'down';
}