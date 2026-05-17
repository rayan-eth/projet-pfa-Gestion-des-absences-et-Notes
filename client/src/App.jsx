import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

const App = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Chargement...</div>;
    }

    return (
        <Routes>
            <Route path="/" element={!user ? <Login /> : <Navigate to={`/${user.role.toLowerCase()}`} />} />
            <Route path="/admin/*" element={user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path="/teacher/*" element={user?.role === 'TEACHER' ? <TeacherDashboard /> : <Navigate to="/" />} />
            <Route path="/student/*" element={user?.role === 'STUDENT' ? <StudentDashboard /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default App;
