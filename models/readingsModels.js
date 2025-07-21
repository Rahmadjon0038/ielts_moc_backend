const db = require('../config/db');

// 1. Jadval yaratish
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

  db.query(createPartsTable, (err) => {
    if (err) return console.error("❌ reading_parts jadvali xatosi:", err);
    console.log("✅ reading_parts jadvali yaratildi.");

    db.query(createQuestionsTable, (err) => {
      if (err) return console.error("❌ reading_questions jadvali xatosi:", err);
      console.log("✅ reading_questions jadvali yaratildi.");
    });
  });
};

// 2. Part qo‘shish
const createPart = ({ monthId, part, intro, passage }, callback) => {
  const query = `INSERT INTO reading_parts (monthId, part, intro, passage) VALUES (?, ?, ?, ?)`;
  db.query(query, [monthId, part, intro, passage], (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId);
  });
};

// 3. Savol qo‘shish
const createQuestion = ({ partId, questionText, type, options }, callback) => {
  const optionsJSON = JSON.stringify(options || []);
  const query = `INSERT INTO reading_questions (partId, questionText, type, options) VALUES (?, ?, ?, ?)`;
  db.query(query, [partId, questionText, type, optionsJSON], (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId);
  });
};

// 4. Partni topish (upsert uchun)
const findPartByMonthAndPart = (monthId, part, callback) => {
  const query = `SELECT * FROM reading_parts WHERE monthId = ? AND part = ? LIMIT 1`;
  db.query(query, [monthId, part], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]); // bo‘sh bo‘lsa undefined qaytadi
  });
};

// 5. Partni yangilash
const updatePart = ({ partId, intro, passage }, callback) => {
  const query = `UPDATE reading_parts SET intro = ?, passage = ? WHERE id = ?`;
  db.query(query, [intro, passage, partId], callback);
};

// 6. Savollarni o‘chirish
const deleteQuestionsByPartId = (partId, callback) => {
  const query = `DELETE FROM reading_questions WHERE partId = ?`;
  db.query(query, [partId], callback);
};

// models/readingsModels.js

// 7. Barcha part va savollarni olish (monthId bo‘yicha)
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
    ORDER BY rp.part ASC, rq.id ASC
  `;

  db.query(query, [monthId], (err, results) => {
    if (err) return callback(err);

    const partsMap = {};
    let questionCounter = 1;

    results.forEach(row => {
      if (!partsMap[row.part]) {
        partsMap[row.part] = {
          part: row.part,
          intro: row.intro,
          passage: row.passage,
          questions: []
        };
      }

      if (row.questionId) {
        partsMap[row.part].questions.push({
          id: row.questionId,
          number: questionCounter++,
          text: row.questionText,
          type: row.type,
          options: row.options ? JSON.parse(row.options) : []
        });
      }
    });

    // part raqamiga qarab tartiblab massivga o‘tkazamiz
    const partsArray = Object.keys(partsMap)
      .sort((a, b) => a - b)
      .map(key => partsMap[key]);

    callback(null, partsArray);
  });
};


module.exports = {
  createReadingTables,
  createPart,
  createQuestion,
  findPartByMonthAndPart,
  updatePart,
  deleteQuestionsByPartId,
  getReadingByMonthId
};
