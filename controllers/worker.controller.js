import db from "../db_connect.js";

class Worker {
async checkEntranceData(req, res) {
try{
  const request_search_worker = await db.query(`select w.worker_login, w.worker_family_name, w.worker_name, w.worker_patronymic, wa.worker_access_id from worker w
  join permission p on w.worker_id = p.worker_worker_id
  join worker_access wa on p.worker_access_worker_access_id =  wa.worker_access_id
  join current_position cp on w.worker_id = cp.worker_worker_id
  join worker_position wp on cp.worker_position_position_id = wp.position_id
  where w.worker_login = TRIM(REPLACE($1, ' ', ''))
  and w.worker_password = TRIM(REPLACE($2, ' ', ''))
  and (current_timestamp < cp.date_end or cp.date_end is null)
  and (current_timestamp < p.date_end or cp.date_end is null);`, [req.body.login, req.body.password]);
  let worker = request_search_worker.rows;
  if(worker.length > 1) {
    let arr = [{
    worker_login: worker[0].worker_login,
    worker_family_name: worker[0].worker_family_name,
    worker_name: worker[0].worker_name,
    worker_patronymic: worker[0].worker_patronymic,
    worker_access : []
    }];
    worker.forEach(el => arr[0].worker_access.push(el.worker_access_id));
    worker = arr;
  }

  if (worker.length === 0) {
    return res.status(400).json({ 'Message': 'Сотрудник не найден' });
  }
  res.json(worker);
} catch (error) {
  res.status(400).json({'Error': error.message});
}
}
}

export const workerAction = new Worker();