
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

      if (e.target.tagName === 'A' && e.target.parentElement.parentElement.parentElement.classList.contains('manager_tables') && !e.target.classList.contains('open_posters') && !e.target.classList.contains('manager_reporting')
      &&  !e.target.classList.contains('open_my_application') &&  !e.target.classList.contains('open_application')
      
      ) {
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

      if (e.target.classList.contains('sales_report')) {
        getSalesReport(menu_left);
      }

      if(e.target.classList.contains('attendance_report')){
        getAttendancePage(menu_left);
      }

      if(e.target.classList.contains('open_application')){
        openNobodyApplication(menu_left, false);
      }
      if(e.target.classList.contains('open_my_application')){
        //мои заявки
        openNobodyApplication(menu_left, true);
      }

    })
  }

});

// Функция для открытия заявки с nobody-application
async function openNobodyApplication(parent, my, back = false) {
  try {
    let  nobody_application;
    if(!my) {
     nobody_application = await fetch(`${window.origin}/cinema-panel/tables/application_rent/true`);
    } else {
     nobody_application = await fetch(`${window.origin}/cinema-panel/tables/application_rent/true/true`);
    }

    const application = await nobody_application.text();
    if(!back) {
      parent.parentElement.parentElement.removeChild(parent.parentElement.parentElement.lastElementChild);
      parent.parentElement.parentElement.insertAdjacentHTML('beforeend', application );
    } else {
      parent.parentElement.removeChild(parent.parentElement.lastElementChild);
      parent.parentElement.insertAdjacentHTML('beforeend', application );
    }


    afterAddTables();

  } catch (err) {
    console.error(err);
  }
}


