import { Router } from 'express';
import {movieList} from '../controllers/movieList.controller.js';
const router = Router(); 
router.get('/movies-slider', movieList.getSliderMoviesList);
router.get('/movies-today', movieList.getTodayMoviesList);
router.get('/movies', movieList.getActualMoviesList);
router.get('/movie/:name', movieList.getMovieByName);

export default router;
