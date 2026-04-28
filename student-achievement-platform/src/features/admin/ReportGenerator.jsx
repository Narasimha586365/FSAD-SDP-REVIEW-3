import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { motion } from 'framer-motion';

const ReportGenerator = () => {
  const { achievementList, participationList, students } = useAppContext();
  const [reportType, setReportType] = useState('achievements');

  const generateAchievementReport = () => {
    const report = {
      totalAchievements: achievementList.length,
      byCategory: {
        award: achievementList.filter(a => a.category === 'award').length,
        recognition: achievementList.filter(a => a.category === 'recognition').length,
        participation: achievementList.filter(a => a.category === 'participation').length
      },
      topStudents: students
        .map(student => ({
          ...student,
          count: achievementList.filter(a => a.studentId === student.id).length
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    };
    return report;
  };

  const generateParticipationReport = () => {
    const report = {
      totalParticipations: participationList.length,
      topParticipants: students
        .map(student => ({
          ...student,
          count: participationList.filter(p => p.studentId === student.id).length
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    };
    return report;
  };

  const handleDownload = () => {
    const report = reportType === 'achievements' 
      ? generateAchievementReport() 
      : generateParticipationReport();

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <motion.div
      className="report-generator"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h3>📊 Report Generator</h3>
      
      <div className="report-controls">
        <select 
          value={reportType} 
          onChange={(e) => setReportType(e.target.value)}
          className="report-select"
        >
          <option value="achievements">🏆 Achievements Report</option>
          <option value="participations">🎯 Participation Report</option>
        </select>

        <motion.button
          onClick={handleDownload}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="download-btn"
        >
          📥 Download Report
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ReportGenerator;
