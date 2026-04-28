import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { useAppContext } from '../context/AppContext';
import AchievementShowcase from '../features/student/AchievementShowcase';
import DashboardStats from '../features/student/DashboardStats';
import ParticipationTimeline from '../features/student/ParticipationTimeline';
import AchievementChart from '../components/ui/AchievementChart';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('achievements');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { currentUser, participationList, logout, certificateList, testAttemptList, myAchievementList, refreshPlatformData, lastRefreshedAt } = useAppContext();
  const navigate = useNavigate();

  const myParticipations = participationList.filter((item) => Number(item.studentId) === Number(currentUser?.id));

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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshPlatformData();
      Swal.fire('Refreshed', 'Student panel updated successfully.', 'success');
    } catch (error) {
      Swal.fire('Refresh Failed', error.message || 'Unable to refresh student data.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const menuItems = [
    { id: 'achievements', label: 'Achievements', color: '#667eea' },
    { id: 'participation', label: 'My Participants', color: '#4ecdc4', route: '/participation' }
  ];

  return (
    <div className="dashboard-container">
      <motion.nav className="sidebar" initial={{ x: -300 }} animate={{ x: 0 }} transition={{ type: 'spring', stiffness: 100 }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2>Student Portal</h2>
        </motion.div>
        <motion.div className="profile-section" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} whileHover={{ scale: 1.05 }}>
          <motion.div className="avatar" animate={{ boxShadow: ['0 0 20px rgba(255, 215, 0, 0.5)', '0 0 40px rgba(255, 215, 0, 0.8)', '0 0 20px rgba(255, 215, 0, 0.5)'] }} transition={{ duration: 2, repeat: Infinity }}>
            {currentUser?.name?.charAt(0).toUpperCase()}
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}><strong>{currentUser?.name}</strong></motion.p>
          <p className="roll-number">{currentUser?.rollNumber}</p>
          <motion.p className="department" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>{currentUser?.department}</motion.p>
        </motion.div>
        <ul className="sidebar-menu">
          {menuItems.map((item, index) => (
            <motion.li
              key={item.id}
              className={activeTab === item.id ? 'active' : ''}
              onClick={() => (item.route ? navigate(item.route) : setActiveTab(item.id))}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ x: 10, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ borderLeft: activeTab === item.id ? `4px solid ${item.color}` : '4px solid transparent' }}
            >
              {item.label}
            </motion.li>
          ))}
          <motion.li className="logout-btn" onClick={handleLogout} initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }} whileHover={{ x: 10, backgroundColor: 'rgba(231, 76, 60, 0.6)' }} whileTap={{ scale: 0.95 }}>
            Logout
          </motion.li>
        </ul>
        <motion.div className="sidebar-summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
          <h4>Quick Stats</h4>
          <div className="quick-stat"><span>Achievements</span><span>{myAchievementList.length}</span></div>
          <div className="quick-stat"><span>Participations</span><span>{myParticipations.length}</span></div>
          <div className="quick-stat"><span>Tests</span><span>{testAttemptList.length}</span></div>
          <div className="quick-stat"><span>Certificates</span><span>{certificateList.length}</span></div>
        </motion.div>
      </motion.nav>

      <div className="main-content">
        <motion.header className="dashboard-header" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="header-content">
            <div>
              <motion.h1 initial={{ x: -20 }} animate={{ x: 0 }} transition={{ delay: 0.6 }}>
                My Achievement Dashboard
              </motion.h1>
              <p>Track extracurricular activities, assessments, achievements, and certificates.</p>
              {lastRefreshedAt && (
                <p style={{ marginTop: '6px', color: '#64748b', fontSize: '14px' }}>
                  Last refreshed: {new Date(lastRefreshedAt).toLocaleTimeString()}
                </p>
              )}
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
        </motion.header>

        <DashboardStats 
          achievements={myAchievementList} 
          participations={myParticipations} 
          tests={(testAttemptList || []).filter(a => String(a.status).toUpperCase() === 'COMPLETED')}
        />
        {myAchievementList.length > 0 && <AchievementChart achievements={myAchievementList} />}
        <AnimatePresence mode="wait">
          <div className="content-area">
            {activeTab === 'achievements' && (
              <motion.div key="achievements" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                <AchievementShowcase achievements={myAchievementList} />
              </motion.div>
            )}
            {activeTab === 'participation' && (
              <motion.div key="participation" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                <ParticipationTimeline participations={myParticipations} />
              </motion.div>
            )}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentDashboard;
