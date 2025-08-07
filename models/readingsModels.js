const db = require('../config/db');

// Jadval yaratish
const createReadingTables = () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS reading_sections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      monthId INT NOT NULL,
      part VARCHAR(50),
      intro TEXT,
      textTitle VARCHAR(255),
      text TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS questions_groups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      reading_section_id INT NOT NULL,
      questionTitle VARCHAR(255),
      questionIntro TEXT,
      FOREIGN KEY (reading_section_id) REFERENCES reading_sections(id) ON DELETE CASCADE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      questions_group_id INT NOT NULL,
      number INT,
      type ENUM('radio', 'select', 'text-multi', 'table', 'checkbox') NOT NULL,
      question TEXT,
      options JSON,
      maxSelect INT DEFAULT 1,
      FOREIGN KEY (questions_group_id) REFERENCES questions_groups(id) ON DELETE CASCADE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS text_multi_answers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question_id INT NOT NULL,
      number INT NOT NULL,
      answer TEXT DEFAULT '',
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  queries.forEach((query, i) => {
    db.query(query, (err) => {
      if (err) console.error(`❌ ${i + 1}-jadvalda xatolik:`, err.sqlMessage);
      else console.log(`✅ ${i + 1}-jadval yaratildi.`);
    });
  });
};
const createReadingSection = (data, callback) => {
  const { monthId, sections = [] } = data;

  db.getConnection((err, connection) => {
    if (err) return callback(err);

    connection.beginTransaction(err => {
      if (err) {
        connection.release();
        return callback(err);
      }

      // 1️⃣ DELETE: questions
      const deleteQuestions = `
        DELETE qma FROM questions qma
        JOIN questions_groups qg ON qma.questions_group_id = qg.id
        JOIN reading_sections rs ON qg.reading_section_id = rs.id
        WHERE rs.monthId = ?;
      `;

      connection.query(deleteQuestions, [monthId], (err) => {
        if (err) return rollbackWithError(err);

        // 2️⃣ DELETE: questions_groups
        const deleteGroups = `
          DELETE qg FROM questions_groups qg
          JOIN reading_sections rs ON qg.reading_section_id = rs.id
          WHERE rs.monthId = ?;
        `;

        connection.query(deleteGroups, [monthId], (err) => {
          if (err) return rollbackWithError(err);

          // 3️⃣ DELETE: reading_sections
          const deleteSections = `
            DELETE FROM reading_sections WHERE monthId = ?;
          `;

          connection.query(deleteSections, [monthId], (err) => {
            if (err) return rollbackWithError(err);

            // 4️⃣ INSERT boshlaymiz
            insertSection(0);
          });
        });
      });

      // INSERT bo‘limlari
      const insertSection = (index) => {
        if (index >= sections.length) return commitSuccess();

        const { part, intro, textTitle, text, question = [] } = sections[index];

        const sectionQuery = `
          INSERT INTO reading_sections (monthId, part, intro, textTitle, text)
          VALUES (?, ?, ?, ?, ?)
        `;

        connection.query(sectionQuery, [monthId, part, intro, textTitle, text], (err, sectionResult) => {
          if (err) return rollbackWithError(err);

          const sectionId = sectionResult.insertId;
          const groups = question;

          const insertGroup = (groupIndex) => {
            if (groupIndex >= groups.length) return insertSection(index + 1);

            const { questionTitle, questionIntro, questionsTask = [] } = groups[groupIndex];

            const groupQuery = `
              INSERT INTO questions_groups (reading_section_id, questionTitle, questionIntro)
              VALUES (?, ?, ?)
            `;

            connection.query(groupQuery, [sectionId, questionTitle, questionIntro], (err, groupResult) => {
              if (err) return rollbackWithError(err);

              const groupId = groupResult.insertId;

              const insertQuestion = (qIndex) => {
                if (qIndex >= questionsTask.length) return insertGroup(groupIndex + 1);

                const q = questionsTask[qIndex];
                const options = q.options ? JSON.stringify(q.options) : null;
                const questionText = q.type === 'table' ? JSON.stringify(q.table) : q.question;
                const questionData = [
                  groupId,
                  q.number || null,
                  q.type,
                  questionText,
                  options,
                  q.maxSelect || 1
                ];

                const questionQuery = `
                  INSERT INTO questions (questions_group_id, number, type, question, options, maxSelect)
                  VALUES (?, ?, ?, ?, ?, ?)
                `;

                connection.query(questionQuery, questionData, (err, questionResult) => {
                  if (err) return rollbackWithError(err);

                  const questionId = questionResult.insertId;

                  if (['text-multi', 'table'].includes(q.type) && Array.isArray(q.numbers)) {
                    const answers = [];

                    if (q.type === 'table') {
                      const tableRows = q.table?.[0]?.rows || [];
                      tableRows.forEach(row => {
                        answers.push([questionId, row.number, row.question]);
                      });
                    } else {
                      q.numbers.forEach(num => {
                        answers.push([questionId, num, ""]);
                      });
                    }

                    const answerQuery = `
                      INSERT INTO text_multi_answers (question_id, number, answer)
                      VALUES ?
                    `;

                    connection.query(answerQuery, [answers], (err) => {
                      if (err) return rollbackWithError(err);
                      insertQuestion(qIndex + 1);
                    });
                  } else {
                    insertQuestion(qIndex + 1);
                  }
                });
              };

              insertQuestion(0);
            });
          };

          insertGroup(0);
        });
      };

      function rollbackWithError(err) {
        connection.rollback(() => {
          connection.release();
          callback(err);
        });
      }

      function commitSuccess() {
        connection.commit((err) => {
          if (err) return rollbackWithError(err);
          connection.release();
          callback(null, { message: '✅ Barcha sections yaratildi (eski maʼlumotlar yangilandi)' });
        });
      }
    });
  });
};



