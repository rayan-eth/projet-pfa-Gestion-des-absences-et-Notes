const db = require('../config/database');

const getAllTimetables = (req, res) => {
    db.all(`
        SELECT t.*, c.name as class_name, s.name as subject_name, u.name as teacher_name 
        FROM timetables t 
        JOIN classes c ON t.class_id = c.id 
        JOIN subjects s ON t.subject_id = s.id 
        JOIN users u ON t.teacher_id = u.id
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json(rows);
    });
};

const getTimetablesByClass = (req, res) => {
    const { class_id } = req.params;
    db.all(`
        SELECT t.*, c.name as class_name, s.name as subject_name, u.name as teacher_name 
        FROM timetables t 
        JOIN classes c ON t.class_id = c.id 
        JOIN subjects s ON t.subject_id = s.id 
        JOIN users u ON t.teacher_id = u.id
        WHERE t.class_id = ?
    `, [class_id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json(rows);
    });
};

const getTimetablesByTeacher = (req, res) => {
    const { teacher_id } = req.params;
    db.all(`
        SELECT t.*, c.name as class_name, s.name as subject_name, u.name as teacher_name 
        FROM timetables t 
        JOIN classes c ON t.class_id = c.id 
        JOIN subjects s ON t.subject_id = s.id 
        JOIN users u ON t.teacher_id = u.id
        WHERE t.teacher_id = ?
    `, [teacher_id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json(rows);
    });
};

const createTimetable = (req, res) => {
    const { class_id, subject_id, teacher_id, day_of_week, start_time, end_time, academic_year } = req.body;
    db.run(`
        INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, start_time, end_time, academic_year) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [class_id, subject_id, teacher_id, day_of_week, start_time, end_time, academic_year || '2026-2027'], function(err) {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.status(201).json({ message: 'Timetable entry created successfully', id: this.lastID });
    });
};

const deleteTimetable = (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM timetables WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json({ message: 'Timetable entry deleted successfully' });
    });
};

module.exports = { getAllTimetables, getTimetablesByClass, getTimetablesByTeacher, createTimetable, deleteTimetable };
