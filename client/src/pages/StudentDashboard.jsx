import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Sparkles, LogOut, Calendar } from 'lucide-react';
import axios from 'axios';
import CalendarView from '../components/CalendarView';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

const StudentDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('timetables');
    const [synthesis, setSynthesis] = useState('');
    const [loadingAI, setLoadingAI] = useState(false);
    const [timetables, setTimetables] = useState([]);
    const [grades, setGrades] = useState([]);
    const [absences, setAbsences] = useState([]);

    useEffect(() => {
        if (!user || user.role !== 'STUDENT') {
            navigate('/');
        } else {
            fetchData();
        }
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            if (user.class_id) {
                const resTime = await axios.get(`http://localhost:5005/api/timetables/class/${user.class_id}`);
                setTimetables(resTime.data);
            }
            const resGrades = await axios.get(`http://localhost:5005/api/grades/student/${user.id}`);
            setGrades(resGrades.data);
            const resAbs = await axios.get(`http://localhost:5005/api/absences/student/${user.id}`);
            setAbsences(resAbs.data);
        } catch (error) { console.error('Error fetching data', error); }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const fetchSynthesis = async () => {
        if (synthesis) return;
        setLoadingAI(true);
        try {
            const res = await axios.get(`http://localhost:5005/api/ai/synthesis/${user.id}`);
            setSynthesis(res.data.synthesis);
        } catch (error) {
            console.error('Error fetching synthesis', error);
            setSynthesis('Erreur lors du chargement de la synthèse.');
        } finally {
            setLoadingAI(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'ai') {
            fetchSynthesis();
        }
    }, [activeTab]);

    if (!user || user.role !== 'STUDENT') return null;

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Espace Étudiant</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user.name}</p>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <a href="#" className={`nav-link ${activeTab === 'timetables' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('timetables'); }}>
                        <Calendar size={20} /> Emploi du Temps
                    </a>
                    <a href="#" className={`nav-link ${activeTab === 'grades' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('grades'); }}>
                        <FileText size={20} /> Mes Notes
                    </a>
                    <a href="#" className={`nav-link ${activeTab === 'absences' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('absences'); }}>
                        <Clock size={20} /> Mes Absences
                    </a>
                    <a href="#" className={`nav-link ${activeTab === 'ai' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('ai'); }}>
                        <Sparkles size={20} /> Synthèse IA
                    </a>
                </nav>

                <button className="glass-button danger" onClick={handleLogout} style={{ width: '100%' }}>
                    <LogOut size={20} /> Déconnexion
                </button>
            </aside>

            <main className="main-content">
                <header style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem' }}>Mon Tableau de bord</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Consultez vos résultats, absences et analyses de performance.</p>
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

                    {activeTab === 'grades' && (
                        <div>
                            <h2>Mes Notes</h2>
                            <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Matière</th>
                                            <th>Note</th>
                                            <th>Commentaire</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grades.map((g) => (
                                            <tr key={g.id}>
                                                <td>{g.subject_name}</td>
                                                <td>{g.score}/20</td>
                                                <td>{g.description || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'absences' && (
                        <div>
                            <h2>Mes Absences</h2>
                            <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Justifiée</th>
                                            <th>Justification</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {absences.map((a) => (
                                            <tr key={a.id}>
                                                <td>{a.date}</td>
                                                <td>
                                                    <span style={{ color: a.is_justified ? 'var(--success)' : 'var(--danger)' }}>
                                                        {a.is_justified ? 'Oui' : 'Non'}
                                                    </span>
                                                </td>
                                                <td>{a.justification_reason || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <Sparkles color="var(--primary-color)" />
                                <h2>Synthèse par Claude AI</h2>
                            </div>
                            
                            {loadingAI ? (
                                <p style={{ color: 'var(--text-secondary)' }}>Analyse de vos performances en cours...</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div style={{ 
                                        background: 'rgba(255,255,255,0.02)', 
                                        padding: '1.5rem', 
                                        borderRadius: '8px', 
                                        border: '1px solid var(--glass-border)',
                                        lineHeight: '1.6',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {synthesis}
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                        {grades.length > 0 && (
                                            <div style={{ 
                                                background: 'rgba(255,255,255,0.02)', 
                                                padding: '1.5rem', 
                                                borderRadius: '8px', 
                                                border: '1px solid var(--glass-border)'
                                            }}>
                                                <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Aperçu de mes notes</h3>
                                                <div style={{ width: '100%', height: 300 }}>
                                                    <ResponsiveContainer>
                                                        <BarChart data={grades.map(g => ({ ...g, score: parseFloat(g.score) }))} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                            <XAxis dataKey="subject_name" stroke="rgba(255,255,255,0.5)" angle={-45} textAnchor="end" height={60} />
                                                            <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 20]} />
                                                            <Tooltip 
                                                                contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                                                                itemStyle={{ color: 'var(--primary-color)' }}
                                                                formatter={(value) => [`${value} / 20`, 'Note']}
                                                            />
                                                            <Bar dataKey="score" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ 
                                            background: 'rgba(255,255,255,0.02)', 
                                            padding: '1.5rem', 
                                            borderRadius: '8px', 
                                            border: '1px solid var(--glass-border)',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}>
                                            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Risque de sanction (Absences)</h3>
                                            
                                            {Math.floor(absences.length / 10) > 0 && (
                                                <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>
                                                    Attention : Vous avez déjà été suspendu {Math.floor(absences.length / 10)} fois.
                                                </div>
                                            )}

                                            <div style={{ width: '100%', height: 300 }}>
                                                <ResponsiveContainer>
                                                    <PieChart>
                                                        <Pie
                                                            data={[
                                                                { name: 'Absences actuelles', value: absences.length % 10 },
                                                                { name: 'Marge avant sanction', value: 10 - (absences.length % 10) }
                                                            ]}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={100}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                        >
                                                            <Cell fill="#ef4444" /> {/* Rouge pour les absences accumulées */}
                                                            <Cell fill="#10b981" /> {/* Vert pour la marge */}
                                                        </Pie>
                                                        <Tooltip 
                                                            contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                                                            formatter={(value) => [value, '']}
                                                        />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 'auto', fontSize: '0.875rem' }}>
                                                Chaque palier de 10 absences entraîne une suspension de 3 jours.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
