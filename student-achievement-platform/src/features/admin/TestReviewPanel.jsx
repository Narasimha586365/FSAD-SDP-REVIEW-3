import React from 'react';
import Swal from 'sweetalert2';
import { useAppContext } from '../../context/AppContext';

const optionLabel = (value = '') => {
  if (!value) return 'Not answered';
  return value.replace('option', 'Option ');
};

const TestReviewPanel = () => {
  const { adminTestAttempts, issueAchievementForAttempt, fetchJson, currentUser } = useAppContext();

  const handleIssue = async (attempt) => {
    const { value: formValues } = await Swal.fire({
      title: 'Issue Achievement & Certificate',
      html: `
        <input id="swal-title" class="swal2-input" placeholder="Achievement title" value="${attempt.score >= 50 ? `${attempt.domainName} Excellence` : `${attempt.domainName} Result`}">
        <select id="swal-category" class="swal2-input">
          <option value="award">Award</option>
          <option value="recognition" selected>Recognition</option>
          <option value="participation">Participation</option>
        </select>
        <textarea id="swal-description" class="swal2-textarea" placeholder="Description">${attempt.studentName} completed ${attempt.domainName} assessment with ${attempt.score}%. Status: ${attempt.score >= 50 ? 'Passed' : 'Not Passed'}.</textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => ({
        title: document.getElementById('swal-title').value,
        category: document.getElementById('swal-category').value,
        description: document.getElementById('swal-description').value
      })
    });

    if (!formValues) return;

    try {
      await issueAchievementForAttempt({
        attemptId: attempt.id,
        ...formValues
      });
      Swal.fire('Issued', 'Certificate emailed successfully to the student.', 'success');
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleReviewAttempt = async (attemptId) => {
    try {
      const review = await fetchJson(`/test-attempts/${attemptId}/review`);
      const answerHtml = (review.answers || []).map((answer, index) => `
        <div style="text-align:left; padding:12px 0; border-bottom:1px solid #e2e8f0;">
          <div style="font-weight:700; color:#0f172a; margin-bottom:6px;">Q${index + 1}. ${answer.question}</div>
          <div style="color:${answer.isCorrect ? '#047857' : '#b91c1c'}; font-weight:600;">Student Answer: ${optionLabel(answer.selectedAnswer)}</div>
          <div style="color:#1d4ed8; font-weight:600;">Correct Answer: ${optionLabel(answer.correctAnswer)}</div>
        </div>
      `).join('');
      await Swal.fire({
        title: `${review.studentName || 'Student'} - ${review.domainName} Review`,
        html: `
          <div style="text-align:left;">
            <div style="margin-bottom:14px; padding:12px; border-radius:12px; background:#eff6ff;">
              <div><strong>Category:</strong> ${review.categoryName}</div>
              <div><strong>Score:</strong> ${review.score}%</div>
              <div><strong>Status:</strong> ${review.resultLabel}</div>
              <div><strong>Correct Answers:</strong> ${review.correctAnswers} / ${review.totalQuestions}</div>
            </div>
            ${answerHtml}
          </div>
        `,
        width: 900,
        confirmButtonText: 'Close'
      });
    } catch (error) {
      Swal.fire('Review unavailable', error.message || 'Unable to load review.', 'error');
    }
  };

  const handleDownloadPdf = async (attempt) => {
    try {
      if (!attempt?.certificateId) {
        throw new Error('Certificate is not issued yet.');
      }
      const response = await fetch(`http://localhost:8080/certificate/download?certificateId=${attempt.certificateId}`, {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`
        }
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to download certificate.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attempt.certificateFileName || `${attempt.studentName}-${attempt.domainName}-certificate.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      Swal.fire('PDF unavailable', error.message || 'Unable to download certificate PDF.', 'error');
    }
  };

  return (
    <div className="student-list-container">
      <div className="list-header">
        <h2>Completed Domain Tests</h2>
        <p>Review student scores and issue achievements with certificate PDFs</p>
      </div>

      <div className="table-wrapper">
        <table className="student-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Category</th>
              <th>Domain</th>
              <th>Score</th>
              <th>Status</th>
              <th>Certificate</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {adminTestAttempts.length > 0 ? (
              adminTestAttempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td>
                    <strong>{attempt.studentName}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{attempt.rollNumber}</div>
                  </td>
                  <td>{attempt.categoryName}</td>
                  <td>{attempt.domainName}</td>
                  <td>{attempt.score}%</td>
                  <td>{attempt.score >= 50 ? 'Passed' : 'Not Passed'}</td>
                  <td>{attempt.certificateIssued ? 'Issued' : 'Pending'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="submit-btn"
                        type="button"
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                        disabled={attempt.certificateIssued}
                        onClick={() => handleIssue(attempt)}
                      >
                        {attempt.certificateIssued ? 'Issued' : 'Issue'}
                      </button>
                      <button
                        type="button"
                        style={{ padding: '6px 12px', fontSize: '13px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={() => handleReviewAttempt(attempt.id)}
                      >
                        Review
                      </button>
                      {attempt.certificateIssued && attempt.certificateId && (
                        <button
                          type="button"
                          style={{ padding: '6px 12px', fontSize: '13px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          onClick={() => handleDownloadPdf(attempt)}
                        >
                          PDF
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  No completed assessments yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestReviewPanel;
