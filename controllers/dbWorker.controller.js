import db from "../db_connect.js";

class Databases{
  async getTablesListForWorker(_, res) {
  const request_tables = await db.query(`select c.relname as table_name, pgd.description as table_comment
  from pg_catalog.pg_class as c
  join pg_catalog.pg_namespace as n on n.oid = c.relnamespace
  left join pg_catalog.pg_description as pgd on pgd.objoid = c.oid
  where c.relkind = 'r'  -- только обычные таблицы
  and n.nspname = 'public' -- фильтрация по схеме
  and c.relname not in ('worker_position', 'worker', 'worker_access', 'permission', 'unreg_user' ,'client', 'current_position');`);
  res.json(request_tables.rows);}

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
  const query = `select ${columns.toString()} from ${table};`;
  const req_table = await db.query(`${query}`);
  res.json(req_table.rows); 

/*     console.log(req.body); */
  
/*   const req_table = await db.query(`select * from $1` , [table]);
  res.json(req_table.rows); */
  }
}

export const workerDb = new Databases();


/* and pg_get_serial_sequence(table_name, column_name) is NULL */