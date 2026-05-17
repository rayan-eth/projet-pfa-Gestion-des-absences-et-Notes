const db = require('../config/database');

const getAllModules = (req, res) => {
    db.all('SELECT * FROM modules', [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json(rows);
    });
};

const createModule = (req, res) => {
    const { name, field_of_study, academic_year, semester } = req.body;
    db.run(
        'INSERT INTO modules (name, field_of_study, academic_year, semester) VALUES (?, ?, ?, ?)',
        [name, field_of_study, academic_year, semester],
        function(err) {
            if (err) return res.status(500).json({ message: 'Database error', error: err.message });
            res.status(201).json({ message: 'Module created successfully', id: this.lastID });
        }
    );
};

const deleteModule = (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM modules WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json({ message: 'Module deleted successfully' });
    });
};

module.exports = { getAllModules, createModule, deleteModule };
