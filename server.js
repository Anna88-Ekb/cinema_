import express, { json, response }/* , { urlencoded } */ from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import fs from 'fs/promises';
import { __filename, __dirname } from './__dirname.js';
import { manifest } from './manifest.js';
import moviesRoutes from './routes/movies.routes.js';
import moviesFilterRoutes from './routes/movieFilter.routes.js';
import clientRoutes from './routes/client.routes.js';
import seansHall from './routes/seans.routes.js';
import workerRoutes from './routes/worker.routes.js';
import workerDBRotes from './routes/dbWorker.router.js';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import { error } from 'console';
import cors from 'cors';
import { cache } from 'webpack';

const date = new Date().toLocaleDateString('ru-RU', { timeZone: "Europe/Moscow" });
const date_db_format = date.substring(6) + '-' + date.substring(3, 5) + '-' + date.substring(0, 2);

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE));
app.use((req, res, next) => {
  res.locals.login = Boolean(req.cookies.client_login);
  next();
});
app.use((req, res, next) => {
  res.locals.worker_login = Boolean(req.cookies.worker_login);
  next();
});
app.use((req, res, next) => {
  res.locals.worker_access = JSON.parse(req.cookies.worker_access || '[]');
  next();
});


app.use('/posters', express.static(path.join(__dirname, 'images/posters')));
app.use('/icons', express.static(path.join(__dirname, 'images/icons')));
app.use('/api', moviesRoutes);
app.use('/api', moviesFilterRoutes);
app.use('/api', seansHall);
app.use('/server-api', cors({
  origin: `${process.env.SERV_HOST}:${process.env.DB_PORT}`
}));
app.use('/server-api', clientRoutes);
app.use('/server-api', workerRoutes);
app.use('/server-api', workerDBRotes);

app.engine('hbs', engine({
  extname: 'hbs',
  defaultLayout: false,
  partialsDir: path.join(__dirname, 'views', 'partials'),
  helpers: {
    homeCssFile: manifest['home.css'],
    homeJsFile: manifest['home.js'],
    scheduleCssFile: manifest['schedule.css'],
    scheduleJsFile: manifest['schedule.js'],
    cinemaPanelCssFile: manifest['cinema_panel.css'],
    cinemaPanelJsFile: manifest['cinema_panel.js'],
    dateFormatRU: function (day) {
      return day.substring(8) + '.' + day.substring(5, 7) + '.' + day.substring(0, 4);
    },
    dateFormatDB: function (day) {
      return day.substring(6) + '-' + day.substring(3, 5) + '-' + day.substring(0, 2);
    },
    eq: function (a, b) {
      return a === b;
    },
    or: function (a, b) {
      return a || b;
    },
    and: function (a, b) {
      return a && b;
    },
    not: function (a, b) {
      return !a && !b;
    },
    true: function (a) {
      return a === true || Boolean(a) === true;
    },
    invers: function (a) {
      return !a;
    },
    capitalize: function (el) {
      return el.substring(0, 1).toUpperCase() + el.substring(1);
    },
    createInput: function (table_columns, obj) {
      const required = table_columns.not_null ? 'required' : '';
      // Если нет внешнего ключа
      if (table_columns.constraint_name === null) {
        const inp_type = table_columns.udt_name;

        if (inp_type.startsWith('int')) {
          return `<input id="${table_columns.column_name}" name="${table_columns.column_name}" type="number" min="1" step="1" maxlength="${table_columns.max_length}" ${required}></input>`;
        }
        if (inp_type === 'numeric') {
          return `<input id="${table_columns.column_name}" name="${table_columns.column_name}" type="number" min="0.1" step="0.1" max="1" maxlength="${table_columns.max_length}" ${required}></input>`;
        }
        if (inp_type === 'date') {
          return `<input id="${table_columns.column_name}" name="${table_columns.column_name}" type="date" min="${date_db_format}" ${required}></input>`;
        }
        if (inp_type === 'varchar') {
          return `<textarea id="${table_columns.column_name}" name="${table_columns.column_name}" maxlength="${table_columns.max_length}" ${required}></textarea>`;
        }
        if (inp_type === 'timestamp') {
          return `<input id="${table_columns.column_name}" name="${table_columns.column_name}" type="datetime-local" min="${date_db_format}T00:00" ${required}></input>`;
        }
        if (inp_type === 'time') {
          return `<input id="${table_columns.column_name}" name="${table_columns.column_name}" type="time" ${required}></input>`;
        }
        if (inp_type === 'bool') {
          return `<input id="${table_columns.column_name}" name="${table_columns.column_name}" min="0" max="1" type="range" ${required}></input>`;
        }

      }
      else {
        let option_str = '';
        obj[table_columns.column_name].forEach(element => {
          const keys = Object.keys(element);
          const values = Object.values(element);
          if (keys.length === 1) {
            option_str += `<option value="${values[0]}">${values[0]}</option>`;
          }
          else if (keys.length >= 2) {
            option_str += `<option value="${values[0]}">${values[1]}</option>`;
          }
        });

        return `<select ${required} data-table="${table_columns.foreign_table_name}" data-column="${table_columns.foreign_column_name}" name="${table_columns.column_name}">${option_str}</select>`;
      }
    }
  }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));



// Конфигурация хранилища с проверкой на существование файла
const storageConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'images/posters/'));
  },
  filename: async function (req, file, cb) {
    const filePath = path.join(__dirname, 'images/posters', file.originalname);
    try {
      // Асинхронная проверка существования файла
      await fs.access(filePath);
      cb(new Error('Файл с таким именем уже существует'));
    } catch (err) {
      cb(null, file.originalname);
    }
  }
});