function afterAddTables() {
  const left_toolbar = document.querySelector('.database_view_left_toolbar');
  const search_text_btn = document.querySelector('.search_text_btn');
  let database_table = document.querySelector('.database_view_table table tbody');
  const search_content = document.querySelectorAll('.database_view_table table th, .database_view_table table td');
  const menu_left = document.querySelector('.menu-left__items');
  database_table.parentElement.insertAdjacentHTML('afterend', `<p class = "total_rows">Итого: <span>${database_table.children.length} ${strIng(database_table.children.length)}</span></p>`);
  const getforwork = document.querySelector('.getforwork');
  const cancelforwork = document.querySelector('.cancelforwork');
  const chech_halls = document.querySelector('.chech_halls');
  const designforwork = document.querySelector('.designforwork');

  if(designforwork) {
    designforwork.addEventListener('click', designForWork);
  }

  const svg_save = document.querySelector('.svg_save');
  const table = document.querySelector('table');
  if(svg_save) {
    svg_save.addEventListener('click', () => {
      exportData(table);
    })
  }

  function exportData(table) {
    const violet = document.querySelector('.violet');

    // Данные таблицы
    let csv_data = [];

    // Функция для замены символов
    function changeSymbolsForCSV(str) {
      let arr = str.split("");
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === ".") {
          arr[i] = ",";
          continue;
        }
        if (arr[i] === ",") {
          arr[i] = " ";
          continue;
        }
        if (arr[i] === "№") {
          arr[i] = "#";
        }
      }
      return arr.join("");
    }

    // Считываем строки таблицы
    let rows = table.querySelectorAll("tr");
    for (let i = 0; i < rows.length; i++) {
      let cols = rows[i].querySelectorAll("td, th");
      let csvRow = [];
      for (let j = 0; j < cols.length; j++) {
        csvRow.push(changeSymbolsForCSV(cols[j].textContent.trim()));
      }
      csv_data.push(csvRow.join(";"));
    }

    csv_data = csv_data.join("\n"); // Преобразование в строку

    /*     // Делаем перекодировку символов (убираем "иероглифы")
        let uint8 = new Uint8Array(csv_data.length);
        for (let i = 0; i < csv_data.length; i++) {
          let x = csv_data.charCodeAt(i);
          if (x >= 1040 && x <= 1103) {
            // Символы А..Я а..я
            x -= 848;
          } else if (x === 1025) {
            // Символ Ё
            x = 168;
          } else if (x === 1105) {
            // Символ ё
            x = 184;
          }
          uint8[i] = x;
        } */

    // Скачать полученный файл
    let file = new Blob([csv_data], { type: 'text/csv;charset=utf-8;' });
    let link = document.createElement("a");
    let url = window.URL.createObjectURL(file);
    link.href = url;
    link.download = `${violet.textContent}.csv`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  //кнопка принятия в работу
  if(getforwork) {
    getforwork.addEventListener('click', takeForWork);
  }

  if(chech_halls) {
    chech_halls.addEventListener('click', checkHallsTime);
  }

  //кнопка отмены работы
  if(cancelforwork) {
    cancelforwork.addEventListener('click', closeApplication);
  }


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
      database_table = document.querySelector('.database_view_table table tbody');
      const change_entry = database_table.querySelectorAll('.change_entry');
      const delete_entry = database_table.querySelectorAll('.delete_entry');
      const errorMessage = database_table.parentElement.parentElement.querySelector('.database_view_left_toolbar_error');
      const ths = document.querySelectorAll('table th');

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

      if (change_entry.length > 0 && delete_entry.length > 0) {
        showError('Обновите страницу и попробуйте снова');
      } else if (change_entry.length > 0 || delete_entry.length > 0) {
        const container = document.querySelector('.container');
        if (delete_entry.length > 0) {
          container.append(openConfirmationForm('удаление', delete_entry.length + ' шт.'));
          container.addEventListener('click', async function (e) {
            const form_big_container = container.querySelector('.form_big_container');
            if (e.target.id == 'confirm_false' && form_big_container) {
              form_big_container.remove();
            }
            if (e.target.id == 'confirm_true' && form_big_container) {
              const arr = [];
              delete_entry.forEach(element => {
                const obj = {};
                const tds = element.querySelectorAll('td');
                tds.forEach(elem => obj[ths[elem.cellIndex].id] = elem.textContent);
                arr.push(obj);
              });
              if (arr.length > 0) {
                try {
                  const req_delete = await fetch(`${window.origin}/cinema-panel/insert-to-table/${database_table.parentElement.id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(arr)
                  });
                  const res_del = await req_delete.json();
                  showError(res_del.message);
                } catch (err) {
                  showError(err.message);
                }
                form_big_container.remove();

              }
            }
          });
        }

        if (change_entry.length > 0) {
          container.append(openConfirmationForm('изменение', change_entry.length + ' шт.'));
          container.addEventListener('click', async function (e) {
            const form_big_container = container.querySelector('.form_big_container');
            if (e.target.id == 'confirm_false' && form_big_container) {
              form_big_container.remove();
            }
            if (e.target.id == 'confirm_true' && form_big_container) {
              const arr = [];
              change_entry.forEach(tr => {
                const tds = tr.querySelectorAll('td');
                if (tds) {
                  const obj = { old: {}, new: {} };
                  tds.forEach(td => {
                    const textarea = td.querySelector('textarea');
                    if (textarea) {
                      obj.new[ths[td.cellIndex].id] = textarea.value.trim();
                    }
                    obj.old[ths[td.cellIndex].id] = td.dataset.value;
                    /*  [td.dataset.row] */
                  })
                  arr.push(obj);
                }
              });
              try {
                const req_change = await fetch(`${window.origin}/cinema-panel/insert-to-table/${database_table.parentElement.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(arr)
                });
                const res_change = await req_change.json();
                showError(res_change.message);
              } catch (err) {
                showError(err.message);
              }
              form_big_container.remove();
            }
          });

        }

      } else {
        showError('Выберите записи');
      }
    }

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
            const textarea = td.querySelector('textarea');
            if (textarea) {
              td.textContent = td.dataset.value;
              textarea.remove();
              td.classList.remove('nopadding');
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
  const req_table = await fetch(`${window.origin}/cinema-panel/tables/${tableName}`);
  const table_colums = await req_table.text();
  parent.parentElement.parentElement.removeChild(parent.parentElement.parentElement.lastElementChild);
  parent.parentElement.parentElement.insertAdjacentHTML('beforeend', table_colums);
  afterAddTables();
}

