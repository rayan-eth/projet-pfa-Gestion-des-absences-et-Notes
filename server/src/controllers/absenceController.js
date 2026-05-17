const db = require('../config/database');

const getAbsencesByStudent = (req, res) => {
    const { student_id } = req.params;
    db.all(`SELECT * FROM absences WHERE student_id = ?`, [student_id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json(rows);
    });
};

const getAllAbsences = (req, res) => {
    db.all(`SELECT a.*, u.name as student_name FROM absences a JOIN users u ON a.student_id = u.id`, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json(rows);
    });
};

const createAbsence = (req, res) => {
    const { student_id, date, is_justified, justification_reason } = req.body;
    db.run(`INSERT INTO absences (student_id, date, is_justified, justification_reason) VALUES (?, ?, ?, ?)`, 
        [student_id, date, is_justified ? 1 : 0, justification_reason || null], function(err) {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.status(201).json({ message: 'Absence recorded successfully', id: this.lastID });
    });
};

const updateAbsence = (req, res) => {
    const { id } = req.params;
    const { is_justified, justification_reason } = req.body;
    db.run(`UPDATE absences SET is_justified = ?, justification_reason = ? WHERE id = ?`, 
        [is_justified ? 1 : 0, justification_reason || null, id], function(err) {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json({ message: 'Absence updated successfully' });
    });
};

const deleteAbsence = (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM absences WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json({ message: 'Absence deleted successfully' });
    });
};

module.exports = { getAbsencesByStudent, getAllAbsences, createAbsence, updateAbsence, deleteAbsence };