app.use((err, req, res, next) => {
  if (err.message === 'Файл с таким именем уже существует') {
    return res.status(409).json({ error: err.message });
  }
  res.status(500).json({ error: "Произошла ошибка на сервере" });
});

// Настройка фильтра типов файлов
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Настройка multer с фильтром и хранилищем
const upload = multer({ storage: storageConfig, fileFilter: fileFilter });


app.get('/', async (_, res) => {
  try {
    const response_movies = await fetch(process.env.SERV_HOST + process.env.PORT + '/api/movies-slider');
    const movies = await response_movies.json();
    const response_movies_today = await fetch(process.env.SERV_HOST + process.env.PORT + `/api/movies-day/:${date_db_format}`);
    const halls = await response_movies_today.json();
    const response_min_price = await fetch(process.env.SERV_HOST + process.env.PORT + `/api/min-price`);
    let min_price = await response_min_price.json();

    res.render('home', {
      title: "Cinema-кинотеатр", movies, halls, min_price,
      helpers: {
        currentHall: function (halls, hallId, options) {
          const hall = halls.find(h => h.hall_id === hallId);
          if (hall) {
            return options.fn(hall);
          } else {
            return '<p>Сегодня киносеансы не проводятся</p>';
          }
        }
      }

    });
  } catch (error) {
    console.error('Ошибка при запросе к API:', error);
    res.status(500).send('Ошибка сервера');
  }
});

app.get('/schedule-page', async (_, res) => {
  try {
    const response_movies_country = await fetch(process.env.SERV_HOST + process.env.PORT + '/api/movies-country');
    const response_movies_type = await fetch(process.env.SERV_HOST + process.env.PORT + '/api/movies-type');
    const response_movies_age = await fetch(process.env.SERV_HOST + process.env.PORT + '/api/movies-age');
    const response_movies = await fetch(process.env.SERV_HOST + process.env.PORT + '/api/movies');
    const response_movies_calendar = await fetch(process.env.SERV_HOST + process.env.PORT + '/api/movies-calendar');
    const response_movies_day = await fetch(process.env.SERV_HOST + process.env.PORT + `/api/movies-day/:${date_db_format}`);
    const movies = await response_movies.json();
    const country = await response_movies_country.json();
    const type = await response_movies_type.json();
    const age = await response_movies_age.json();
    const calendar = await response_movies_calendar.json();
    const halls = await response_movies_day.json();
    res.render('schedule_page', {
      title: "Cinema-кинотеатр", country, type, age, movies, calendar, halls
    });
  } catch (error) {
    console.error('Ошибка при запросе к API:', error);
    res.status(500).send('Ошибка сервера');
  }
});

