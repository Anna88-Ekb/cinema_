import express, { json } from 'express';
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
import puppeteer from 'puppeteer';//pdf
import reportingRoutes from './routes/reporting.routes.js'; // Импортируем маршруты




const all_nums = '0123456789';
const abc = 'abcdefghijklmnopqrstuvwxyz';
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const rus_abc = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
const RUS_ABC = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
const symbols = './?><!@#$%^&*()-_=+';
const symbols_mini = '.-_';

const date = new Date().toLocaleDateString('ru-RU', { timeZone: "Europe/Moscow" });
const date_db_format = date.substring(6) + '-' + date.substring(3, 5) + '-' + date.substring(0, 2);
function toDate(d) {
  return d.substring(0, 4) + '-' + d.substring(5, 7) + '-' + d.substring(8, 10);
}
function getToday() {
  const date = new Date().toLocaleDateString('ru-RU', { timeZone: "Europe/Moscow" });
  const date_db_format = date.substring(6) + '-' + date.substring(3, 5) + '-' + date.substring(0, 2);
  return date_db_format;
}


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
  res.locals.login = Boolean(req.cookies.client_login) || Boolean(req.cookies.worker_login);
  res.locals.client_login = req.cookies.client_login || null;
  res.locals.worker_login = req.cookies.worker_login || null;

  // Разбираем JSON для worker_access
  try {
    res.locals.worker_access = req.cookies.worker_access;
  } catch (err) {
    console.error('Ошибка разбора worker_access:', err.message);
    res.locals.worker_access = [];
  }
  next();
});




app.use('/posters', express.static(path.join(__dirname, 'images/posters')));
app.use('/icons', express.static(path.join(__dirname, 'images/icons')));
app.use('/api', moviesRoutes);
app.use('/api', moviesFilterRoutes);

/* app.use(`/${process.env.SERV_HOST}:${process.env.DB_PORT}/`, cors({
  origin: `${process.env.SERV_HOST}:${process.env.DB_PORT}`,
  credentials: true,
})); */
/* 
app.use(cors({
  origin: ['http://localhost:3000'], // Список разрешенных источников
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Разрешенные методы
  credentials: true // Если нужно разрешить куки
})); */


app.use(cors({
  origin: '*' // Это разрешит запросы с любых доменов
}));

app.use('/server-api', seansHall);
app.use('/server-api', clientRoutes);
app.use('/server-api', workerRoutes);
app.use('/server-api', workerDBRotes);
app.use('/server-api', reportingRoutes);

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
    clientPanelCssFile: manifest['client_panel.css'],
    clientPanelJsFile: manifest['client_panel.js'],
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
          return `<input id="${table_columns.column_name}" name="${table_columns.column_name}" type="number"  maxlength="${table_columns.max_length}" ${required}></input>`;
        }
        if (inp_type === 'date') {
          return `<input id="${table_columns.column_name}" name="${table_columns.column_name}" type="date" min="${getToday()}" ${required}></input>`;
        }
        if (inp_type === 'varchar') {
          return `<textarea id="${table_columns.column_name}" name="${table_columns.column_name}" maxlength="${table_columns.max_length}" ${required}></textarea>`;
        }
        if (inp_type === 'timestamp') {
          return `<input id="${table_columns.column_name}" name="${table_columns.column_name}" type="datetime-local" min="${getToday()}T00:00" ${required}></input>`;
        }
        if (inp_type === 'time') {
          return `<input id="${table_columns.column_name}" name="${table_columns.column_name}" type="time" ${required}></input>`;
        }
        if (inp_type === 'bool') {
          return `<input id="${table_columns.column_name}" name="${table_columns.column_name}" type="radio" ${required}></input>`;
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
    },
    truncTime: function (time) {
      return time.substring(0, 5);
    },
    phoneMask: function (a) {
      return '+' + a.substring(0, 1) + '(' + a.substring(1, 4) + ')' + a.substring(4, 7) + '-' + a.substring(7, 9) + '-' + a.substring(9);
    }

  }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

