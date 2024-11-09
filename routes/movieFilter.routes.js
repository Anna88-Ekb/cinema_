import { Router } from 'express';
import {movieFilterSelection} from '../controllers/movieFiltter.controller.js';
const router = Router(); 
router.get('/movies-country', movieFilterSelection.getCurrentMovieCountry);
router.get('/movies-type', movieFilterSelection.getCurrentMovieType);
router.get('/movies-age', movieFilterSelection.getCurrentMovieAge);
router.get('/movies-calendar', movieFilterSelection.getMoviesCalendar);
router.get('/movies-calendar-days', movieFilterSelection.getMoviesDate);
router.get('/movie-months', movieFilterSelection.getMoviesMonthByMovieName);
router.get('/movie-day-calendar', movieFilterSelection.getDaysByMovieNameAndMonth);
router.get('/movie-time-calendar', movieFilterSelection.getTimeByMovieNameAndDay);
router.get('/movie-hall-calendar', movieFilterSelection.getHallByMovieNameAndDatetime);
router.get('/movie-all-country', movieFilterSelection.getALLMovieCountry);
router.get('/movie-all-type', movieFilterSelection.getALLMovieType);
router.get('/movie-all-age', movieFilterSelection.getALLMovieAge);
router.get('/movie-all-hall', movieFilterSelection.getALLHall);

export default router;