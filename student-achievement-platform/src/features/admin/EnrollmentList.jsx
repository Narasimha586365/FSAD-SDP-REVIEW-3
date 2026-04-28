import React from 'react';
import Swal from 'sweetalert2';
import { useAppContext } from '../../context/AppContext';

const EnrollmentList = () => {
  const { enrollmentList, currentUser, updateActivitySlots, grantTestAccess } = useAppContext();

  const handleUpdateSlots = async (activityId, currentSlots) => {
    const result = await Swal.fire({
      title: 'Update Participant Limit',
      input: 'number',
      inputValue: currentSlots,
      inputAttributes: { min: 1 },
      showCancelButton: true,
      confirmButtonText: 'Save'
    });

    if (!result.isConfirmed) return;

    try {
      await updateActivitySlots(activityId, result.value);
      Swal.fire('Updated', 'Participant limit updated successfully.', 'success');
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleGrantTestAccess = async (enrollment) => {
    try {
      await grantTestAccess(enrollment.id);
      Swal.fire('Access Granted', 'Student can now take the test for this category.', 'success');
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  return (
    <div className="student-list-container">
      <div className="list-header">
        <h2>Student Enrollments</h2>
        <p>View all student activity enrollments</p>
      </div>

      <div className="table-wrapper">
        <table className="student-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Activity Name</th>
              <th>Filled / Limit</th>
              <th>Status</th>
              <th>Enrolled Date</th>
              {currentUser?.role === 'admin' && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {enrollmentList.length > 0 ? (
              enrollmentList.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td><strong>{enrollment.studentName}</strong></td>
                  <td>
                    <div>{enrollment.activityName}</div>
                    {enrollment.domainName && (
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        {enrollment.domainName}
                      </div>
                    )}
                  </td>
                  <td>{enrollment.enrolledCount} / {enrollment.slots}</td>
                  <td>
                    <span className="count-badge" style={{ background: '#10b981' }}>
                      {enrollment.status}
                    </span>
                  </td>
                  <td>{new Date(enrollment.enrolledDate).toLocaleDateString('en-IN')}</td>
                  {currentUser?.role === 'admin' && (
                    <td>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button className="submit-btn" type="button" onClick={() => handleUpdateSlots(enrollment.activityId, enrollment.slots)}>
                          Update Limit
                        </button>
                        <button
                          className="submit-btn"
                          type="button"
                          onClick={() => handleGrantTestAccess(enrollment)}
                          disabled={enrollment.testAccessGranted}
                          style={{ opacity: enrollment.testAccessGranted ? 0.72 : 1 }}
                        >
                          {enrollment.testAccessGranted ? 'Access Granted' : 'Give Test Access'}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={currentUser?.role === 'admin' ? 6 : 5} style={{ textAlign: 'center', padding: '20px' }}>
                  No enrollments yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnrollmentList;
