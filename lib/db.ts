import mysql, { Pool, PoolOptions } from "mysql2/promise";

const config: PoolOptions = {
  host: "localhost",
  user: "root",
  password: "",
  database: "sistem_surat",
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
};

declare global {
  var __mysqlPool: Pool | undefined;
}

const pool: Pool =
  globalThis.__mysqlPool ??
  mysql.createPool(config);

if (!globalThis.__mysqlPool) {
  globalThis.__mysqlPool = pool;
}

export default pool;