import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import {__filename, __dirname} from './__dirname.js';
import {manifest} from './manifest.js';

const app = express(); 

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));
app.engine('hbs', engine({
    extname: 'hbs',
    defaultLayout: false,
    partialsDir: path.join(__dirname, 'views', 'partials'),
    helpers: {
      cssFile: manifest['main.css'],
      jsFile: manifest['main.js'],
    }
}));


app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (_, res) => {
  res.render('home', {
    title: "Cinema"
  });
});


app.get('/page', function(req,res) {
  res.send('text');
});

app.listen(process.env.PORT || 4000, ()=>console.log('server started'));