async function createInsertForm(tableName, parent) {
  const req_table = await fetch(`${window.origin}/cinema-panel/insert-to-table/${tableName}`);
  const table_colums = await req_table.text();
  parent.parentElement.parentElement.removeChild(parent.parentElement.parentElement.lastElementChild);
  parent.parentElement.parentElement.insertAdjacentHTML('beforeend', table_colums);
  const back = document.querySelector('.prev_form_btn');
  const insert_form = document.querySelector('.insert_form form');
  insert_form.addEventListener('submit', async function (event) {
    event.preventDefault();

    // Преобразование FormData в объект
    const formData = new FormData(insert_form);
    const jsonObject = {};
    formData.forEach((value, key) => {
      jsonObject[key] = value;
    });

    // Отправка JSON-запроса
    fetch(`/cinema-panel/insert-to-table/${insert_form.dataset.table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonObject)
    })
      .then(async (response) => {
        const data = await response.json();
        insert_form.reset();
        if (data.message) {
          const p = document.createElement('p');
          p.textContent = data.message;
          p.className = 'database_view_left_toolbar_error';
          insert_form.parentElement.insertAdjacentElement('afterbegin', p);
          setTimeout(() => {
            insert_form.parentElement.removeChild(p);
          }, 5000);
        } else {
          throw new Error('Ошибка');
        }
      })
      .catch(error => {
        console.error(error.message);
      });
  });
  if (back) {
    back.addEventListener('click', function () {
      getTableByName(tableName, parent);
    }, { once: true })
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
  const req_posters = await fetch(`${window.origin}/cinema-panel/posters`);
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

          fetch(`${window.origin}/cinema-panel/posters`, {
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
              fetch(`${window.origin}/cinema-panel/posters/${e.target.parentElement.previousElementSibling.textContent}`, {
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

              /*   console.log(e.target.parentElement.previousElementSibling.textContent); */
            }
          }, { once: true })
        }
      }
      if (e.target.classList.contains('poster_change_name_btn')) {
        fetch(`${window.origin}/cinema-panel/posters/${e.target.parentElement.parentElement.parentElement.dataset.name}`, {
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
            if (data.message) {
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

async function getSalesReport(parent) {
  const req_sales = await fetch(`${window.origin}/cinema-panel/sales-report`);
  const sales = await req_sales.text();
  parent.parentElement.parentElement.removeChild(parent.parentElement.parentElement.lastElementChild);
  parent.parentElement.parentElement.insertAdjacentHTML('beforeend', sales);
  AfterSalePage();
}

async function AfterSalePage() {
  const form_sales = document.querySelector('.form_sales'); // Находим форму
  const sales_page = document.querySelector('.sales_page');
  const sales_choice_period = document.querySelector('.sales_choice_period');
  const period_type = document.querySelectorAll('.radio-container input[type="radio"]');
  const download_reporting = document.querySelector('.download_reporting');

  download_reporting.addEventListener('click', async function () {

    const obj = {
      perriod_start: sales_choice_period.firstElementChild.value,
      perriod_end: sales_choice_period.lastElementChild.value,
      period: Array.from(period_type).find(radio => radio.checked)?.value
    }

    const req_reporting = await fetch(`${window.origin}/cinema-panel/sales-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obj)
    });

    const sales = await req_reporting.text();
    const next_report = document.querySelector('.next_report');
    next_report.insertAdjacentHTML('afterbegin', sales) ;
    createChartFromTable();
  })



  function createChartFromTable() {
    // Получаем таблицу и строки данных
    const table = document.querySelector('.next_report table');
    const rows = table.getElementsByTagName('tr');
    // Массивы для месяцев и сумм
    const months = [];
    const totals = [];
    
    // Перебираем строки и извлекаем данные
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].getElementsByTagName('td');
      const month = cells[0].innerText; // Месяц
      const total = parseFloat(cells[1].innerText); // Сумма (преобразуем в число)
      
      months.push(month); // Добавляем месяц в массив
      totals.push(total); // Добавляем сумму в массив
    }
    
    // Получаем элемент canvas для графика
    const ctx = document.getElementById('myChart').getContext('2d');

    // Создаем график
    new Chart(ctx, {
      type: 'bar', // Тип графика (столбчатая диаграмма)
      data: {
        labels: months, // Месяцы как метки по оси X
        datasets: [{
          label: 'Сумма по месяцам', // Подпись для графика
          data: totals, // Суммы как данные для графика
          borderWidth: 1, // Толщина границы
          backgroundColor: 'rgba(72, 64, 121, .5)', // Цвет фона для столбцов
          borderColor: 'rgba(72, 64, 121, 1)', // Цвет границ столбцов
          borderRadius: 5, // Закругленные углы у столбцов
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true, // Основание оси Y будет начинаться с нуля
            ticks: {
              callback: function(value) {
                return value.toFixed(2); // Форматирование меток по оси Y (с двумя знаками после запятой)
              }
            }
          }
        },
        responsive: true, // Адаптивность графика
        maintainAspectRatio: false // Поддержка пропорций
      }
    });
  }


}

