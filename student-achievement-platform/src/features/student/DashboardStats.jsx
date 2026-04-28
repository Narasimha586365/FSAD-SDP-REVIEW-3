import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const DashboardStats = ({ achievements, participations, tests }) => {
  const stats = [
    {
      label: 'Total Achievements',
      value: achievements.length,
      icon: '🥇',
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      label: 'Awards Won',
      value: achievements.filter(a => a.category === 'award').length,
      icon: '🏆',
      color: '#ffd700',
      gradient: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
    },
    {
      label: 'Completed Tests',
      value: tests ? tests.length : 0,
      icon: '📝',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
    },
    {
      label: 'Participations',
      value: participations.length,
      icon: '🎯',
      color: '#4ecdc4',
      gradient: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)'
    }
  ];

  return (
    <div className="stats-container">
      {stats.map((stat, index) => (
        <motion.div 
          key={index} 
          className="stat-card" 
          style={{ borderTop: `4px solid ${stat.color}` }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ 
            y: -10,
            boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
            transition: { duration: 0.3 }
          }}
        >
          <motion.span 
            className="stat-icon"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            {stat.icon}
          </motion.span>
          <h3 style={{ color: stat.color }}>
            <CountUp end={stat.value} duration={2} delay={index * 0.1} />
          </h3>
          <p>{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;
