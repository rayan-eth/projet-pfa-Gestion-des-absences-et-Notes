const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Users Table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('ADMIN', 'TEACHER', 'STUDENT')),
                class_id INTEGER,
                FOREIGN KEY (class_id) REFERENCES classes(id)
            )
        `);

        // Classes Table
        db.run(`
            CREATE TABLE IF NOT EXISTS classes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                level TEXT NOT NULL
            )
        `);

        // Modules Table
        db.run(`
            CREATE TABLE IF NOT EXISTS modules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                field_of_study TEXT NOT NULL,
                academic_year TEXT NOT NULL,
                semester TEXT NOT NULL
            )
        `);

        // Subjects Table
        db.run(`
            CREATE TABLE IF NOT EXISTS subjects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                teacher_id INTEGER,
                module_id INTEGER,
                FOREIGN KEY (teacher_id) REFERENCES users(id),
                FOREIGN KEY (module_id) REFERENCES modules(id)
            )
        `);
        
        // Attempt to add module_id to subjects if it doesn't exist (Migration)
        db.run(`ALTER TABLE subjects ADD COLUMN module_id INTEGER REFERENCES modules(id)`, function(err) {
            // Ignore error if column already exists
        });

        // Grades Table
        db.run(`
            CREATE TABLE IF NOT EXISTS grades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                subject_id INTEGER NOT NULL,
                score REAL NOT NULL,
                date TEXT NOT NULL,
                description TEXT,
                FOREIGN KEY (student_id) REFERENCES users(id),
                FOREIGN KEY (subject_id) REFERENCES subjects(id)
            )
        `);

        // Absences Table
        db.run(`
            CREATE TABLE IF NOT EXISTS absences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                date TEXT NOT NULL,
                is_justified BOOLEAN DEFAULT 0,
                justification_reason TEXT,
                FOREIGN KEY (student_id) REFERENCES users(id)
            )
        `);

        // Timetables Table
        db.run(`
            CREATE TABLE IF NOT EXISTS timetables (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                class_id INTEGER NOT NULL,
                subject_id INTEGER NOT NULL,
                teacher_id INTEGER NOT NULL,
                day_of_week TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                academic_year TEXT DEFAULT '2026-2027',
                FOREIGN KEY (class_id) REFERENCES classes(id),
                FOREIGN KEY (subject_id) REFERENCES subjects(id),
                FOREIGN KEY (teacher_id) REFERENCES users(id)
            )
        `);
        
        console.log('Database tables initialized.');
    });
}

module.exports = db;
