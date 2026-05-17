const db = require('../config/database');

const getAllSubjects = (req, res) => {
    db.all(`
        SELECT s.*, u.name as teacher_name, m.name as module_name, m.academic_year as academic_year, m.semester as semester 
        FROM subjects s 
        LEFT JOIN users u ON s.teacher_id = u.id 
        LEFT JOIN modules m ON s.module_id = m.id
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json(rows);
    });
};

const getTeacherSubjects = (req, res) => {
    const { teacher_id } = req.params;
    db.all(`SELECT * FROM subjects WHERE teacher_id = ?`, [teacher_id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json(rows);
    });
};

const createSubject = (req, res) => {
    const { name, teacher_id, module_id } = req.body;
    db.run(`INSERT INTO subjects (name, teacher_id, module_id) VALUES (?, ?, ?)`, [name, teacher_id || null, module_id || null], function(err) {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.status(201).json({ message: 'Subject created successfully', id: this.lastID });
    });
};

const deleteSubject = (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM subjects WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json({ message: 'Subject deleted successfully' });
    });
};

module.exports = { getAllSubjects, getTeacherSubjects, createSubject, deleteSubject };
