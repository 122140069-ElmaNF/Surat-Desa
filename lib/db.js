import mysql from "mysql2/promise";

const config = {
  host: "localhost",
  user: "root",
  password: "",
  database: "sistem_surat",
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
};

// Reuse pool across module reloads (helps in Next dev mode)
let pool;
if (globalThis.__mysqlPool) {
  pool = globalThis.__mysqlPool;
} else {
  pool = mysql.createPool(config);
  globalThis.__mysqlPool = pool;
}

export default pool;