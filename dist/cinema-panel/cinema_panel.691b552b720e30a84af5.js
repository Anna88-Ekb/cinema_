/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./modules_js/entrance_worker.js


document.addEventListener('DOMContentLoaded', ()=> {
  const entrance_form_big_container = document.querySelector('.entrance_form_big_container');
  if(entrance_form_big_container) {
    const logo = document.querySelector('.logo');
    logo.style.cssText = `justify-content: center; margin-top: 2rem; color: var(--dark_violet);`;
    logo.children[0].style.cssText = `align-self: center;`;
    entrance_form_big_container.style.backdropFilter = 'sepia(0%)';
    
    const pass = document.querySelector('.password+svg');
    pass.addEventListener('click', ()=> {
      pass.previousElementSibling.type == "text" ? pass.previousElementSibling.type = "password" : pass.previousElementSibling.type = "text";
    })
  }
 
});
  
;// ./modules_js/panel_worker.js
document.addEventListener('DOMContentLoaded', async () => {

  const menu_left = document.querySelector('.menu-left__items');

  if (menu_left) {
    menu_left.addEventListener('click', async function (e) {
      e.preventDefault();
      if (e.target.tagName === 'SPAN' && e.target.classList.contains('arrow')) {
        const children_el = e.target.parentElement.querySelector('ul');
        if (children_el) {
          children_el.classList.toggle('unblock');
        }
      }
      if (e.target.tagName === 'A') {
        const all_links = menu_left.querySelectorAll('li a');
        all_links.forEach(a => a.classList.remove('violet'));
        e.target.classList.toggle('violet');
        const req_table = await fetch(`${window.origin}/tables/${e.target.dataset.tableName}`);
        const table_colums = await req_table.text();
        menu_left.parentElement.parentElement.removeChild( menu_left.parentElement.parentElement.lastElementChild);
        menu_left.parentElement.parentElement.insertAdjacentHTML('beforeend', table_colums);
        afterAddTables();
      }
    })
  }

});


function afterAddTables() {

  const left_toolbar = document.querySelector('.database_view_left_toolbar');
  const search_text_btn = document.querySelector('.search_text_btn');
  let database_table = document.querySelector('.database_view_table table tbody');
  const search_content = document.querySelectorAll('.database_view_table table th, .database_view_table table td');


  // кнопка отмены
  const btn_remove = document.createElement('button');
  if (btn_remove) {
    btn_remove.textContent = "Отменить";
    btn_remove.title = "Отменить внесение изменений";
    btn_remove.classList.add('cancellation');
  }

  if (search_text_btn) {
    //кнопка поиска
    search_text_btn.addEventListener('click', function () {
      const search = search_text_btn.parentElement.previousElementSibling.children[0];
      const S = search.value.trim().toLowerCase();

      // поиск и выделение совпадений
      [...search_content].filter(t => t.textContent.toLowerCase().includes(S)).forEach(t => {
        const text_ind = t.textContent.toLowerCase().indexOf(S);
        const before = t.textContent.substring(0, text_ind);
        const match = t.textContent.substring(text_ind, text_ind + S.length);
        const after = t.textContent.substring(text_ind + S.length);
        t.innerHTML = before + '<mark class="marked_account">' + match + '</mark>' + after;
      });
    });

  }

  if (left_toolbar) {
    // обработчики для кнопок боковой панели
    left_toolbar.addEventListener('click', (e) => {
      const targetParent = e.target.parentElement;

      function clearActiveClass() {
        const all_actives = e.currentTarget.querySelectorAll('.active');
        all_actives.forEach(el => el.classList.toggle('active'));
      }

      if (targetParent.classList.contains('scroll-up')) {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }

      if (targetParent.classList.contains('scroll-down')) {
        const scrollHeight = Math.max(
          document.body.scrollHeight, document.documentElement.scrollHeight,
          document.body.offsetHeight, document.documentElement.offsetHeight,
          document.body.clientHeight, document.documentElement.clientHeight
        );
        window.scrollTo({ top: scrollHeight, left: 0, behavior: "smooth" });
      }

      if (targetParent.classList.contains('change')) {
        if (!e.target.parentElement.classList.contains('active')) {
          clearActiveClass();
          e.target.parentElement.classList.toggle('active');
          addChangeClassesToColumn({ shange: 'change-str', cursor: 'cursor_pointer' });
        } else {
          location.reload();
        }
      }

      if (targetParent.classList.contains('delete')) {
        if (!e.target.parentElement.classList.contains('active')) {
          clearActiveClass();
          e.target.parentElement.classList.toggle('active');
          addChangeClassesToColumn({ cursor: 'cursor_pointer' });
        } else {
          location.reload();
        }
      }

      if (targetParent.classList.contains('update')) {
        location.reload();
      }
    });

  }

  if (database_table) {
    let trs = database_table.querySelectorAll('tr');
    let tds = database_table.querySelectorAll('td');
    let ths = database_table.previousElementSibling.querySelectorAll('th');

    database_table.addEventListener('click', function (e) {
      const changeActive = document.querySelector('.change.active');
      const deleteActive = document.querySelector('.delete.active');

      if (e.target.classList.contains('change-str') && changeActive) {
        const textarea = document.createElement('textarea');
        textarea.value = e.target.textContent;
        e.target.textContent = '';
        e.target.append(textarea);


        textarea.addEventListener('change', () => {
          if (!e.target.parentElement.classList.contains('change_entry')) {
            e.target.parentElement.classList.add('change_entry');
            const btn = btn_remove.cloneNode(true);
            e.target.parentElement.append(btn);
          }
          textarea.parentElement.classList.add(`${ths[e.target.cellIndex].id}`);
        });
      }

      // удаление
      if (deleteActive && e.target.closest('tr')) {
        const tr = e.target.closest('tr');
        tr.classList.toggle('delete_entry'); // класс  удаления
      }

      //  кнопка отмены
      if (e.target.classList.contains('cancellation')) {
        const parent = e.target.closest('tr');

        // сброс изменений
        if (parent.classList.contains('change_entry')) {
          parent.classList.remove('change_entry');
          parent.querySelectorAll('td').forEach(td => {
            td.className = 'change-str cursor_pointer';
            if (td.querySelector('textarea')) {
              td.textContent = td.querySelector('textarea').value;
            }
          });
        }

        // сброс удаления
        if (parent.classList.contains('delete_entry')) {
          parent.classList.remove('delete_entry');
        }

        // Удаление кнопки отмены после сброса
        parent.removeChild(e.target);
      }

    });
  }

  function addChangeClassesToColumn(classes) {
    const tds = database_table.querySelectorAll('td');
    const class_line = Object.values(classes);
    tds.forEach(td => td.classList.add(...class_line));
  }
  

}





;// ./cinema-panel.js













/******/ })()
;