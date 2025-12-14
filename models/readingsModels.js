const db = require('../config/db'); // pg pool ni import qilish

// 1. Jadvallarni yaratish (CREATE TYPE xatosini ishonchli tekshiruv bilan tuzatish)
const createReadingTables = async () => {
  // 1️⃣ ENUM turi mavjudligini tekshirish
  const checkTypeQuery = `
    SELECT 1 FROM pg_type WHERE typname = 'question_type'
  `;
  
  try {
    const typeExistsResult = await db.query(checkTypeQuery);
    
    if (typeExistsResult.rows.length === 0) {
      // 2️⃣ Agar tur mavjud bo'lmasa, uni yaratamiz
      const createTypeQuery = `
        CREATE TYPE question_type AS ENUM ('radio', 'select', 'text-multi', 'table', 'checkbox');
      `;
      await db.query(createTypeQuery);
      console.log(`✅ 1-type 'question_type' yaratildi.`);
    } else {
      console.log(`✅ 1-type 'question_type' allaqachon mavjud.`);
    }

  } catch (err) {
    // Agar yuqoridagi 'SELECT'da ham xato kelsa (juda kam hollarda)
    console.error(`❌ ENUM turini boshqarishda xatolik:`, err.message);
  }

  // Qolgan jadvallar (CREATE TABLE IF NOT EXISTS mantiqi qoladi)
  const queries = [
    // 2. reading_sections
    `CREATE TABLE IF NOT EXISTS reading_sections (
      id SERIAL PRIMARY KEY,
      monthId INT NOT NULL,
      part VARCHAR(50),
      intro TEXT,
      textTitle VARCHAR(255),
      text TEXT,
      createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,
    // 3. questions_groups
    `CREATE TABLE IF NOT EXISTS questions_groups (
      id SERIAL PRIMARY KEY,
      reading_section_id INT NOT NULL,
      questionTitle VARCHAR(255),
      questionIntro TEXT,
      FOREIGN KEY (reading_section_id) REFERENCES reading_sections(id) ON DELETE CASCADE,
      createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,
    // 4. questions
    `CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      questions_group_id INT NOT NULL,
      number INT,
      type question_type NOT NULL,
      question JSONB, 
      options JSONB,
      maxSelect INT DEFAULT 1,
      answer JSONB DEFAULT NULL,
      FOREIGN KEY (questions_group_id) REFERENCES questions_groups(id) ON DELETE CASCADE,
      createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,
    // 5. text_multi_answers
    `CREATE TABLE IF NOT EXISTS text_multi_answers (
      id SERIAL PRIMARY KEY,
      question_id INT NOT NULL,
      number INT NOT NULL,
      answer TEXT DEFAULT '',
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
      createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`
  ];

  // Tranzaksiyasiz har birini ketma-ket ishga tushiramiz
  for (let i = 0; i < queries.length; i++) {
    try {
      await db.query(queries[i]);
      console.log(`✅ ${i + 2}-jadval yaratildi.`);
    } catch (err) {
      if (err.code !== '42P07') { // 42P07: Table allaqachon mavjud
        console.error(`❌ ${i + 2}-jadvalda xatolik:`, err.message);
      }
    }
  }
};


// 2. Reading Section yaratish (JSON.stringify tuzatishlari bilan)
const createReadingSection = async (data) => {
  const { monthId, sections = [] } = data;
  
  const client = await db.connect();

  try {
    await client.query('BEGIN'); // Tranzaksiyani boshlash

    // Eski ma'lumotlarni o'chirish (CASCADE tufayli avtomatik o'chadi, faqat asosiy sections kifoya)
    const deleteSections = `DELETE FROM reading_sections WHERE monthId = $1;`;
    await client.query(deleteSections, [monthId]);
    
    // 2️⃣ Yangi ma'lumotlarni kiritish (Looplar yordamida)
    for (const section of sections) {
      const { part, intro, textTitle, text, question: groups = [] } = section;

      // 2.1 Section INSERT
      const sectionQuery = `
        INSERT INTO reading_sections (monthId, part, intro, textTitle, text)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `;
      const sectionResult = await client.query(sectionQuery, [monthId, part, intro, textTitle, text]);
      const sectionId = sectionResult.rows[0].id;
      
      for (const group of groups) {
        const { questionTitle, questionIntro, questionsTask = [] } = group;

        // 2.2 Group INSERT
        const groupQuery = `
          INSERT INTO questions_groups (reading_section_id, questionTitle, questionIntro)
          VALUES ($1, $2, $3) RETURNING id
        `;
        const groupResult = await client.query(groupQuery, [sectionId, questionTitle, questionIntro]);
        const groupId = groupResult.rows[0].id;

        for (const q of questionsTask) {
          
          // ✅ TUZATISH 1: JSONB ustunlariga ma'lumot yuborishdan oldin JSON.stringify() ishlatish
          const optionsString = q.options ? JSON.stringify(q.options) : null;
          const answerString = q.answer ? JSON.stringify(q.answer) : null;
          
          let questionData = null;
          if (q.type === 'table' && q.table) {
             questionData = JSON.stringify(q.table); 
          } else if (q.question) {
             questionData = JSON.stringify(q.question); 
          }
          
          // 2.3 Question INSERT
          const questionQuery = `
            INSERT INTO questions (questions_group_id, number, type, question, options, maxSelect, answer)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
          `;

          const values = [
            groupId,
            q.number || null,
            q.type,
            questionData, // ✅ JSON String
            optionsString, // ✅ JSON String
            q.maxSelect || 1,
            answerString // ✅ JSON String
          ];
          
          const questionResult = await client.query(questionQuery, values);
          const questionId = questionResult.rows[0].id;

          // 2.4 Text Multi Answers INSERT (Agar kerak bo'lsa)
          if (['text-multi', 'table'].includes(q.type) && Array.isArray(q.numbers)) {
            const answersToInsert = [];
            
            // ✅ TUZATISH 2: Table va text-multi mantiqini soddalashtirish
            let numbersArray = q.numbers;
            if (q.type === 'table' && q.table?.rows) {
                numbersArray = q.table.rows.map(row => row.number).filter(n => n !== undefined);
            }
            
            numbersArray.forEach(num => {
                answersToInsert.push(questionId, num, ''); 
            });
            
            if (answersToInsert.length > 0) {
                 // Dinamik placeholderlarni yaratish
                 const placeholders = [];
                 for (let i = 0; i < answersToInsert.length / 3; i++) {
                     const base = i * 3;
                     placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3})`);
                 }

                const answerQuery = `
                  INSERT INTO text_multi_answers (question_id, number, answer)
                  VALUES ${placeholders.join(', ')}
                `;
                
                await client.query(answerQuery, answersToInsert);
            }
          }
        } // End questionsTask loop
      } // End groups loop
    } // End sections loop
    
    await client.query('COMMIT'); // Tranzaksiyani yakunlash
    return { message: '✅ Barcha sections yaratildi (eski maʼlumotlar yangilandi)' };

  } catch (err) {
    await client.query('ROLLBACK'); // Xatolik bo'lsa, qaytarish
    throw err; // Xatolikni yuqoriga uzatish
  } finally {
    client.release(); // Client ni poolga qaytarish
  }
};


