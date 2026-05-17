const db = require('../config/database');

const getAllUsers = (req, res) => {
    db.all(`SELECT id, name, email, role, class_id FROM users`, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json(rows);
    });
};

const getStudentsByClass = (req, res) => {
    const { class_id } = req.params;
    db.all(`SELECT id, name, email FROM users WHERE role = 'STUDENT' AND class_id = ?`, [class_id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json(rows);
    });
};

const updateUser = (req, res) => {
    const { id } = req.params;
    const { name, email, role, class_id } = req.body;
    db.run(`UPDATE users SET name = ?, email = ?, role = ?, class_id = ? WHERE id = ?`, 
        [name, email, role, class_id || null, id], function(err) {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json({ message: 'User updated successfully' });
    });
};

const deleteUser = (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM users WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json({ message: 'User deleted successfully' });
    });
};

module.exports = { getAllUsers, getStudentsByClass, updateUser, deleteUser };
