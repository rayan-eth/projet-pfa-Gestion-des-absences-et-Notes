const db = require('../config/database');

const getGradesByStudent = (req, res) => {
    const { student_id } = req.params;
    db.all(`SELECT g.*, s.name as subject_name FROM grades g JOIN subjects s ON g.subject_id = s.id WHERE g.student_id = ?`, [student_id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json(rows);
    });
};

const getGradesBySubject = (req, res) => {
    const { subject_id } = req.params;
    db.all(`SELECT g.*, u.name as student_name FROM grades g JOIN users u ON g.student_id = u.id WHERE g.subject_id = ?`, [subject_id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json(rows);
    });
};

const createGrade = (req, res) => {
    const { student_id, subject_id, score, date, description } = req.body;
    db.run(`INSERT INTO grades (student_id, subject_id, score, date, description) VALUES (?, ?, ?, ?, ?)`, 
        [student_id, subject_id, score, date, description], function(err) {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.status(201).json({ message: 'Grade added successfully', id: this.lastID });
    });
};

const updateGrade = (req, res) => {
    const { id } = req.params;
    const { score, description } = req.body;
    db.run(`UPDATE grades SET score = ?, description = ? WHERE id = ?`, [score, description, id], function(err) {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json({ message: 'Grade updated successfully' });
    });
};

const deleteGrade = (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM grades WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json({ message: 'Grade deleted successfully' });
    });
};

const getAllGrades = (req, res) => {
    db.all(`SELECT g.*, u.name as student_name, s.name as subject_name FROM grades g JOIN users u ON g.student_id = u.id JOIN subjects s ON g.subject_id = s.id`, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json(rows);
    });
};

module.exports = { getGradesByStudent, getGradesBySubject, createGrade, updateGrade, deleteGrade, getAllGrades };
