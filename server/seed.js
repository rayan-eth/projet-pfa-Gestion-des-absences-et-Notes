const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const seedDatabase = async () => {
    console.log('Seeding database with mock data...');

    // Helper to run queries with async/await
    const run = (query, params = []) => new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });

    try {
        const hashedPassword = await bcrypt.hash('password123', 10);

        // 1. Create Classes
        console.log('Creating Classes...');
        const classes = [
            { name: 'Groupe A', level: '1ère année' },
            { name: 'Groupe B', level: '1ère année' },
            { name: 'Groupe C', level: '2ème année' },
            { name: 'Groupe D', level: '3ème année' }
        ];
        const classIds = [];
        for (let c of classes) {
            classIds.push(await run(`INSERT INTO classes (name, level) VALUES (?, ?)`, [c.name, c.level]));
        }

        // 2. Create 10 Teachers
        console.log('Creating Teachers...');
        const teacherIds = [];
        for (let i = 1; i <= 10; i++) {
            const id = await run(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`, 
                [`Professeur ${i}`, `prof${i}@school.com`, hashedPassword, 'TEACHER']);
            teacherIds.push(id);
        }

        // 3. Create 10 Students
        console.log('Creating Students...');
        const studentIds = [];
        for (let i = 1; i <= 10; i++) {
            // Assign randomly to one of the classes
            const classId = classIds[Math.floor(Math.random() * classIds.length)];
            const id = await run(`INSERT INTO users (name, email, password_hash, role, class_id) VALUES (?, ?, ?, ?, ?)`, 
                [`Etudiant ${i}`, `student${i}@school.com`, hashedPassword, 'STUDENT', classId]);
            studentIds.push(id);
        }

        // 4. Create 5 Modules
        console.log('Creating Modules...');
        const modules = [
            { name: 'Développement Web', field_of_study: 'Génie Informatique', academic_year: '1ère année', semester: 'S1' },
            { name: 'Mathématiques Appliquées', field_of_study: 'Tronc Commun', academic_year: '1ère année', semester: 'S1' },
            { name: 'Bases de Données Avancées', field_of_study: 'Génie Logiciel', academic_year: '2ème année', semester: 'S3' },
            { name: 'Réseaux & Sécurité', field_of_study: 'Réseaux', academic_year: '3ème année', semester: 'S5' },
            { name: 'Intelligence Artificielle', field_of_study: 'Data Science', academic_year: '3ème année', semester: 'S5' }
        ];
        const moduleIds = [];
        for (let m of modules) {
            moduleIds.push(await run(`INSERT INTO modules (name, field_of_study, academic_year, semester) VALUES (?, ?, ?, ?)`, 
                [m.name, m.field_of_study, m.academic_year, m.semester]));
        }

        // 5. Create 2 Subjects per Module (10 total)
        console.log('Creating Subjects...');
        const subjectIds = [];
        let teacherIndex = 0;
        for (let mId of moduleIds) {
            for (let j = 1; j <= 2; j++) {
                const tId = teacherIds[teacherIndex % teacherIds.length];
                const id = await run(`INSERT INTO subjects (name, teacher_id, module_id) VALUES (?, ?, ?)`, 
                    [`Matière ${j} du Module ${mId}`, tId, mId]);
                subjectIds.push(id);
                teacherIndex++;
            }
        }

        // 6. Create Timetables
        console.log('Creating Timetables...');
        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
        for (let cId of classIds) {
            // Assign 3 random subjects to each class
            for (let i = 0; i < 3; i++) {
                const sId = subjectIds[Math.floor(Math.random() * subjectIds.length)];
                // Note: the teacher assigned to the subject isn't strictly enforced in the timetable schema, but let's just pick a random teacher for simplicity or the actual one.
                const tId = teacherIds[Math.floor(Math.random() * teacherIds.length)];
                const day = days[Math.floor(Math.random() * days.length)];
                
                // Random start time between 8 and 14
                const startH = Math.floor(Math.random() * 7) + 8;
                const start_time = `${startH < 10 ? '0' : ''}${startH}:00`;
                const end_time = `${startH + 2 < 10 ? '0' : ''}${startH + 2}:00`;

                await run(`INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, start_time, end_time, academic_year) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                    [cId, sId, tId, day, start_time, end_time, '2026-2027']);
            }
        }

        // 7. Create Grades
        console.log('Creating Grades...');
        const today = new Date().toISOString().split('T')[0];
        for (let sId of studentIds) {
            // Each student gets 2 random grades
            for (let i = 0; i < 2; i++) {
                const subId = subjectIds[Math.floor(Math.random() * subjectIds.length)];
                const score = (Math.random() * 10 + 10).toFixed(2); // Random note between 10 and 20
                await run(`INSERT INTO grades (student_id, subject_id, score, date, description) VALUES (?, ?, ?, ?, ?)`, 
                    [sId, subId, score, today, 'Bon travail.']);
            }
        }

        // 8. Create Absences
        console.log('Creating Absences...');
        for (let sId of studentIds) {
            // 50% chance a student has an absence
            if (Math.random() > 0.5) {
                const is_justified = Math.random() > 0.5;
                const reason = is_justified ? 'Certificat médical fourni' : '';
                await run(`INSERT INTO absences (student_id, date, is_justified, justification_reason) VALUES (?, ?, ?, ?)`, 
                    [sId, '2026-05-10', is_justified ? 1 : 0, reason]);
            }
        }

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        db.close();
    }
};

seedDatabase();