/* min="0.1" step="0.1" max="1" */

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
    const response_movies_today = await fetch(process.env.SERV_HOST + process.env.PORT + `/api/movies-day/:${getToday()}`);
    const halls = await response_movies_today.json();
    const response_min_price = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/min-price`);
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
    console.error('Ошибка при запросе к API главной страницы:', error);
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

    const movies = await response_movies.json();
    const country = await response_movies_country.json();
    const type = await response_movies_type.json();
    const age = await response_movies_age.json();
    const calendar = await response_movies_calendar.json();
    /*     const halls = await response_movies_day.json(); */
    res.render('schedule_page', {
      title: "Cinema-кинотеатр", country, type, age, movies, calendar/* , halls*/
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
  /*   console.log(req.body); */
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

app.get('/open-client-page', async (req, res) => {

  res.render('client-page', { client_login: req.cookies.client_login });
  /* !!!! */
});


app.get('/open-client-page/client-history-tickets', async (req, res) => {
  try {
    const client_tickets = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/client-history-tickets/?login=${req.cookies.client_login}`);
    const tickets = await client_tickets.json();
    let oldD = [];
    let newD = [];

    tickets.forEach(el => {
      // session_date в объект Date
      const sessionDateParts = el.session_date.split('-');
      const sessionTimeParts = el.session_time.split(':');

      const sessionDate = new Date(sessionDateParts[0], sessionDateParts[1] - 1, sessionDateParts[2], sessionTimeParts[0], sessionTimeParts[1]);

      const currentDate = new Date();

      if (sessionDate < currentDate) {
        oldD.push(el);
      } else {
        newD.push(el);
      }
    });

    if (oldD.length === 0) oldD = false;
    if (newD.length === 0) {
      newD = false
    } else {
      newD.sort((a, b) => {
        const dateA = new Date(a.session_date);
        const dateB = new Date(b.session_date);

        // Сравнение по дате
        if (dateA - dateB !== 0) {
          return dateA - dateB;
        }

        // Если даты равны, сравнение по времени
        const [hoursA, minutesA] = a.session_time.split(':').map(Number);
        const [hoursB, minutesB] = b.session_time.split(':').map(Number);
        const timeA = hoursA * 60 + minutesA;
        const timeB = hoursB * 60 + minutesB;

        return timeA - timeB;
      });

    };

    res.render('partials/panel_client/tickets', { old_sess: oldD, cur_sess: newD }, (err, html) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка рендеринга' });
      }
      res.send(html);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при обработке запроса.' });
  }
});

