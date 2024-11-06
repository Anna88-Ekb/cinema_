import db from "../db_connect.js";

class seansHallContoller {
async getPlacesOfHall(req, res) {

const request_hall = await db.query(`select p.hall_hall_id, p.place_row, p.place_col, t.place_place_row, t.place_place_col, cs.session_date, cs.session_time, c.cinema_name, t.sale_status from place p
left join cinema_session cs on p.hall_hall_id = cs.hall_hall_id
and cs.session_date = $3 
and cs.session_time = $4
left join cinema c on cs.cinema_cinema_id =c.cinema_id
and c.cinema_name = $1 
left join ticket t on cs.session_id = t.cinema_session_session_id
and p.place_row = t.place_place_row
and p.place_col = t.place_place_col
where p.hall_hall_id = $2 ;`, [req.body.movie_name, +req.body.hall_num, req.body.movie_date, req.body.movie_time]);
const arr = [
  {
    hall_id: request_hall.rows[0].hall_hall_id,
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
}

export const seansHall = new seansHallContoller();