app.get('/filtered-movie', async (req, res) => {
  try {
    if (Object.keys(req.query).length > 0) {
      /*      console.log(req.query); */
      const queryString = new URLSearchParams(req.query).toString();
      const response_movies = await fetch(process.env.SERV_HOST + process.env.PORT + `/api/movies?${queryString}`);
      const movies = await response_movies.json();
      res.render('partials/afisha/filtered_movies', { movies });
    } else {
      const response_movies = await fetch(process.env.SERV_HOST + process.env.PORT + '/api/movies');
      const movies = await response_movies.json();
      res.render('partials/afisha/filtered_movies', { movies });
    }
  } catch (error) {
    console.error('Ошибка при запросе к API:', error);
    res.status(500).send('Ошибка сервера');
  }
})

app.get('/pages_info', async (_, res) => {
  res.sendFile(__dirname + '/dist/pages_info/index.html');
});

app.get('/schedule-day/', async (req, res) => {
  try {
    const response_movies_day = await fetch(process.env.SERV_HOST + process.env.PORT + `/api/movies-day/:${req.query.year}-${req.query.month}-${req.query.day}`);
    const halls = await response_movies_day.json();
    res.render('partials/cinema_session/cinema_sessions_halls', { halls });
  } catch (error) {
    console.error('Ошибка при запросе к API:', error);
    res.status(500).send('Ошибка сервера');
  }
});

app.post('/new-client', async (req, res) => {
  try {
    const clientResponse = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/new-client/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    if (!clientResponse.ok) {
      const errorData = await clientResponse.json();
      if (errorData.message) {
        return res.status(400).json({ message: errorData.message });
      } else {
        throw new Error(`Ошибка сервера: ${clientResponse.status}`);
      }
    }
    res.status(200).json({ success: true });
  } catch (e) {
    console.error('Ошибка при создании клиента:', error.message);
    res.status(500).json({ error: 'Ошибка при создании клиента' });
  }
});

app.get('/entarance-form/', async (_, res) => {
  res.render('partials/header/entrance_form', { client: true });
});

app.get('/registration-form/', async (_, res) => {
  res.render('partials/header/registration_form');
});

app.get('/restore-password-form/', async (_, res) => {
  res.render('partials/header/restore_password_form');
});

app.post('/search-client-mail', async (req, res) => {
  try {
    const client_email = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/search-client-mail/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const a_client_email = await client_email.json();
    if (a_client_email.message) {
      res.status(200).json({ message: a_client_email.message });
    }
    else if (a_client_email.success) {
      res.status(400).json({ success: a_client_email.success });
    }

  } catch (error) {
    res.status(500).json(error.message);
  }
});

app.post('/search-client-phone', async (req, res) => {
  try {
    const client_phone = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/search-client-phone/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const a_client_phone = await client_phone.json();
    if (a_client_phone.message) {
      res.status(200).json({ message: a_client_phone.message });
    }
    else if (a_client_phone.success) {
      res.status(400).json({ success: a_client_phone.success });
    }

  } catch (error) {
    res.status(500).json(error.message);
  }
});

app.post('/search-client-login', async (req, res) => {
  try {
    const client_login = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/search-client-login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const a_client_login = await client_login.json();
    if (a_client_login.message) {
      res.status(200).json({ message: a_client_login.message });
    }
    else if (a_client_login.success) {
      res.status(400).json({ success: a_client_login.success });
    }

  } catch (error) {
    res.status(500).json(error.message);
  }
});

