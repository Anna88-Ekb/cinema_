import express, { json } from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import { __filename, __dirname } from './__dirname.js';
import { manifest } from './manifest.js';
import moviesRoutes from './routes/movies.routes.js';
import moviesFilterRoutes from './routes/movieFilter.routes.js';
import clientRoutes from './routes/client.routes.js';
import { error } from 'console';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));
app.use(cookieParser(process.env.COOKIE));
app.use((req, res, next) => {
  res.locals.login = Boolean(req.cookies.client_login);
  next();
});


app.use('/posters', express.static(path.join(__dirname, 'posters')))
app.use('/api', moviesRoutes);
app.use('/api', moviesFilterRoutes);
app.use('/server-api', clientRoutes);




app.engine('hbs', engine({
  extname: 'hbs',
  defaultLayout: false,
  partialsDir: path.join(__dirname, 'views', 'partials'),
  helpers: {
    homeCssFile: manifest['home.css'],
    homeJsFile: manifest['home.js'],
    scheduleCssFile: manifest['schedule.css'],
    scheduleJsFile: manifest['schedule.js'],
    dateFormatRU: function(day) {
      return day.substring(8) + '.' + day.substring(5, 7) + '.' + day.substring(0, 4);
   },
   dateFormatDB: function(day) {
      return day.substring(6) + '-' + day.substring(3, 5) + '-' + day.substring(0, 2);
   }
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
    res.status(200).json({ success: true});
  } catch(e) {
    console.error('Ошибка при создании клиента:', error.message);
    res.status(500).json({ error: 'Ошибка при создании клиента' });
  }
});

app.get('/entarance-form/', async (_, res) => {
  res.render('partials/header/entrance_form', {client:true});
});

app.get('/registration-form/', async (_, res) => {
  res.render('partials/header/registration_form');
});

app.get('/restore-password-form/', async (_, res) => {
  res.render('partials/header/restore_password_form');
});

app.post('/search-client-mail', async(req, res) => {
try{
  const client_email = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/search-client-mail/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });

  const a_client_email = await client_email.json();
  if(a_client_email.message){
    res.status(200).json({message: a_client_email.message});
  }
  else if(a_client_email.success) {
    res.status(404).json({success: a_client_email.success});
  }

}catch(error){
  res.status(500).json(error.message);
}
});

app.post('/search-client-phone', async(req, res) => {
  try{
    const client_phone = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/search-client-phone/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
  
    const a_client_phone= await client_phone.json();
    if(a_client_phone.message){
      res.status(200).json({message: a_client_phone.message});
    }
    else if(a_client_phone.success) {
      res.status(404).json({success: a_client_phone.success});
    }
  
  }catch(error){
    res.status(500).json(error.message);
  }
});

app.post('/search-client-login', async(req, res) => {
  try{
    const client_login = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/search-client-login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
  
    const a_client_login = await client_login.json();
    if(a_client_login.message){
      res.status(200).json({message: a_client_login.message});
    }
    else if(a_client_login.success) {
      res.status(404).json({success: a_client_login.success});
    }
  
  }catch(error){
    res.status(500).json(error.message);
  }
});

app.post('/entrance-client', async(req, res) => {

    try{
      const client = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/entrance-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
    
      const a_client = await client.json();

      if(a_client.message){
        res.status(404).json({message: a_client.message});
      }
      else if(a_client.entrance === true) {
    
        res.cookie('client_login', `${a_client.login}`, {
          path: '/',
          encode: String 
        });

/*         res.cookie('client_login', `${a_client.login}`, {
          path: '/schedule-page',
          encode: String 
        });
 */

      const login = a_client.login;
       res.render('partials/header/entrance', {login}, (err, html) => {
        if (err) {
          return res.status(500).json({ error: 'Ошибка рендеринга кнопки' });
        }
        res.status(200).json({ entrance: html });
      });
      }
    
    }catch(error){
      res.status(500).json(error.message);
    }
});
  
app.get('/buy-ticket', async (req, res) => {

let client_preference = false;

if(req.cookies.client_login) {
const request_client_preference = await fetch(process.env.SERV_HOST + process.env.PORT + `/server-api/preference-client-contacts/?login=${req.cookies.client_login}`)
client_preference = await request_client_preference.json();
};

console.log(client_preference);

if(Object.keys(req.query).length === 1 && req.query.movie_name) {
const response_movies_day = await fetch(process.env.SERV_HOST + process.env.PORT + `/api/movie-days/${req.query.movie_name}`);
const movie_days = await response_movies_day.json();
const movie_name = movie_days[0].cinema_name;

res.render('partials/buy_form/buy_form', {movie_name, client_preference: client_preference[0]});
} else {
const request_params = {...req.query};
 /*  console.log(req.query); */
res.render('partials/buy_form/buy_form', {request_params, client_preference: client_preference[0]});
  
}

});

app.get('/cinema-panel-entrance', async (_, res)=> {
  res.render('entrance_worker', {title:'Синема/Форма входа'});
})


app.listen(process.env.PORT || 3000, () => console.log('Запуск!'));




const date = new Date().toLocaleDateString('ru-RU', { timeZone: "Europe/Moscow" });
const date_db_format = date.substring(6) + '-' + date.substring(3, 5) + '-' + date.substring(0, 2);
