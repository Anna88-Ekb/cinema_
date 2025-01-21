import db from "../db_connect.js";

class Databases {
  async getTablesListForWorker(_, res) {
    const request_tables = await db.query(`select c.relname AS table_name, pgd.description AS table_comment
    from pg_catalog.pg_class as c
    join pg_catalog.pg_namespace as n on n.oid = c.relnamespace
    left join pg_catalog.pg_description as pgd on pgd.objoid = c.oid 
    and pgd.objsubid = 0  -- только комментарии к таблицам
    where
    c.relkind = 'r'  -- только обычные таблицы
    and n.nspname = 'public'  -- фильтрация по схеме
    and c.relname not in ('unreg_user', 'client');`);
    res.json(request_tables.rows);
  }

  /* 'worker_position', 'worker', 'worker_access', 'permission', 'transact' 'current_position'*/
  /*  async getTableColumnName(req, res) {
     let table = req.params.table;
     const request_column_name = await db.query(`select column_name
   from information_schema.columns
   where table_schema = 'public'
   and table_name = $1;`, [table]);
     res.json(request_column_name.rows);
   } */
  async getTableColumnName(req, res) {
    let table = req.params.table;

    try {
      const request_column_name = await db.query(`
        SELECT 
        column_name,
        col_description(format('%s.%s', table_schema, table_name)::regclass::oid, ordinal_position) AS column_comment
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = $1;

        `, [table]);
      res.json(request_column_name.rows);
    } catch (error) {
      console.error('Error fetching table column names and comments:', error);
      res.status(500).json({ error: 'Failed to fetch table column names and comments.' });
    }
  }

  async getTableColumnNameForQuery(req, res) {
    let table = req.params.table;
    const request_column_name = await db.query(`SELECT 
    CASE 
        WHEN data_type = 'date' THEN 'TO_CHAR(' || column_name || ', ''YYYY-MM-DD'') AS ' || column_name
		WHEN data_type = 'timestamp without time zone' THEN 'TO_CHAR(' || column_name || ', ''YYYY-MM-DD 24HH-MI'') AS ' || column_name
        ELSE column_name
    END
    FROM information_schema.columns
  WHERE table_schema = 'public'
  AND table_name = $1;`, [table]);

    res.json(request_column_name.rows);
  }


  async getTableByColumnName(req, res) {
    const table = req.params.table;
    let columns = [];
    req.body.forEach(el => columns.push(el.column_name));
    const request_foreign = await db.query(`
  select tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
  from information_schema.table_constraints AS tc
  join information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
  join information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
  where 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public' 
    AND tc.table_name = $1;
`, [table]);


    if (request_foreign.rows.length > 0 && table !== 'ticket' && table !== 'cinema_session') {
      const foreiqn = request_foreign.rows;
      let query = `SELECT ${columns.map(col => changeColumnName(col, table, foreiqn)).join(', ')} FROM ${table};`;
      const req_table = await db.query(`${query}`);
      res.json(req_table.rows);
    } else {
      const query = `select ${columns.toString()} from ${table};`
      const req_table = await db.query(`${query}`);
      res.json(req_table.rows);
    }
  }


  async getTableApplication(req, res) {
    try {
      const table = req.params.table;
      const worker = req.params.worker;
      let columns = [];
  
      // Проверка, что тело запроса - это массив
      if (Array.isArray(req.body)) {
        columns = req.body.map(el => el.column_name);
      } else {
        return res.status(400).json({ error: 'Invalid request body format' });
      }
  
      // Запрос на получение внешних ключей для таблицы
      const request_foreign = await db.query(`
        SELECT 
          tc.constraint_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name, 
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu 
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu 
          ON ccu.constraint_name = tc.constraint_name
        WHERE 
          tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_schema = 'public' 
          AND tc.table_name = $1;
      `, [table]);
  
      const foreignKeys = request_foreign.rows;
  
      // Формирование списка колонок для запроса
      const formattedColumns = columns.map(col => changeColumnName(col, table, foreignKeys)).join(', ');
  
      let query;
      
      // Построение запроса в зависимости от наличия worker
      if (!worker) {
        query = `
          SELECT ${formattedColumns} 
          FROM ${table} 
          WHERE application_rent_name NOT IN (
            SELECT application_rent_application_rent_id
            FROM application_worker
          );
        `;
      } else {
        // Используем параметризацию для worker_login, чтобы избежать SQL-инъекций
        query = `
        SELECT ${formattedColumns} 
        FROM ${table}
        WHERE application_rent_name IN (
          SELECT application_rent_application_rent_id
          FROM application_worker
          WHERE worker_worker_id = (
            SELECT worker_id 
            FROM worker 
            WHERE worker_login = $1
          )
        ) AND application_rent_name NOT IN (
          SELECT application_rent_application_rent_id
          FROM application_worker
          WHERE application_status_application_status_id IN (2, 3, 4));
      `;
      }
  
      // Выполнение запроса к базе данных с параметризацией
      const req_table = await db.query(query, worker ? [worker] : []);
      
      // Отправка результатов клиенту
      res.json(req_table.rows);
  
    } catch (error) {
      console.error('Ошибка:', error.message);
      res.status(500).json({ error: 'Ошибка обработки запроса' });
    }
  }
  

