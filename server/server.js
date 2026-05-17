require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const classRoutes = require('./src/routes/classRoutes');
const subjectRoutes = require('./src/routes/subjectRoutes');
const gradeRoutes = require('./src/routes/gradeRoutes');
const absenceRoutes = require('./src/routes/absenceRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const timetableRoutes = require('./src/routes/timetableRoutes');
const moduleRoutes = require('./src/routes/moduleRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/absences', absenceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/modules', moduleRoutes);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'School Tracking System API is running.' });
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