app.get('/open-client-page/client-settings', async (req, res) => {
  const client_personality = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/client-personality-page/?login=${req.cookies.client_login}`);
  const personality = await client_personality.json();
  res.render('partials/panel_client/personality', { pers: personality[0] }, (err, html) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка рендеринга' });
    }
    res.send(html);
  });
});

//смена данных
app.patch('/open-client-page/client-change-settings', async (req, res) => {
  try {
    const { client_email, old_pass, new_pass, client_phone, client_preference_email, 
            client_agreement_newsletter, client_preference_phone } = req.body;
    
    const obj = {};

    // Проверка client_email
    if (
      client_email &&
      client_email.trim().length >= 6 && 
      client_email.trim().length <= 50 &&
      client_email.indexOf('@') !== -1 &&
      client_email.substring(client_email.indexOf('@')).indexOf('.') !== -1 &&
      client_email.trim().indexOf(' ') === -1
    ) {
      obj.client_email = client_email.trim().toLowerCase();
    }

    // Проверка паролей
    if (
      old_pass && new_pass &&
      old_pass.trim().length >= 10 && new_pass.trim().length >= 10 &&
      old_pass.trim().length <= 30 && new_pass.trim().length <= 30 &&
      old_pass.trim().indexOf(' ') === -1 && new_pass.trim().indexOf(' ') === -1
    ) {
      const temp_abc = [...new_pass].every(el => abc.includes(el));
      const temp_ABC = [...new_pass].every(el => ABC.includes(el));
      const temp_nums = [...new_pass].every(el => all_nums.includes(el));
      const temp_symbols = [...new_pass].every(el => symbols.includes(el));
      
      if (temp_abc || temp_ABC || temp_nums || temp_symbols) {
        throw new Error('Пароль должен состоять из различных типов символов');
      } 

      const req_pass = await fetch('/search-client-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pass: old_pass.trim(), login: req.cookies.client_login }),
      });

      if (!req_pass.ok) {
        return res.status(400).json({ error: 'Ошибка при проверке текущего пароля' });
      }

      obj.client_password = new_pass.trim();
    }

    // Проверка client_phone
    if (client_phone && client_phone.trim().length === 11 && !isNaN(Number(client_phone.trim()))) {
      obj.client_phone = client_phone.trim();
    }

    // Проверка client_preference_email
    if (client_preference_email === 'false' || client_preference_email === 'true') {
      obj.client_preference_email = client_preference_email === 'false' ? false : true;
    }

    // Проверка client_agreement_newsletter
    if (client_agreement_newsletter === 'false' || client_agreement_newsletter === 'true') {
      obj.client_agreement_newsletter = client_agreement_newsletter === 'false' ? false : true;
    }

    // Проверка client_preference_phone
    if (client_preference_phone === 'false' || client_preference_phone === 'true') {
      obj.client_preference_phone = client_preference_phone === 'false' ? false : true;
    }

    // Добавление client_login из cookies
    if (req.cookies.client_login) {
      obj.client_login = req.cookies.client_login;
    }

    const req_update = await fetch(`${process.env.SERV_HOST}${process.env.PORT}/server-api/client-update`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obj),
    });

    if (!req_update.ok) {
      return res.status(400).json({ error: 'Ошибка при обновлении' });
    }

    // Успешный ответ
    res.status(200).json({ success: true, message: 'Данные успешно обновлены' });
  } catch (error) {
    console.error('Ошибка обработки запроса:', error);
    res.status(500).json({ error: 'Произошла ошибка при обработке запроса' });
  }
});




/* app.post('/', async(req, res) => {
  const client_personality = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/client-personality-page/?login=${req.cookies.client_login}`);
  const personality = await client_personality.json();
  console.log(personality); 
  /client-change-settings
}) */

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
    const request_hall_place = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/hall-tickets`, {
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

  if (params.month && params.month.length == 1) {
    params.month = `0${params.month}`;
  }
  if (params.day && params.day.length == 1) {
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
      const request_hall_place = await fetch(`${process.env.SERV_HOST}${process.env.PORT}/server-api/hall-tickets`, {
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
    const request_hall_place = await fetch(`${process.env.SERV_HOST}${process.env.PORT}/server-api/hall-tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request_params)
    });
    const hall_place = await request_hall_place.json();
    res.render('partials/buy_form/buy_form_tickets', { request_params, hall_place }, (e, html) => {
      if (e) { return res.status(500).send(`Ошибка рендеринга: ${e.message}`); }
      res.send(html);
    });
  }
})

