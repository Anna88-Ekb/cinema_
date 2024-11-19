import db from "../db_connect.js";

class seansHallContoller {
async getPlacesOfHall(req, res) {
const request_hall = await db.query(`select p.hall_hall_id, p.place_row, p.place_col,
t.place_place_row, t.place_place_col, cs.session_date, cs.session_time, cs.cinema_session_name,
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
    session_id: request_hall.rows[0].cinema_session_name,
    places: []
  }
]
console.log(arr);
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

async getSeansSales(req, res) {
  try {
    const query = `
    select * 
    from current_prom cp
    join promotion p 
    on cp.promotion_promotion_id = p.promotion_id
    and (p.promotion_date_end is null or p.promotion_date_end::date >= current_date)
    and (p.promotion_date_end is null or p.promotion_date_end::time >= current_time)
    join cinema_session cs on cp.cinema_session_cinema_session_name = cs.cinema_session_name
    and cs.cinema_session_name = $1
    and cs.hall_hall_id = $2
    and cs.session_date = $3
    and cs.session_time	= $4
    and cs.session_basic_price = $5
    `;

    const values = [
      +req.body.seance,
      +req.body.hall,
      req.body.day,
      req.body.time,
      req.body.price,
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

async getSeansBasicPrice(req, res) {
  console.log(req.query.id);
  const req_price = await db.query(`select session_basic_price from cinema_session 
  where cinema_session_name = $1`, [req.query.id]);
  res.json(req_price.rows[0]);
} 

async createTransactAndTicket(req, res) {
  console.log(req.body);
}

}

export const seansHall = new seansHallContoller();


/* CREATE OR REPLACE FUNCTION insert_transaction_and_ticket(
  p_transact_sum NUMERIC,
  p_client_id INTEGER,
  p_worker_id SMALLINT,
  p_user_id INTEGER,
  p_sale_status BOOLEAN,
  p_place_row SMALLINT,
  p_place_col SMALLINT,
  p_hall_id SMALLINT,
  p_session_name INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_transact_id BIGINT;
  v_unreg_user_id INTEGER;
BEGIN
  -- Вставка незарегистрированного пользователя
  INSERT INTO unreg_user (user_phone, user_email)
  VALUES ('74656654445', 'test@test.com')
  RETURNING user_id INTO v_unreg_user_id;

  -- Вставляем в transact и получаем ID
  INSERT INTO transact 
  (transact_sum, transact_time, client_client_id, worker_worker_id, unreq_user_user_id)
  VALUES 
  (p_transact_sum, NOW(), p_client_id, p_worker_id, v_unreg_user_id)
  RETURNING transact_id INTO v_transact_id;
  
  -- Вставляем в ticket
  INSERT INTO ticket 
  (sale_status, place_place_row, place_place_col, place_hall_hall_id, cinema_session_session_name, transact_transact_id)
  VALUES 
  (p_sale_status, p_place_row, p_place_col, p_hall_id, p_session_name, v_transact_id);

  -- Возвращаем ID транзакции
  RETURN v_transact_id;
END;
$$ LANGUAGE plpgsql; */