import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const activityCategories = [
  { value: 'sports', label: 'Sports Competitions' },
  { value: 'cultural', label: 'Cultural Events' },
  { value: 'ncc', label: 'NCC / NSS Participation' },
  { value: 'club', label: 'Club Activities' },
  { value: 'entrepreneurship', label: 'Entrepreneurship' },
  { value: 'others', label: 'Others' }
];

const AchievementForm = () => {
  const { students, addAchievement, achievementList } = useAppContext();
  const [formData, setFormData] = useState({
    studentId: '',
    title: '',
    category: 'award',
    activityCategory: '',
    description: '',
    date: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addAchievement(formData);
      toast.success('Achievement added successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored'
      });

      setFormData({
        studentId: '',
        title: '',
        category: 'award',
        activityCategory: '',
        description: '',
        date: ''
      });
    } catch (error) {
      toast.error(error.message || 'Unable to add achievement', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored'
      });
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="form-container">
        <h2>Add New Achievement</h2>
        <p className="form-description">
          Record student awards, recognitions, and participation
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Student *</label>
            <select
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
            >
              <option value="">Choose a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.rollNumber}) - {student.department}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Achievement Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., First Prize in Hackathon"
              required
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="award">Award</option>
              <option value="recognition">Recognition</option>
              <option value="participation">Participation</option>
            </select>
          </div>

          <div className="form-group">
            <label>Activity Type *</label>
            <select
              name="activityCategory"
              value={formData.activityCategory}
              onChange={handleChange}
              required
            >
              <option value="">Select Activity Type</option>
              {activityCategories.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the achievement in detail..."
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Add Achievement
          </button>
        </form>
      </div>

      <div className="student-list-container" style={{ marginTop: '40px' }}>
        <div className="list-header">
          <h2>Added Achievements</h2>
          <p>List of all achievements currently granted to students</p>
        </div>
        <div className="table-wrapper">
          <table className="student-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Title</th>
                <th>Type</th>
                <th>Category</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {achievementList && achievementList.length > 0 ? (
                achievementList.map((achievement) => (
                  <tr key={achievement.id}>
                    <td><strong>{achievement.studentName || 'Unknown Student'}</strong></td>
                    <td>{achievement.title}</td>
                    <td><span style={{ textTransform: 'capitalize' }}>{achievement.category}</span></td>
                    <td>{achievement.activityCategory || 'General'}</td>
                    <td>{achievement.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    No achievements added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AchievementForm;
