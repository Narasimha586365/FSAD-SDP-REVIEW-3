import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ParticipationPage from './pages/ParticipationPage';
import CategoriesPage from './pages/CategoriesPage';
import DomainsPage from './pages/DomainsPage';
import ModulesPage from './pages/ModulesPage';
import StudyPage from './pages/StudyPage';
import TestPage from './pages/TestPage';
import CertificatePage from './pages/CertificatePage';
import DarkModeToggle from './components/ui/DarkModeToggle';
import { useAppContext } from './context/AppContext';
import './App.css';

function App() {
  return (
    <>
      <DarkModeToggle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="/student" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
        <Route path="/participation" element={<PrivateRoute role="student"><ParticipationPage /></PrivateRoute>} />
        <Route path="/categories" element={<PrivateRoute role="student"><CategoriesPage /></PrivateRoute>} />
        <Route path="/domains/:categoryId" element={<PrivateRoute role="student"><DomainsPage /></PrivateRoute>} />
        <Route path="/modules/:domainId" element={<PrivateRoute role="student"><ModulesPage /></PrivateRoute>} />
        <Route path="/study/:moduleId" element={<PrivateRoute role="student"><StudyPage /></PrivateRoute>} />
        <Route path="/test/:moduleId" element={<PrivateRoute role="student"><TestPage /></PrivateRoute>} />
        <Route path="/certificate/:certificateId" element={<PrivateRoute role="student"><CertificatePage /></PrivateRoute>} />
      </Routes>
    </>
  );
}

function PrivateRoute({ children, role }) {
  const { currentUser } = useAppContext();
  const savedUser = !currentUser
    ? JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null')
    : null;
  const activeUser = currentUser || savedUser;
  
  if (!activeUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (role === 'admin' && (activeUser.role === 'admin' || activeUser.role === 'co-admin')) {
    return children;
  }
  
  if (activeUser.role !== role) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default App;
