const { upsertWritingTask, getWritingTask } = require('../models/writingModel');

// Writing qo‘shish
const setWriting = (req, res) => {
  const mock_id = req.params.mock_id;
  const { task1, task2 } = req.body;

  if (!task1 || !task2) {
    return res.status(400).json({ msg: "Please complete both writing tasks." });
  }

  upsertWritingTask(mock_id, task1, task2, (err, id) => {
    if (err) {
      return res.status(500).json({ msg: "Error adding writing", error: err.message });
    }
    res.status(201).json({ msg: "Writing added", id });
  });
};

// Writinglarni olish
const getWriting = (req, res) => {
  const mock_id = req.params.mock_id;

  getWritingTask(mock_id, (err, rows) => {
    if (err) {
      return res.status(500).json({ msg: "Error retrieving data", error: err.message });
    }
    res.status(200).json(rows);
  });
};

module.exports = {
  setWriting,
  getWriting
};