  async takeApplication(req, res) {
    const { worker_login, application_rent_application_rent_id } = req.body;

    try {
      // Проверка входных данных
      if (!worker_login || !application_rent_application_rent_id) {
        return res.status(400).json({
          message: 'worker_login и application_rent_application_rent_id обязательны',
        });
      }

      // Выполнение SQL-запроса
      const inser_table = await db.query(
        `
        INSERT INTO application_worker (
          worker_worker_id,
          application_rent_application_rent_id,
          application_status_application_status_id
        )
        VALUES (
          (SELECT worker_id FROM worker WHERE worker_login = $1),
          $2,
          (SELECT application_status_id FROM application_status WHERE LOWER(application_status_name) LIKE LOWER('%принято%'))
        )
        RETURNING *;
        `,
        [worker_login, application_rent_application_rent_id]
      );

      if (inser_table.rows.length === 0) {
        return res.status(404).json({
          message: 'Не удалось добавить запись. Проверьте данные.',
        });
      }

      // Успешный ответ
      res.status(200).json({
        message: 'Запись успешно добавлена',
        data: inser_table.rows,
      });
    } catch (e) {
      console.error('Ошибка выполнения запроса:', e.message);
      res.status(500).json({
        message: 'Ошибка сервера при обработке заявки.',
        error: e.message,
      });
    }
  }


  async getTableParametrsForCreate(req, res) {
    let query = `select c.column_name, c.udt_name, coalesce(c.character_maximum_length, c.numeric_precision) as max_length, 
  (c.is_nullable = 'NO') as not_null,
  pgd.description as column_comment,
  max(tc.constraint_name) as constraint_name,  
  max(ccu.table_name) as foreign_table_name, 
  max(ccu.column_name) as foreign_column_name
  from information_schema.columns as c
  left join pg_catalog.pg_description as pgd 
  on pgd.objsubid = c.ordinal_position  
  and pgd.objoid = (select oid from pg_catalog.pg_class 
  where relname = c.table_name 
  and relnamespace = (select oid from pg_catalog.pg_namespace where nspname = c.table_schema))
  left join information_schema.key_column_usage as kcu on c.column_name = kcu.column_name  and c.table_name = kcu.table_name
  left join information_schema.table_constraints as tc on kcu.constraint_name = tc.constraint_name 
  AND tc.constraint_type = 'FOREIGN KEY'
  left join information_schema.constraint_column_usage as ccu on tc.constraint_name = ccu.constraint_name
  where c.identity_generation is null and c.table_schema = 'public' and c.table_name = $1
  group by c.column_name, c.udt_name, c.character_maximum_length, c.numeric_precision, c.is_nullable, pgd.description
  order by c.column_name;`;
    if (req.params.besides) {
      const ind = Math.max(query.lastIndexOf('group by'), query.lastIndexOf('GROUP BY'));
      query = query.substring(0, ind) + ' ' + `and c.column_name not in (${req.params.besides.split(',').map(el => `'${el.trim()}'`).join(', ')})` + ' ' + query.substring(ind);
    }
    const request_parametrs = await db.query(query, [req.params.table]);
    res.json(request_parametrs.rows);
  }

  async getALLPromotion(_, res) {
    const request_promotion = await db.query(` select promotion_id, promotion_name from promotion;`);
    res.json(request_promotion.rows);
  }

