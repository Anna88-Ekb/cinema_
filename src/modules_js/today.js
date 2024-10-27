const today_buy_btn = document.querySelector('.today_buy_btn');

today_buy_btn.addEventListener('click', function() {
  window.location.assign('/schedule-page');
});

const halls = document.querySelectorAll('.hall');

if(halls) {
  for (let i = 1; i < halls.length; i++) {
    let childs = Array.from(halls[i].children).some(el => el.tagName === 'TABLE');
    if (childs) { addSortType(halls[i]) };
  }
}


function addSortType(hall, last_child_prev = false) {
  const table = hall.querySelector('table');
  const trs_length = table.querySelectorAll('tbody tr').length;
  const tds_last = table.querySelectorAll('tbody tr td:last-child');
  const check = [...tds_last].every(el=> el.textContent == tds_last[0].textContent);
  const th_title = table.querySelector('th:last-child');
  if (trs_length > 1 && !check) {
    th_title.title = 'Сортировать';
    th_title.className = 'down';
    th_title.addEventListener('click', () => {
      sortingTable(table, th_title, last_child_prev);
    });
  }
}

function sortingTableAlg(trs, name_class, last_child_prev = false) {
  let trs_sorted = Array.from(trs).sort((a, b) => {
    let A, B;

    if (last_child_prev) {
      A = a.lastElementChild.previousElementSibling.innerHTML;
      B = b.lastElementChild.previousElementSibling.innerHTML;
    } else {
      A = a.lastElementChild.innerHTML;
      B = b.lastElementChild.innerHTML;
    }

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

function sortingTable(table, th_title) {
  let tbody = table.querySelector('tbody');
  let new_tbody = document.createElement('tbody');
  let trs = Array.from(tbody.querySelectorAll('tr'));
  let sortedTrs = sortingTableAlg(trs, th_title.className);
  new_tbody.append(...sortedTrs);
  table.replaceChild(new_tbody, tbody);
  th_title.className = th_title.className === 'down' ? 'up' : 'down';
}