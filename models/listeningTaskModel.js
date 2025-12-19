const db = require("../config/db"); // pg pool ni import qilish

// Listening jadvalini yaratish (Model funksiyasi emas, shunchaki chaqiriladi)
const createListeningTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS listening_tests (
      id SERIAL PRIMARY KEY,
      month_id INT NOT NULL UNIQUE,
      test_data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.query(query)
    .then(() => console.log("Listening jadval muvaffaqiyatli yaratildi ."))
    .catch((err) => console.error("Listening jadval yaratishda xatolik:", err));
};

// Listening test saqlash/yangilash (To'liq Promise/async ga o'tkazildi)
// ✅ callback argumenti olib tashlandi
const saveListeningTest = async (monthId, testData) => {
  // ⚠️ Izoh: Bu yerda MySQL'dagi ON DUPLICATE KEY UPDATE o'rniga
  // PostgreSQLning INSERT ... ON CONFLICT DO UPDATE sintaksisini ishlatamiz,
  // bu SELECT/UPDATE/INSERT ketma-ketligidan ko'ra samaraliroq.

  const query = `
    INSERT INTO listening_tests (month_id, test_data)
    VALUES ($1, $2)
    ON CONFLICT (month_id) DO UPDATE
    SET 
      test_data = EXCLUDED.test_data,
      updated_at = now()
    RETURNING id;
  `;

  try {
    const result = await db.query(query, [monthId, testData]); // testData to'g'ridan-to'g'ri JSONB sifatida uzatiladi
    return result.rows[0].id; // Kiritilgan yoki yangilangan ID ni qaytaramiz
  } catch (err) {
    throw err;
  }
};

// Month ID bo'yicha listening test olish (To'liq Promise/async ga o'tkazildi)
// ✅ callback argumenti olib tashlandi
const getListeningTestByMonth = async (monthId) => {
  const query =
    "SELECT id, month_id, test_data, created_at, updated_at FROM listening_tests WHERE month_id = $1";

  try {
    const result = await db.query(query, [monthId]);

    // Yagona qatorni yoki null qaytaramiz
    return result.rows[0] || null;
  } catch (err) {
    throw err;
  }
};

// Barcha listening testlarni olish (To'liq Promise/async ga o'tkazildi)
// ✅ callback argumenti olib tashlandi
const getAllListeningTests = async () => {
  const query =
    "SELECT id, month_id, created_at, updated_at FROM listening_tests ORDER BY month_id DESC";

  try {
    const result = await db.query(query);
    // Barcha qatorlarni massiv sifatida qaytaramiz
    return result.rows;
  } catch (err) {
    throw err;
  }
};

// Listening test o'chirish (To'liq Promise/async ga o'tkazildi)
// ✅ callback argumenti olib tashlandi
const deleteListeningTest = async (monthId) => {
  const query = "DELETE FROM listening_tests WHERE month_id = $1";

  try {
    const result = await db.query(query, [monthId]);
    return result.rowCount; // O'chirilgan qatorlar sonini qaytaramiz
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createListeningTable,
  saveListeningTest,
  getListeningTestByMonth,
  getAllListeningTests,
  deleteListeningTest,
};
