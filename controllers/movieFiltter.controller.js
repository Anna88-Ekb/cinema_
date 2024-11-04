import db from "../db_connect.js";

class movieSelection {
  async getCurrentMovieCountry(req, res) {
    const result = await db.query(`
    select 'country' as name,  c.country_name, count(distinct p.cinema_cinema_id) as movie_count from production p
    join country c on c.country_id = p.country_country_id
    where p.cinema_cinema_id in (select cs.cinema_cinema_id from cinema_session cs where session_date >= CURRENT_DATE)
    group by 1, 2
    order by 2;
    `);
    res.json(result.rows);
  }

  async getCurrentMovieType(req, res) {
    const result = await db.query(`
    select 'type' as name, t.type_desc, count (distinct cs.cinema_cinema_id) as type_count from cinema_session cs
    join cinema c on cs.cinema_cinema_id = c.cinema_id
    join type t on c.type_type_id = t.type_id
    where cs.session_date >= CURRENT_DATE
    group by 1, 2
    order by 2;
    `);
    res.json(result.rows);
  }

  async getCurrentMovieAge(req, res) {
    const result = await db.query(`
    select 'age' as name, a.age_desc, count (distinct cs.cinema_cinema_id) as age_count from cinema_session cs
    join cinema c on cs.cinema_cinema_id = c.cinema_id
    join age a on c.age_age_id = a.age_id
    where cs.session_date >= CURRENT_DATE
    group by 1, 2
    order by LENGTH(a.age_desc), a.age_desc;
    `);
    res.json(result.rows);
  }

  async getMoviesCalendar(req, res) {
    const result = await db.query(`
    select  extract (month from session_date) as month, to_char(session_date, 'TMmonth') as month_name, extract (year from session_date)  AS year from cinema_session 
    where session_date >= current_date
    group by 1, 2, 3
    order by 3, 1;
    `);
    const calendar = result.rows;
    const new_calendar = calendar.map((el, i) => {
      el.ind = i + 1;
      el.week = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
      return el;
    });

    res.json(new_calendar);
  }

  async getMoviesDate(req, res) {
    const result = await db.query(`
    select extract(month from session_date) as month, extract(day from session_date) as day, extract(year from session_date) as year from (select distinct 
      session_date from cinema_session where session_date >= current_date)
      order by 3, 1, 2;
    `);
    res.json(result.rows);
  }

  async getMoviesMonthByMovieName(req, res) {
  const movie_name = req.query.name;
  const req_months = await db.query(`select  extract (month from session_date) as month, to_char(session_date, 'TMmonth') as month_name, extract (year from session_date)  as year from cinema_session cs
  join cinema c on cs.cinema_cinema_id =  c.cinema_id
  where (lower(c.cinema_name) = $1 or c.cinema_name = $1)
  and cs.session_date >= current_date
  group by 1, 2, 3
  order by 3, 1;`, [movie_name]);
  res.json(req_months.rows)
  }

  async getDaysByMovieNameAndMonth(req, res) {
  const request_movies = await db.query(`select to_char(cs.session_date, 'YYYY-MM-DD') as session_date from cinema_session cs
  join cinema c on cs.cinema_cinema_id =  c.cinema_id
  where ( lower(c.cinema_name) = $1 or c.cinema_name = $1 )
  and extract (month from cs.session_date) = $2
  and extract (year from cs.session_date) = $3
  and cs.session_date >= current_date
  group by 1;`, [req.query.name, req.query.month_num, req.query.year]);
  console.log(request_movies.rows);
  res.json(request_movies.rows);
  }
};

export const movieFilterSelection = new movieSelection();