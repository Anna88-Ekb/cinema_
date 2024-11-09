
import {addSortType} from './client_validate.js';

document.addEventListener('DOMContentLoaded', async () => {

const today_buy_btn = document.querySelector('.today_buy_btn');

today_buy_btn.addEventListener('click', function() {
  window.location.assign('/schedule-page');
});

const halls = document.querySelectorAll('.hall');

if(halls) {
  for (let i = 1; i < halls.length; i++) {
    let childs = Array.from(halls[i].children).some(el => el.tagName === 'TABLE');
    if (childs) { addSortType(halls[i], 3)};
  }
}


});
