const { saveAudio, getAudiosByMonth, deleteAudiosByMonth } = require("../models/audioModel");

const addAudioTask = (req, res) => {
    const { monthId, inputIndex } = req.body;
    const file = req.file;

    if (!monthId || file === undefined || inputIndex === undefined) {
        return res.status(400).json({ message: "monthId, inputIndex va audio fayl majburiy" });
    }

    saveAudio(monthId, inputIndex, file, (err) => {
        if (err) return res.status(500).json({ message: "Audio saqlashda xatolik", error: err });

        res.status(201).json({ message: "Audio muvaffaqiyatli yuklandi", filename: file.filename });
    });
};

const getAudioTasks = (req, res) => {
    const monthId = req.params.monthId || req.query.monthId;
    if (!monthId) {
        return res.status(400).json({ message: "monthId kerak" });
    }
    getAudiosByMonth(monthId, (err, audios) => {
        if (err) {
            return res.status(500).json({ message: "Audio tasks olishda xatolik", error: err });
        }
        res.status(200).json(audios);
    });
};




const deleteAudioTasksByMonth = (req, res) => {
    const monthId = req.params.monthId || req.query.monthId;

    if (!monthId) {
        return res.status(400).json({ message: "monthId kerak" });
    }

    deleteAudiosByMonth(monthId, (err) => {
        if (err) return res.status(500).json({ message: "Audio fayllarni o'chirishda xatolik", error: err });

        res.status(200).json({ message: "Barcha audio fayllar muvaffaqiyatli o'chirildi" });
    });
};

module.exports = {
    addAudioTask,
    getAudioTasks,
    deleteAudioTasksByMonth
};