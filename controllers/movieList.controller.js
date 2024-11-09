import db from "../db_connect.js";

class movieListController {
  async getSliderMoviesList(req, res) {
    const result = await db.query(`
  SELECT 
  sub.cinema_id,
  sub.cinema_name,
  sub.cinema_desc,
  sub.cinema_path,
  sub.cinema_duration,
  sub.country_desc,
  a.age_name,
  to_char(sub.session_date, 'DD.MM.YYYY') as session_date,
  to_char(sub.session_time, 'HH24:MI') as session_time
FROM (
  SELECT 
    c.cinema_id,
    c.cinema_name,
    c.cinema_desc,
    c.cinema_path,
    c.cinema_duration,
    (
      SELECT STRING_AGG(country_name, ', ')
      FROM country 
      WHERE country_id IN (
        SELECT country_country_id 
        FROM production 
        WHERE c.cinema_id = cinema_cinema_id
      )
    ) AS country_desc,
    c.age_age_id, 
    cs.session_date,
    cs.session_time,
    ROW_NUMBER() OVER (PARTITION BY c.cinema_id ORDER BY cs.session_date, cs.session_time) AS rn
  FROM 
    CINEMA c
  JOIN 
    cinema_session cs ON c.cinema_id = cs.cinema_cinema_id
  WHERE 
  cs.session_date >= CURRENT_DATE AND
    (c.cinema_end_date > CURRENT_DATE OR c.cinema_end_date IS NULL)
) AS sub
JOIN 
  age a ON sub.age_age_id = a.age_id
WHERE sub.rn <= 3
ORDER BY sub.cinema_id, sub.session_date, sub.session_time;
`);

    const rows = result.rows;
    const movies = rows.reduce((acc, row) => {
      const movie = acc.find(m => m.cinema_id === row.cinema_id);

      if (movie) {
        movie.sessions.push({ session_date: row.session_date, session_time: row.session_time });
      } else {
        acc.push({
          cinema_id: row.cinema_id,
          cinema_name: row.cinema_name,
          cinema_desc: row.cinema_desc,
          cinema_path: row.cinema_path,
          cinema_duration: row.cinema_duration,
          cinema_country: row.country_desc,
          age: row.age_name,
          sessions: [{ session_date: row.session_date, session_time: row.session_time }]
        });
      }

      return acc;
    }, []);

    res.json(movies);
  };

  async getDayMoviesList(req, res) {
    const day = req.params.day;
    const result = await db.query(`
    select h.hall_id, h.hall_name, c.cinema_name, to_char(session_date, 'YYYY-MM-DD') as session_day ,to_char(session_time, 'HH24:MI') as session_time, g.graphics_name, cs.session_basic_price as basic_price  from cinema_session cs
    JOIN cinema c ON  cs.cinema_cinema_id = c.cinema_id
    JOIN hall h ON  cs.hall_hall_id = h.hall_id
    JOIN graphics g ON  cs.graphics_graphics_id=g.graphics_id
    where session_date = $1
    order by h.hall_id, session_time;
    `, [day]);
    const rows = result.rows;
    const halls = rows.reduce((acc, row) => {
    let hall = acc.find(h => h.hall_id === row.hall_id);
      if (hall) {
        hall.sessions.push({
          cinema_name: row.cinema_name,
          session_day: row.session_day,
          session_time: row.session_time,
          graphics_name: row.graphics_name,
          basic_price: row.basic_price
        });
      } else {
        acc.push({
          hall_id: row.hall_id,
          hall_name: row.hall_name,
          sessions: [{
            cinema_name: row.cinema_name,
            session_day: row.session_day,
            session_time: row.session_time,
            graphics_name: row.graphics_name,
            basic_price: row.basic_price
          }]
        });
      }
      return acc;
    }, []);

    res.json(halls);
  }

