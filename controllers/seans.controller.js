import db from "../db_connect.js";

class seansHallContoller {
async getPlacesOfHall(req, res) {
const request_hall = await db.query(`select p.hall_hall_id, p.place_row, p.place_col,
t.place_place_row, t.place_place_col, cs.session_date, cs.session_time, 
c.cinema_name, t.sale_status, cs.session_basic_price, 
(select graphics_name from graphics where cs.graphics_graphics_id = graphics_id order by 1) from place p
left join cinema_session cs on p.hall_hall_id = cs.hall_hall_id
and cs.session_date = $3 
and cs.session_time = $4
left join cinema c on cs.cinema_cinema_id =c.cinema_id
and c.cinema_name = $1 
left join ticket t on cs.cinema_session_name = t.cinema_session_session_name
and p.place_row = t.place_place_row
and p.place_col = t.place_place_col
where p.hall_hall_id = $2 ;`, [req.body.movie_name, +req.body.hall_num, req.body.movie_date, req.body.movie_time]);

const arr = [
  {
    hall_id: request_hall.rows[0].hall_hall_id,
    basic_price: request_hall.rows[0].session_basic_price,
    graphics_name: request_hall.rows[0].graphics_name,
    places: []
  }
]
const rows = [...new Set([...request_hall.rows].map(el=> el.place_row))].sort((a, b)=>a-b);
rows.forEach(row => {
  arr[0].places.push({place_row : row, place_col : []});
});

request_hall.rows.forEach((element, ind) => {
const row = arr[0].places.findIndex(el => el.place_row === element.place_row);
arr[0].places[row].place_col.push({col_num: element.place_col, col_status: element.place_place_col === +element.place_place_col && element.sale_status === true ? true:false});
}); 
/* arr[0].places.forEach(el=> el.place_col.forEach(e=>console.log(e.col_status))); */
res.json(arr[0]);
};

async getMinPrice(req, res) {
  const request_price = await db.query(`select distinct floor(min(session_basic_price)) as min from cinema_session cs
  where cs.session_date >= current_date;`);
  res.json(request_price.rows[0]);
}

async  getSeansSales(req, res) {
  try {
    const query = `
      SELECT * 
      FROM current_prom cp
      JOIN promotion p 
        ON cp.promotion_promotion_id = p.promotion_id
        AND (p.promotion_date_end IS NULL OR p.promotion_date_end::date >= CURRENT_DATE)
        AND (p.promotion_date_end IS NULL OR p.promotion_date_end::time >= CURRENT_TIME)
      WHERE cp.cinema_session_cinema_session_name IN (
        SELECT cinema_session_name 
        FROM cinema_session 
        WHERE session_date = $2
          AND session_time = $3
          AND session_basic_price = $4
          AND hall_hall_id = $1
          AND graphics_graphics_id = (
            SELECT graphics_id 
            FROM graphics 
            WHERE LOWER(graphics_name) = LOWER($5)
          )
          AND cinema_cinema_id = (
            SELECT cinema_id 
            FROM cinema 
            WHERE LOWER(cinema_name) = LOWER($6)
          )
      );
    `;

    const values = [
      +req.body.hall,
      req.body.day,
      req.body.time,
      req.body.price,
      req.body.type,
      req.body.movie,
    ];

    const req_promotion_sales = await db.query(query, values);

    if (!req_promotion_sales.rows.length) {
      return res.status(404).json({ message: 'Промоакции не найдены' });
    }

    res.json(req_promotion_sales.rows);
  } catch (err) {
    console.error('Ошибка запроса к базе данных:', err.message);
    res.status(500).json({ message: 'Ошибка сервера, попробуйте позже' });
  }
}


}

export const seansHall = new seansHallContoller();