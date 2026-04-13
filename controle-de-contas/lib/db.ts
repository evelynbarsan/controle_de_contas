import mysql from "mysql2/promise";

// Pool singleton — reutiliza conexões entre requests
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host    : process.env.DB_HOST,
      port    : Number(process.env.DB_PORT ?? 3306),
      user    : process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      waitForConnections: true,
      connectionLimit   : 10,
      timezone          : "Z",
    });
  }
  return pool;
}