app.post('/seance-promotion', async (req, res) => {
  try {

    const req_promotion = await fetch(
      `${process.env.SERV_HOST}${process.env.PORT}/server-api/seance-promotion`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      }
    );

    if (!req_promotion.ok) {
      throw new Error('Промоакция не применяется');
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

app.post('/buy-ticket-confirm', async (req, res) => {
  try {

    if (req.body.total_price_promotion === 'false' || req.body.total_price_promotion === false) {
      const req_basic_price = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/seance-basic-price/?id=${req.body.movie_seance}`);
      const basic_price = await req_basic_price.json();
      const check_summ = (() => {
        if (req.body.tickets.length * parseFloat(basic_price.session_basic_price) == parseFloat(req.body.total_price)) {
          return true;
        }
        throw new Error("Ошибка оплаты");
      })();
    } else if (req.body.total_price_promotion !== 'false' && req.body.total_price_promotion !== false) {
      const req_promotions_params = {
        seance: req.body.movie_seance,
        hall: req.body.movie_hall,
        day: req.body.movie_day,
        time: req.body.movie_time,
        price: req.body.movie_price
      };
      const req_promotions = await fetch(
        `${process.env.SERV_HOST}${process.env.PORT}/server-api/seance-promotion`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req_promotions_params),
        });
      const promotions = await req_promotions.json();
      const { promotion_count, promotion_discount, promotion_promotion_id, session_basic_price } = promotions[0];

      const check_summ = (() => {
        if (req.body.tickets.length < +promotion_count && parseFloat(session_basic_price) * req.body.tickets.length == parseFloat(req.body.total_price) && promotion_promotion_id == req.body.total_price_promotion) {
          return true;
        }
        if (req.body.tickets.length >= promotion_count && parseFloat(session_basic_price) * req.body.tickets.length * parseFloat(promotion_discount) == parseFloat(req.body.total_price) && promotion_promotion_id == req.body.total_price_promotion) {
          return true;
        }
        throw new Error("Ошибка оплаты");
      })();
    }

    const req_create_tickets = await fetch(`${process.env.SERV_HOST}${process.env.PORT}/server-api/buy-ticket-confirm`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });

    const tickets = await req_create_tickets.json();
    /* console.log(tickets); */
    if (tickets && tickets.length > 0) {
      res.render('tickets', { tickets }, (err, html) => {
        if (err) {
          console.error('Ошибка рендеринга страницы:', err.message);
          return res.status(500).json({ message: 'Ошибка рендеринга страницы' });
        }
        return res.status(200).json({ html });
      });
    } else {
      return res.status(400).json({ message: 'Ошибка при обработке билетов' });
    }


  } catch (error) {
    console.error(error.message);
  }
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

    //console.log(tables);
    const tables_obj = [
      {
        category: "Управление сеансами",
        tables: [
          { table_name: "cinema_session", table_comment: "СЕАНСЫ" },
          { table_name: "current_prom", table_comment: "АКЦИИ СЕАНСА" },
        ]
      },
      {
        category: "Управление кинопродукцией",
        tables: [
          { table_name: 'cinema', table_comment: 'КИНОПРОДУКЦИЯ' },
          { table_name: 'production', table_comment: 'СТРАНЫ КИНОПРОДУКЦИИ' },
          { table_name: 'cinema_graphics', table_comment: 'ФОРМАТ КИНОПРОДУКТА' },
        ]
      },
      {
        category: "Управление акциями",
        tables: [
          { table_name: 'promotion', table_comment: 'АКЦИИ' },
        ]
      },
      {
        category: "Управление залами",
        tables: [
          { table_name: 'hall', table_comment: 'ЗАЛЫ' },
          { table_name: 'hall_graphics', table_comment: 'ФОРМАТ ЭКРАНА ЗАЛА' },
          { table_name: 'place', table_comment: 'МЕСТА' },
        ]
      },
      {
        category: "Управление арендой",
        tables: [
          { table_name: 'application_rent', table_comment: 'ЗАЯВКИ АРЕНДЫ' },
          { table_name: 'rent', table_comment: 'АРЕНДОВАННЫЕ ЗАЛЫ' }
        ]
      },
      {
        category: "Управление сотрудниками",
        tables: [
          { table_name: 'worker', table_comment: 'СОТРУДНИКИ' },
          { table_name: 'worker_position', table_comment: 'ДОЛЖНОСТИ' },
          { table_name: 'worker_access', table_comment: 'ДОСТУПЫ' },
          { table_name: 'current_position', table_comment: 'ДОСТУПЫ СОТРУДНИКОВ' },
        ]
      },
      {
        category: "Управление транзакциями",
        tables: [
          { table_name: 'transact', table_comment: 'ТРАНЗАКЦИИ' },
          { table_name: 'ticket', table_comment: 'БИЛЕТЫ' }
        ]
      },
      {
        category: "Справочники",
        tables: [
          { table_name: 'type', table_comment: 'ТИП КИНОПРОДКУЦИИ' },
          { table_name: 'age', table_comment: 'ВОЗРАСТНЫЕ ОГРАНИЧЕНИЯ' },
          { table_name: 'country', table_comment: 'СТРАНЫ' },
          { table_name: 'graphics', table_comment: 'ФОРМАТ' },
          { table_name: 'application_type', table_comment: 'ТИП ЗАЯВКИ' },
          { table_name: 'application_status', table_comment: 'СТАТУС ЗАЯВКИ' },
        ]
      },

    ];

    res.render('worker-page', { worker_access: JSON.parse(req.cookies.worker_access), worker_name: worker_name[0], worker_login: req.cookies.worker_login, tables_obj });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Ошибка загрузки данных');
  }
});

app.get('/cinema-panel/tables/:table/:personality?/:my?/', async (req, res) => {
  try {
    const { table, personality, my } = req.params;
    let btn_take = false;
    let btn_cancel = false;
    let btn_design = false;

    // Запрос к серверу для получения колонок таблицы
    const req_table_columns = await fetch(`${process.env.SERV_HOST}${process.env.PORT}/server-api/tables/${table}`);
    if (!req_table_columns.ok) {
      throw new Error(`Ошибка получения колонок таблицы: ${req_table_columns.statusText}`);
    }
    const table_columns = await req_table_columns.json();

    // Запрос к серверу для получения колонок таблицы для запросов
    const req_table_columns_for_query = await fetch(`${process.env.SERV_HOST}${process.env.PORT}/server-api/tables/${table}`, {
      method: 'PATCH' // Убедитесь, что сервер поддерживает PATCH
    });
    if (!req_table_columns_for_query.ok) {
      throw new Error(`Ошибка получения колонок для запросов: ${req_table_columns_for_query.statusText}`);
    }
    const table_columns_for_query = await req_table_columns_for_query.json();

    let table_dates;

    if (personality !== 'true') {
      // Обычный запрос на данные таблицы
      const req_table_dates = await fetch(`${process.env.SERV_HOST}${process.env.PORT}/server-api/tables/${table}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(table_columns_for_query)
      });
      if (!req_table_dates.ok) {
        throw new Error(`Ошибка получения данных таблицы: ${req_table_dates.statusText}`);
      }
      table_dates = await req_table_dates.json();
    } else if (personality === 'true' && table === 'application_rent' && !my) {
      // Специальный запрос для "application_rent"
      const req_table_dates = await fetch(`${process.env.SERV_HOST}${process.env.PORT}/server-api/nobody-application/${table}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(table_columns_for_query)
      });
      if (!req_table_dates.ok) {
        throw new Error(`Ошибка получения данных nobody-application: ${req_table_dates.statusText}`);
      }
      btn_take = true;
      table_dates = await req_table_dates.json();
    } else if (personality === 'true' && table === 'application_rent' && my === 'true') {
      const worker_login = req.cookies.worker_login;
      if (worker_login) {
        const req_table_dates = await fetch(`${process.env.SERV_HOST}${process.env.PORT}/server-api/nobody-application/${table}/${worker_login}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(table_columns_for_query)
        });
        if (!req_table_dates.ok) {
          throw new Error(`Ошибка получения данных nobody-application: ${req_table_dates.statusText}`);
        }
        table_dates = await req_table_dates.json();
        btn_cancel = true;
        btn_design = true;
      }
    }

    // Отправка отрендеренного шаблона
    res.render('partials/tables/tables_container', {
      table_colums: table_columns,
      table_dates,
      table_name: table,
      btn_take,
      btn_cancel,
      btn_design
    }, (err, html) => {
      if (err) {
        console.error('Ошибка рендеринга:', err.message);
        return res.status(500).send('Ошибка рендеринга кнопки');
      }
      res.status(200).send(html);
    });
  } catch (error) {
    console.error('Ошибка обработки запроса:', error.message);
    res.status(500).json({ message: error.message });
  }
});