  async inserRowToTable(req, res) {

    const table = req.params.table.startsWith(':') ? req.params.table.substring(1) : req.params.table;
    const keys = Object.keys(req.body.cols);
    const values = Object.values(req.body.cols);
    if (table !== 'cinema_session') {
      let query = `INSERT INTO ${table} (${[...keys]}) VALUES (${values.map(el => `'${el.trim()}'`).join(', ')}) returning *;`;
      try {
        const request_insert = await db.query(query);
        const inserted = request_insert.rows;
        res.status(200).json(inserted);
      } catch (e) {
        res.status(400).json({ message: e.message });
      }
    }

    if (table === 'cinema_session') {
      const {
        cinema_cinema_id,
        graphics_graphics_id,
        hall_hall_id,
        session_basic_price,
        session_date,
        session_time,
      } = req.body.cols;
    
      // Проверка обязательных параметров
      if (
        !cinema_cinema_id ||
        !graphics_graphics_id ||
        !hall_hall_id ||
        !session_basic_price ||
        !session_date ||
        !session_time
      ) {
        return res
          .status(400)
          .json({ message: 'Некорректные или неполные данные для создания сеанса.' });
      }
    
      const query = `
      WITH active_sessions AS (
        SELECT 1
        FROM cinema_session cs
        JOIN cinema c ON cs.cinema_cinema_id = c.cinema_id
        WHERE cs.session_date = $5
          AND cs.hall_hall_id = $3
          AND ($6::time, $6::time + INTERVAL '1 minute' * c.cinema_duration) 
              OVERLAPS (cs.session_time, cs.session_time + INTERVAL '1 minute' * c.cinema_duration)
      ),
      active_rents AS (
        SELECT 1
        FROM rent r
        WHERE r.rent_date =  $5
          AND r.hall_hall_id = $3
          AND ($6::time, $6::time + INTERVAL '1 minute' * (
            SELECT c.cinema_duration 
            FROM cinema c 
            WHERE c.cinema_id = $1
          )) OVERLAPS (r.rent_start_time, r.rent_end_time)
      )
      INSERT INTO cinema_session (
        cinema_cinema_id, 
        graphics_graphics_id, 
        hall_hall_id, 
        session_basic_price, 
        session_date, 
        session_time
      )
      SELECT $1, $2, $3, $4, $5, $6
      WHERE NOT EXISTS (SELECT 1 FROM active_sessions)
        AND NOT EXISTS (SELECT 1 FROM active_rents)
        returning cinema_session_name;
      `;
      try {
        // Выполнение SQL-запроса
        const request_insert = await db.query(query, [
          cinema_cinema_id,
          graphics_graphics_id,
          hall_hall_id,
          session_basic_price,
          session_date,
          session_time,
        ]);
    
        const inserted = request_insert.rows;
    
        // Если данные не вставились, возбуждаем ошибку
        if (inserted.length === 0) {
          throw new Error('Зал занят, сеанс не может быть создан.');
        }
    
        // Успешный ответ
        return res.status(200).json({
          message: 'Запись создана',
        });
      } catch (e) {
        // Обработка ошибок
        console.error('Ошибка выполнения запроса:', e.message);
        return res.status(500).json({
          message: 'Ошибка сервера',
          error: e.message,
        });
      }
    }
    


  }

