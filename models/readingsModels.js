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
      if (err) console.error(`❌ ${i + 1}-jadvalda xatolik:`, err);
      else console.log(`✅ ${i + 1}-jadval yaratildi.`);
    });
  });
};

// Reading section va savollarni saqlovchi funksiyasi
const createReadingSection = ({ monthId, sections }, callback) => {
  db.beginTransaction((err) => {
    if (err) return callback(err);

    db.query(`DELETE FROM reading_sections WHERE monthId = ?`, [monthId], (err) => {
      if (err) return db.rollback(() => callback(err));

      const insertSection = (section, cb) => {
        db.query(
          `INSERT INTO reading_sections (monthId, part, intro, textTitle, text) VALUES (?, ?, ?, ?, ?)`,
          [monthId, section.part, section.intro, section.textTitle, section.text],
          (err, sectionRes) => {
            if (err) return cb(err);
            const sectionId = sectionRes.insertId;

            const insertGroup = (group, cbGroup) => {
              db.query(
                `INSERT INTO questions_groups (reading_section_id, questionTitle, questionIntro) VALUES (?, ?, ?)`,
                [sectionId, group.questionTitle, group.questionIntro],
                (err, groupRes) => {
                  if (err) return cbGroup(err);
                  const groupId = groupRes.insertId;

                  const tasks = group.questionsTask || [];
                  let doneCount = 0;

                  if (!tasks.length) return cbGroup(null);

                  tasks.forEach((task) => {
                    const number = task.number || task.numbers?.[0] || 0;
                    const options = task.options ? JSON.stringify(task.options) : null;

                    const questionContent =
                      task.type === 'table' ? JSON.stringify(task.table || []) : task.question;
                    db.query(
                      `INSERT INTO questions (questions_group_id, number, type, question, options, maxSelect) VALUES (?, ?, ?, ?, ?, ?)`,
                      [groupId, number, task.type, questionContent, options, task.maxSelect || 1],
                      (err, questionRes) => {
                        if (err) return cbGroup(err);
                        const questionId = questionRes.insertId;

                        if (task.type === 'text-multi' || task.type === 'table') {
                          const nums = task.numbers || [];
                          if (!nums.length) return finishQuestion();

                          let inserted = 0;
                          nums.forEach((num) => {
                            db.query(
                              `INSERT INTO text_multi_answers (question_id, number, answer) VALUES (?, ?, ?)`,
                              [questionId, num, ''],
                              (err) => {
                                if (err) return cbGroup(err);
                                inserted++;
                                if (inserted === nums.length) finishQuestion();
                              }
                            );
                          });
                        } else {
                          finishQuestion();
                        }

                        function finishQuestion() {
                          doneCount++;
                          if (doneCount === tasks.length) cbGroup(null);
                        }
                      }
                    );
                  });
                }
              );
            };

            const groups = section.question || [];
            if (!groups.length) return cb(null);

            let groupDone = 0;
            groups.forEach((g) => {
              insertGroup(g, (err) => {
                if (err) return cb(err);
                groupDone++;
                if (groupDone === groups.length) cb(null);
              });
            });
          }
        );
      };

      let sectionDone = 0;
      if (!sections.length) return db.commit(() => callback(null, { message: 'Bo‘limlar yo‘q' }));

      sections.forEach((section) => {
        insertSection(section, (err) => {
          if (err) return db.rollback(() => callback(err));
          sectionDone++;
          if (sectionDone === sections.length) {
            db.commit((err) => {
              if (err) return db.rollback(() => callback(err));
              callback(null, { message: '✅ Maʼlumotlar muvaffaqiyatli qo‘shildi' });
            });
          }
        });
      });
    });
  });
};

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
          sectionCount++;
          if (sectionCount === sections.length) callback(null, result);
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

              // Agar table bo‘lsa, uni JSON qilib ajrat
              if (question.type === "table") {
                try {
                  question.table = JSON.parse(question.question || "[]");
                } catch (e) {
                  question.table = [];
                }
                question.question = null; // endi bu JSON emas
              }

              if (question.type === 'text-multi' || question.type === 'table') {
                db.query(`SELECT * FROM text_multi_answers WHERE question_id = ?`, [question.id], (err, answers) => {
                  if (err) return callback(err);
                  question.answers = answers || [];
                  question.numbers = answers.map(ans => ans.number);
                  finalQuestions.push(question);
                  questionCount++;
                  if (questionCount === questions.length) {
                    group.questionsTask = finalQuestions;
                    finalizeGroup();
                  }
                });
              } else {
                question.answers = [];
                question.numbers = question.number ? [question.number] : [];
                finalQuestions.push(question);
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
                sectionCount++;
                if (sectionCount === sections.length) {
                  callback(null, result);
                }
              }
            }
          });
        });
      });
    });
  });
};

module.exports = {
  createReadingTables,
  createReadingSection,
  getReadingByMonthId,
};