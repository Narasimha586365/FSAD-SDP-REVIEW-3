import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useAppContext } from '../../context/AppContext';

const AdminAccessPanel = () => {
  const { accessSummary, students, currentUser, updatePlatformLimits, approveCoAdmin, removeUser } = useAppContext();
  const [studentLimit, setStudentLimit] = useState(accessSummary?.studentLimit || 0);
  const [coAdminLimit, setCoAdminLimit] = useState(accessSummary?.coAdminLimit || 0);

  useEffect(() => {
    setStudentLimit(accessSummary?.studentLimit || 0);
    setCoAdminLimit(accessSummary?.coAdminLimit || 0);
  }, [accessSummary?.studentLimit, accessSummary?.coAdminLimit]);

  const handleLimitSave = async () => {
    try {
      await updatePlatformLimits(studentLimit, coAdminLimit);
      Swal.fire('Saved', 'Platform limits updated successfully.', 'success');
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleApprove = async (userId) => {
    try {
      await approveCoAdmin(userId);
      Swal.fire('Approved', 'Co-admin access granted successfully.', 'success');
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleRemove = async (user) => {
    const result = await Swal.fire({
      title: 'Remove User',
      text: `Remove ${user.name} from the portal?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Remove',
      cancelButtonText: 'Cancel'
    });
    if (!result.isConfirmed) return;
    try {
      await removeUser(user.id);
      Swal.fire('Removed', `${user.name} was removed successfully.`, 'success');
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  return (
    <div className="student-list-container">
      <div className="list-header">
        <h2>Access Management</h2>
        <p>Manage student limits, co-admin limits, and pending co-admin approvals</p>
      </div>

      <div className="form-container" style={{ marginBottom: '24px' }}>
        <h3>Platform Limits</h3>
        <div className="form-group">
          <label>Student Limit</label>
          <input type="number" min="1" value={studentLimit} onChange={(e) => setStudentLimit(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Co-Admin Limit</label>
          <input type="number" min="0" value={coAdminLimit} onChange={(e) => setCoAdminLimit(e.target.value)} />
        </div>
        <button className="submit-btn" type="button" onClick={handleLimitSave}>Save Limits</button>
      </div>

      <div className="stats-container" style={{ marginBottom: '24px' }}>
        <div className="stat-card-admin"><h3>{accessSummary?.studentCount || 0}</h3><p>Active Students</p></div>
        <div className="stat-card-admin"><h3>{accessSummary?.coAdminCount || 0}</h3><p>Active Co-Admins</p></div>
        <div className="stat-card-admin"><h3>{accessSummary?.pendingCoAdminCount || 0}</h3><p>Pending Co-Admin Requests</p></div>
      </div>

      <div className="table-wrapper">
        <table className="student-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Roll Number</th>
              <th>Department</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {(accessSummary?.pendingCoAdmins || []).length > 0 ? (
              accessSummary.pendingCoAdmins.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.rollNumber}</td>
                  <td>{user.department}</td>
                  <td>{user.accessStatus}</td>
                  <td>
                    <button className="submit-btn" type="button" onClick={() => handleApprove(user.id)}>
                      Approve as Co-Admin
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No pending co-admin requests</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-wrapper" style={{ marginTop: '24px' }}>
        <table className="student-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Roll Number</th>
              <th>Department</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.rollNumber}</td>
                  <td>{user.department}</td>
                  <td>{user.accessStatus}</td>
                  <td>
                    <button className="submit-btn" type="button" onClick={() => handleRemove(user)}>
                      Remove Student
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No students found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-wrapper" style={{ marginTop: '24px' }}>
        <table className="student-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Roll Number</th>
              <th>Department</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {(accessSummary?.activeCoAdmins || []).length > 0 ? (
              accessSummary.activeCoAdmins
                .filter((user) => String(user.email).toLowerCase() !== String(currentUser?.email || '').toLowerCase())
                .map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.rollNumber}</td>
                    <td>{user.department}</td>
                    <td>{user.accessStatus}</td>
                    <td>
                      <button className="submit-btn" type="button" onClick={() => handleRemove(user)}>
                        Remove Co-Admin
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No active co-admins found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAccessPanel;
