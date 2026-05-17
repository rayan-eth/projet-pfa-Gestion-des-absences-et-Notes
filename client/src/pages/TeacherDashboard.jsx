import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, LogOut, Calendar, Clock } from 'lucide-react';
import axios from 'axios';
import CalendarView from '../components/CalendarView';

const TeacherDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('timetables');
    const [timetables, setTimetables] = useState([]);
    
    // Mes Classes states
    const [selectedClassId, setSelectedClassId] = useState('');
    const [studentsList, setStudentsList] = useState([]);

    // Grades states
    const [gradesClassId, setGradesClassId] = useState('');
    const [gradesSubjectId, setGradesSubjectId] = useState('');
    const [classStudentsForGrades, setClassStudentsForGrades] = useState([]);
    const [subjectGrades, setSubjectGrades] = useState([]);
    const [gradeForm, setGradeForm] = useState({});

    // Absences states
    const [absencesClassId, setAbsencesClassId] = useState('');
    const [absencesDate, setAbsencesDate] = useState(new Date().toISOString().split('T')[0]);
    const [classStudentsForAbsences, setClassStudentsForAbsences] = useState([]);
    const [allAbsences, setAllAbsences] = useState([]);

    const myClasses = Array.from(new Map(timetables.map(t => [t.class_id, { id: t.class_id, name: t.class_name }])).values());
    const mySubjectsForSelectedClass = Array.from(new Map(timetables.filter(t => t.class_id.toString() === gradesClassId).map(t => [t.subject_id, { id: t.subject_id, name: t.subject_name }])).values());
    
    useEffect(() => {
        if (!user || user.role !== 'TEACHER') {
            navigate('/');
        } else {
            fetchTimetables();
        }
    }, [user, navigate]);

    const fetchTimetables = async () => {
        try {
            const res = await axios.get(`http://localhost:5005/api/timetables/teacher/${user.id}`);
            setTimetables(res.data);
        } catch (error) { console.error('Error fetching timetables', error); }
    };

    const fetchStudentsForClass = async (classId) => {
        try {
            const res = await axios.get(`http://localhost:5005/api/users/class/${classId}`);
            setStudentsList(res.data);
        } catch (error) { console.error('Error fetching students', error); }
    };

    useEffect(() => {
        if (selectedClassId) {
            fetchStudentsForClass(selectedClassId);
        } else {
            setStudentsList([]);
        }
    }, [selectedClassId]);

    useEffect(() => {
        if (gradesClassId) {
            axios.get(`http://localhost:5005/api/users/class/${gradesClassId}`)
                .then(res => setClassStudentsForGrades(res.data))
                .catch(err => console.error(err));
            setGradesSubjectId(''); // Reset subject when class changes
            setSubjectGrades([]);
        }
    }, [gradesClassId]);

    useEffect(() => {
        if (gradesSubjectId) {
            fetchSubjectGrades(gradesSubjectId);
        } else {
            setSubjectGrades([]);
        }
    }, [gradesSubjectId]);

    const fetchSubjectGrades = async (subjectId) => {
        try {
            const res = await axios.get(`http://localhost:5005/api/grades/subject/${subjectId}`);
            setSubjectGrades(res.data);
        } catch (error) { console.error('Error fetching grades', error); }
    };

    useEffect(() => {
        if (absencesClassId) {
            axios.get(`http://localhost:5005/api/users/class/${absencesClassId}`)
                .then(res => setClassStudentsForAbsences(res.data))
                .catch(err => console.error(err));
            fetchAllAbsences();
        }
    }, [absencesClassId]);

    const fetchAllAbsences = async () => {
        try {
            const res = await axios.get('http://localhost:5005/api/absences');
            setAllAbsences(res.data);
        } catch (error) { console.error('Error fetching absences', error); }
    };

    const handleSaveGrade = async (studentId, existingGradeId) => {
        const data = gradeForm[studentId];
        if (!data || !data.score) return alert('Veuillez saisir une note valide.');
        
        try {
            if (existingGradeId) {
                await axios.put(`http://localhost:5005/api/grades/${existingGradeId}`, { score: data.score, description: data.description });
            } else {
                const today = new Date().toISOString().split('T')[0];
                await axios.post(`http://localhost:5005/api/grades`, { student_id: studentId, subject_id: gradesSubjectId, score: data.score, description: data.description, date: today });
            }
            alert('Note sauvegardée avec succès !');
            fetchSubjectGrades(gradesSubjectId);
        } catch (error) {
            alert('Erreur lors de la sauvegarde de la note.');
        }
    };

    const handleToggleAbsence = async (studentId) => {
        const existingAbsence = allAbsences.find(a => a.student_id === studentId && a.date === absencesDate);
        try {
            if (existingAbsence) {
                await axios.delete(`http://localhost:5005/api/absences/${existingAbsence.id}`);
            } else {
                await axios.post(`http://localhost:5005/api/absences`, { student_id: studentId, date: absencesDate });
            }
            fetchAllAbsences();
        } catch (error) {
            console.error(error.response?.data || error);
            alert("Erreur lors de la mise à jour de l'absence: " + (error.response?.data?.message || error.message));
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user || user.role !== 'TEACHER') return null;

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Espace Enseignant</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user.name}</p>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <a href="#" className={`nav-link ${activeTab === 'timetables' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('timetables'); }}>
                        <Calendar size={20} /> Mon Emploi du Temps
                    </a>
                    <a href="#" className={`nav-link ${activeTab === 'classes' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('classes'); }}>
                        <Users size={20} /> Mes Classes
                    </a>
                    <a href="#" className={`nav-link ${activeTab === 'grades' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('grades'); }}>
                        <FileText size={20} /> Saisie des notes
                    </a>
                    <a href="#" className={`nav-link ${activeTab === 'absences' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('absences'); }}>
                        <Clock size={20} /> Saisie des absences
                    </a>
                </nav>

                <button className="glass-button danger" onClick={handleLogout} style={{ width: '100%' }}>
                    <LogOut size={20} /> Déconnexion
                </button>
            </aside>

            <main className="main-content">
                <header style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem' }}>Tableau de bord</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Consultez vos classes et saisissez les notes.</p>
                </header>

                <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                    {activeTab === 'timetables' && (
                        <div>
                            <h2 style={{ marginBottom: '1.5rem' }}>Mon Emploi du Temps</h2>
                            <CalendarView events={timetables} />
                            {timetables.length === 0 && (
                                <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>Aucun créneau assigné.</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'classes' && (
                        <div>
                            <h2>Mes Classes</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Sélectionnez une classe pour voir la liste des étudiants inscrits.</p>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                {myClasses.length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)' }}>Vous n'êtes assigné à aucune classe pour le moment.</p>
                                ) : (
                                    myClasses.map(c => (
                                        <button 
                                            key={c.id} 
                                            className={`glass-button ${selectedClassId === c.id ? 'active' : ''}`}
                                            style={selectedClassId === c.id ? { background: 'var(--primary-color)', color: 'white' } : {}}
                                            onClick={() => setSelectedClassId(c.id)}
                                        >
                                            {c.name}
                                        </button>
                                    ))
                                )}
                            </div>

                            {selectedClassId && (
                                <div style={{ overflowX: 'auto' }}>
                                    <h3 style={{ marginBottom: '1rem' }}>Étudiants de {myClasses.find(c => c.id === selectedClassId)?.name}</h3>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Nom</th>
                                                <th>Email</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentsList.map(student => (
                                                <tr key={student.id}>
                                                    <td>{student.name}</td>
                                                    <td>{student.email}</td>
                                                </tr>
                                            ))}
                                            {studentsList.length === 0 && (
                                                <tr>
                                                    <td colSpan="2" style={{ textAlign: 'center' }}>Aucun étudiant dans cette classe.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'grades' && (
                        <div>
                            <h2>Saisie des notes</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Sélectionnez une classe puis une matière pour évaluer les étudiants.</p>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                                <select className="glass-input" value={gradesClassId} onChange={e => setGradesClassId(e.target.value)} style={{ flex: 1 }}>
                                    <option value="" style={{color: 'black'}}>1. Sélectionner une classe...</option>
                                    {myClasses.map(c => <option key={c.id} value={c.id} style={{color: 'black'}}>{c.name}</option>)}
                                </select>

                                <select className="glass-input" value={gradesSubjectId} onChange={e => setGradesSubjectId(e.target.value)} disabled={!gradesClassId} style={{ flex: 1 }}>
                                    <option value="" style={{color: 'black'}}>2. Sélectionner une matière...</option>
                                    {mySubjectsForSelectedClass.map(s => <option key={s.id} value={s.id} style={{color: 'black'}}>{s.name}</option>)}
                                </select>
                            </div>

                            {gradesSubjectId && (
                                <div style={{ overflowX: 'auto' }}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Nom de l'étudiant</th>
                                                <th style={{ width: '150px' }}>Note / 20</th>
                                                <th>Appréciation</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classStudentsForGrades.map(student => {
                                                const existingGrade = subjectGrades.find(g => g.student_id === student.id);
                                                const formData = gradeForm[student.id] || { score: existingGrade?.score || '', description: existingGrade?.description || '' };
                                                
                                                return (
                                                    <tr key={student.id}>
                                                        <td>{student.name}</td>
                                                        <td>
                                                            <input 
                                                                type="number" 
                                                                step="0.25" 
                                                                min="0" 
                                                                max="20" 
                                                                className="glass-input" 
                                                                placeholder="-" 
                                                                value={formData.score} 
                                                                onChange={e => setGradeForm({...gradeForm, [student.id]: { ...formData, score: e.target.value }})} 
                                                                style={{ padding: '0.5rem', width: '100px' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input 
                                                                type="text" 
                                                                className="glass-input" 
                                                                placeholder="Commentaire..." 
                                                                value={formData.description} 
                                                                onChange={e => setGradeForm({...gradeForm, [student.id]: { ...formData, description: e.target.value }})} 
                                                                style={{ padding: '0.5rem', width: '100%' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className="glass-button" 
                                                                style={{ padding: '0.5rem 1rem' }}
                                                                onClick={() => handleSaveGrade(student.id, existingGrade?.id)}
                                                            >
                                                                {existingGrade ? 'Mettre à jour' : 'Enregistrer'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {classStudentsForGrades.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: 'center' }}>Aucun étudiant dans cette classe.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'absences' && (
                        <div>
                            <h2>Saisie des absences</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Sélectionnez une classe et une date pour marquer les absences.</p>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                                <select className="glass-input" value={absencesClassId} onChange={e => setAbsencesClassId(e.target.value)} style={{ flex: 1 }}>
                                    <option value="" style={{color: 'black'}}>1. Sélectionner une classe...</option>
                                    {myClasses.map(c => <option key={c.id} value={c.id} style={{color: 'black'}}>{c.name}</option>)}
                                </select>

                                <input 
                                    type="date" 
                                    className="glass-input" 
                                    value={absencesDate} 
                                    onChange={e => { setAbsencesDate(e.target.value); fetchAllAbsences(); }} 
                                    disabled={!absencesClassId} 
                                    style={{ flex: 1 }}
                                />
                            </div>

                            {absencesClassId && (
                                <div style={{ overflowX: 'auto' }}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Nom de l'étudiant</th>
                                                <th>Statut (Le {absencesDate})</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classStudentsForAbsences.map(student => {
                                                const isAbsent = allAbsences.find(a => a.student_id === student.id && a.date === absencesDate);
                                                
                                                return (
                                                    <tr key={student.id}>
                                                        <td>{student.name}</td>
                                                        <td>
                                                            <span style={{ color: isAbsent ? 'var(--danger)' : 'var(--success)', fontWeight: 'bold' }}>
                                                                {isAbsent ? 'Absent(e)' : 'Présent(e)'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className={`glass-button ${isAbsent ? 'danger' : ''}`} 
                                                                style={{ padding: '0.5rem 1rem', background: isAbsent ? 'rgba(239, 68, 68, 0.2)' : '' }}
                                                                onClick={() => handleToggleAbsence(student.id)}
                                                            >
                                                                {isAbsent ? 'Marquer Présent' : 'Marquer Absent'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {classStudentsForAbsences.length === 0 && (
                                                <tr>
                                                    <td colSpan="3" style={{ textAlign: 'center' }}>Aucun étudiant dans cette classe.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TeacherDashboard;
