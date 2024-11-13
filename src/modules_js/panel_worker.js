import { addSortType } from './client_validate.js';

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

      if (e.target.tagName === 'A' && e.target.parentElement.parentElement.parentElement.classList.contains('manager_tables')) {
        getTableByName(e.target.dataset.tableName, menu_left)
      }

      if (e.target.tagName === 'A') {
        const all_links = menu_left.querySelectorAll('li a');
        all_links.forEach(a => a.classList.remove('violet'));
        e.target.classList.toggle('violet');
      }

      if (e.target.classList.contains('open_posters')) {
        getPosters(menu_left);
      }

    })
  }

});


function afterAddTables() {
  const left_toolbar = document.querySelector('.database_view_left_toolbar');
  const search_text_btn = document.querySelector('.search_text_btn');
  let database_table = document.querySelector('.database_view_table table tbody');
  const search_content = document.querySelectorAll('.database_view_table table th, .database_view_table table td');
  const menu_left = document.querySelector('.menu-left__items');
  database_table.parentElement.insertAdjacentHTML('afterend', `<p class = "total_rows">Итого: <span>${database_table.children.length} ${strIng(database_table.children.length)}</span></p>`);


  // кнопка отмены
  const btn_remove = document.createElement('button');
  if (btn_remove) {
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
    // обработчики для кнопок боковой панели DB
    left_toolbar.addEventListener('click', leftToolbar);

  }

  function leftToolbar(e) {

    let database_table = document.querySelector('.database_view_table table tbody');
    const menu_left = document.querySelector('.menu-left__items');
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
      clearActiveClass();
      removeClassesToColumn();
      e.target.parentElement.classList.toggle('active');
    }

    if (targetParent.classList.contains('delete')) {
      clearActiveClass();
      removeClassesToColumn();
      e.target.parentElement.classList.toggle('active');
    }

    if (targetParent.classList.contains('update')) {
      getTableByName(database_table.parentElement.id, menu_left);
    }

    if (targetParent.classList.contains('add')) {
      createInsertForm(database_table.parentElement.id, menu_left);
    }

    if (targetParent.classList.contains('save')) {
      const change_str = database_table.querySelectorAll('.change-str');
      const delete_entry = database_table.querySelectorAll('.delete_entry');
      const errorMessage = database_table.parentElement.parentElement.querySelector('.database_view_left_toolbar_error');
    
      //  функция показа сообщения об ошибке
      function showError(message) {
        if (!errorMessage) { 
          const p = document.createElement('p');
          p.className = 'database_view_left_toolbar_error';
          p.textContent = message;
          database_table.parentElement.insertAdjacentElement('beforebegin', p);
          setTimeout(() => {
            p.remove();
          }, 5000);
        }
      }
    
      if (change_str.length > 0 && delete_entry.length > 0) {
        showError('Обновите страницу и попробуйте снова');
      } else if (change_str.length > 0 || delete_entry.length > 0) {
        const container = document.querySelector('.container');
        if(delete_entry.length > 0) {
        container.append(openConfirmationForm('удалить', delete_entry.length + ' шт.'));
        }
      } else {
        showError('Выберите записи');
      }
    }
   /*  console.log(targetParent); */

  }


  if (database_table) {
    let ths = database_table.previousElementSibling.querySelectorAll('th');
    ths.forEach((el, i) => addSortType(database_table.parentElement.parentElement, i + 1));
    ths.forEach((el) => el.addEventListener('click', leftToolbar));
    ths.forEach((el) => el.addEventListener('click', databaseTable));
    databaseTable();
  }


  function databaseTable() {
    let database_table = document.querySelector('.database_view_table table tbody');
    database_table.addEventListener('click', function databaseTable(e) {
      const changeActive = document.querySelector('.change.active');
      const deleteActive = document.querySelector('.delete.active');

      if (changeActive) {
        addChangeClassesToColumn({ shange: 'change-str', cursor: 'cursor_pointer' });

        if (e.target.tagName === 'TD' && !e.target.closest('textarea') && !e.target.querySelector('textarea')) {
          const textarea = document.createElement('textarea');
          textarea.value = e.target.textContent;
          e.target.textContent = '';
          e.target.classList.add('nopadding');
          e.target.style.padding = '0';
          e.target.append(textarea);


          textarea.addEventListener('change', textareaChange);

          function textareaChange() {
            const ths = document.querySelectorAll('table thead th');
            if (!e.target.parentElement.classList.contains('change_entry')) {
              e.target.parentElement.className = 'change_entry';
              const btn = btn_remove.cloneNode(true);
              e.target.parentElement.append(btn);
            }
            textarea.parentElement.classList.add(`${ths[e.target.cellIndex].id}`);
          };
        }
      }

      // удаление
      if (deleteActive) {
        addChangeClassesToColumn({ cursor: 'cursor_pointer' });
        const tr = e.target.closest('tr');
        tr.classList.contains('delete_entry') ? tr.classList.remove('delete_entry') : tr.classList.add('delete_entry');
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

        // Удаление кнопки отмены после сброса
        parent.removeChild(e.target);
      }

    });
  }


  function addChangeClassesToColumn(classes) {
    const tds = database_table.querySelectorAll('td');
    const class_line = Object.values(classes);
    tds.forEach(td => td.className = class_line.join(' '));
  }

  function removeClassesToColumn() {
    let trs = database_table.querySelectorAll('tr');
    let tds = database_table.querySelectorAll('td');
    const btns = database_table.querySelectorAll('.cancellation');
    tds.forEach(td => td.className = '');
    trs.forEach(tr => tr.className = '');
    if (btns) {
      btns.forEach(btn => btn.parentElement.removeChild(btn));
    }
  }

}

