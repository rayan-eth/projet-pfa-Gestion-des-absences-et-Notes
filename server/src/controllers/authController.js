const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET } = require('../middlewares/authMiddleware');

const register = async (req, res) => {
    try {
        const { name, email, password, role, class_id } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const validRoles = ['ADMIN', 'TEACHER', 'STUDENT'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const query = `INSERT INTO users (name, email, password_hash, role, class_id) VALUES (?, ?, ?, ?, ?)`;
        db.run(query, [name, email, passwordHash, role, class_id || null], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ message: 'Email already exists' });
                }
                return res.status(500).json({ message: 'Database error', error: err.message });
            }
            res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const query = `SELECT * FROM users WHERE email = ?`;
        db.get(query, [email], async (err, user) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err.message });
            if (!user) return res.status(401).json({ message: 'Invalid credentials' });

            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

            const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

            res.json({
                message: 'Logged in successfully',
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role, class_id: user.class_id }
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { register, login };
