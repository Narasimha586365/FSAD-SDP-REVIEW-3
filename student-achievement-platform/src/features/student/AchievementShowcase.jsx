import React from 'react';
import { motion } from 'framer-motion';

const AchievementShowcase = ({ achievements }) => {
  const groupByCategory = achievements.reduce((acc, achievement) => {
    acc[achievement.category] = acc[achievement.category] || [];
    acc[achievement.category].push(achievement);
    return acc;
  }, {});

  const categoryLabels = {
    award: '🏆 Awards',
    recognition: '⭐ Recognitions',
    participation: '🎯 Participations'
  };

  const categoryColors = {
    award: '#ffd700',
    recognition: '#ff6b6b',
    participation: '#4ecdc4'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <div className="achievement-showcase">
      {Object.entries(groupByCategory).map(([category, items]) => (
        <div key={category} className="category-section">
          <motion.h2 
            style={{ borderLeft: `4px solid ${categoryColors[category]}` }}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {categoryLabels[category] || category}
          </motion.h2>
          
          <motion.div 
            className="achievement-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {items.map((achievement) => (
              <motion.div 
                key={achievement.id} 
                className="achievement-card" 
                style={{ borderTop: `3px solid ${categoryColors[category]}` }}
                variants={cardVariants}
                whileHover={{ 
                  y: -10, 
                  boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                  transition: { duration: 0.3 }
                }}
              >
                <h3>{achievement.title}</h3>
                <p className="description">{achievement.description}</p>
                <div className="card-footer">
                  <motion.span 
                    className="category-tag" 
                    style={{ background: categoryColors[category] }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {category.toUpperCase()}
                  </motion.span>
                  <span className="date">
                    📅 {new Date(achievement.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      ))}
      
      {achievements.length === 0 && (
        <motion.div 
          className="no-data"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p>📭 No achievements recorded yet.</p>
          <p>Contact your admin to add your achievements!</p>
        </motion.div>
      )}
    </div>
  );
};

export default AchievementShowcase;
