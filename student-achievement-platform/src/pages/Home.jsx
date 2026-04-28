import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '🏆',
      title: 'Achievement Tracking',
      description: 'Comprehensive record of awards, recognitions, and participation certificates',
      color: '#ffd700'
    },
    {
      icon: '⭐',
      title: 'Digital Portfolio',
      description: 'Build and showcase your extracurricular profile beyond academics',
      color: '#ff6b6b'
    },
    {
      icon: '📊',
      title: 'Visual Analytics',
      description: 'Interactive charts and insights to track your achievement journey',
      color: '#4ecdc4'
    },
    {
      icon: '🎯',
      title: 'Participation History',
      description: 'Timeline view of all your club activities, events, and competitions',
      color: '#667eea'
    },
    {
      icon: '👥',
      title: 'Role-Based Access',
      description: 'Secure admin panel and personalized student dashboards',
      color: '#764ba2'
    },
    {
      icon: '🌙',
      title: 'Dark Mode Support',
      description: 'Eye-friendly dark theme for comfortable viewing anytime',
      color: '#2c3e50'
    }
  ];

  const floatingIcons = ['🏅', '🥇', '🥈', '🥉', '🏆', '⚽', '🏀', '🎾', '🏐', '⚡', '🌟', '✨', '🎖️', '🎗️'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
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
    <div className="home-container">
      {/* Header Navigation */}
      <motion.header 
        className="home-header"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="header-title">🎓 Student Achievement Platform</h2>
        <div className="header-buttons">
          <motion.button
            className="header-btn-login"
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Login 🚀
          </motion.button>
          <motion.button
            className="header-btn-register"
            onClick={() => navigate('/register')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Account
          </motion.button>
        </div>
      </motion.header>

      {/* Floating Background Icons */}
      <div className="floating-icons" style={{ display: 'none' }}>
        {floatingIcons.map((icon, index) => (
          <motion.div
            key={index}
            className="floating-icon"
            initial={{ 
              x: `${Math.random() * 1920}px`,
              y: `${Math.random() * 1080}px`,
              scale: 0.5 + Math.random() * 0.5,
              opacity: 0.2 + Math.random() * 0.3
            }}
            animate={{
              y: [`${Math.random() * 1080}px`],
              x: [`${Math.random() * 1920}px`],
              rotate: [0, 360],
            }}
            transition={{
              duration: 20 + Math.random() * 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear'
            }}
          >
            {icon}
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <motion.section 
        className="hero-section"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div
          className="trophy-animation"
        >
          🏆
        </div>
        
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Empower Your Success Beyond the Classroom
        </motion.h1>

        <motion.p
          className="hero-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          A comprehensive digital platform for colleges and universities to track, manage, 
          and showcase student achievements in extracurricular activities, competitions, and leadership roles.
        </motion.p>

        <motion.div
          className="hero-badges"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span className="badge">🥇 Awards</span>
          <span className="badge">⭐ Recognition</span>
          <span className="badge">🎯 Participation</span>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features"
        className="features-section"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          ✨ Platform Features
        </motion.h2>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              variants={itemVariants}
              whileHover={{ 
                y: -18, 
                boxShadow: `0 25px 50px ${feature.color}50`,
                borderColor: feature.color
              }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="feature-icon"
                style={{ background: `linear-gradient(135deg, ${feature.color}50, ${feature.color}30)` }}
              >
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        className="how-it-works"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          🎯 How It Works
        </motion.h2>

        <div className="steps-container">
          {[
            { step: '1', icon: '🔐', title: 'Secure Login', desc: 'Access your personalized dashboard with role-based authentication' },
            { step: '2', icon: '➕', title: 'Add Achievements', desc: 'Record awards, certificates, and participation details with ease' },
            { step: '3', icon: '📊', title: 'Track Progress', desc: 'Monitor growth with real-time analytics and visual reports' },
            { step: '4', icon: '🌟', title: 'Showcase Portfolio', desc: 'Display and share your comprehensive achievement portfolio' }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="step-card"
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.05, rotate: 1 }}
            >
              <div className="step-number">{item.step}</div>
              <div className="step-icon">{item.icon}</div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        className="cta-section"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div
          className="cta-content"
        >
          <h2>Ready to Showcase Your Achievements? 🚀</h2>
          <p>Join hundreds of students building their digital success portfolio</p>
          <motion.button
            className="btn-cta"
            onClick={() => navigate('/register')}
            whileHover={{ scale: 1.12, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Now 🎉
          </motion.button>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🎓 Achievement Portal</h3>
            <p>Empowering students to track and showcase their extracurricular excellence.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="/login">Login</a></li>
              <li><a href="/register">Register</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>2400030764@kluniversity.in</p>
            
          </div>
        </div>
        <div className="footer-icons">
          <span>🏆</span>
          <span>⭐</span>
          <span>🎯</span>
          <span>🥇</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