// 3. Readingni monthId bo‘yicha olish (getReadingByMonthId)
const getReadingByMonthId = async ({ monthId }) => {
  try {
    // 1. Reading Sections
    const sectionResult = await db.query(`SELECT * FROM reading_sections WHERE monthId = $1`, [monthId]);
    const sections = sectionResult.rows;
    if (!sections.length) return [];

    const finalResult = [];

    // Asenkron Section Loop
    for (const section of sections) {
        // 2. Questions Groups
        const groupResult = await db.query(`SELECT * FROM questions_groups WHERE reading_section_id = $1`, [section.id]);
        const groups = groupResult.rows;
        section.question = groups;

        if (!groups.length) {
          finalResult.push(section);
          continue;
        }

        // Asenkron Group Loop
        for (const group of groups) {
            // 3. Questions
            const questionsResult = await db.query(`SELECT * FROM questions WHERE questions_group_id = $1`, [group.id]);
            const questions = questionsResult.rows;

            // Asenkron Question Loop
            const finalQuestions = await Promise.all(questions.map(async question => {
                
                question.options = question.options || [];

                if (question.type === 'table') {
                   question.table = question.question || [];
                   question.question = null; 
                } else {
                    question.question = question.question || null; 
                }
                
                if (['text-multi', 'table'].includes(question.type)) {
                  // 4. Text Multi Answers
                  const answersResult = await db.query(`SELECT * FROM text_multi_answers WHERE question_id = $1 ORDER BY number ASC`, [question.id]);
                  question.answers = answersResult.rows || [];
                  question.numbers = question.answers.map(ans => ans.number);
                } else {
                  question.answers = [];
                  question.numbers = question.number ? [question.number] : [];
                }
                return question;
            })); // End Promise.all (questions.map)

            group.questionsTask = finalQuestions;
        } // End Group Loop

        finalResult.push(section);
    } // End Section Loop

    return finalResult;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createReadingTables,
  createReadingSection,
  getReadingByMonthId,
};