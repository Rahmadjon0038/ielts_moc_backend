// models/readingModel.js
const db = require('../config/db'); // callback style

// Tablelarni yaratish
const createTables = () => {
db.query(`
    CREATE TABLE IF NOT EXISTS months (
      monthId INT UNSIGNED NOT NULL AUTO_INCREMENT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (monthId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  db.query(`
    CREATE TABLE IF NOT EXISTS sections (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      monthId INT UNSIGNED NOT NULL,
      part VARCHAR(255) NOT NULL,
      intro TEXT,
      textTitle VARCHAR(255),
      text TEXT,
      PRIMARY KEY (id),
      CONSTRAINT fk_sections_month FOREIGN KEY (monthId)
        REFERENCES months(monthId)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  db.query(`
   CREATE TABLE IF NOT EXISTS questions (
     id INT AUTO_INCREMENT PRIMARY KEY,
     questionTitle VARCHAR(255),
    questionIntro TEXT
)
  `);

  db.query(`
    CREATE TABLE IF NOT EXISTS questionsTask (
      id INT AUTO_INCREMENT PRIMARY KEY,
      questionId INT NOT NULL,
      number INT NOT NULL,
      type ENUM('text', 'radio', 'select') NOT NULL,
      question TEXT,
      options JSON,
      answer TEXT,
      FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
    )
  `);

  console.log('All tables created successfully');
};

// Ma'lumotlarni saqlash (callback style)
const saveReadingData = (monthId, sections, callback) => {
  db.query(
    'INSERT IGNORE INTO months (monthId) VALUES (?)',
    [monthId],
    (err) => {
      if (err) return callback(err);

      const saveSection = (index) => {
        if (index >= sections.length) return callback(null);

        const section = sections[index];
        db.query(
          'INSERT INTO sections (monthId, part, intro, textTitle, text) VALUES (?, ?, ?, ?, ?)',
          [monthId, section.part, section.intro, section.textTitle, section.text],
          (err, sectionResult) => {
            if (err) return callback(err);
            const sectionId = sectionResult.insertId;

            const saveQuestion = (qIndex) => {
              if (qIndex >= section.question.length) return saveSection(index + 1);

              const question = section.question[qIndex];
              db.query(
                'INSERT INTO questions (questionTitle, questionIntro) VALUES (?, ?)',
                [question.questionTitle, question.questionIntro],
                (err, questionResult) => {
                  if (err) return callback(err);
                  const questionId = questionResult.insertId;

                  const saveTask = (tIndex) => {
                    if (tIndex >= question.questionsTask.length) return saveQuestion(qIndex + 1);

                    const task = question.questionsTask[tIndex];
                    db.query(
                      'INSERT INTO questionsTask (questionId, number, type, question, options, answer) VALUES (?, ?, ?, ?, ?, ?)',
                      [questionId, task.number, task.type, task.question, JSON.stringify(task.options), task.answer],
                      (err) => {
                        if (err) return callback(err);
                        saveTask(tIndex + 1);
                      }
                    );
                  };

                  saveTask(0);
                }
              );
            };

            saveQuestion(0);
          }
        );
      };

      saveSection(0);
    }
  );
};

// Ma'lumotlarni olish (callback style)
const getReadingDataByMonth = (monthId, callback) => {
  db.query(
    `
    SELECT 
      s.id AS sectionId, s.part, s.intro, s.textTitle, s.text,
      q.id AS questionId, q.questionTitle, q.questionIntro,
      qt.id AS taskId, qt.number, qt.type, qt.question, qt.options, qt.answer
    FROM sections s
    LEFT JOIN questions q ON s.id = q.sectionId
    LEFT JOIN questionsTask qt ON q.id = qt.questionId
    WHERE s.monthId = ?
    ORDER BY s.id, q.id, qt.id
    `,
    [monthId],
    (err, rows) => {
      if (err) return callback(err);

      const result = { monthId, sections: [] };
      let currentSection = null;
      let currentQuestion = null;

      rows.forEach((row) => {
        if (!currentSection || currentSection.sectionId !== row.sectionId) {
          currentSection = {
            sectionId: row.sectionId,
            part: row.part,
            intro: row.intro,
            textTitle: row.textTitle,
            text: row.text,
            question: [],
          };
          result.sections.push(currentSection);
          currentQuestion = null;
        }

        if (row.questionId && (!currentQuestion || currentQuestion.questionId !== row.questionId)) {
          currentQuestion = {
            questionId: row.questionId,
            questionTitle: row.questionTitle,
            questionIntro: row.questionIntro,
            questionsTask: [],
          };
          currentSection.question.push(currentQuestion);
        }

        if (row.taskId) {
          currentQuestion.questionsTask.push({
            number: row.number,
            type: row.type,
            question: row.question,
            options: JSON.parse(row.options),
            answer: row.answer,
          });
        }
      });

      callback(null, result);
    }
  );
};

module.exports = { createTables, saveReadingData, getReadingDataByMonth };
