const { Pool } = require("pg"); // pg kutubxonasidagi Pool obyekti

// PostgreSQL konfigiratsiyasi
const pool = new Pool({
  user: "rahmadjon", // Ma'lumotlar bazasi foydalanuvchisi
  host: "0.0.0.0", // Ma'lumotlar bazasi manzili
  database: "ieltsmock", // Ma'lumotlar bazasi nomi
  password: "ieltsmock12345", // Parol
  port: 4010, // PostgreSQL default porti (MariaDB/MySQL odatda 3306)
  // Quyidagi sozlamalar MariaDB/MySQL'dagi 'connectionLimit'ga teng
  max: 10, // Pool'dagi maksimal ulanishlar soni
  idleTimeoutMillis: 30000, // Ulanish pool'da uzoq vaqt foydalanilmasa, tugatish (30 sekund)
  connectionTimeoutMillis: 2000, // Ulanishni olish uchun maksimal kutish (2 sekund)
});

// Ulanishni sinash (ixtiyoriy)
pool.on("connect", () => {
  console.log("PostgreSQL bazasi bilan muvaffaqiyatli ulandi.");
});

pool.on("error", (err) => {
  console.error("PostgreSQL ulanish poolida kutilmagan xato:", err);
});

module.exports = pool;
