import { Router } from 'express';
import {movieFilterSelection} from '../controllers/movieFiltter.controller.js';
const router = Router(); 
router.get('/movies-country', movieFilterSelection.getCurrentMovieCountry);
router.get('/movies-type', movieFilterSelection.getCurrentMovieType);
router.get('/movies-age', movieFilterSelection.getCurrentMovieAge);
router.get('/movies-calendar', movieFilterSelection.getMoviesCalendar);
router.get('/movies-calendar-days', movieFilterSelection.getMoviesDate);
export default router;