async function getAttendancePage(parent) {

  const req_sales = await fetch(`${window.origin}/cinema-panel/attention-report`);
  const sales = await req_sales.text();
  parent.parentElement.parentElement.removeChild(parent.parentElement.parentElement.lastElementChild);
  parent.parentElement.parentElement.insertAdjacentHTML('beforeend', sales);
  const attendance_page_conrainer = document.querySelector('.attendance_page_conrainer');
  AfterAttentPage(attendance_page_conrainer);
}

async function AfterAttentPage(attendance_page_conrainer) {
  const table1 = attendance_page_conrainer.querySelectorAll('.session_summary_today_table table td');
  const table2 = attendance_page_conrainer.querySelectorAll('.session_summary_lastday_table table td');
  const dates = document.querySelector('.session_summary_reporting .attendance_page_period');
  const download = document.querySelector('.attendance_page .download_reporting');
  const select = document.querySelector('[name="attendance_page_list"]');

  download.addEventListener('click', async function() {
    const radio_block = document.querySelector('input[type="radio"]:checked');
    const obj = {
      perriod_start: dates.firstElementChild.value,
      perriod_end: dates.firstElementChild.nextElementSibling.value,
      period: radio_block.value,
      movie_name: select[select.selectedIndex].value
    }
    const movie_name = select[select.selectedIndex].textContent;

    const req_report = await fetch(`${window.origin}/cinema-panel/attention-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obj)
    });

    const answ = await req_report.json();
    const answ_date = answ.map(el => el.day); 
    const percent = answ.map(el => el.percent); 
    const ctx4 = document.getElementById('myChart4').getContext('2d');
    new Chart(ctx4, {
      type: 'line', // Тип диаграммы: Линейная диаграмма
      data: {
        labels: answ_date, // Периоды
        datasets: [{
            label: movie_name, // Для первого периода
            data: percent, // Проценты для текущего периода
            borderColor: 'rgba(72, 64, 121, 1)', // Цвет линии
            fill: false, // Без заливки
            tension: 0.1 // Сглаживание линии
          }
        ]
      },
      options:  {
        responsive: false,
        maintainAspectRatio: false,
    /*     width: 200,
        height: 200 */
      }
    });

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const tr = document.createElement('tr');
    const th1 = document.createElement('th');
    const th2 = document.createElement('th');
    th1.textContent = 'Процент';
    th2.textContent = movie_name;
    tr.append(th1, th2);
    thead.append(tr);
    answ.forEach((item) => {
      const tr = document.createElement('tr'); 
      const tdDay = document.createElement('td');
      tdDay.textContent = item.day; 
  
      const tdPercent = document.createElement('td');
      tdPercent.textContent = item.percent;
      tr.appendChild(tdDay);
      tr.appendChild(tdPercent);
      tbody.append(tr);
    });
    
    table.append(thead, tbody);

    const created_table = document.querySelector('.created_table');
    created_table.append(table); 

  }, {once:true})




  const labels = ['День', 'Неделя', 'Месяц', 'Год'];
  const allPlaceData = [
    table1[1].textContent, 
    table1[5].textContent,
    table1[9].textContent,
    table1[13].textContent,
  ];

  const allTicketData = [
    table1[2].textContent, 
    table1[6].textContent,
    table1[10].textContent,
    table1[14].textContent,
  ];

  const percentData = [
    table1[3].textContent, 
    table1[7].textContent,
    table1[11].textContent,
    table1[15].textContent,
  ];


  const allPlaceLastData = [
    table2[1].textContent, 
    table2[5].textContent,
    table2[9].textContent,
    table2[13].textContent,
  ];

  const allTicketLastData = [
    table2[2].textContent, 
    table2[6].textContent,
    table2[10].textContent,
    table2[14].textContent,
  ];

  const percentLastData = [
    table2[3].textContent, 
    table2[7].textContent,
    table2[11].textContent,
    table2[15].textContent,
  ];
  const ctx1 = document.getElementById('myChart1').getContext('2d');
  const ctx2 = document.getElementById('myChart2').getContext('2d');
  const ctx3 = document.getElementById('myChart3').getContext('2d');


  new Chart(ctx1, {
    type: 'line', // Тип диаграммы: Линейная диаграмма
    data: {
      labels: ['День', 'Неделя', 'Месяц', 'Год'], // Периоды
      datasets: [{
          label: 'Текущий период', // Для первого периода
          data: percentData, // Проценты для текущего периода
          borderColor: 'rgba(54, 162, 235, 1)', // Цвет линии
          fill: false, // Без заливки
          tension: 0.1 // Сглаживание линии
        },
        {
          label: 'Прошлый период', // Для второго периода
          data: percentLastData, // Проценты для прошлого периода
          borderColor: 'rgba(255, 99, 132, 1)', // Цвет линии
          fill: false, // Без заливки
          tension: 0.1 // Сглаживание линии
        }
      ]
    },
    options:  {
      responsive: false,
      maintainAspectRatio: false,
      width: 200,
      height: 200
    }
  });
  new Chart(ctx2, {
    type: 'line', // Тип диаграммы: Линейная диаграмма
    data: {
      labels: ['День', 'Неделя', 'Месяц', 'Год'], // Периоды
      datasets: [{
          label: 'Текущий период', // Для первого периода
          data: allTicketData , // Проценты для текущего периода
          borderColor: 'rgba(54, 162, 235, 1)', // Цвет линии
          fill: false, // Без заливки
          tension: 0.1 // Сглаживание линии
        },
        {
          label: 'Прошлый период', // Для второго периода
          data: allTicketLastData, // Проценты для прошлого периода
          borderColor: 'rgba(255, 99, 132, 1)', // Цвет линии
          fill: false, // Без заливки
          tension: 0.1 // Сглаживание линии
        }
      ]
    },
    options:  {
      responsive: false,
      maintainAspectRatio: false,
      width: 200,
      height: 200
    }
  });

  new Chart(ctx3, {
    type: 'line', // Тип диаграммы: Линейная диаграмма
    data: {
      labels: ['Сегодня', 'Неделя', 'Месяц', 'Год'], // Периоды
      datasets: [{
          label: 'Текущий период', // Для первого периода
          data: allPlaceData, // Проценты для текущего периода
          borderColor: 'rgba(54, 162, 235, 1)', // Цвет линии
          fill: false, // Без заливки
          tension: 0.1 // Сглаживание линии
        },
        {
          label: 'Прошлый период', // Для второго периода
          data: allPlaceLastData, // Проценты для прошлого периода
          borderColor: 'rgba(255, 99, 132, 1)', // Цвет линии
          fill: false, // Без заливки
          tension: 0.1 // Сглаживание линии
        }
      ]
    },
    options:  {
      responsive: false,
      maintainAspectRatio: false,
      width: 200,
      height: 200
    }
  });


}


async function takeForWork(e) {
  try {
    // Находим элемент с данными
    const element = e.target.parentElement.parentElement.querySelector('[data-row="application_rent_name"]');
    if (!element) {
      console.error("Элемент с data-row='application_rent_name' не найден");
      return;
    }

    // Проверяем наличие значения в data-row
    if (!element.dataset.value) {
      console.error("Атрибут data-value отсутствует или пуст");
      return;
    }

    // Находим контейнер и добавляем форму подтверждения
    const container = document.querySelector('.container');
    container.append(openConfirmationForm('Принятие в работу', `Идентификатор заявки №${element.dataset.value}`));

    // Находим форму подтверждения
    const confirmation_form = document.querySelector('.confirmation_form');
    if (!confirmation_form) {
      console.error("Форма подтверждения не найдена");
      return;
    }

    // Обработка кликов на кнопки подтверждения
    confirmation_form.addEventListener('click', async function (event) {
      if (event.target.id === 'confirm_false') {
        // Удаляем форму при отказе
        container.removeChild(confirmation_form.parentElement);
      }

      if (event.target.id === 'confirm_true') {
        try {
          // Отправляем данные на сервер
          const response = await fetch(`${window.origin}/cinema-panel/take-application`, {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({ elem_id: element.dataset.value })
          });

          if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
          }

          const data = await response.json();

          // Отображаем сообщение от сервера
          confirmation_form.textContent = data.message;

          // Удаляем форму через 3 секунды
          setTimeout(() => {
            container.removeChild(confirmation_form.parentElement);
          }, 3000);
        } catch (error) {
          console.error('Ошибка отправки данных:', error.message);
          confirmation_form.textContent = 'Произошла ошибка. Попробуйте снова.';
        }
      }
    }, { once: true }); // Убеждаемся, что обработчик выполнится только один раз
  } catch (error) {
    console.error('Ошибка в функции takeForWork:', error.message);
  }
}

async function closeApplication (e) {
  try {
    // Находим элемент с данными
    const element = e.target.parentElement.parentElement.querySelector('[data-row="application_rent_name"]');
    if (!element) {
      console.error("Элемент с data-row='application_rent_name' не найден");
      return;
    }

    // Проверяем наличие значения в data-row
    if (!element.dataset.value) {
      console.error("Атрибут data-value отсутствует или пуст");
      return;
    }

    // Находим контейнер и добавляем форму подтверждения
    const container = document.querySelector('.container');
    container.append(openConfirmationForm('Отменить заявку', `Идентификатор заявки №${element.dataset.value}`));

    // Находим форму подтверждения
    const confirmation_form = document.querySelector('.confirmation_form');
    if (!confirmation_form) {
      console.error("Форма подтверждения не найдена");
      return;
    }

    // Обработка кликов на кнопки подтверждения
    confirmation_form.addEventListener('click', async function (event) {
      if (event.target.id === 'confirm_false') {
        // Удаляем форму при отказе
        container.removeChild(confirmation_form.parentElement);
      }

      if (event.target.id === 'confirm_true') {
        try {
          // Отправляем данные на сервер
          const response = await fetch(`${window.origin}/cinema-panel/close-application`, {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({ elem_id: element.dataset.value })
          });

          if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
          }

          const data = await response.json();

          // Отображаем сообщение от сервера
          confirmation_form.textContent = data.message;

          // Удаляем форму через 3 секунды
          setTimeout(() => {
            container.removeChild(confirmation_form.parentElement);
          }, 3000);
        } catch (error) {
          console.error('Ошибка отправки данных:', error.message);
          confirmation_form.textContent = 'Произошла ошибка. Попробуйте снова.';
        }
      }
    }, { once: true }); // Убеждаемся, что обработчик выполнится только один раз
  } catch (error) {
    console.error('Ошибка в функции takeForWork:', error.message);
  }
}

function checkHallsTime() {
  const container = document.querySelector('.container');
  const formElement = openSearchForm();

  // Открываем форму
  container.append(formElement);

  const btn_search_hall_form = document.querySelector('.btn_search_hall_form');
  if(btn_search_hall_form) {
    btn_search_hall_form.addEventListener('click', async function () {
      const forms = document.querySelectorAll('form input[name]');
      const obj = {
        date: forms[0].value || null,
        time_start: forms[1].value || null,
        time_end: forms[2].value || null
      }
      const check = Object.values(obj).every(el => el !== null);
      if(check) {
        const start = new Date(`1970-01-01T${obj.time_start}:00`);
        const end = new Date(`1970-01-01T${obj.time_end}:00`);
        if(start < end) {
        const req_data_halls = await fetch(`${window.origin}/cinema-panel/check-date-halls`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify(obj)
        });
        const data_halls = await req_data_halls.text();
        const searched_halls = document.querySelector('.searched_halls');
        if(data_halls && searched_halls) {
          searched_halls.innerHTML =  data_halls;     
        }
        }
      }
    })
  }

  // Добавляем обработчик закрытия после создания кнопки
  const buyFormClose = formElement.querySelector('.buy_form_close');
  if (buyFormClose) {
    buyFormClose.addEventListener('click', function () {
      container.removeChild(formElement);
    });
  }
}

function openSearchForm() {
  // Создаем главный контейнер формы
  const formBigContainer = document.createElement('div');
  formBigContainer.className = 'form_big_container';

  // Внутренний контейнер формы
  const searchFormContainer = document.createElement('div');
  searchFormContainer.className = 'search_form_container';

  // Кнопка закрытия
  const btn = document.createElement('button');
  btn.className = 'buy_form_close btn_main_style search_form_close';
  btn.title= 'Закрыть'; 
  const form = document.createElement('form');
  form.className = 'search_hall_form';
  const div = document.createElement('div');
  div.className = 'search_hall_form_container'
  const div1 = document.createElement('div');
  const input1 = document.createElement('input');
  input1.type = 'date'; 
  input1.name = 'date';
  const date = new Date();
  const formatted_date = `${date.getFullYear()}-${(date.getMonth() + 1).toString().length < 2 ? "0"+(date.getMonth() + 1) : (date.getMonth() + 1)}-${(date.getDate()).toString().length < 2 ? "0"+(date.getDate()) : (date.getDate())}`;
  input1.min = formatted_date;
  input1.title = 'Дата';
  const input2 = document.createElement('input');
  input2.type = 'time'; 
  input2.title = 'Время начала';
  input2.name = 'time_start';
  const input3 = document.createElement('input');
  input3.type = 'time'; 
  input3.title = 'Время окончания';
  input3.name = 'time_end';
  const input4 = document.createElement('input');
  input4.type = 'button'; 
  input4.value = "Отправить";
  input4.className = 'btn_form btn_search_hall_form';
  div1.append(input1, input2, input3, input4);
  const div2 = document.createElement('div');
  div2.className = 'searched_halls';
  form.append(div1, div2);
  div.append(form);
  // Добавляем кнопку в контейнер формы
  searchFormContainer.append(btn, div);
  
  // Добавляем контейнер формы в главный контейнер
  formBigContainer.append(searchFormContainer);

  return formBigContainer;
}

async function designForWork() {
  const parent = document.querySelector('.menu-left');
  const req_table = await fetch(`${window.origin}/cinema-panel/insert-to-table/rent`);
  const table_colums = await req_table.text();
  parent.parentElement.removeChild(parent.parentElement.lastElementChild);
  parent.parentElement.insertAdjacentHTML('beforeend', table_colums);
  const back = document.querySelector('.prev_form_btn');
  const insert_form = document.querySelector('.insert_form form');
  if (back) {
    back.addEventListener('click', function () {
      openNobodyApplication(parent, true, true);
    }, { once: true })
  }

  if(insert_form ) {
    insert_form.addEventListener('submit', async function (event) {
      event.preventDefault();
  
      // Преобразование FormData в объект
      const formData = new FormData(insert_form);
      const jsonObject = {};
      formData.forEach((value, key) => {
        jsonObject[key] = value;
      });
  
      // Отправка JSON-запроса
      fetch(`/cinema-panel/rent-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonObject)
      })
        .then(async (response) => {
          const data = await response.json();
          insert_form.reset();
          if (data.message) {
            const p = document.createElement('p');
            p.textContent = data.message;
            p.className = 'database_view_left_toolbar_error';
            insert_form.parentElement.insertAdjacentElement('afterbegin', p);
            setTimeout(() => {
              insert_form.parentElement.removeChild(p);
            }, 25000);
          } else {
            throw new Error('Ошибка');
          }
        })
        .catch(error => {
          console.error(error.message);
        });
    });
  }
}