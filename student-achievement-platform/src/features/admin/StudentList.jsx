import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const StudentList = () => {
  const { students, achievementList, participationList, adminTestAttempts } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="student-list-container">
      <div className="list-header">
        <h2>👥 All Students</h2>
        <input
          type="text"
          placeholder="🔍 Search by name, roll number, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-wrapper">
        <table className="student-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Cohort</th>
              <th>Achievements</th>
              <th>Tests</th>
              <th>Participations</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => {
              const achievementCount = achievementList.filter(a => a.studentId === student.id).length;
              const testCount = adminTestAttempts ? adminTestAttempts.filter(t => t.userId === student.id).length : 0;
              const participationCount = participationList.filter(p => p.studentId === student.id).length;
              
              return (
                <tr key={student.id}>
                  <td>{student.rollNumber}</td>
                  <td><strong>{student.name}</strong></td>
                  <td>{student.email}</td>
                  <td><span className="dept-badge">{student.department}</span></td>
                  <td>{student.cohort}</td>
                  <td><span className="count-badge">{achievementCount}</span></td>
                  <td><span className="count-badge">{testCount}</span></td>
                  <td><span className="count-badge">{participationCount}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <p className="no-data">No students found matching your search.</p>
      )}
    </div>
  );
};

export default StudentList;
