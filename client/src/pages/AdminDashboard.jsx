import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Clock, LogOut, Calendar, FileText } from 'lucide-react';
import axios from 'axios';
import CalendarView from '../components/CalendarView';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');
    const [usersList, setUsersList] = useState([]);
    const [classesList, setClassesList] = useState([]);
    const [modulesList, setModulesList] = useState([]);
    const [subjectsList, setSubjectsList] = useState([]);
    const [timetablesList, setTimetablesList] = useState([]);
    const [gradesList, setGradesList] = useState([]);
    const [absencesList, setAbsencesList] = useState([]);
    const [showAddUser, setShowAddUser] = useState(false);
    const [showAddTimetable, setShowAddTimetable] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'STUDENT', class_id: '' });
    const [newTimetable, setNewTimetable] = useState({ class_id: '', subject_id: '', teacher_id: '', day_of_week: 'Lundi', start_time: '08:00', end_time: '10:00', academic_year: '2026-2027' });
    const [newClass, setNewClass] = useState({ name: '', level: '' });
    const [newModule, setNewModule] = useState({ name: '', field_of_study: '', academic_year: '', semester: '' });
    const [newSubject, setNewSubject] = useState({ name: '', module_id: '', teacher_id: '' });
    const [errorMsg, setErrorMsg] = useState('');
    
    // Edit Modal States
    const [editingUser, setEditingUser] = useState(null);
    const [editingGrade, setEditingGrade] = useState(null);
    const [editingAbsence, setEditingAbsence] = useState(null);

    // Timetable Filter States
    const [timetableFilterType, setTimetableFilterType] = useState('CLASS');
    const [timetableFilterId, setTimetableFilterId] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
        } else {
            fetchUsers();
            fetchClasses();
            fetchModules();
            fetchSubjects();
            fetchTimetables();
            fetchGrades();
            fetchAbsences();
        }
    }, [user, navigate]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5005/api/users');
            setUsersList(res.data);
        } catch (error) {
            console.error('Error fetching users', error);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await axios.get('http://localhost:5005/api/classes');
            setClassesList(res.data);
        } catch (error) { console.error('Error fetching classes', error); }
    };

    const fetchModules = async () => {
        try {
            const res = await axios.get('http://localhost:5005/api/modules');
            setModulesList(res.data);
        } catch (error) { console.error('Error fetching modules', error); }
    };

    const fetchSubjects = async () => {
        try {
            const res = await axios.get('http://localhost:5005/api/subjects');
            setSubjectsList(res.data);
        } catch (error) { console.error('Error fetching subjects', error); }
    };

    const fetchTimetables = async () => {
        try {
            const res = await axios.get('http://localhost:5005/api/timetables');
            setTimetablesList(res.data);
        } catch (error) { console.error('Error fetching timetables', error); }
    };

    const fetchGrades = async () => {
        try {
            const res = await axios.get('http://localhost:5005/api/grades');
            setGradesList(res.data);
        } catch (error) { console.error('Error fetching grades', error); }
    };

    const fetchAbsences = async () => {
        try {
            const res = await axios.get('http://localhost:5005/api/absences');
            setAbsencesList(res.data);
        } catch (error) { console.error('Error fetching absences', error); }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            await axios.post('http://localhost:5005/api/auth/register', newUser);
            setShowAddUser(false);
            setNewUser({ name: '', email: '', password: '', role: 'STUDENT', class_id: '' });
            fetchUsers();
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Erreur lors de l\'ajout');
        }
    };

    const handleAddTimetable = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5005/api/timetables', newTimetable);
            setShowAddTimetable(false);
            fetchTimetables();
        } catch (error) { console.error('Error adding timetable', error); }
    };

    const handleAddClass = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5005/api/classes', newClass);
            setNewClass({ name: '', level: '' });
            fetchClasses();
        } catch (error) { console.error(error); }
    };

    const handleAddModule = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5005/api/modules', newModule);
            setNewModule({ name: '', field_of_study: '', academic_year: '', semester: '' });
            fetchModules();
        } catch (error) { console.error(error); }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5005/api/subjects', newSubject);
            setNewSubject({ name: '', module_id: '', teacher_id: '' });
            fetchSubjects();
        } catch (error) { console.error(error); }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user || user.role !== 'ADMIN') return null;

    return (
        <>
        <div className="app-container">
            <aside className="sidebar">
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Admin Portal</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user.name}</p>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <a href="#" className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('users'); }}>
                        <Users size={20} /> Utilisateurs
                    </a>
                    <a href="#" className={`nav-link ${activeTab === 'classes' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('classes'); }}>
                        <BookOpen size={20} /> Classes & Matières
                    </a>
                    <a href="#" className={`nav-link ${activeTab === 'timetables' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('timetables'); }}>
                        <Calendar size={20} /> Emploi du Temps
                    </a>
                    <a href="#" className={`nav-link ${activeTab === 'grades' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('grades'); }}>
                        <FileText size={20} /> Notes
                    </a>
                    <a href="#" className={`nav-link ${activeTab === 'absences' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('absences'); }}>
                        <Clock size={20} /> Absences
                    </a>
                </nav>

                <button className="glass-button danger" onClick={handleLogout} style={{ width: '100%' }}>
                    <LogOut size={20} /> Déconnexion
                </button>
            </aside>

            <main className="main-content">
                <header style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem' }}>Tableau de bord Administrateur</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gérez les utilisateurs, classes, et les absences.</p>
                </header>

                <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                    {activeTab === 'users' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2>Gestion des Utilisateurs</h2>
                                <button className="glass-button" onClick={() => setShowAddUser(!showAddUser)}>
                                    {showAddUser ? 'Annuler' : 'Ajouter un Utilisateur'}
                                </button>
                            </div>
                            
                            {showAddUser && (
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                    <h3 style={{ marginBottom: '1rem' }}>Nouvel Utilisateur</h3>
                                    {errorMsg && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{errorMsg}</p>}
                                    <form onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <input type="text" placeholder="Nom complet" className="glass-input" required
                                            value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                                        <input type="email" placeholder="Email" className="glass-input" required
                                            value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                                        <input type="password" placeholder="Mot de passe" className="glass-input" required
                                            value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                                        <select className="glass-input" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value, class_id: ''})}>
                                            <option value="STUDENT" style={{color: 'black'}}>Étudiant</option>
                                            <option value="TEACHER" style={{color: 'black'}}>Enseignant</option>
                                            <option value="ADMIN" style={{color: 'black'}}>Administrateur</option>
                                        </select>
                                        {newUser.role === 'STUDENT' && (
                                            <select className="glass-input" value={newUser.class_id || ''} onChange={e => setNewUser({...newUser, class_id: e.target.value ? parseInt(e.target.value) : ''})}>
                                                <option value="" style={{color: 'black'}}>Sélectionner une classe (optionnel)</option>
                                                {classesList.map(c => <option key={c.id} value={c.id} style={{color: 'black'}}>{c.name} - {c.level}</option>)}
                                            </select>
                                        )}
                                        <button type="submit" className="glass-button" style={{ gridColumn: '1 / -1' }}>Enregistrer</button>
                                    </form>
                                </div>
                            )}
                            <div style={{ overflowX: 'auto' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Nom</th>
                                            <th>Email</th>
                                            <th>Rôle</th>
                                            <th>Classe</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersList.map((u) => (
                                            <tr key={u.id}>
                                                <td>{u.name}</td>
                                                <td>{u.email}</td>
                                                <td>
                                                    <span style={{ 
                                                        background: u.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.2)' : u.role === 'TEACHER' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(79, 70, 229, 0.2)',
                                                        color: u.role === 'ADMIN' ? 'var(--danger)' : u.role === 'TEACHER' ? 'var(--success)' : 'var(--primary-color)',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    {u.role === 'STUDENT' ? (classesList.find(c => c.id === u.class_id)?.name || 'Non assigné') : '-'}
                                                </td>
                                                <td>
                                                    <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginRight: '1rem' }} onClick={() => setEditingUser(u)}>Modifier</button>
                                                    <button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} onClick={async () => {
                                                        if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
                                                            try {
                                                                await axios.delete(`http://localhost:5005/api/users/${u.id}`);
                                                                fetchUsers();
                                                            } catch (error) { alert('Erreur lors de la suppression'); }
                                                        }
                                                    }}>Supprimer</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'classes' && (
                        <div>
                            <h2>Classes et Matières</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Configurez le référentiel académique de l'établissement.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                                {/* CLASSES */}
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px' }}>
                                    <h3>1. Classes</h3>
                                    <form onSubmit={handleAddClass} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
                                        <input type="text" className="glass-input" placeholder="Nom de la classe (ex: Groupe A)" value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} required />
                                        <input type="text" className="glass-input" placeholder="Niveau (ex: 1ère année)" value={newClass.level} onChange={e => setNewClass({...newClass, level: e.target.value})} required />
                                        <button type="submit" className="glass-button">Ajouter Classe</button>
                                    </form>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table>
                                            <thead><tr><th>Nom</th><th>Niveau</th><th>Actions</th></tr></thead>
                                            <tbody>
                                                {classesList.map(c => (
                                                    <tr key={c.id}>
                                                        <td>{c.name}</td><td>{c.level}</td>
                                                        <td><button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} onClick={async () => {
                                                            if(confirm('Supprimer ?')) { await axios.delete(`http://localhost:5005/api/classes/${c.id}`); fetchClasses(); }
                                                        }}>Supprimer</button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* MODULES */}
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px' }}>
                                    <h3>2. Modules</h3>
                                    <form onSubmit={handleAddModule} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
                                        <input type="text" className="glass-input" placeholder="Nom du module" value={newModule.name} onChange={e => setNewModule({...newModule, name: e.target.value})} required />
                                        <input type="text" className="glass-input" placeholder="Filière (ex: Génie Informatique)" value={newModule.field_of_study} onChange={e => setNewModule({...newModule, field_of_study: e.target.value})} required />
                                        <input type="text" className="glass-input" placeholder="Année (ex: 1ère année)" value={newModule.academic_year} onChange={e => setNewModule({...newModule, academic_year: e.target.value})} required />
                                        <input type="text" className="glass-input" placeholder="Semestre (ex: S1)" value={newModule.semester} onChange={e => setNewModule({...newModule, semester: e.target.value})} required />
                                        <button type="submit" className="glass-button" style={{ gridColumn: '1 / -1' }}>Ajouter Module</button>
                                    </form>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table>
                                            <thead><tr><th>Module</th><th>Filière</th><th>Année</th><th>Semestre</th><th>Actions</th></tr></thead>
                                            <tbody>
                                                {modulesList.map(m => (
                                                    <tr key={m.id}>
                                                        <td>{m.name}</td><td>{m.field_of_study}</td><td>{m.academic_year}</td><td>{m.semester}</td>
                                                        <td><button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} onClick={async () => {
                                                            if(confirm('Supprimer ?')) { await axios.delete(`http://localhost:5005/api/modules/${m.id}`); fetchModules(); }
                                                        }}>Supprimer</button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* SUBJECTS */}
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px' }}>
                                    <h3>3. Matières (Subjects)</h3>
                                    <form onSubmit={handleAddSubject} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
                                        <input type="text" className="glass-input" placeholder="Nom de la matière" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} required />
                                        <select className="glass-input" value={newSubject.module_id} onChange={e => setNewSubject({...newSubject, module_id: e.target.value})} required>
                                            <option value="" style={{color: 'black'}}>Sélectionner un module</option>
                                            {modulesList.map(m => <option key={m.id} value={m.id} style={{color: 'black'}}>{m.name} ({m.semester})</option>)}
                                        </select>
                                        <select className="glass-input" value={newSubject.teacher_id} onChange={e => setNewSubject({...newSubject, teacher_id: e.target.value})} required>
                                            <option value="" style={{color: 'black'}}>Sélectionner un enseignant</option>
                                            {usersList.filter(u => u.role === 'TEACHER').map(u => <option key={u.id} value={u.id} style={{color: 'black'}}>{u.name}</option>)}
                                        </select>
                                        <button type="submit" className="glass-button">Ajouter Matière</button>
                                    </form>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table>
                                            <thead><tr><th>Matière</th><th>Module</th><th>Année & Semestre</th><th>Enseignant</th><th>Actions</th></tr></thead>
                                            <tbody>
                                                {subjectsList.map(s => (
                                                    <tr key={s.id}>
                                                        <td>{s.name}</td><td>{s.module_name}</td><td>{s.academic_year} - {s.semester}</td><td>{s.teacher_name}</td>
                                                        <td><button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} onClick={async () => {
                                                            if(confirm('Supprimer ?')) { await axios.delete(`http://localhost:5005/api/subjects/${s.id}`); fetchSubjects(); }
                                                        }}>Supprimer</button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'timetables' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2>Emploi du Temps</h2>
                                <button className="glass-button" onClick={() => setShowAddTimetable(!showAddTimetable)}>
                                    {showAddTimetable ? 'Annuler' : 'Assigner un créneau'}
                                </button>
                            </div>
                            
                            {showAddTimetable && (
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                    <h3 style={{ marginBottom: '1rem' }}>Nouveau Créneau</h3>
                                    <form onSubmit={handleAddTimetable} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <select className="glass-input" value={newTimetable.class_id} onChange={e => setNewTimetable({...newTimetable, class_id: e.target.value})} required>
                                            <option value="" style={{color: 'black'}}>Sélectionner une classe</option>
                                            {classesList.map(c => <option key={c.id} value={c.id} style={{color: 'black'}}>{c.name} - {c.level}</option>)}
                                        </select>
                                        <select className="glass-input" value={newTimetable.subject_id} onChange={e => setNewTimetable({...newTimetable, subject_id: e.target.value})} required>
                                            <option value="" style={{color: 'black'}}>Sélectionner une matière</option>
                                            {subjectsList.map(s => <option key={s.id} value={s.id} style={{color: 'black'}}>{s.name}</option>)}
                                        </select>
                                        <select className="glass-input" value={newTimetable.teacher_id} onChange={e => setNewTimetable({...newTimetable, teacher_id: e.target.value})} required>
                                            <option value="" style={{color: 'black'}}>Sélectionner un enseignant</option>
                                            {usersList.filter(u => u.role === 'TEACHER').map(u => <option key={u.id} value={u.id} style={{color: 'black'}}>{u.name}</option>)}
                                        </select>
                                        <select className="glass-input" value={newTimetable.day_of_week} onChange={e => setNewTimetable({...newTimetable, day_of_week: e.target.value})} required>
                                            {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(d => <option key={d} value={d} style={{color: 'black'}}>{d}</option>)}
                                        </select>
                                        <input type="time" className="glass-input" required value={newTimetable.start_time} onChange={e => setNewTimetable({...newTimetable, start_time: e.target.value})} />
                                        <input type="time" className="glass-input" required value={newTimetable.end_time} onChange={e => setNewTimetable({...newTimetable, end_time: e.target.value})} />
                                        <input type="text" className="glass-input" placeholder="Année (ex: 2026-2027)" required value={newTimetable.academic_year} onChange={e => setNewTimetable({...newTimetable, academic_year: e.target.value})} />
                                        <button type="submit" className="glass-button" style={{ gridColumn: '1 / -1' }}>Enregistrer</button>
                                    </form>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                                <select className="glass-input" value={timetableFilterType} onChange={e => { setTimetableFilterType(e.target.value); setTimetableFilterId(''); }} style={{ flex: 1 }}>
                                    <option value="CLASS" style={{color: 'black'}}>Filtrer par Classe</option>
                                    <option value="TEACHER" style={{color: 'black'}}>Filtrer par Enseignant</option>
                                </select>
                                
                                {timetableFilterType === 'CLASS' ? (
                                    <select className="glass-input" value={timetableFilterId} onChange={e => setTimetableFilterId(e.target.value)} style={{ flex: 2 }}>
                                        <option value="" style={{color: 'black'}}>Sélectionner une classe...</option>
                                        {classesList.map(c => <option key={c.id} value={c.id} style={{color: 'black'}}>{c.name} - {c.level}</option>)}
                                    </select>
                                ) : (
                                    <select className="glass-input" value={timetableFilterId} onChange={e => setTimetableFilterId(e.target.value)} style={{ flex: 2 }}>
                                        <option value="" style={{color: 'black'}}>Sélectionner un enseignant...</option>
                                        {usersList.filter(u => u.role === 'TEACHER').map(u => <option key={u.id} value={u.id} style={{color: 'black'}}>{u.name}</option>)}
                                    </select>
                                )}
                            </div>

                            {timetableFilterId ? (
                                <CalendarView 
                                    events={timetablesList.filter(t => 
                                        timetableFilterType === 'CLASS' ? t.class_id.toString() === timetableFilterId.toString() : t.teacher_id.toString() === timetableFilterId.toString()
                                    )} 
                                    onDelete={async (id) => {
                                        if (confirm('Supprimer ce créneau ?')) {
                                            await axios.delete(`http://localhost:5005/api/timetables/${id}`);
                                            fetchTimetables();
                                        }
                                    }}
                                />
                            ) : (
                                <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>Veuillez sélectionner une classe ou un enseignant pour afficher son emploi du temps.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'grades' && (
                        <div>
                            <h2>Toutes les Notes</h2>
                            <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Étudiant</th>
                                            <th>Matière</th>
                                            <th>Note</th>
                                            <th>Commentaire</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gradesList.map((g) => (
                                            <tr key={g.id}>
                                                <td>{g.student_name}</td>
                                                <td>{g.subject_name}</td>
                                                <td>{g.score}/20</td>
                                                <td>{g.description}</td>
                                                <td>
                                                    <button style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginRight: '1rem' }} onClick={() => setEditingGrade(g)}>Modifier</button>
                                                    <button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} onClick={async () => {
                                                        if (confirm('Supprimer cette note ?')) {
                                                            await axios.delete(`http://localhost:5005/api/grades/${g.id}`);
                                                            fetchGrades();
                                                        }
                                                    }}>Supprimer</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'absences' && (
                        <div>
                            <h2>Toutes les Absences</h2>
                            <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Étudiant</th>
                                            <th>Justifiée</th>
                                            <th>Justification</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {absencesList.map((a) => (
                                            <tr key={a.id}>
                                                <td>{a.date}</td>
                                                <td>{a.student_name}</td>
                                                <td>
                                                    <span style={{ color: a.is_justified ? 'var(--success)' : 'var(--danger)' }}>
                                                        {a.is_justified ? 'Oui' : 'Non'}
                                                    </span>
                                                </td>
                                                <td>{a.justification_reason || '-'}</td>
                                                <td>
                                                    <button style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginRight: '1rem' }} onClick={() => setEditingAbsence(a)}>Justifier</button>
                                                    <button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} onClick={async () => {
                                                        if (confirm('Supprimer cette absence définitivement ?')) {
                                                            try {
                                                                await axios.delete(`http://localhost:5005/api/absences/${a.id}`);
                                                                await fetchAbsences();
                                                                alert('Absence supprimée avec succès !');
                                                            } catch (error) {
                                                                console.error(error);
                                                                alert('Erreur lors de la suppression : ' + (error.response?.data?.message || error.message));
                                                            }
                                                        }
                                                    }}>Supprimer</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>

        {/* MODALS */}
        {editingUser && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="glass-panel" style={{ padding: '2rem', width: '400px' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Modifier Utilisateur</h3>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            await axios.put(`http://localhost:5005/api/users/${editingUser.id}`, editingUser);
                            setEditingUser(null);
                            fetchUsers();
                        } catch (error) { alert('Erreur lors de la modification'); }
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input type="text" className="glass-input" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} required placeholder="Nom complet" />
                        <input type="email" className="glass-input" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} required placeholder="Email" />
                        <select className="glass-input" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value, class_id: ''})}>
                            <option value="STUDENT" style={{color: 'black'}}>Étudiant</option>
                            <option value="TEACHER" style={{color: 'black'}}>Enseignant</option>
                            <option value="ADMIN" style={{color: 'black'}}>Administrateur</option>
                        </select>
                        {editingUser.role === 'STUDENT' && (
                            <select className="glass-input" value={editingUser.class_id || ''} onChange={e => setEditingUser({...editingUser, class_id: e.target.value ? parseInt(e.target.value) : ''})}>
                                <option value="" style={{color: 'black'}}>Sélectionner une classe</option>
                                {classesList.map(c => <option key={c.id} value={c.id} style={{color: 'black'}}>{c.name} - {c.level}</option>)}
                            </select>
                        )}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="glass-button" style={{ flex: 1 }}>Sauvegarder</button>
                            <button type="button" className="glass-button" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }} onClick={() => setEditingUser(null)}>Annuler</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {editingGrade && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="glass-panel" style={{ padding: '2rem', width: '400px' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Modifier la Note</h3>
                    <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>{editingGrade.student_name} - {editingGrade.subject_name}</p>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            await axios.put(`http://localhost:5005/api/grades/${editingGrade.id}`, { score: editingGrade.score, description: editingGrade.description });
                            setEditingGrade(null);
                            fetchGrades();
                        } catch (error) { alert('Erreur lors de la modification'); }
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input type="number" step="0.25" min="0" max="20" className="glass-input" value={editingGrade.score} onChange={e => setEditingGrade({...editingGrade, score: e.target.value})} required placeholder="Note sur 20" />
                        <textarea className="glass-input" value={editingGrade.description || ''} onChange={e => setEditingGrade({...editingGrade, description: e.target.value})} placeholder="Commentaire" />
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="glass-button" style={{ flex: 1 }}>Sauvegarder</button>
                            <button type="button" className="glass-button" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }} onClick={() => setEditingGrade(null)}>Annuler</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {editingAbsence && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="glass-panel" style={{ padding: '2rem', width: '400px' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Justifier l'absence</h3>
                    <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>{editingAbsence.student_name} - Le {editingAbsence.date}</p>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            await axios.put(`http://localhost:5005/api/absences/${editingAbsence.id}`, { is_justified: editingAbsence.is_justified, justification_reason: editingAbsence.justification_reason });
                            setEditingAbsence(null);
                            fetchAbsences();
                        } catch (error) { alert('Erreur lors de la modification'); }
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input type="checkbox" style={{ width: '20px', height: '20px' }} checked={editingAbsence.is_justified} onChange={e => setEditingAbsence({...editingAbsence, is_justified: e.target.checked})} />
                            Absence justifiée
                        </label>
                        <textarea className="glass-input" value={editingAbsence.justification_reason || ''} onChange={e => setEditingAbsence({...editingAbsence, justification_reason: e.target.value})} placeholder="Raison de la justification" />
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="glass-button" style={{ flex: 1 }}>Sauvegarder</button>
                            <button type="button" className="glass-button" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }} onClick={() => setEditingAbsence(null)}>Annuler</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
    );
};

export default AdminDashboard;
