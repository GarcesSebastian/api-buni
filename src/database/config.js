import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conectado a MySQL');
    connection.release();
  } catch (error) {
    console.error('Error conectando a MySQL:', error);
  }
})();
