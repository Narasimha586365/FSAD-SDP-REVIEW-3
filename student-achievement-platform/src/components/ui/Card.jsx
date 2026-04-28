import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/Card.css';

const Card = ({ 
  children, 
  title = null, 
  subtitle = null,
  hoverable = true,
  className = '',
  onClick = null
}) => {
  return (
    <motion.div
      className={`custom-card ${hoverable ? 'hoverable' : ''} ${className}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={hoverable ? { y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' } : {}}
    >
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </motion.div>
  );
};

export default Card;