// Readingni monthId bo‘yicha olish
const getReadingByMonthId = ({ monthId }, callback) => {
  db.query(`SELECT * FROM reading_sections WHERE monthId = ?`, [monthId], (err, sections) => {
    if (err) return callback(err);
    if (!sections.length) return callback(null, []);

    const result = [];
    let sectionCount = 0;

    sections.forEach((section) => {
      db.query(`SELECT * FROM questions_groups WHERE reading_section_id = ?`, [section.id], (err, groups) => {
        if (err) return callback(err);

        if (!groups.length) {
          section.question = [];
          result.push(section);
          finalizeSection();
          return;
        }

        let groupCount = 0;
        groups.forEach((group) => {
          db.query(`SELECT * FROM questions WHERE questions_group_id = ?`, [group.id], (err, questions) => {
            if (err) return callback(err);

            if (!questions.length) {
              group.questionsTask = [];
              finalizeGroup();
              return;
            }

            let questionCount = 0;
            const finalQuestions = [];

            questions.forEach((question) => {
              question.options = question.options ? JSON.parse(question.options) : [];

              if (question.type === 'table') {
                try {
                  question.table = JSON.parse(question.question || "[]");
                } catch {
                  question.table = [];
                }
                question.question = null;
              }

              if (['text-multi', 'table'].includes(question.type)) {
                db.query(`SELECT * FROM text_multi_answers WHERE question_id = ?`, [question.id], (err, answers) => {
                  if (err) return callback(err);
                  question.answers = answers || [];
                  question.numbers = answers.map(ans => ans.number);
                  finalQuestions.push(question);
                  checkQuestionDone();
                });
              } else {
                question.answers = [];
                question.numbers = question.number ? [question.number] : [];
                finalQuestions.push(question);
                checkQuestionDone();
              }

              function checkQuestionDone() {
                questionCount++;
                if (questionCount === questions.length) {
                  group.questionsTask = finalQuestions;
                  finalizeGroup();
                }
              }
            });

            function finalizeGroup() {
              groupCount++;
              if (groupCount === groups.length) {
                section.question = groups;
                result.push(section);
                finalizeSection();
              }
            }
          });
        });
      });

      function finalizeSection() {
        sectionCount++;
        if (sectionCount === sections.length) {
          callback(null, result);
        }
      }
    });
  });
};

module.exports = {
  createReadingTables,
  createReadingSection,
  getReadingByMonthId,
};
