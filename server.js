import express, { json } from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import { __filename, __dirname } from './__dirname.js';
import { manifest } from './manifest.js';
import moviesRoutes from './routes/movies.routes.js';
import moviesFilterRoutes from './routes/movieFilter.routes.js';
import clientRoutes from './routes/client.routes.js';

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

app.use('/posters', express.static(path.join(__dirname, 'posters')))
app.use('/api', moviesRoutes);
app.use('/api', moviesFilterRoutes);
app.use('/api', clientRoutes);

app.engine('hbs', engine({
  extname: 'hbs',
  defaultLayout: false,
  partialsDir: path.join(__dirname, 'views', 'partials'),
  helpers: {
    homeCssFile: manifest['home.css'],
    homeJsFile: manifest['home.js'],
    scheduleCssFile: manifest['schedule.css'],
    scheduleJsFile: manifest['schedule.js']
  }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', async (_, res) => {
  try {
    const response_movies = await fetch(process.env.SERV_HOST + process.env.PORT + '/api/movies-slider');
    const movies = await response_movies.json();
    const response_movies_today = await fetch(process.env.SERV_HOST + process.env.PORT + `/api/movies-day/:${date_db_format}`);
    const halls = await response_movies_today.json();
    res.render('home', {
      title: "Cinema-кинотеатр", movies, halls,
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
    if(Object.keys(req.query).length > 0) {
 /*      console.log(req.query); */
      const queryString = new URLSearchParams(req.query).toString();
      const response_movies = await fetch(process.env.SERV_HOST + process.env.PORT + `/api/movies?${queryString}`);
      const movies = await response_movies.json();
      res.render('partials/afisha/filtered_movies', {movies});
    } else {
      const response_movies = await fetch(process.env.SERV_HOST + process.env.PORT + '/api/movies');
      const movies = await response_movies.json();
      res.render('partials/afisha/filtered_movies', {movies});
    }
  } catch (error) {
    console.error('Ошибка при запросе к API:', error);
    res.status(500).send('Ошибка сервера');
  }
})

app.get('/pages_info', async (_, res) => {
  res.sendFile(__dirname + '/dist/pages_info/index.html');
});

app.get('/schedule-day/', async(req, res) => {
  try{
    const response_movies_day = await fetch(process.env.SERV_HOST + process.env.PORT + `/api/movies-day/:${req.query.year}-${req.query.month}-${req.query.day}`);
    const halls = await response_movies_day.json();
    res.render('partials/cinema_session/cinema_sessions_halls', {halls});
  }catch(error){
    console.error('Ошибка при запросе к API:', error);
    res.status(500).send('Ошибка сервера');
  }
});

app.post('/new-client', async (req, res) => {
console.log(req.body);
});


app.get('/entarance-form/', async(_, res) => {
  res.render('partials/header/entrance_form');
});

app.get('/registration-form/', async(_, res) => {
  res.render('partials/header/registration_form');
});

app.get('/restore-password-form/', async(_, res) => {
  res.render('partials/header/restore_password_form');
});


app.listen(process.env.PORT || 3000, () => console.log('Запуск!'));




const date = new Date().toLocaleDateString('ru-RU', {timeZone: "Europe/Moscow"});
const date_db_format = date.substring(6)+'-'+date.substring(3, 5) + '-' +date.substring(0,2);
