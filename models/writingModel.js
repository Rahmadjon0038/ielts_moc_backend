const db = require('../config/db'); // pg pool ni import qilish

// ================== WRITING TASKS (ADMIN UCHUN) ===================

// Jadval yaratish (Model funksiyasi emas, shunchaki chaqiriladi)
const createWritingTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS writing_tasks (
      id SERIAL PRIMARY KEY,
      mock_id INT UNIQUE,
      task1 TEXT,
      task2 TEXT,
      task1_image TEXT,
      task2_image TEXT
    );
  `;
  db.query(query)
    .then(() => {
      console.log('✅ writing_tasks jadvali tayyor (Postgres)');
    })
    .catch((err) => {
      console.error('❌ Writing jadvalini yaratishda xatolik:', err.message);
    });
};

// Writing qo‘shish yoki yangilash (To'liq Promise/async ga o'tkazildi)
const upsertWritingTask = async (mock_id, task1, task2, task1Image, task2Image) => {
  const query = `
    INSERT INTO writing_tasks (mock_id, task1, task2, task1_image, task2_image)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (mock_id) 
    DO UPDATE SET
      task1 = EXCLUDED.task1,
      task2 = EXCLUDED.task2,
      task1_image = EXCLUDED.task1_image,
      task2_image = EXCLUDED.task2_image;
  `;
  
  try {
    await db.query(query, [mock_id, task1, task2, task1Image, task2Image]);
    return true;
  } catch (err) {
    throw err;
  }
};

// Writingni olish (To'liq Promise/async ga o'tkazildi)
const getWritingTask = async (mock_id) => {
  const query = `SELECT task1, task2, task1_image, task2_image FROM writing_tasks WHERE mock_id = $1`;
  
  try {
    const result = await db.query(query, [mock_id]);
    return result.rows[0] || null;
  } catch (err) {
    throw err;
  }
};

// ================== WRITING ANSWERS (USER) ===================

const createWritingAnswersTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS writing_answers (
      id SERIAL PRIMARY KEY,
      user_id INT,
      month_id INT,
      section VARCHAR(100),
      task1 TEXT,
      task2 TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      
      UNIQUE (user_id, month_id, section) 
    );
  `;
  db.query(query)
    .then(() => {
      console.log('✅ writing_answers jadvali tayyor (Postgres)');
    })
    .catch((err) => {
      console.error('❌ writing_answers jadvalini yaratishda xatolik:', err.message);
    });
};

// Javobni saqlash/yangilash (To'liq Promise/async ga o'tkazildi)
const saveUserWritingAnswer = async (userId, monthId, section, answers) => {
  const query = `
    INSERT INTO writing_answers (user_id, month_id, section, task1, task2)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id, month_id, section)
    DO UPDATE SET
      task1 = EXCLUDED.task1,
      task2 = EXCLUDED.task2,
      created_at = NOW()
    RETURNING id;
  `;
  
  try {
    const result = await db.query(query, [userId, monthId, section, answers.task1, answers.task2]);
    return result.rows[0].id;
  } catch (err) {
    throw err;
  }
};

// Javoblarni olish (To'liq Promise/async ga o'tkazildi)
const getWritingAnswersByMonthAndUser = async (monthId, userId) => {
  const query = `
    SELECT * FROM writing_answers
    WHERE month_id = $1 AND user_id = $2
  `;
  try {
    const result = await db.query(query, [monthId, userId]);
    return result.rows;
  } catch (err) {
    throw err;
  }
};

// ================== RAITINGS ===================

const createRaitingsTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS raitings (
      id SERIAL PRIMARY KEY,
      user_id INT,
      month_id INT,
      section VARCHAR(50),
      score VARCHAR(10),
      comment TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, month_id, section)
    );
  `;
  db.query(query)
    .then(() => {
      console.log('✅ raitings jadvali tayyor (Postgres)');
    })
    .catch((err) => {
      console.error('❌ Raitings jadvalini yaratishda xatolik:', err.message);
    });
};

// Bahoni saqlash yoki yangilash (To'liq Promise/async ga o'tkazildi)
const upsertUserRaiting = async (user_id, month_id, section, score, comment) => {
  const query = `
    INSERT INTO raitings (user_id, month_id, section, score, comment)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id, month_id, section)
    DO UPDATE SET
      score = EXCLUDED.score,
      comment = EXCLUDED.comment;
  `;
  try {
    await db.query(query, [user_id, month_id, section, score, comment]);
    return true;
  } catch (err) {
    throw err;
  }
};

// Bahoni olish (To'liq Promise/async ga o'tkazildi)
const getUserRaitingmodel = async (user_id, month_id, section) => {
  const query = `
    SELECT * FROM raitings
    WHERE user_id = $1 AND month_id = $2 AND section = $3
  `;
  try {
    const result = await db.query(query, [user_id, month_id, section]);
    return result.rows[0] || null;
  } catch (err) {
    throw err;
  }
};

// ================== STATISTICS ===================

// Statistika olish (To'liq Promise/async ga o'tkazildi)
const getMonthStatistics = async (monthId) => {
  const query = `
    SELECT 
      u.id AS user_id,
      u.username,
      COUNT(DISTINCT r.section) AS rated_sections
    FROM users u
    JOIN writing_answers wa ON u.id = wa.user_id AND wa.month_id = $1
    LEFT JOIN raitings r 
      ON wa.user_id = r.user_id AND wa.month_id = r.month_id
    WHERE wa.month_id = $1
    GROUP BY u.id, u.username
  `;
  // Izoh: GROUP BY 'u.id' va 'u.username' bo'lishi kerak, shunda u.username SELECT qilinishi mumkin.
  
  try {
    const result = await db.query(query, [monthId]);
    return result.rows;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  // Admin
  createWritingTable,
  upsertWritingTask,
  getWritingTask,
  // User
  createWritingAnswersTable,
  saveUserWritingAnswer,
  getWritingAnswersByMonthAndUser,
  // Raitings
  createRaitingsTable,
  upsertUserRaiting,
  getUserRaitingmodel,
  // Stats
  getMonthStatistics
};