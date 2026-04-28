import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ActivityForm = () => {
  const { addActivity, fetchJson, activityList } = useAppContext();
  const [categories, setCategories] = useState([]);
  const [domains, setDomains] = useState([]);
  const [formData, setFormData] = useState({
    activityName: '',
    activityCategory: '',
    domainId: '',
    role: '',
    duration: '',
    skills: '',
    startDate: '',
    endDate: '',
    slots: 30,
  });

  useEffect(() => {
    fetchJson('/categories').then((data) => setCategories(data || [])).catch(() => setCategories([]));
  }, [fetchJson]);

  useEffect(() => {
    if (!formData.activityCategory) {
      setDomains([]);
      return;
    }
    const selectedCategory = categories.find((item) => item.activityCategory === formData.activityCategory);
    if (!selectedCategory) {
      setDomains([]);
      return;
    }
    fetchJson(`/domains/${selectedCategory.id}`).then((data) => setDomains(data || [])).catch(() => setDomains([]));
  }, [categories, formData.activityCategory, fetchJson]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'activityCategory' ? { domainId: '' } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const skillsArray = formData.skills.split(',').map((item) => item.trim()).filter(Boolean);

    try {
      await addActivity({
        ...formData,
        skills: skillsArray,
      });

      toast.success('Activity added successfully!', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
      });

      setFormData({
        activityName: '',
        activityCategory: '',
        domainId: '',
        role: '',
        duration: '',
        skills: '',
        startDate: '',
        endDate: '',
        slots: 30,
      });
    } catch (error) {
      toast.error(error.message || 'Unable to add activity', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
      });
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="form-container">
        <h2>Add New Activity</h2>
        <p className="form-description">Create domain-based activities for students to enroll in</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Activity Name *</label>
            <input
              type="text"
              name="activityName"
              value={formData.activityName}
              onChange={handleChange}
              placeholder="e.g., UI/UX Workshop"
              required
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="activityCategory"
              value={formData.activityCategory}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.activityCategory}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Domain *</label>
            <select
              name="domainId"
              value={formData.domainId}
              onChange={handleChange}
              required
              disabled={!formData.activityCategory}
            >
              <option value="">Select Domain</option>
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>{domain.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Role *</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="e.g., Participant, Member"
              required
            />
          </div>

          <div className="form-group">
            <label>Duration *</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 1 month, 2 days"
              required
            />
          </div>

          <div className="form-group">
            <label>Skills (comma separated) *</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g., Programming, Teamwork, Leadership"
              required
            />
          </div>

          <div className="form-group">
            <label>Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date *</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Participant Limit *</label>
            <input
              type="number"
              name="slots"
              value={formData.slots}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <button type="submit" className="submit-btn">Add Activity</button>
        </form>
      </div>

      <div className="student-list-container" style={{ marginTop: '40px' }}>
        <div className="list-header">
          <h2>Added Activities</h2>
          <p>List of all activities currently active in the platform</p>
        </div>
        <div className="table-wrapper">
          <table className="student-table">
            <thead>
              <tr>
                <th>Activity Name</th>
                <th>Category</th>
                <th>Domain</th>
                <th>Role</th>
                <th>Duration</th>
                <th>Slots</th>
                <th>Date Range</th>
              </tr>
            </thead>
            <tbody>
              {activityList && activityList.length > 0 ? (
                activityList.map((activity) => (
                  <tr key={activity.activityId}>
                    <td><strong>{activity.activityName}</strong></td>
                    <td>{activity.activityCategory}</td>
                    <td>{activity.domainName || 'N/A'}</td>
                    <td>{activity.role}</td>
                    <td>{activity.duration}</td>
                    <td>{activity.slots}</td>
                    <td>{activity.startDate} to {activity.endDate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    No activities added yet
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

export default ActivityForm;
