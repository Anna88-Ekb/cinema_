import { Router } from 'express';
import {movieList} from '../controllers/movieList.controller.js';
const router = Router(); 
router.get('/movies-slider', movieList.getSliderMoviesList);
router.get('/movies-day/:day', movieList.getDayMoviesList);
router.get('/movies', movieList.getActualMoviesList);
router.get('/movie/:name', movieList.getMovieByName);
router.get('/movie-days/:name', movieList.getDaysByMovieName)
export default router;
