import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAppContext } from '../context/AppContext';
import AchievementForm from '../features/admin/AchievementForm';
import ActivityForm from '../features/admin/ActivityForm';
import StudentList from '../features/admin/StudentList';
import EnrollmentList from '../features/admin/EnrollmentList';
import AdminAccessPanel from '../features/admin/AdminAccessPanel';
import TestReviewPanel from '../features/admin/TestReviewPanel';
import AchievementChart from '../components/ui/AchievementChart';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { currentUser, achievementList, students, accessSummary, logout, refreshPlatformData, adminTestAttempts } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    refreshPlatformData();
    const intervalId = setInterval(() => {
      refreshPlatformData();
    }, 15000);
    return () => clearInterval(intervalId);
  }, [currentUser, navigate, refreshPlatformData]);

  useEffect(() => {
    if (currentUser?.role === 'admin' && accessSummary?.pendingCoAdminCount > 0) {
      Swal.fire(
        'Pending Co-Admin Requests',
        `${accessSummary.pendingCoAdminCount} co-admin request(s) are waiting for approval in Access Management.`,
        'info'
      );
    }
  }, [currentUser?.role, accessSummary?.pendingCoAdminCount]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshPlatformData();
      Swal.fire('Updated', 'Admin portal data refreshed successfully.', 'success');
    } catch (error) {
      Swal.fire('Refresh failed', error.message || 'Unable to refresh admin data.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const stats = useMemo(() => ({
    totalAchievements: achievementList.length,
    totalAwards: achievementList.filter((item) => item.category === 'award').length,
    totalRecognitions: achievementList.filter((item) => item.category === 'recognition').length,
    totalTests: adminTestAttempts ? adminTestAttempts.length : 0
  }), [achievementList, adminTestAttempts]);

  const menuItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'add-achievement', label: 'Add Achievement' },
    { id: 'add-activity', label: 'Add Activity' },
    { id: 'students', label: 'Students' },
    { id: 'enrollments', label: 'Enrollments' },
    { id: 'tests', label: 'Completed Tests' },
    ...(currentUser?.role === 'admin' ? [{ id: 'access', label: 'Access Management' }] : [])
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'add-achievement':
        return <AchievementForm />;
      case 'add-activity':
        return <ActivityForm />;
      case 'students':
        return <StudentList />;
      case 'enrollments':
        return <EnrollmentList />;
      case 'tests':
        return <TestReviewPanel />;
      case 'access':
        return currentUser?.role === 'admin' ? <AdminAccessPanel /> : null;
      default:
        return (
          <>
            <div className="stats-container">
              <div className="stat-card-admin"><h3>{stats.totalAchievements}</h3><p>Total Achievements</p></div>
              <div className="stat-card-admin"><h3>{stats.totalAwards}</h3><p>Awards</p></div>
              <div className="stat-card-admin"><h3>{stats.totalRecognitions}</h3><p>Recognitions</p></div>
              <div className="stat-card-admin"><h3>{stats.totalTests}</h3><p>Completed Tests</p></div>
            </div>
            {achievementList.length > 0 && <AchievementChart achievements={achievementList} />}
            <div className="total-students-card">
              <div className="students-card-content">
                <div>
                  <h3>{students.length}</h3>
                  <p>Total Students Registered</p>
                  {currentUser?.role === 'admin' && accessSummary && (
                    <p style={{ marginTop: '10px', color: '#475569' }}>
                      Student Limit: {accessSummary.studentCount}/{accessSummary.studentLimit} | Co-Admins: {accessSummary.coAdminCount}/{accessSummary.coAdminLimit}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <h2>Admin Portal</h2>
        <div className="profile-section">
          <div className="admin-avatar">{currentUser?.name?.charAt(0)?.toUpperCase()}</div>
          <p><strong>{currentUser?.name}</strong></p>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>{currentUser?.email}</p>
          <span className="role-badge">
            {currentUser?.role === 'admin' ? 'Administrator' : 'Co-Administrator'}
          </span>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.id} className={activeTab === item.id ? 'active' : ''} onClick={() => setActiveTab(item.id)}>
              {item.label}
            </li>
          ))}
          <li className="logout-btn" onClick={handleLogout}>Logout</li>
        </ul>
      </nav>

      <div className="main-content">
        <header className="dashboard-header">
          <div className="header-content">
            <div>
              <h1>Welcome, {currentUser?.name}</h1>
              <p>
                {currentUser?.role === 'admin'
                  ? 'Manage achievements, enrollment capacity, student limits, and co-admin approvals.'
                  : 'Manage achievements and student activity records with co-admin permissions.'}
              </p>
            </div>
            <button
              type="button"
              className="submit-btn"
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{ minWidth: '160px', opacity: isRefreshing ? 0.8 : 1 }}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </header>
        <div className="content-area">{renderTab()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