app.post('/entrance-client', async (req, res) => {

  try {
    const client = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/entrance-client`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const a_client = await client.json();

    if (a_client.message) {
      res.status(400).json({ message: a_client.message });
    }
    else if (a_client.entrance === true) {

      res.cookie('client_login', `${a_client.login}`, {
        path: '/',
        encode: String
      });

      const login = a_client.login;
      res.render('partials/header/entrance', { login }, (err, html) => {
        if (err) {
          return res.status(500).json({ error: 'Ошибка рендеринга кнопки' });
        }
        res.status(200).json({ entrance: html });
      });
    }

  } catch (error) {
    res.status(500).json(error.message);
  }
});

app.get('/buy-ticket', async (req, res) => {

  let client_preference = false;
  if (req.cookies.client_login) {
    const request_client_preference = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/preference-client-contacts/?login=${req.cookies.client_login}`)
    client_preference = await request_client_preference.json();
  };


  if (Object.keys(req.query).length === 1 && req.query.movie_name) {
    const response_movies_day = await fetch(process.env.SERV_HOST + process.env.PORT + `/api/movie-days/${req.query.movie_name}`);
    const movie_days = await response_movies_day.json();
    const movie_name = movie_days[0].cinema_name;
    const response_movie_month = await fetch(process.env.SERV_HOST + process.env.PORT + `/api/movie-months/?name=${req.query.movie_name}`);
    const months = await response_movie_month.json();
    res.render('partials/buy_form/buy_form', { movie_name, client_preference: client_preference[0], months, days: false, hours: false });
  } else {
    const request_params = { ...req.query };
    const request_hall_place = await fetch(process.env.SERV_HOST + process.env.PORT + `/api/hall-tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request_params)
    });
    const hall_place = await request_hall_place.json();
    /*     hall_place.places.forEach(element => {
          element.place_col.forEach(el=> console.log(typeof el.col_status));
        }); */
    res.render('partials/buy_form/buy_form', { request_params, client_preference: client_preference[0], hall_place });

  }

});

app.get('/buy-ticket-halls/:name/:year/:month/:day?/:time?/:hall?/', async (req, res) => {
  let params = Object.fromEntries(
    Object.entries(req.params).filter(([key, value]) => value !== undefined && value !== 'undefined')
  );

  if(params.month && params.month.length ==1) {
    params.month = `0${params.month}`;
  }
  if(params.day && params.day.length ==1) {
    params.day = `0${params.day}`;
  }

  if (params.name && params.year && params.month && !params.day && !params.time & !params.hall) {
    try {
      const url = new URLSearchParams(params).toString();
      const request_dates = await fetch(process.env.SERV_HOST + process.env.PORT + `/api/movie-day-calendar/?${url}`);
      const days = await request_dates.json();
      res.render('partials/buy_form/buy_form_selection_days', { days }, (e, html) => {
        if (e) {
          return res.status(500).send(`Ошибка рендеринга: ${e.message}`);
        }
        res.send(html);
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  if (params.name && params.year && params.month && params.day && !params.time && !params.hall) {
    try {
      const url = new URLSearchParams(params).toString();
      const request_times = await fetch(process.env.SERV_HOST + process.env.PORT + `/api/movie-time-calendar/?${url}`);
      let hours = await request_times.json();
      if (hours.length === 0) {
        hours = false;
        return res.status(400).send('Выбирайте дату из предложенного списка');
      }
      res.render('partials/buy_form/buy_form_selection_hours', { hours }, (e, html) => {
        if (e) {
          return res.status(500).send(`Ошибка рендеринга: ${e.message}`);
        }
        res.send(html);
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  if (params.name && params.year && params.month && params.day && params.time && !params.hall) {
    const url = new URLSearchParams(params).toString();
    const request_halls = await fetch(process.env.SERV_HOST + process.env.PORT + `/api/movie-hall-calendar/?${url}`);
    const halls = await request_halls.json();
    if (halls.length > 1) {
      res.render('partials/buy_form/buy_form_halls', { halls }, (e, html) => {
        if (e) {
          return res.status(500).send(`Ошибка рендеринга: ${e.message}`);
        }
        res.send(html);
      });
    } else if (halls.length === 1) {
      const request_params = {
        movie_name: params.name,
        hall_num: halls[0].hall_id.toString(),
        movie_date: params.year + '-' + params.month + '-' + params.day,
        movie_time: params.time
      };

      const request_hall_place = await fetch(`${process.env.SERV_HOST}${process.env.PORT}/api/hall-tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request_params)
      });

      const hall_place = await request_hall_place.json();

      res.render('partials/buy_form/buy_form_tickets', { request_params, hall_place }, (e, html) => {
        if (e) {
          return res.status(500).send(`Ошибка рендеринга: ${e.message}`);
        }
        res.send(html);
      });
    }
  }

  if (params.name && params.year && params.month && params.day && params.time && params.hall) {
    const request_params = {
      movie_name: params.name,
      hall_num: params.hall,
      movie_date: params.year + '-' + params.month + '-' + params.day,
      movie_time: params.time
    };
    const request_hall_place = await fetch(`${process.env.SERV_HOST}${process.env.PORT}/api/hall-tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request_params)
    });
    const hall_place = await request_hall_place.json();
    
    res.render('partials/buy_form/buy_form_tickets', { request_params, hall_place }, (e, html) => {
      if (e) {
        return res.status(500).send(`Ошибка рендеринга: ${e.message}`);
      }
      res.send(html);
    });


  }


})

app.post('/seance-promotion', async (req, res) => {
  try {

    const req_promotion = await fetch(
      `${process.env.SERV_HOST}${process.env.PORT}/api/seance-promotion`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      }
    );

    if (!req_promotion.ok) {
      throw new Error('Ошибка запроса промоакций');
    }

    const promotions = await req_promotion.json();

    if (!promotions.length) {
      throw new Error('Нет подходящих скидок');
    }

    const promotion = promotions[0];

    res.status(200).json({
      promotion_id: promotion.promotion_id || 0,
      promotion_count: promotion.promotion_count || 0,
      promotion_discount: promotion.promotion_discount || 1,
    });
  } catch (err) {
    console.error('Ошибка:', err.message);
    res.status(400).json({ message: err.message });
  }
});

app.post('/buy-ticket-confirm', (req, res) => {
  try{
    console.log(req_body);
  }catch(err) {
    
  }
  console.log(req.body);
});

app.get('/cinema-panel-entrance', async (_, res) => {
  res.render('entrance_worker', { title: 'Синема/Форма входа', worker: true });
})

app.post('/cinema-panel', async (req, res) => {
  try {
    const req_worker = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/worker-access`, {
      method: 'POST', headers: { 'Content-type': 'application/json' }, body: JSON.stringify(req.body)
    });

    if (!req_worker.ok) {
      throw new Error('Ошибка при обработке данных, проверьте вводимые данные');
    }

    const worker = await req_worker.json();

    res.cookie('worker_login', `${worker[0].worker_login}`, { path: '/cinema-panel', encode: String });
    res.cookie('worker_access', `${JSON.stringify(worker[0].worker_access)}`, { path: '/cinema-panel' });

    res.redirect('/cinema-panel');

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 'Error': error.message });
  }
});

