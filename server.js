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
    partialsDir: path.join(__dirname, 'views', 'partials')
}));


app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('home', {
    cssFile: manifest['main.css'], // Получаем сгенерированный CSS файл из манифеста
    jsFile: manifest['main.js'],    // Получаем сгенерированный JS файл из манифеста
  });
});


app.get('/page', function(req,res) {
  res.send('text');
});
const port = 3000;
app.listen(port, ()=>console.log('server started'));