async function getTableByName(tableName, parent) {
  const req_table = await fetch(`${window.origin}/tables/${tableName}`);
  const table_colums = await req_table.text();
  parent.parentElement.parentElement.removeChild(parent.parentElement.parentElement.lastElementChild);
  parent.parentElement.parentElement.insertAdjacentHTML('beforeend', table_colums);
  afterAddTables();
}

async function createInsertForm(tableName, parent) {
  const req_table = await fetch(`${window.origin}/insert-to-table/${tableName}`);
  const table_colums = await req_table.text();
  parent.parentElement.parentElement.removeChild(parent.parentElement.parentElement.lastElementChild);
  parent.parentElement.parentElement.insertAdjacentHTML('beforeend', table_colums);
  const back = document.querySelector('.prev_form_btn');
  const btn_form = document.querySelector('.insert_form .btn_form');
  if (back) {
    back.addEventListener('click', function () {
      getTableByName(tableName, parent);
    }, { once: true })
  }
  if(btn_form) {
    btn_form.addEventListener('click', async function() {
      const obj = {};
      document.forms[0].querySelectorAll('[name]').forEach(el => {
        if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          console.log(el.value);
        }
      });
    })
  }
};

function strIng(l) {
  const length_str = String(l);
  const len = length_str.length;
  if (length_str[len - 1] === '1') {
    return 'строкa';
  }
  if (length_str[len - 1] === '2' || length_str[len - 1] === '3' || length_str[len - 1] === '4') {
    return 'строки';
  }
  return 'строк';
}

async function getPosters(menu_left) {
  const req_posters = await fetch(`${window.origin}/posters`);
  const posters = await req_posters.text();
  menu_left.parentElement.parentElement.removeChild(menu_left.parentElement.nextElementSibling);
  menu_left.parentElement.insertAdjacentHTML('afterend', posters);
  managementPosters();
  managementPosterDownloaded();
}

function managementPosters() {
  const posters_add = document.querySelector('.posters_add');
  if (posters_add) {
    const posters_add_preview = posters_add.querySelector('.posters_add_preview');
    const poster_save = posters_add.querySelector('.poster_save');
    const posters_add_name = posters_add.querySelector('.posters_add_name');

    posters_add.addEventListener('change', (e) => {
      if (e.target.id === 'myfile') {
        const file = e.target.files[0];
        const reader = new FileReader();
        poster_save.classList.remove('unblock');
        posters_add_name.textContent = e.target.value.substring(12);
        reader.onload = () => {
          posters_add_preview.style.backgroundImage = `url(${reader.result})`;
        };
        reader.readAsDataURL(file); // Start reading the file
      }
    });

    posters_add.addEventListener('click', async (e) => {
      if (e.target.classList.contains('reset_btn_form')) {
        poster_save.classList.add('unblock');
        posters_add_name.textContent = '';
        posters_add_preview.style.backgroundImage = 'none';
      }
      if (e.target.classList.contains('poster_save')) {
        try {
          const myfile = document.querySelector('#myfile');
          const formData = new FormData();
          formData.append("file", myfile.files[0]);

          fetch(`${window.origin}/posters`, {
            method: 'POST',
            body: formData
          })
            .then(async response => {
              if (!response.ok) {
                // Проверка типа ответа
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("text/html")) {
                  throw new Error("Файл с таким именем уже создан");
                }
                const error = await response.json();
                throw new Error(error.error);
              }
              return response.json();
            })
            .then(data => {
              poster_save.classList.add('unblock');
              posters_add_name.textContent = `Файл ${data.filename} успешно загружен`;
              posters_add_name.classList.add('success');
              setTimeout(() => {
                posters_add_name.textContent = '';
                posters_add_name.classList.remove('success');
              }, 8000);
              posters_add_preview.style.backgroundImage = 'none';
            })
            .catch(e => {
              posters_add_name.textContent = e.message;
              posters_add_name.classList.add('error');
              console.error("Ошибка при загрузке файла:", e.message);
            });

        } catch (e) {
          console.error("Ошибка:", e.message);
        }
      }


    })
  }

}

