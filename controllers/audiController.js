const {
  saveAudio,
  getAudiosByMonth,
  deleteAudiosByMonth,
} = require("../models/audioModel");

// Audio faylni qo'shish (Async/await ga o'tkazildi)
const addAudioTask = async (req, res) => {
  const { monthId, inputIndex } = req.body;
  const file = req.file;

  // inputIndex ni raqamga o'tkazish
  const finalInputIndex = Number(inputIndex);

  if (
    !monthId ||
    file === undefined ||
    finalInputIndex === undefined ||
    isNaN(finalInputIndex)
  ) {
    return res
      .status(400)
      .json({ message: "monthId, inputIndex and audio file are required" });
  }

  try {
    // Model funksiyasi endi Promise qaytaradi
    await saveAudio(monthId, finalInputIndex, file);

    res
      .status(201)
      .json({
        message: "Audio uploaded successfully ",
        filename: file.filename,
      });
  } catch (err) {
    console.error("Error while saving audio :", err.message);
    return res
      .status(500)
      .json({ message: "Error while saving audio", error: err.message });
  }
};

// Audio fayllarni oy bo'yicha olish (Async/await ga o'tkazildi)
const getAudioTasks = async (req, res) => {
  const monthId = req.params.monthId || req.query.monthId;

  if (!monthId) {
    return res.status(400).json({ message: "monthId is required" });
  }

  try {
    // Model funksiyasi Promise orqali audiolarning massivini qaytaradi
    const audios = await getAudiosByMonth(monthId);

    res.status(200).json(audios);
  } catch (err) {
    console.error("Error while fetching audio tasks :", err.message);
    return res
      .status(500)
      .json({
        message: "Error while fetching audio tasks",
        error: err.message,
      });
  }
};

// Audio fayllarni oy bo'yicha o'chirish (Async/await ga o'tkazildi)
const deleteAudioTasksByMonth = async (req, res) => {
  const monthId = req.params.monthId || req.query.monthId;

  if (!monthId) {
    return res.status(400).json({ message: "monthId is required" });
  }

  try {
    // Model funksiyasi Promise orqali natijani qaytaradi
    await deleteAudiosByMonth(monthId);

    res
      .status(200)
      .json({ message: "All audio files were successfully deleted " });
  } catch (err) {
    console.error("Error while deleting audio files :", err.message);
    return res
      .status(500)
      .json({
        message: "Error while deleting audio files",
        error: err.message,
      });
  }
};

module.exports = {
  addAudioTask,
  getAudioTasks,
  deleteAudioTasksByMonth,
};
