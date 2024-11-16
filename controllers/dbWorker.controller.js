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
    and c.relname not in ('worker_position', 'worker', 'worker_access', 'permission', 'unreg_user', 'client', 'current_position');`);
    res.json(request_tables.rows);
  }

  async getTableColumnName(req, res) {
    let table = req.params.table;
    const request_column_name = await db.query(`select column_name
  from information_schema.columns
  where table_schema = 'public'
  and table_name = $1;`, [table]);
    res.json(request_column_name.rows);
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

    if (request_foreign.rows.length > 0 && table !== 'ticket') {
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
    let query = `INSERT INTO ${table} (${[...keys]}) VALUES (${values.map(el => `'${el.trim()}'`).join(', ')}) returning *;`;
    try {
      const request_insert = await db.query(query);
      const inserted = request_insert.rows;
      res.status(200).json(inserted);
    } catch (e) {
      res.status(400).json({ message: e.message });
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

    const queries = req.body.map(el => createInsRow(table, el, obj));
    const query = `BEGIN; ${queries.join(' ')} END;`;

    try {
      await db.query(query);
      res.status(200).json({ message: 'Строки были изменены' });
    } catch (e) {
      res.status(400).json({ message: `Ошибка изменения строк: ${e.message}` });
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
  const keys = Object.keys(el);
  const values = Object.values(el);
  if(!obj) {
    const where = keys.map((key, i) => `${key} = '${values[i]}'`).join(' and ');
    return `DELETE FROM ${table} WHERE ${where};`;
  } else {
    const where = keys.map((key, i) => {
      if(key in obj) {
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