function managementPosterDownloaded() {
  const posters_container = document.querySelector('.posters_views');
  if (posters_container) {
    posters_container.addEventListener('click', (e) => {
      if (e.target.classList.contains('poster_change_name')) {
        const poster_view_name = e.target.parentElement.parentElement.querySelector('.poster_view_name');
        const div = document.createElement('div');
        div.className = 'poster_changes_container';
        const input_text = document.createElement('input');
        input_text.type = 'text';
        input_text.value = poster_view_name.textContent.substring(0, poster_view_name.textContent.lastIndexOf('.'));
        const input_btn = document.createElement('input');
        input_btn.type = 'button';
        input_btn.title = 'Сохранить';
        input_btn.className = 'poster_change_name_btn';
        div.append(input_text, input_btn);
        poster_view_name.parentElement.replaceChild(div, poster_view_name);
      }
      if (e.target.classList.contains('poster_delete')) {
        const container = document.querySelector('.container');
        container.append(openConfirmationForm('удаление', e.target.parentElement.previousElementSibling.textContent));
        const confirmation_form = document.querySelector('.confirmation_form');
        if (confirmation_form) {
          confirmation_form.addEventListener('click', function (event) {
            if (event.target.id === 'confirm_false') {
              container.removeChild(confirmation_form.parentElement);
            }
            if (event.target.id === 'confirm_true') {
              fetch(`${window.origin}/posters/${e.target.parentElement.previousElementSibling.textContent}`, {
                method: 'DELETE'
              })
                .then(async (response) => {
                  if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                  }
                  const data = await response.json();
                  confirmation_form.textContent = data.message;
                  setTimeout(() => {
                    container.removeChild(confirmation_form.parentElement);
                  }, 3000);
                })
                .catch((err) => {
                  console.error(err.message);
                });

              console.log(e.target.parentElement.previousElementSibling.textContent);
            }
          }, { once: true })
        }
      }
      if (e.target.classList.contains('poster_change_name_btn')) {
        fetch(`${window.origin}/posters/${e.target.parentElement.parentElement.parentElement.dataset.name}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            newName: e.target.previousElementSibling.value + e.target.parentElement.parentElement.parentElement.dataset.name.substring(e.target.parentElement.parentElement.parentElement.dataset.name.lastIndexOf('.'))
          })
        })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
          const data = await response.json();
          if(data.message) {
            e.target.parentElement.textContent = data.message; 
          }
        })
        .catch((error) => {
          console.error('Ошибка:', error.message);
        });
      }
    });
  }
}

function openConfirmationForm(activity, elems) {
  const div = document.createElement('div');
  div.className = 'form_big_container';
  const div1 = document.createElement('div');
  div1.className = 'confirmation_form';
  const p1 = document.createElement('p');
  p1.textContent = `Подтвердите ${activity} документа`;
  const p2 = document.createElement('p');
  p2.textContent = elems;
  const div2 = document.createElement('div');
  const input1 = document.createElement('input');
  input1.type = 'button';
  input1.id = 'confirm_true';
  input1.value = 'Да';
  input1.className = 'btn_form_accent';
  const input2 = document.createElement('input');
  input2.type = 'button';
  input2.value = 'Нет';
  input2.className = 'btn_form';
  input2.id = 'confirm_false';
  div2.append(input1, input2);
  div1.append(p1, p2, div2);
  div.append(div1);
  return div;
}