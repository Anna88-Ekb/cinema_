
import {addSortType} from './client_validate.js';

document.addEventListener('DOMContentLoaded', async () => {

const today_buy_btn = document.querySelector('.today_buy_btn');

today_buy_btn.addEventListener('click', function() {
  window.location.assign('/schedule-page');
});

const halls = document.querySelectorAll('.hall');

if(halls) {
  let childs = Array.from(halls[0].children).some(el => el.tagName === 'TABLE');
  if (childs) { addSortType(halls[0], 3)};
}


});
