import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { useAppContext } from '../context/AppContext';
import ParticipationTimeline from '../features/student/ParticipationTimeline';

const ParticipationPage = () => {
  const { currentUser, participationList, refreshPlatformData, lastRefreshedAt } = useAppContext();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const navigate = useNavigate();
  const myParticipations = participationList.filter((item) => Number(item.studentId) === Number(currentUser?.id));

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshPlatformData();
      Swal.fire('Refreshed', 'My Participants updated successfully.', 'success');
    } catch (error) {
      Swal.fire('Refresh Failed', error.message || 'Unable to refresh participant data.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="main-content" style={{ marginLeft: 0, width: '100%' }}>
        <motion.header
          className="dashboard-header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="header-content">
            <div>
              <motion.h1>My Participants</motion.h1>
              <p>Track your enrollments, domain tests, and certificates.</p>
              {lastRefreshedAt && (
                <p style={{ marginTop: '6px', color: '#64748b', fontSize: '14px' }}>
                  Last refreshed: {new Date(lastRefreshedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.button
                onClick={handleRefresh}
                disabled={isRefreshing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '10px 20px',
                  background: '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isRefreshing ? 'wait' : 'pointer',
                  fontSize: '16px',
                  opacity: isRefreshing ? 0.8 : 1
                }}
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </motion.button>
              <motion.button
                onClick={() => navigate('/student')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '10px 20px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Back to Dashboard
              </motion.button>
            </div>
          </div>
        </motion.header>

        <div className="content-area">
          <ParticipationTimeline participations={myParticipations} />
        </div>
      </div>
    </div>
  );
};

export default ParticipationPage;
