const { saveAudio, getAudiosByMonth, deleteAudiosByMonth } = require("../models/audioModel");

const addAudioTask = (req, res) => {
    const { monthId, inputIndex } = req.body;
    const file = req.file;

    if (!monthId || file === undefined || inputIndex === undefined) {
        return res.status(400).json({ message: "monthId, inputIndex and audio file are required" });
    }

    saveAudio(monthId, inputIndex, file, (err) => {
        if (err) return res.status(500).json({ message: "Error while saving audio", error: err });

        res.status(201).json({ message: "Audio uploaded successfully", filename: file.filename });
    });
};

const getAudioTasks = (req, res) => {
    const monthId = req.params.monthId || req.query.monthId;
    if (!monthId) {
        return res.status(400).json({ message: "monthId is required" });
    }
    getAudiosByMonth(monthId, (err, audios) => {
        if (err) {
            return res.status(500).json({ message: "Error while fetching audio tasks", error: err });
        }
        res.status(200).json(audios);
    });
};

const deleteAudioTasksByMonth = (req, res) => {
    const monthId = req.params.monthId || req.query.monthId;

    if (!monthId) {
        return res.status(400).json({ message: "monthId is required" });
    }

    deleteAudiosByMonth(monthId, (err) => {
        if (err) return res.status(500).json({ message: "Error while deleting audio files", error: err });

        res.status(200).json({ message: "All audio files were successfully deleted" });
    });
};

module.exports = {
    addAudioTask,
    getAudioTasks,
    deleteAudioTasksByMonth
};
