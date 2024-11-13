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
  if(req.params.besides) {
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

/*   async getAllSession(_, res) {

  } */
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




/* select c.column_name, c.udt_name, 
  COALESCE(c.character_maximum_length, c.numeric_precision) as max_length, 
  (c.is_nullable = 'NO') as not_null,
  pgd.description as column_comment,
  tc.constraint_name,  
  ccu.table_name as foreign_table_name, 
  ccu.column_name as foreign_column_name
  from information_schema.columns as c
  left join information_schema.key_column_usage as kcu on c.column_name = kcu.column_name and c.table_name = kcu.table_name
  left join information_schema.table_constraints as tc on kcu.constraint_name = tc.constraint_name and tc.constraint_type = 'FOREIGN KEY'
  left join information_schema.constraint_column_usage as ccu on ccu.constraint_name = tc.constraint_name
  left join pg_catalog.pg_description as pgd on pgd.objsubid = c.ordinal_position  and pgd.objoid = (
  select oid 
  from pg_catalog.pg_class 
  where relname = c.table_name 
  and relnamespace = (select oid from pg_catalog.pg_namespace where nspname = c.table_schema))
  where c.table_schema = 'public' and c.table_name = $1 and c.identity_generation is NULL  order by 6 desc; */



/* str = `(select ${foreiqn_filtered.foreign_table_name + '_name'} from ${foreiqn_filtered.foreign_table_name} where 
${table + '.' + col} = ${foreiqn_filtered.foreign_table_name}.${foreiqn_filtered.foreign_column_name})`; */


/* async getTableMultipleParametrsForCreate(req, res) {
  const request_parametrs = await db.query(`select c.column_name, c.udt_name, 
  COALESCE(c.character_maximum_length, c.numeric_precision) as max_length, 
  (c.is_nullable = 'NO') as not_null,
  pgd.description as column_comment,
  tc.constraint_name,  
  ccu.table_name as foreign_table_name, 
  ccu.column_name as foreign_column_name
  from information_schema.columns as c
  join information_schema.key_column_usage as kcu on c.column_name = kcu.column_name and c.table_name = kcu.table_name
  join information_schema.table_constraints as tc on kcu.constraint_name = tc.constraint_name and tc.constraint_type = 'FOREIGN KEY'
  join information_schema.constraint_column_usage as ccu on ccu.constraint_name = tc.constraint_name
  left join pg_catalog.pg_description as pgd on pgd.objsubid = c.ordinal_position  and pgd.objoid = (
  select oid 
  from pg_catalog.pg_class 
  where relname = c.table_name 
  and relnamespace = (select oid from pg_catalog.pg_namespace where nspname = c.table_schema))
  where c.identity_generation is NULL and c.table_schema = 'public' and c.table_name = $1
  order by 6 desc;`, [req.params.table]);  
  res.json(request_parametrs.rows);
  } */
