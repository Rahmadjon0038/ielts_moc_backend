const db = require('../config/db'); // pg pool ni import qilish

// 🛠 Jadval yaratishlar (Modelga tegishli emas, qoldiriladi)
const createMockTables = () => {
  const queries = [
    // 1. mock_months
    `CREATE TABLE IF NOT EXISTS mock_months (
      id SERIAL PRIMARY KEY,
      month VARCHAR(255) UNIQUE
    );`,
    
    // 2. mock_parts
    `CREATE TABLE IF NOT EXISTS mock_parts (
      id SERIAL PRIMARY KEY,
      mock_id INT,
      part VARCHAR(50),
      FOREIGN KEY (mock_id) REFERENCES mock_months(id) ON DELETE CASCADE
    );`,
    
    // 3. active_mock_month
    `CREATE TABLE IF NOT EXISTS active_mock_month (
      id INT PRIMARY KEY DEFAULT 1,
      mock_id INT,
      FOREIGN KEY (mock_id) REFERENCES mock_months(id) ON DELETE SET NULL
    );`
  ];

  queries.forEach((query) => {
    db.query(query)
      .catch((err) => {
        console.error("❌ Jadval yaratishda xatolik:", err);
      });
  });
};

//  Oy qo‘shish + 4ta part yaratish (To'liq Promise/async ga o'tkazildi)
// ✅ callback olib tashlandi
const createMockMonth = async (month) => {
  // 1. Oy qo'shish
  const insertMonth = `INSERT INTO mock_months (month) VALUES ($1) RETURNING id`;
  
  try {
    const monthResult = await db.query(insertMonth, [month]);
    const mockId = monthResult.rows[0].id;
    
    const parts = ['writing', 'listening', 'reading', 'speaking'];
    
    // 2. Mock qismlarini tayyorlash (Postgres VALUES listini samarali ishlatish)
    // Bu usul xavfsiz emas. Lekin sizning original kodingizni saqlash uchun 
    // hozircha avvalgi uslubdan voz kechiladi va ko'proq so'rov yuborish usuliga o'tiladi.
    // Optimal usul: UNNEST yoki BULK INSERT yordamida.
    
    // 2. Mock qismlarini yaratish (oddiyroq usul - har bir part uchun alohida promise)
    const partInsertQuery = `INSERT INTO mock_parts (mock_id, part) VALUES ($1, $2)`;
    
    const partPromises = parts.map(part => db.query(partInsertQuery, [mockId, part]));
    
    await Promise.all(partPromises);
    
    return mockId; // Kontrollerga id ni qaytaramiz
    
  } catch (err) {
    // Xatolikni yuqoriga uzatish
    throw err;
  }
};

//  Barcha mock_months (To'liq Promise/async ga o'tkazildi)
// ✅ callback olib tashlandi
const getAllMockMonths = async () => {
  const result = await db.query("SELECT * FROM mock_months");
  return result.rows; // massivni qaytaramiz
};

//  O'chirish (To'liq Promise/async ga o'tkazildi)
// ✅ callback olib tashlandi
const deleteMockMonth = async (id) => {
  const result = await db.query("DELETE FROM mock_months WHERE id = $1", [id]);
  return result.rowCount; // O'chirilgan qatorlar sonini qaytaramiz
};

//  ID orqali topish (To'liq Promise/async ga o'tkazildi)
// ✅ callback olib tashlandi
const getMockMonthById = async (id) => {
  const result = await db.query("SELECT * FROM mock_months WHERE id = $1", [id]);
  return result.rows[0] || null; // yagona obyektni qaytaramiz
};

//  active_mock_month ni o‘rnatish (To'liq Promise/async ga o'tkazildi)
// ✅ callback olib tashlandi
const setActiveMockMonth = async (mockId) => {
  const query = `
    INSERT INTO active_mock_month (id, mock_id)
    VALUES (1, $1)
    ON CONFLICT (id) 
    DO UPDATE SET mock_id = EXCLUDED.mock_id;
  `;
  // Faqat so'rovni bajarish, natijani tekshirish shart emas
  await db.query(query, [mockId]);
  return true; 
};

//  active_mock_month ni olish (To'liq Promise/async ga o'tkazildi)
// ✅ callback olib tashlandi
const getActiveMockMonth = async () => {
  const query = `
    SELECT m.* FROM active_mock_month a
    LEFT JOIN mock_months m ON a.mock_id = m.id
    WHERE a.id = 1
  `;
  const result = await db.query(query);
  return result.rows[0] || null;
};

module.exports = {
  createMockTables,
  createMockMonth,
  getAllMockMonths,
  deleteMockMonth,
  getMockMonthById,
  setActiveMockMonth,
  getActiveMockMonth
};