import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import { __filename, __dirname } from './__dirname.js';
import { manifest } from './manifest.js';
import moviesRoutes from './routes/movies.routes.js';
import moviesFilterRoutes from './routes/movieFilter.routes.js';

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, 'dist')));
app.use('/posters', express.static(path.join(__dirname, 'posters')))
app.use('/api', moviesRoutes);
app.use('/api', moviesFilterRoutes);


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
    const response_movies_today = await fetch(process.env.SERV_HOST + process.env.PORT + '/api/movies-today');
    const halls = await response_movies_today.json();
    res.render('home', {
      title: "Cinema-кинотеатр", movies, halls,
      helpers: {
        currentHall: function (halls, hallId, options) {
          // Проверяем, есть ли зал с заданным hallId
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
    const response_movies_calendar = await fetch(process.env.SERV_HOST + process.env.PORT + '/api/movies-calendar')
    const movies = await response_movies.json();
    const country = await response_movies_country.json();
    const type = await response_movies_type.json();
    const age = await response_movies_age.json();
    const calendar = await response_movies_calendar.json();
    res.render('schedule_page', {
      title: "Cinema-кинотеатр", country, type, age, movies, calendar
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

app.get('/pages_info', (_, res) => {
  res.sendFile(__dirname + '/dist/pages_info/index.html');
});


app.listen(process.env.PORT || 4000, () => console.log('server started'));


/* select extract(month from session_date) as month, extract (day from date_trunc('month', session_date) + interval '1 month -1 day') AS max_day from cinema_session 
where session_date >= current_date
group by 1, 2
order by
case
when extract (MONTH FROM CURRENT_DATE) = extract(month from session_date) then 0 
when extract (MONTH FROM CURRENT_DATE) < extract(month from session_date) then 1
else 2
end, extract(month from session_date); */