app.get('/cinema-panel', async (req, res) => {
  try {
    const request_tables_list = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/db-list`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });


    if (!request_tables_list.ok) {
      throw new Error(`Ошибка запроса: ${request_tables_list.statusText}`);
    }

    const req_worker = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/worker-name/?login=${req.cookies.worker_login}`);
    const worker_name = await req_worker.json();
    const tables_list = await request_tables_list.json();
    const tables = tables_list.length > 0 ? tables_list : false;

    res.render('worker-page', { worker_access: JSON.parse(req.cookies.worker_access), worker_name: worker_name[0], worker_login: req.cookies.worker_login, tables });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Ошибка загрузки данных');
  }
});

app.get('/tables/:table', async (req, res) => {
  try {
    const table = req.params.table;
    const req_table_colums = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/tables/${table}`);
    const table_colums = await req_table_colums.json();
    const req_table_columns_for_query = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/tables/${table}`, { method: 'PATCH' });
    const table_columns_for_query = await req_table_columns_for_query.json();
    const req_table_dates = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/tables/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(table_columns_for_query)
    });
    const table_dates = await req_table_dates.json();
    // console.log(table_colums); 
    // console.log(table_dates);  
    res.render('partials/tables/tables_container', { table_colums, table_dates, table_name: table }, (err, html) => {
      if (err) {
        return res.status(500).send('Ошибка рендеринга кнопки');
      }
      res.status(200).send(html);
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: e.message });
  }
});

