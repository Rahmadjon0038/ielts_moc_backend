const { getReadingByMonthId, createReadingSection } = require('../models/readingsModels');
const Joi = require('joi');

// JSON validatsiya sxemasi
const readingSchema = Joi.object({
  monthId: Joi.number().required(),
  sections: Joi.array().items(
    Joi.object({
      part: Joi.string().required(),
      intro: Joi.string().required(),
      textTitle: Joi.string().required(),
      text: Joi.string().required(),
      question: Joi.array().items(
        Joi.object({
          questionTitle: Joi.string().required(),
          questionIntro: Joi.string().required(),
          questionsTask: Joi.array().items(
            Joi.object({
              type: Joi.string().valid('radio', 'select', 'checkbox', 'text-multi', 'table').required(),

              // `number` faqat radio/select/checkbox uchun kerak
              number: Joi.when('type', {
                is: Joi.valid('radio', 'select', 'checkbox'),
                then: Joi.number().required(),
                otherwise: Joi.forbidden()
              }),

              // `numbers` faqat text-multi/table uchun kerak
              numbers: Joi.when('type', {
                is: Joi.valid('text-multi', 'table'),
                then: Joi.array().items(Joi.number()).required(),
                otherwise: Joi.forbidden()
              }),

              question: Joi.when('type', {
                is: Joi.valid('radio', 'select', 'checkbox', 'text-multi'),
                then: Joi.string().required(),
                otherwise: Joi.forbidden()
              })
              ,

              // `options` faqat radio/select/checkbox uchun
              options: Joi.when('type', {
                is: Joi.valid('radio', 'select', 'checkbox'),
                then: Joi.array().items(Joi.string()).required(),
                otherwise: Joi.forbidden()
              }),

              // `maxSelect` faqat checkbox uchun optional
              maxSelect: Joi.when('type', {
                is: 'checkbox',
                then: Joi.number().optional(),
                otherwise: Joi.forbidden()
              }),

              // `table` faqat table tipida optional
              table: Joi.when('type', {
                is: 'table',
                then: Joi.any().optional(),
                otherwise: Joi.forbidden()
              }),

              // `answer` barcha turlar uchun optional (admin to'g'ri javob kiritadi)
              answer: Joi.any().optional(),
            })
          )
        })
      )
    })
  )
});

// 📥 getQuestionReading — monthId orqali savollarni olish
const getQuestionReading = (req, res) => {
  const { monthId } = req.params;

  getReadingByMonthId({ monthId: parseInt(monthId) }, (err, result) => {
    if (err) {
      console.error('Error fetching questions:', err);
      return res.status(500).json({ message: 'Server error occurred' });
    }
    if (!result.length) {
      return res.status(404).json({ message: 'No test found for this month' });
    }
    res.json(result);
  });
};

// 📤 addQuestionReading — yangi reading test qo‘shish yoki yangilash
const addQuestionReading = (req, res) => {
  const { error, value } = readingSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { monthId, sections } = value;

  createReadingSection({ monthId: parseInt(monthId), sections }, (err, result) => {
    if (err) {
      console.error('Error adding/updating test:', err);
      return res.status(500).json({ message: 'Error adding/updating test' });
    }
    res.status(201).json({ message: 'Reading test successfully updated', result });
  });
};

module.exports = { getQuestionReading, addQuestionReading };