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
};

export const movieFilterSelection = new movieSelection();