app.get('/insert-to-table/:table', async (req, res) => {
  try {
    const table = req.params.table;
    const foreign_columns = {};
    let req_table_columns;
    if (table !== 'ticket') {
      req_table_columns = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/insert-to-table/${table}`);
    } else {
      req_table_columns = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/insert-to-table/${table}/sale_time,client_client_id,worker_worker_id,unreg_user_user_id`);
    }

    const table_columns = await req_table_columns.json();

    if (table === 'cinema') {
      const [req_ages, req_type] = await Promise.all([
        fetch(`${process.env.SERV_HOST}${process.env.PORT}/api/movie-all-age`),
        fetch(`${process.env.SERV_HOST}${process.env.PORT}/api/movie-all-type`)
      ]);
      foreign_columns['age_age_id'] = await req_ages.json();
      foreign_columns['type_type_id'] = await req_type.json();
    }

    if (table === 'current_prom') {
      const [promotion_promotion_id, cinema_session_cinema_session_name] = await Promise.all([
        fetch(`${process.env.SERV_HOST}${process.env.PORT}/server-api/movie-all-promotion`),
        fetch(`${process.env.SERV_HOST}${process.env.PORT}/api/movie-all-cinema-session`)
      ]);
      foreign_columns['promotion_promotion_id'] = await promotion_promotion_id.json();
      foreign_columns['cinema_session_cinema_session_name'] = await cinema_session_cinema_session_name.json();
    }

    if (table === 'place') {
      const hall_hall_id = await fetch(`${process.env.SERV_HOST}${process.env.PORT}/api/movie-all-hall`);
      foreign_columns['hall_hall_id'] = await hall_hall_id.json();
    }

    if (table === 'production') {
      const [cinema_cinema_id, country_country_id] = await Promise.all([
        fetch(`${process.env.SERV_HOST}${process.env.PORT}/api/movie-all-movie`),
        fetch(`${process.env.SERV_HOST}${process.env.PORT}/api/movie-all-country`)
      ]);
      foreign_columns['cinema_cinema_id'] = await cinema_cinema_id.json();
      foreign_columns['country_country_id'] = await country_country_id.json();
    }

    if (table === 'cinema_session') {
      const [cinema_cinema_id, hall_hall_id, graphics_graphics_id] = await Promise.all([
        fetch(`${process.env.SERV_HOST}${process.env.PORT}/api/movie-all-movie`),
        fetch(`${process.env.SERV_HOST}${process.env.PORT}/api/movie-all-hall`),
        fetch(`${process.env.SERV_HOST}${process.env.PORT}/api/movie-all-graphics`)
      ]);
      foreign_columns['cinema_cinema_id'] = await cinema_cinema_id.json();
      foreign_columns['hall_hall_id'] = await hall_hall_id.json();
      foreign_columns['graphics_graphics_id'] = await graphics_graphics_id.json();
    }

    if (table === 'cinema_graphics') {
      const [graphics_graphics_id, cinema_cinema_id] = await Promise.all([
        fetch(`${process.env.SERV_HOST}${process.env.PORT}/api/movie-all-graphics`),
        fetch(`${process.env.SERV_HOST}${process.env.PORT}/api/movie-all-movie`)
      ]);
      foreign_columns['graphics_graphics_id'] = await graphics_graphics_id.json();
      foreign_columns['cinema_cinema_id'] = await cinema_cinema_id.json();
    }

    if (table === 'hall_graphics') {
      const [graphics_graphics_id, hall_hall_id] = await Promise.all([
        fetch(`${process.env.SERV_HOST}${process.env.PORT}/api/movie-all-graphics`),
        fetch(`${process.env.SERV_HOST}${process.env.PORT}/api/movie-all-hall`)
      ]);
      foreign_columns['graphics_graphics_id'] = await graphics_graphics_id.json();
      foreign_columns['hall_hall_id'] = await hall_hall_id.json();
    }

    res.render('partials/tables/insert_container', { table_name: table, table_columns, foreign_columns }, (err, html) => {
      if (err) {
        return res.status(500).send(`Ошибка рендеринга: ${err.message}`);
      }
      res.send(html);
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Ошибка');
  }
});

app.post('/insert-to-table/:table', async (req, res) => {
  try {
    const request_insert = await fetch(`${process.env.SERV_HOST}${process.env.PORT}/server-api/insert-to-table/${req.params.table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cols: req.body })
    });

    if (!request_insert.ok) {
      return res.status(request_insert.status).json({ message: `Ошибка при вставке данных` });
    }
    const insert = await request_insert.json();
    return res.status(200).json({ message: `Запись создана` });

  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

app.patch('/insert-to-table/:table', async (req, res) => {
  try {
    const req_change = await fetch(`${process.env.SERV_HOST}${process.env.PORT}/server-api/insert-to-table/${req.params.table}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const changed = await req_change.json();
    res.status(200).json(changed);

  } catch (e) {
    console.error(e.message);
    res.status(400).json({ message: e.message });
  }
})

app.delete('/insert-to-table/:table', async (req, res) => {
  try {
    const req_delete = await fetch(`${process.env.SERV_HOST}${process.env.PORT}/server-api/insert-to-table/${req.params.table}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const deleted = await req_delete.json();
    res.status(200).json(deleted);

  } catch (e) {
    console.error(e.message);
    res.status(400).json({ message: e.message });
  }
})

app.get('/posters', async (_, res) => {
  const request_posters = await fs.readdir(path.join(__dirname, 'images/posters/'));
  const posters = [...request_posters];
  res.render('partials/panel_employee/posters', { posters: posters });
});

app.post('/posters', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не был загружен или тип файла не поддерживается' });
  }
  res.json({ message: 'Файл загружен успешно', filename: req.file.filename });
});

app.delete('/posters/:name', async (req, res) => {
  try {
    await fs.unlink(path.join(__dirname, `images/posters/${req.params.name}`));
    res.status(200).json({ message: `Файл ${req.params.name} удален` });
  } catch {
    res.status(500).json({ message: `Ошибка удаления ${req.params.name}` });
  }
});

app.patch('/posters/:oldname', async (req, res) => {
  const old_name = req.params.oldname;
  const new_name = req.body.newName;
  const oldPath = path.join(__dirname, `images/posters/${old_name}`);
  const newPath = path.join(__dirname, `images/posters/${new_name}`);

  try {
    if (new_name !== old_name) {
      await fs.rename(oldPath, newPath);
      return res.status(200).json({ message: 'Файл успешно переименован!' });
    } else {
      return res.status(200).json({ message: 'Файл имеет одинаковое название' });
    }
  } catch (err) {
    console.error('Ошибка при переименовании файла:', err);
    return res.status(500).json({ message: 'Ошибка при переименовании файла.' });
  }

});



app.listen(process.env.PORT || 3000, () => console.log('Запуск!'));



