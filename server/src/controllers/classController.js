const db = require('../config/database');

const getAllClasses = (req, res) => {
    db.all(`SELECT * FROM classes`, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json(rows);
    });
};

const createClass = (req, res) => {
    const { name, level } = req.body;
    db.run(`INSERT INTO classes (name, level) VALUES (?, ?)`, [name, level], function(err) {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.status(201).json({ message: 'Class created successfully', id: this.lastID });
    });
};

const deleteClass = (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM classes WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json({ message: 'Class deleted successfully' });
    });
};

module.exports = { getAllClasses, createClass, deleteClass };
