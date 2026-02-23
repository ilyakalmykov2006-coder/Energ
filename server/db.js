const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

pool.query("SELECT NOW()").then(res => {
  console.log("Подключение к БД успешно:", res.rows[0]);
}).catch(err => {
  console.error("Ошибка подключения к БД:", err);
});

module.exports = pool;