  async getActualMoviesList(req, res) {
    if (Object.keys(req.query).length > 0) {
      const filters = [];
      const queryParams = [];

      if (req.query.type && req.query.type !== 'false') {
        filters.push(`t.type_name = $${queryParams.length + 1}`);
        queryParams.push(req.query.type);
      }

      if (req.query.country && req.query.country !== 'false') {
        filters.push(`(select string_agg(country_name, ', ')
        from country where country_id in
        (select country_country_id
        from production p
        where c.cinema_id = p.cinema_cinema_id)) LIKE $${queryParams.length + 1}`);
        queryParams.push(`%${req.query.country}%`);
      }

      if (req.query.age && req.query.age !== 'false') {
        filters.push(`a.age_name = $${queryParams.length + 1}`);
        queryParams.push(req.query.age);
      }

      let query = `
      select c.cinema_id,
      c.cinema_name,
      c.cinema_desc,
      c.cinema_path,
      c.cinema_duration,
      (select string_agg(country_name, ', ')
      from country
      where country_id in
      (select country_country_id
      from production
      where c.cinema_id = cinema_cinema_id)) as country_desc,
      a.age_name,
      t.type_name,
      to_char(c.cinema_start_date, 'dd.mm.yyyy') as cinema_start_date,
      to_char(c.cinema_end_date, 'dd.mm.yyyy') as cinema_end_date
      from cinema c
      join age a on c.age_age_id = a.age_id
      join type t on c.type_type_id = t.type_id
      where c.cinema_id in
      (select cinema_cinema_id
      from cinema_session cs
      where cs.session_date >= current_date
      and (c.cinema_end_date > current_date
      or c.cinema_end_date is null))
      `;

      if (filters.length > 0) {
        query += ' AND ' + filters.join(' AND ');
      }
      const result = await db.query(query, queryParams);
      res.json(result.rows);
    } else {
      const result = await db.query(`
      select c.cinema_id,
      c.cinema_name,
      c.cinema_desc,
      c.cinema_path,
      c.cinema_duration,
      (SELECT STRING_AGG(country_name, ', ')
      FROM country 
      WHERE country_id IN (
      SELECT country_country_id 
      FROM production 
      WHERE c.cinema_id = cinema_cinema_id)) as country_desc,
      a.age_name,
      t.type_name,
      to_char(c.cinema_start_date, 'DD.MM.YYYY') as cinema_start_date,
      to_char(c.cinema_end_date, 'DD.MM.YYYY') as cinema_end_date
      from cinema c
      join age a on c.age_age_id = a.age_id
      join type t on c.type_type_id = t.type_id
      where c.cinema_id in (select cinema_cinema_id from cinema_session cs where  cs.session_date >= CURRENT_DATE AND
      (c.cinema_end_date > CURRENT_DATE OR c.cinema_end_date IS NULL));
      `);
      res.json(result.rows);
    }
  }

  async getMovieByName(req, res) {
    const name = req.params.name;
    const movie = await db.query(`select c.cinema_id,
    c.cinema_name,
    c.cinema_desc,
    c.cinema_path,
    c.cinema_duration,
    (SELECT STRING_AGG(country_name, ', ')
    FROM country 
    WHERE country_id IN (
    SELECT country_country_id 
    FROM production 
    WHERE c.cinema_id = cinema_cinema_id)) as country_desc,
    a.age_name,
    t.type_name,
    to_char(c.cinema_start_date, 'DD.MM.YYYY') as cinema_start_date,
    to_char(c.cinema_end_date, 'DD.MM.YYYY') as cinema_end_date
    from cinema c
    join age a on c.age_age_id = a.age_id
    join type t on c.type_type_id = t.type_id
    where c.cinema_name = $1 and c.cinema_id in (select cinema_cinema_id from cinema_session cs where  cs.session_date >= CURRENT_DATE AND
    (c.cinema_end_date > CURRENT_DATE OR c.cinema_end_date IS NULL));`, [name]);
    res.json(movie.rows[0]);
  }

  async getDaysByMovieName(req, res) {
  const name = req.params.name;

  const date_path = await db.query(`select distinct to_char(cs.session_date, 'YYYY-MM-DD') as session, c.cinema_path, c.cinema_name from cinema_session cs
  join cinema c on c.cinema_id = cs.cinema_cinema_id 
  where cs.session_date >= current_date
  and lower(c.cinema_name) = $1
  order by 1;`, [name.toLowerCase()]);
  res.json(date_path.rows);
  } 

  
}
export const movieList = new movieListController();