app.get('/cinema-panel/insert-to-table/:table', async (req, res) => {
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
        fetch(`${process.env.SERV_HOST}${process.env.PORT}/api/movie-all-graphics`),

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

    if (table === 'application_rent') {
      const [type_client_type_client_id, hall_hall_id] = await Promise.all([
        fetch(`${process.env.SERV_HOST}${process.env.PORT}/server-api/get-all-client-type`),
        fetch(`${process.env.SERV_HOST}${process.env.PORT}/api/movie-all-hall`)
      ]);
      foreign_columns['type_client_type_client_id'] = await type_client_type_client_id.json();
      foreign_columns['hall_hall_id'] = await hall_hall_id.json();
    }

    if (table === 'rent') {
      const [application_rent_application_rent_id, hall_hall_id] = await Promise.all([
        fetch(`${process.env.SERV_HOST}${process.env.PORT}/server-api/get-all-application-rent`),
        fetch(`${process.env.SERV_HOST}${process.env.PORT}/api/movie-all-hall`)
      ]);
      foreign_columns['application_rent_application_rent_id'] = await application_rent_application_rent_id.json();
      foreign_columns['hall_hall_id'] = await hall_hall_id.json();
    }

    /*     router.get('/get-all-client-type', workerDb.getAllClientType);
        router.get('/get-all-application-status', workerDb.getAllApplicationStatus);
        router.get('/get-all-application-type', workerDb.getAllApplicationType); */

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

app.post('/cinema-panel/insert-to-table/:table', async (req, res) => {
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

app.patch('/cinema-panel/insert-to-table/:table', async (req, res) => {

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

app.delete('/cinema-panel/insert-to-table/:table', async (req, res) => {

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

app.get('/cinema-panel/posters', async (_, res) => {
  const request_posters = await fs.readdir(path.join(__dirname, 'images/posters/'));
  const posters = [...request_posters];
  res.render('partials/panel_employee/posters', { posters: posters });
});

app.post('/cinema-panel/posters', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не был загружен или тип файла не поддерживается' });
  }
  res.json({ message: 'Файл загружен успешно', filename: req.file.filename });
});

app.delete('/cinema-panel/posters/:name', async (req, res) => {
  try {
    await fs.unlink(path.join(__dirname, `images/posters/${req.params.name}`));
    res.status(200).json({ message: `Файл ${req.params.name} удален` });
  } catch {
    res.status(500).json({ message: `Ошибка удаления ${req.params.name}` });
  }
});

app.patch('/cinema-panel/posters/:oldname', async (req, res) => {
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

app.get('/cinema-panel/sales-report', async (_, res) => {
  try {
    const req_sales_tickets = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/reporting-sales-tickets`);
    const res_sales_tickets = await req_sales_tickets.json();

    const req_sales_halls = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/reporting-sales-halls`);
    const res_sales_halls = await req_sales_halls.json();
    const date = getToday().toString();
    res.render('partials/panel_employee/sales_page', { sales_ticket: res_sales_tickets, sales_halls: res_sales_halls,  date }, (err, html) => {
      if (err) {
        console.error('Ошибка рендеринга:', err);
        return res.status(500).json({ error: 'Ошибка рендеринга' });
      }
      res.send(html);
    });
  } catch (error) {
    console.error('Ошибка обработки запроса на сервере:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

//отчеты
app.post('/cinema-panel/sales-report', async (req, res) => {
  try {
    const req_table = await fetch(`${process.env.SERV_HOST}${process.env.PORT}/server-api/sales-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const table = await req_table.json();

    res.render('partials/tables/report', { table }, (err, html) => {
      if (err) {
        console.error('Ошибка рендеринга:', err);
        return res.status(500).json({ error: 'Ошибка рендеринга' });
      }
      res.send(html);
    });

  } catch (e) {
    return res.status(500).json({ message: e.message });
  }

});


app.get('/cinema-panel/attention-report', async (_, res) => {
  try {
    const req_attention = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/reporting-actual-attention-halls`);
    const req_attention_last = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/reporting-actuallast-attention-halls`);
    const req_movies = await fetch(process.env.SERV_HOST + process.env.PORT + `/api/movie-all-movie`);
    const res_attention = await req_attention.json();
    const res_attention_last = await req_attention_last.json();
    const response_movies = await req_movies.json();
    /*     console.log(res_attention_last); */
    /*     console.log(res_attention_last); */
    const date = getToday().toString();
    res.render('partials/panel_employee/at_page', { actual: res_attention[0], last: res_attention_last[0], movies: response_movies, date }, (err, html) => {
      if (err) {
        console.error('Ошибка рендеринга:', err);
        return res.status(500).json({ error: 'Ошибка рендеринга' });
      }
      res.send(html);
    });
  } catch (error) {
    console.error('Ошибка обработки запроса на сервере:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


app.post('/cinema-panel/attention-report', async (req, res) => {
  try {
    const req_attention = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/reporting-attention-movie-reporting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const res_attention = await req_attention.json();
    const res_att = res_attention.map((el) => {
      if (el.day) { return { ...el, day: toDate(el.day) }; }
      else { return el }
    });
    res.json(res_att);

  } catch (error) {
    console.error('Ошибка обработки запроса на сервере:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
})

//аренда залов

app.post('/cinema-panel/take-application', async (req, res) => {
  try {
    const workerLogin = req.cookies.worker_login;
    const elemId = req.body.elem_id;

    // Проверяем входные данные
    if (!workerLogin || !elemId) {
      console.log('Ошибка: отсутствует worker_login или elem_id');
      return res.status(400).json({
        error: 'Недостаточно данных для обработки запроса.',
      });
    }

    const applicationPersonality = {
      worker_login: workerLogin,
      application_rent_application_rent_id: elemId,
    };

    // Выполняем запрос к API
    const assignApplication = await fetch(
      `${process.env.SERV_HOST}${process.env.PORT}/server-api/take-application-hall`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationPersonality),
      }
    );

    if (!assignApplication.ok) {
      throw new Error(`Ошибка запроса к API: ${assignApplication.status}`);
    }

    const responseData = await assignApplication.json(); // Парсим ответ
    console.log('Ответ сервера:', responseData);

    // Успешный ответ клиенту
    return res.status(200).json({
      message: 'Заявка успешно принята в работу',
      serverResponse: responseData,
    });
  } catch (error) {
    console.error('Ошибка обработки заявки:', error.message);

    // Возвращаем ошибку клиенту
    return res.status(500).json({
      error: 'Ошибка обработки заявки. Пожалуйста, попробуйте позже.',
      details: error.message,
    });
  }
});

app.post('/cinema-panel/close-application', async (req, res) => {
  try {
    const workerLogin = req.cookies.worker_login;
    const elemId = req.body.elem_id;

    // Проверяем входные данные
    if (!workerLogin || !elemId) {
      console.log('Ошибка: отсутствует worker_login или elem_id');
      return res.status(400).json({
        error: 'Недостаточно данных для обработки запроса.',
      });
    }

    const applicationPersonality = {
      worker_login: workerLogin,
      application_rent_application_rent_id: elemId,
    };

    // Выполняем запрос к API
    const assignApplication = await fetch(
      `${process.env.SERV_HOST}${process.env.PORT}/server-api/close-application-hall`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationPersonality),
      }
    );

    if (!assignApplication.ok) {
      throw new Error(`Ошибка запроса к API: ${assignApplication.status}`);
    }

    const responseData = await assignApplication.json(); // Парсим ответ
    console.log('Ответ сервера:', responseData);

    // Успешный ответ клиенту
    return res.status(200).json({
      message: 'Заявка успешно отклонена',
      serverResponse: responseData,
    });
  } catch (error) {
    console.error('Ошибка обработки заявки:', error.message);

    // Возвращаем ошибку клиенту
    return res.status(500).json({
      error: 'Ошибка обработки заявки. Пожалуйста, попробуйте позже.',
      details: error.message,
    });
  }



});


app.post('/cinema-panel/check-date-halls', async (req, res) => {
  try {
    if (req.body.date && req.body.time_start && req.body.time_end) {
      const start = new Date(`${req.body.date.toString()}T${req.body.time_start}:00`);
      const end = new Date(`${req.body.date.toString()}T${req.body.time_end}:00`);
      const date = new Date(`${req.body.date.toString()}`);
      const today = new Date(getToday());
      let response_data;

      if (start < end && date >= today) {
        try {
          const req_data_halls = await fetch(
            `${process.env.SERV_HOST}${process.env.PORT}/server-api/check-hall-availability`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(req.body),
            }
          );

          if (!req_data_halls.ok) {
            throw new Error(`Ошибка запроса: ${req_data_halls.status}`);
          }

          try {
            response_data = await req_data_halls.json();
          } catch (jsonError) {
            throw new Error(`Ошибка обработки ответа: ${jsonError.message}`);
          }
        } catch (fetchError) {
          throw new Error(`Ошибка обращения к /сheck-hall-availability: ${fetchError.message}`);
        }

        // Логика с рендерингом (если требуется):
        res.render('partials/panel_employee/halls_check', { halls: response_data }, (err, html) => {
          if (err) {
            return res.status(500).json({ error: 'Ошибка рендеринга' });
          }
          res.send(html);
        });

      } else {
        throw new Error("Некорректные значения времени или даты");
      }
    } else {
      throw new Error("Отсутствуют значения");
    }

    console.log(req.body);
  } catch (e) {
    console.error("Ошибка:", e.message);
    res.status(400).json({ error: e.message });
  }
});

app.post('/cinema-panel/rent-application', async (req, res) => {
  try {
    const workerLogin = req.cookies.worker_login;
    const date = new Date(req.body.rent_date);
    const today = new Date(getToday());
    const start = new Date(`${req.body.rent_date}T${req.body.rent_start_time}:00`);
    const end = new Date(`${req.body.rent_date}T${req.body.rent_end_time}:00`);
    let request_insert;
    if (+req.body.application_rent_application_rent_id
      && +req.body.hall_hall_id
      && today <= date 
      && start && end && start < end) {
      const req_body_copy = Object.assign({}, req.body); 
      req_body_copy['worker_login'] = workerLogin;
      request_insert = await fetch(`${process.env.SERV_HOST}${process.env.PORT}/server-api/get-application-hall`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req_body_copy)
      });
      if (!request_insert.ok) {
        return res.status(request_insert.status).json({ message: `Ошибка при вставке данных` });
      }
      return res.status(200).json({ message: `Запись создана` });

    } else {
      throw new Error("Некорректные значения");
    }
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
})

app.get('/open-arenda-form', async (_, res) => {
  res.render('partials/header/hall_form', (err, html) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка рендеринга' });
    }
    res.send(html);
  });
});


app.post('/create-arenda-application', async (req, res) => {
  try {
    const start = new Date(`${req.body.app_rent_date}T${req.body.app_rent_start_time}:00`);
    const end = new Date(`${req.body.app_rent_date}T${req.body.app_rent_end_time}:00`);
    const date = new Date(req.body.app_rent_date);
    const today = new Date(getToday());

    // Проверка времени
    if (date < today || start >= end) {
      return res.status(400).json({ message: 'Некорректное время' });
    }

    // Проверка телефона
    if (!req.body.app_rent_phone || req.body.app_rent_phone.trim().length !== 11 || isNaN(Number(req.body.app_rent_phone))) {
      return res.status(400).json({ message: 'Некорректный телефон' });
    }

    // Проверка типа клиента
    if (!['1', '2'].includes(req.body.type_client_type_client_id)) {
      return res.status(400).json({ message: 'Тип клиента отсутствует' });
    }

    // Проверка описания мероприятия
    if (req.body.app_rent_details && req.body.app_rent_details.length > 200) {
      return res.status(400).json({ message: 'Допустимо 200 символов' });
    }

    const new_obj = {...req.body};
    if(new_obj.hall_hall_id === '0') {
      new_obj.hall_hall_id = null;
    }

    // Отправка данных в API
    const create_arenda = await fetch(`${process.env.SERV_HOST}${process.env.PORT}/server-api/create-arenda-application/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(new_obj),
    });

    const arenda = await create_arenda.json();
    if (!create_arenda.ok) {
      return res.status(create_arenda.status).json({ message: arenda.message || 'Ошибка при создании заявки' });
    }

    // Успешный ответ
    res.status(200).json({ success: arenda.success });
  } catch (error) {
    console.error('Ошибка обработки заявки:', error);
    res.status(500).json({ message: 'Произошла ошибка на сервере' });
  }
});



app.listen(process.env.PORT || 3000, () => console.log('Запуск!'));