  async deleteRowsFromTable(req, res) {
    const table = req.params.table;
    let obj = false;
    //  внешние таблицы для текущей таблицы
    if (table === 'cinema') {
      obj = {
        type_type_id: {
          foreign_table: 'type',
          foreign_column: 'type_id',
        },
        age_age_id: {
          foreign_table: 'age',
          foreign_column: 'age_id',
        },
      };
    }

    if (table === 'cinema_session') {
      obj = {
        cinema_cinema_id: {
          foreign_table: 'cinema',
          foreign_column: 'cinema_cinema_id',
        },
        hall_hall_id: {
          foreign_table: 'hall',
          foreign_column: 'hall_hall_id',
        },
        graphics_graphics_id: {
          foreign_table: 'graphics',
          foreign_column: 'graphics_graphics_id',
        }
      };
    }

    if (table === 'application_rent') {
      obj = {
        hall_hall_id: {
          foreign_table: 'hall',
          foreign_column: 'hall_hall_id',
        },
        type_client_type_client_id: {
          foreign_table: 'application_type',
          foreign_column: 'type_client_type_client_id',
        }
      };
    }

    if (table === 'application_rent') {
      obj = {
        hall_hall_id: {
          foreign_table: 'hall',
          foreign_column: 'hall_hall_id',
        },
        type_client_type_client_id: {
          foreign_table: 'application_type',
          foreign_column: 'type_client_type_client_id',
        }
      };
    }

    if (table === 'rent') {
      obj = {
        hall_hall_id: {
          foreign_table: 'hall',
          foreign_column: 'hall_hall_id',
        },
        type_client_type_client_id: {
          foreign_table: 'application_rent',
          foreign_column: 'application_rent_name',
        }
      };
    }




    let query = `BEGIN; ${req.body.map(el => createDelRow(table, el, obj)).join(' ')} END;`


    try {
      const request_delete = await db.query(query);
      res.status(200).json({ message: 'Строки были удалены' });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  async changeRowsInTable(req, res) {
    const table = req.params.table;
    let obj = false;

    //  внешние таблицы для текущей таблицы
    if (table === 'cinema') {
      obj = {
        type_type_id: {
          foreign_table: 'type',
          foreign_column: 'type_id',
        },
        age_age_id: {
          foreign_table: 'age',
          foreign_column: 'age_id',
        },
      };
    }

    if (table === 'cinema_session') {
      obj = {
        cinema_cinema_id: {
          foreign_table: 'cinema',
          foreign_column: 'cinema_cinema_id',
        },
        hall_hall_id: {
          foreign_table: 'hall',
          foreign_column: 'hall_hall_id',
        },
        graphics_graphics_id: {
          foreign_table: 'graphics',
          foreign_column: 'graphics_graphics_id',
        }
      };
    }


    const queries = req.body.map(el => createInsRow(table, el, obj));
    const query = `BEGIN; ${queries.join(' ')} END;`;

    try {
      await db.query(query);
      res.status(200).json({ message: 'Строки были изменены' });
    } catch (e) {
      res.status(400).json({ message: `Ошибка изменения строк: ${e.message}` });
    }
  }

  async getAllClientType(_, res) {
    const request_age = await db.query(`select type_client_id, type_client_name from type_client order by 1`);
    res.json(request_age.rows);
  }

  async getAllApplicationStatus(_, res) {
    const request_age = await db.query(`select application_status_id, application_status_name from application_status order by 1`);
    res.json(request_age.rows);
  }

  async getAllApplicationType(_, res) {
    const request_age = await db.query(`select application_type, application_type_name from application_type`);
    res.json(request_age.rows);
  }

  async getAllApplicationRent(_, res) {
    const request_age = await db.query(`select application_rent_name as application_rent_id, application_rent_name  from application_rent`);
    res.json(request_age.rows);
  }


  async closeApplication(req, res) {
    const { worker_login, application_rent_application_rent_id } = req.body;

    try {
      // Проверка входных данных
      if (!worker_login && !application_rent_application_rent_id) {
        return res.status(400).json({
          message: 'worker_login и application_rent_application_rent_id обязательны',
        });
      }

      // Выполнение SQL-запроса
      const inser_table = await db.query(
        `
        INSERT INTO application_worker (
          worker_worker_id,
          application_rent_application_rent_id,
          application_status_application_status_id
        )
        VALUES (
          (SELECT worker_id FROM worker WHERE worker_login = $1),
          $2,
          (SELECT application_status_id FROM application_status WHERE LOWER(application_status_name) LIKE LOWER('%закрыто%'))
        )
        RETURNING *;
        `,
        [worker_login, application_rent_application_rent_id]
      );

      if (inser_table.rows.length === 0) {
        return res.status(404).json({
          message: 'Не удалось добавить запись. Проверьте данные.',
        });
      }

      // Успешный ответ
      res.status(200).json({
        message: 'Запись успешно добавлена',
        data: inser_table.rows,
      });
    } catch (e) {
      console.error('Ошибка выполнения запроса:', e.message);
      res.status(500).json({
        message: 'Ошибка сервера при обработке заявки.',
        error: e.message,
      });
    }
  }

  async checkHallAvailability(req, res) {
    try{
      const {date, time_start, time_end} = req.body;
      const req_db = await db.query(`
      with 
active_sessions as (select cs.hall_hall_id, cs.session_time as session_start, cs.session_time + interval '1 minute' * c.cinema_duration as session_end
from cinema_session cs join cinema c on cs.cinema_cinema_id = c.cinema_id
where cs.session_date = $1),
active_rent as (select r.hall_hall_id, r.rent_start_time, r.rent_end_time from rent r
join application_worker aw  on r.application_rent_application_rent_id = aw.application_rent_application_rent_id
where r.rent_date = $1 and  aw.application_status_application_status_id not in (4))
select h.hall_name,
case when exists (select 1 from active_sessions as a
where a.hall_hall_id = h.hall_id and (($2::time, $3::time) overlaps (a.session_start, a.session_end))
)
or exists (select 1 from active_rent ar
where ar.hall_hall_id = h.hall_id and (($2::time, $3::time) overlaps (ar.rent_start_time, ar.rent_end_time))
) 
then 'Занят' 
else 'Свободен' 
end as hall_status
from hall h;
      `, [date, time_start, time_end]);
      res.json(req_db.rows);
    } catch (e) {
      res.status(500).json({
        message: 'Ошибка сервера при поиске сеансов.',
        error: e.message,
      });
    }
  }


  async rentApplicationForm(req, res) {
    try {
      const {
        application_rent_application_rent_id,
        hall_hall_id,
        rent_date,
        rent_end_time,
        rent_price,
        rent_start_time,
        worker_login,
      } = req.body;
  
      // Проверяем входные параметры
      if (!rent_date || !hall_hall_id || !rent_start_time || !rent_end_time || !rent_price || !application_rent_application_rent_id || !worker_login) {
        return res.status(400).json({ message: 'Некорректные входные данные' });
      }
  
      const query = `
        WITH active_sessions AS (
          SELECT 1
          FROM cinema_session cs
          join cinema c on cs.cinema_cinema_id = c.cinema_id
          WHERE cs.session_date = $1
            AND cs.hall_hall_id = $2
            AND ($3::time, $4::time) OVERLAPS (cs.session_time, cs.session_time + INTERVAL '1 minute' * c.cinema_duration)
        ),
        active_rents AS (
          SELECT 1
          FROM rent r
          WHERE r.rent_date = $1
            AND r.hall_hall_id = $2
            AND ($3::time, $4::time) OVERLAPS (r.rent_start_time, r.rent_end_time)
        )
        INSERT INTO rent (rent_start_time, rent_end_time, rent_date, hall_hall_id, rent_price, application_rent_application_rent_id)
        SELECT $3, $4, $1, $2, $5, $6
        WHERE NOT EXISTS (SELECT 1 FROM active_sessions)
          AND NOT EXISTS (SELECT 1 FROM active_rents)
        RETURNING rent_id;
      `;
  
      const result = await db.query(query, [
        rent_date,
        hall_hall_id,
        rent_start_time,
        rent_end_time,
        rent_price,
        application_rent_application_rent_id,
      ]);
  
      if (result.rows.length > 0) {
        // Добавляем запись в application_worker
        await db.query(
          `
          INSERT INTO application_worker (worker_worker_id, application_rent_application_rent_id, application_status_application_status_id)
          VALUES (
            (SELECT worker_id FROM worker WHERE worker_login = $1),
            $2,
            (SELECT application_status_id FROM application_status WHERE LOWER(application_status_name) LIKE LOWER('%оформлено%'))
          );
          `,
          [worker_login, application_rent_application_rent_id]
        );
  
        return res.json({ message: 'Зал свободен, запись добавлена', rentId: result.rows[0].rent_id });
      } else {
        return res.status(400).json({ message: 'Зал занят, запись не добавлена' });
      }
    } catch (e) {
      console.error('Ошибка при выполнении rentApplicationForm:', e);
      return res.status(500).json({
        message: 'Ошибка сервера при записи',
        error: e.message,
      });
    }
  }
  
  



}














export const workerDb = new Databases();

function changeColumnName(col, table, foreign) {
  const foreiqn_filtered = foreign.find(f => f.column_name === col);
  let str;
  if (foreiqn_filtered) {
    str = `(select ${foreiqn_filtered.foreign_table_name + '_name'} from ${foreiqn_filtered.foreign_table_name} where 
  ${table + '.' + col} = ${foreiqn_filtered.foreign_table_name}.${foreiqn_filtered.foreign_column_name})`;
    return str;
  } else {
    return col.toString();
  }
}

function createInsRow(table, el, obj) {
  const keysNew = Object.keys(el.new);
  const keysOld = Object.keys(el.old);
  const valuesNew = Object.values(el.new);
  const valuesOld = Object.values(el.old);

  // Формирование части SET
  const setPart = keysNew.map((key, i) => {
    if (obj && obj[key]) {
      const { foreign_table, foreign_column } = obj[key];
      const lookupField = `${foreign_table.replace(/_[a-z]+$/, '')}_name`;
      return `${key} = (SELECT ${foreign_column} FROM ${foreign_table} WHERE LOWER(${lookupField}) = LOWER(NULLIF(TRIM('${valuesNew[i]}'), '')) LIMIT 1)`;
    }
    return `${key} = NULLIF(TRIM('${valuesNew[i]}'), '')`;
  }).join(', ');

  // Формирование части WHERE
  const wherePart = keysOld.map((key, i) => {
    if (obj && obj[key]) {
      const { foreign_table, foreign_column } = obj[key];
      const lookupField = `${foreign_table.replace(/_[a-z]+$/, '')}_name`;
      return `${key} = (SELECT ${foreign_column} FROM ${foreign_table} WHERE LOWER(${lookupField}) = LOWER(NULLIF(TRIM('${valuesOld[i]}'), '')) LIMIT 1)`;
    }
    return `${key} = '${valuesOld[i]}'`;
  }).join(' AND ');

  return `UPDATE ${table} SET ${setPart} WHERE ${wherePart};`;
}

function createDelRow(table, el, obj) {
/*   console.log(table, el, obj); */
  const keys = Object.keys(el);
  const values = Object.values(el);
  if (!obj) {
    const where = keys.map((key, i) => `${key} = '${values[i]}'`).join(' and ');
    return `DELETE FROM ${table} WHERE ${where};`;
  } else {
    const where = keys.map((key, i) => {
      if (key in obj) {
        return `${key} = (Select ${obj[key]['foreign_column']} from ${obj[key]['foreign_table']} WHERE ${obj[key]['foreign_table'] + '_name'} = '${values[i]}' LIMIT 1)`;
      }
      return `${key} = '${values[i]}'`;
    }).join(' and ');
    return `DELETE FROM ${table} WHERE ${where};`;
  }
}



/* function createInsRow(table, el, obj) {
  const keysNew = Object.keys(el.new);
  const keysOld = Object.keys(el.old);
  const valuesNew = Object.values(el.new);
  const valuesOld = Object.values(el.old);

  // Формирование части SET
  const setPart = keysNew.map((key, i) => {
    if (obj && obj[key]) {
      const { foreign_table, foreign_column } = obj[key];
      const lookupField = `${foreign_table.replace(/_[a-z]+$/, '')}_name`;
      return `${key} = (SELECT ${foreign_column} FROM ${foreign_table} WHERE ${lookupField} = NULLIF(TRIM('${valuesNew[i]}'), '') LIMIT 1)`;
    }
    return `${key} = NULLIF(TRIM('${valuesNew[i]}'), '')`;
  }).join(', ');

  // Формирование части WHERE
  const wherePart = keysOld.map((key, i) => {
    if (obj && obj[key]) {
      const { foreign_table, foreign_column } = obj[key];
      const lookupField = `${foreign_table.replace(/_[a-z]+$/, '')}_name`;
      return `${key} = (SELECT ${foreign_column} FROM ${foreign_table} WHERE ${lookupField} = NULLIF(TRIM('${valuesOld[i]}'), '') LIMIT 1)`;
    }
    return `${key} = '${valuesOld[i]}'`;
  }).join(' AND ');

  // Финальная строка SQL
  const query = `UPDATE ${table} SET ${setPart} WHERE ${wherePart};`;
  return query;
} */

/* select c.column_name, c.udt_name, coalesce(c.character_maximum_length, c.numeric_precision) as max_length, 
    (c.is_nullable = 'NO') as not_null, pgd.description as column_comment, tc.constraint_name as constraint_name, 
    ccu.table_name as foreign_table_name, ccu.column_name as foreign_column_name from information_schema.columns as c
    left join pg_catalog.pg_description as pgd on pgd.objsubid = c.ordinal_position 
    and pgd.objoid = (select oid from pg_catalog.pg_class where relname = c.table_name and relnamespace = (select oid from pg_catalog.pg_namespace where nspname = c.table_schema)) 
    left join information_schema.key_column_usage as kcu on c.column_name = kcu.column_name and c.table_name = kcu.table_name
    left join information_schema.table_constraints as tc on kcu.constraint_name = tc.constraint_name and tc.constraint_type = 'FOREIGN KEY'
    left join information_schema.constraint_column_usage as ccu on tc.constraint_name = ccu.constraint_name
    where c.identity_generation is null and c.table_schema = 'public' and c.table_name = $1 
    order by c.column_name;`; */