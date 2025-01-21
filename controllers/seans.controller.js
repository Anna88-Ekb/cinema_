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

    const rows = [...new Set([...request_hall.rows].map(el => el.place_row))].sort((a, b) => a - b);
    rows.forEach(row => {
      arr[0].places.push({ place_row: row, place_col: [] });
    });

    request_hall.rows.forEach((element, ind) => {
      const row = arr[0].places.findIndex(el => el.place_row === element.place_row);
      arr[0].places[row].place_col.push({ col_num: element.place_col, col_status: element.place_place_col === +element.place_place_col && element.sale_status === true ? true : false });
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
    const req_price = await db.query(`select session_basic_price from cinema_session 
  where cinema_session_name = $1`, [req.query.id]);
    res.json(req_price.rows[0]);
  }

  async createTransactAndTicket(req, res) {
    try {
      const params = req.body;
  
      // Формируем запрос для клиента
      let try_client_query = '';
      if (
        (params.user_phone && params.user_email) &&
        (params.user_phone !== 'false' && params.user_email !== 'false')
      ) {
        try_client_query = `
          -- Проверяем клиента
          SELECT client_id 
          INTO v_client_id 
          FROM client
          WHERE client_phone = '${params.user_phone}' AND lower(client_email) = lower('${params.user_email}');
          
          -- Если клиент не найден
          IF v_client_id IS NULL THEN
              -- Добавляем пользователя в таблицу unreg_user
              INSERT INTO unreg_user (user_phone, user_email)
              VALUES ('${params.user_phone}', lower('${params.user_email}'))
              RETURNING user_id INTO v_unreg_user_id;
              -- Устанавливаем client_id в значение по умолчанию
              v_client_id := 2;
          END IF;
        `;
      } else if (
        ((!params.user_phone || params.user_phone === 'false') &&
          (!params.user_email || params.user_email === 'false')) &&
        params.client_login &&
        params.client_login !== 'false'
      ) {
        try_client_query = `
          -- Проверяем логин клиента
          SELECT client_id 
          INTO v_client_id 
          FROM client
          WHERE client_login = '${params.client_login}';
        `;
      }
  
      // Формируем запрос для вставки билетов
      const ticketValues = params.tickets
        .map(ticket => `(true, ${ticket.row}, ${ticket.place}, ${params.movie_hall}, ${params.movie_seance}, v_transact_id)`)
        .join(', ');
      const ticketsQuery = `
        INSERT INTO ticket (sale_status, place_place_row, place_place_col, place_hall_hall_id, cinema_session_session_name, transact_transact_id)
        VALUES ${ticketValues};
      `;
  
      // Полный SQL-запрос
      const query = `
        CREATE OR REPLACE FUNCTION create_transaction_and_return_id()
        RETURNS BIGINT AS $$
        DECLARE
        --переменные со значениями по умолчанию ("Система")
          v_client_id INTEGER DEFAULT 2;
          v_unreg_user_id BIGINT DEFAULT 1;
          v_worker_id SMALLINT DEFAULT 1;
          v_transact_id BIGINT;
        BEGIN
          ${try_client_query}
          -- Запись в таблицу transact
          INSERT INTO transact (transact_sum, client_client_id,
          worker_worker_id, unreg_user_user_id)
          VALUES ('${params.total_price}', v_client_id, v_worker_id, v_unreg_user_id)
          RETURNING transact_id INTO v_transact_id;
          -- Запись билетов
          ${ticketsQuery}
          RETURN v_transact_id;
        END $$ LANGUAGE plpgsql;
      `;
  
      // Выполнение SQL-запросов
      console.log(query);
      await db.query(query); // Создаем функцию
      const transaction = await db.query('SELECT create_transaction_and_return_id() AS transaction_id;'); // Вызываем функцию
  
      if (transaction.rows.length === 0) {
        return res.status(400).json({ message: 'Ошибка при сохранении данных. Обновите страницу и попробуйте снова.' });
      }
  
      // Получение информации о билетах
      const ticketsResult = await db.query(
        `select 
        t.place_place_row as row, 
        t.place_place_col as place, 
        h.hall_name as hall, 
        TO_CHAR(cs.session_date, 'DD.MM.YYYY') AS session_date, 
        TO_CHAR(cs.session_time, 'HH:MI') AS session_time, 
        c.cinema_name, 
        c.cinema_path, 
        g.graphics_name, 
        a.age_name, 
        cs.session_basic_price,
        t.ticket_id as ticket_description
        from ticket t
        join cinema_session cs on t.cinema_session_session_name = cs.cinema_session_name
        join cinema c on cs.cinema_cinema_id = c.cinema_id
        join hall h on cs.hall_hall_id = h.hall_id
        join graphics g on cs.graphics_graphics_id = g.graphics_id
        join age a on c.age_age_id = a.age_id
        where t.transact_transact_id = $1;`,
        [+transaction.rows[0].transaction_id]
      );
  
      if (ticketsResult.rows.length > 0) {
        return res.status(201).json(ticketsResult.rows);
      } else {
        throw new Error('Ошибка при поиске билетов.');
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

}

export const seansHall = new seansHallContoller();


/* SELECT 
          t.place_place_row AS row, 
          t.place_place_col AS place, 
          h.hall_name AS hall, 
          TO_CHAR(cs.session_date, 'DD.MM.YYYY') AS session_date, 
          TO_CHAR(cs.session_time, 'HH:MI') AS session_time, 
          c.cinema_name, 
          c.cinema_path 
        FROM ticket t
        JOIN cinema_session cs ON t.cinema_session_session_name = cs.cinema_session_name
        JOIN cinema c ON cs.cinema_cinema_id = c.cinema_id
        JOIN hall h ON cs.hall_hall_id = h.hall_id
        WHERE t.transact_transact_id = $1 */
/* async createTransactAndTicket(req, res) {
  try {
    const params = req.body;
    let try_client_query = '';
    let p = params.tickets.map(ticket =>
      `(true, ${ticket.row}, ${ticket.place}, ${params.movie_hall}, ${params.movie_seance}, v_transact_id)`).join(', ');
    let tickets = `insert into ticket (sale_status, place_place_row, place_place_col, place_hall_hall_id, cinema_session_session_name, transact_transact_id) values ${p};`;
    if ((params.user_phone !== false && params.user_email !== false) || (params.user_phone !== 'false' && params.user_email !== 'false')) {
      try_client_query = `    
      -- Проверяем клиента
      SELECT client_id 
      INTO v_client_id 
      FROM client
      WHERE client_phone = '${params.user_phone}' AND lower(client_email) = lower('${params.user_email}');
      -- Если клиент не найден
      IF v_client_id IS NULL THEN
          -- Добавляем пользователя в таблицу unreg_user
          INSERT INTO unreg_user (user_phone, user_email)
          VALUES ('${params.user_phone}', lower('${params.user_email}'))
          RETURNING user_id INTO v_unreg_user_id;
          -- client_id в значение по умолчанию 
          v_client_id := 2; 
      END IF;`;
    } else if (((params.user_phone === false && params.user_email === false) || (params.user_phone === 'false' && params.user_email === 'false')) && params.client_login !== false && params.client_login !== 'false') {
      try_client_query = `select client_id into v_client_id from client
      where client_login = '${params.client_login}' RETURNING client_id into v_client_id;`;
    }

    let query = `
    CREATE OR REPLACE FUNCTION create_transaction_and_return_id()
    RETURNS BIGINT AS $$
    DECLARE
    v_client_id INTEGER DEFAULT 2;
    v_unreg_user_id BIGINT DEFAULT 1;
    v_worker_id SMALLINT DEFAULT 1;
    v_transact_id BIGINT;
    BEGIN
    ${try_client_query}
    -- Вставка в transact
    INSERT INTO transact 
    (transact_sum,  client_client_id, worker_worker_id, unreg_user_user_id)
    VALUES 
    ('${params.total_price}', v_client_id, v_worker_id, v_unreg_user_id)
    RETURNING transact_id INTO v_transact_id;
    -- Вставка билетов
    ${tickets}
    -- Возвращаем значение
    RETURN v_transact_id;
    END $$ LANGUAGE plpgsql;`;
    

    console.log(query );
    const create_transact = await db.query(query);
    const transaction = await db.query('select create_transaction_and_return_id() as transaction_id;');
    if(transaction.rows.length === 0) {
    return  res.status(400).json({ message: 'Ошибка при сохранении данных. Обновите страницу и попробуйте снова' });
    }
    const tickets_result = await db.query(`select t.place_place_row as row, t.place_place_col as place, h.hall_name as hall, to_char(cs.session_date, 'DD.MM.YYYY') as session_date, to_char(cs.session_time, 'HH:MI') as session_time, c.cinema_name, c.cinema_path from ticket t
    join cinema_session cs on t.cinema_session_session_name = cs.cinema_session_name
    join cinema c on cs.cinema_cinema_id = c.cinema_id
    join hall h on cs.hall_hall_id = h.hall_id
    where t.transact_transact_id = $1`, [+transaction.rows[0].transaction_id]);
    if(tickets_result.rows.length > 0) {
      return res.status(201).json(tickets_result.rows);
    } else {
    throw new Error('Ошибка при поиске билетов');
    }
   
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
} */