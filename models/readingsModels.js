const db = require('../config/db');

//  1. Jadval yaratish
const createReadingTables = () => {
  const createPartsTable = `
    CREATE TABLE IF NOT EXISTS reading_parts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      monthId INT NOT NULL,
      part INT NOT NULL,
      intro TEXT,
      passage TEXT
    )
  `;
  const createQuestionsTable = `
    CREATE TABLE IF NOT EXISTS reading_questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      partId INT NOT NULL,
      questionText TEXT,
      type ENUM('radio', 'select', 'input'),
      options TEXT,
      FOREIGN KEY (partId) REFERENCES reading_parts(id) ON DELETE CASCADE
    )
  `;

  // Avval parts jadvalini yaratamiz
  db.query(createPartsTable, (err) => {
    if (err) return console.error("❌ reading_parts jadvali xatosi:", err);
    console.log("✅ reading_parts jadvali yaratildi.");

    // Keyin questions jadvalini yaratamiz
    db.query(createQuestionsTable, (err) => {
      if (err) return console.error("❌ reading_questions jadvali xatosi:", err);
      console.log("✅ reading_questions jadvali yaratildi.");
    });
  });
};

// ➕ 2. Part qo‘shish
const createPart = ({ monthId, part, intro, passage }, callback) => {
  const query = `INSERT INTO reading_parts (monthId, part, intro, passage) VALUES (?, ?, ?, ?)`;
  db.query(query, [monthId, part, intro, passage], (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId); // partId
  });
};

// ➕ 3. Savol qo‘shish
const createQuestion = ({ partId, questionText, type, options }, callback) => {
  const optionsJSON = JSON.stringify(options || []);
  const query = `INSERT INTO reading_questions (partId, questionText, type, options) VALUES (?, ?, ?, ?)`;
  db.query(query, [partId, questionText, type, optionsJSON], (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId);
  });
};

// 🔍 4. monthId bo‘yicha barcha part va savollarni olish
const getReadingByMonthId = (monthId, callback) => {
  const query = `
    SELECT 
      rp.id AS partId,
      rp.part,
      rp.intro,
      rp.passage,
      rq.id AS questionId,
      rq.questionText,
      rq.type,
      rq.options
    FROM reading_parts rp
    LEFT JOIN reading_questions rq ON rp.id = rq.partId
    WHERE rp.monthId = ?
    ORDER BY rp.part, rq.id
  `;

  db.query(query, [monthId], (err, results) => {
    if (err) return callback(err);

    const partsMap = {};

    results.forEach(row => {
      if (!partsMap[row.partId]) {
        partsMap[row.partId] = {
          part: row.part,
          intro: row.intro,
          passage: row.passage,
          questions: []
        };
      }

      if (row.questionId) {
        partsMap[row.partId].questions.push({
          id: row.questionId,
          text: row.questionText,
          type: row.type,
          options: row.options ? JSON.parse(row.options) : []
        });
      }
    });

    const partsArray = Object.values(partsMap);
    callback(null, partsArray);
  });
};

module.exports = {
  createReadingTables,
  createPart,
  createQuestion,
  getReadingByMonthId
};
