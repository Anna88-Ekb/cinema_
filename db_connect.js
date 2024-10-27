import pg from 'pg';
const { Pool } = pg;
 
const pool = new Pool({
  user: process.env.DATABASE,         
  password: process.env.DB_PASSWORD,  
  host: process.env.DB_HOST,         
  port: parseInt(process.env.DB_PORT, 10), 
  database: process.env.DB_NAME,
})

export default pool;

