const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.POSTGRES_USER || "rahmadjon",
  host: process.env.POSTGRES_HOST || process.env.PGHOST || "0.0.0.0",
  database: process.env.POSTGRES_DB || process.env.PGDATABASE || "ieltsmock",
  password: process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD || "ieltsmock12345",
  port: Number(process.env.POSTGRES_PORT || process.env.PGPORT || 4010),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Ulanishni sinash (ixtiyoriy)
pool.on("connect", () => {
  console.log("PostgreSQL bazasi bilan muvaffaqiyatli ulandi.");
});

pool.on("error", (err) => {
  console.error("PostgreSQL ulanish poolida kutilmagan xato:", err);
});

module.exports = pool;
