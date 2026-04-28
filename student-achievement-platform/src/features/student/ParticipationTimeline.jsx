import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAppContext } from '../../context/AppContext';

const CATEGORY_STYLES = {
  sports: 'linear-gradient(135deg, #6f5be8 0%, #7c4dff 100%)',
  cultural: 'linear-gradient(135deg, #ff74c8 0%, #ff5d7a 100%)',
  ncc: 'linear-gradient(135deg, #34c8ff 0%, #14b8ff 100%)',
  club: 'linear-gradient(135deg, #ff9b6a 0%, #ffd24d 100%)',
  entrepreneurship: 'linear-gradient(135deg, #26de81 0%, #38efc3 100%)',
  others: 'linear-gradient(135deg, #c66eff 0%, #54c7ff 100%)',
};

const normalizeCategoryName = (name = '') => name.toLowerCase().replace(/\s+/g, ' ').replace('ncc/nss', 'ncc / nss').trim();
const normalizeActivityType = (value = '') => value.toLowerCase().trim();
const optionLabel = (value = '') => {
  if (!value) return 'Not answered';
  return value.replace('option', 'Option ');
};

const ParticipationTimeline = ({ participations }) => {
  const { currentUser, addEnrollment, activityList, fetchJson, testAttemptList, certificateList, refreshPlatformData } = useAppContext();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showHistory, setShowHistory] = useState(true);
  const [busyActivityId, setBusyActivityId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    refreshPlatformData();
  }, [refreshPlatformData]);

  useEffect(() => {
    fetchJson('/categories')
      .then((items) => {
        const deduped = [];
        const seen = new Set();
        (items || []).forEach((category) => {
          const key = `${category.activityCategory}-${normalizeCategoryName(category.name)}`;
          if (!seen.has(key)) {
            seen.add(key);
            deduped.push({
              ...category,
              name: normalizeCategoryName(category.name) === 'ncc / nss participation'
                ? 'NCC / NSS Participation'
                : category.name,
            });
          }
        });
        setCategories(deduped);
      })
      .catch(() => setCategories([]));
  }, [fetchJson]);

  const enrolledActivityIds = useMemo(
    () => new Set((participations || []).map((item) => item.activityId)),
    [participations]
  );

  const completedAttempts = useMemo(
    () => (testAttemptList || []).filter((attempt) => String(attempt.status).toUpperCase() === 'COMPLETED'),
    [testAttemptList]
  );

  const visibleCertificates = useMemo(() => {
    const issued = [...(certificateList || [])];
    const knownModuleIds = new Set(issued.map((item) => Number(item.moduleId)));
    (testAttemptList || [])
      .filter((attempt) => attempt.certificateIssued && !knownModuleIds.has(Number(attempt.moduleId)))
      .forEach((attempt) => {
        issued.push({
          id: attempt.certificateId || `attempt-${attempt.id}`,
          moduleId: attempt.moduleId,
          issuedDate: attempt.submittedAt,
          score: attempt.score,
          fileName: attempt.certificateFileName || `${attempt.moduleName || 'certificate'}.pdf`,
          moduleName: attempt.moduleName,
          domainName: attempt.domainName,
          categoryName: attempt.categoryName,
          achievementTitle: attempt.score >= 50 ? `${attempt.domainName} Excellence` : null,
          resultLabel: attempt.score >= 50 ? 'PASSED' : 'NOT PASSED',
          fallbackAttemptId: attempt.id
        });
      });
    return issued;
  }, [certificateList, testAttemptList]);

  const filteredActivities = selectedCategory === 'all'
    ? activityList
    : activityList.filter((item) => item.activityCategory?.toLowerCase() === selectedCategory);

  const handleEnroll = async (activity) => {
    try {
      setBusyActivityId(activity.activityId);
      await addEnrollment({ studentId: currentUser.id, activityId: activity.activityId });
      Swal.fire('Enrolled', 'Enrollment saved successfully.', 'success');
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setBusyActivityId(null);
    }
  };

  const openDomains = (category) => {
    if (!category?.id) {
      Swal.fire('Category not found', 'This category is not ready yet. Please refresh data and try again.', 'info');
      return;
    }
    navigate(`/domains/${category.id}`);
  };

  const handleReviewAttempt = async (attemptId) => {
    try {
      const review = await fetchJson(`/test-attempts/${attemptId}/review`);
      const answerHtml = (review.answers || []).map((answer, index) => `
        <div style="text-align:left; padding:12px 0; border-bottom:1px solid #e2e8f0;">
          <div style="font-weight:700; color:#0f172a; margin-bottom:6px;">Q${index + 1}. ${answer.question}</div>
          <div style="color:${answer.isCorrect ? '#047857' : '#b91c1c'}; font-weight:600;">Your Answer: ${optionLabel(answer.selectedAnswer)}</div>
          <div style="color:#1d4ed8; font-weight:600;">Correct Answer: ${optionLabel(answer.correctAnswer)}</div>
        </div>
      `).join('');
      Swal.fire({
        title: `${review.domainName} Review`,
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
      Swal.fire('Review unavailable', error.message, 'error');
    }
  };

  const openCertificate = async (certificate, mode = 'view') => {
    try {
      let resolvedCertificate = certificate;
      const numericCertificateId = Number(certificate.id);
      const hasRealCertificateId = Number.isFinite(numericCertificateId) && numericCertificateId > 0;

      if (!hasRealCertificateId) {
        resolvedCertificate = (certificateList || []).find((item) => Number(item.moduleId) === Number(certificate.moduleId));
        if (!resolvedCertificate) {
          const latestCertificates = await fetchJson('/certificates/me');
          resolvedCertificate = (latestCertificates || []).find((item) => Number(item.moduleId) === Number(certificate.moduleId));
        }
        if (!resolvedCertificate) {
          resolvedCertificate = await fetchJson(`/certificate/resolve?moduleId=${certificate.moduleId}`);
        }
        await refreshPlatformData();
      }

      if (mode === 'download') {
        const response = await fetch(`https://student-achievement-api.onrender.com/certificate/download?certificateId=${resolvedCertificate.id}`, {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`
          }
        });
        if (!response.ok) {
          throw new Error('Unable to download certificate.');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = resolvedCertificate.fileName || 'certificate.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
        return;
      }
      navigate(`/certificate/${resolvedCertificate.id}`);
    } catch (error) {
      Swal.fire('Certificate not ready', error.message || 'Unable to open certificate.', 'error');
    }
  };

  return (
    <div className="participation-timeline">
      <div className="category-filter-section">
        <h3>Explore Various Categories of Activities</h3>
        <div className="category-buttons">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.activityCategory ? 'active' : ''}`}
              style={{ background: CATEGORY_STYLES[category.activityCategory] || CATEGORY_STYLES.others }}
              onClick={() => {
                setSelectedCategory(category.activityCategory);
                openDomains(category);
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
        <button className="clear-filter-btn" onClick={() => setSelectedCategory('all')}>
          Show All Activities
        </button>
      </div>

      <div style={{ margin: '30px 0 20px 0', padding: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '10px', textAlign: 'center' }}>
        <h2 style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Upcoming Activities</h2>
      </div>

      {filteredActivities.length > 0 ? (
        <div className="timeline">
          {filteredActivities.map((activity) => (
            <div key={activity.activityId} className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3>{activity.activityName}</h3>
                    <p className="role"><strong>Role:</strong> {activity.role}</p>
                    <p className="duration"><strong>Duration:</strong> {activity.duration}</p>
                    <p className="dates">{activity.startDate} - {activity.endDate}</p>
                    <p><strong>Seats:</strong> {activity.enrolledCount} / {activity.slots}</p>
                    {activity.skills?.length > 0 && (
                      <div className="skills">
                        <strong>Skills:</strong>
                        <div className="skill-tags">
                          {activity.skills.map((skill, index) => (
                            <span key={index} className="skill-tag">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ marginLeft: '20px' }}>
                    {enrolledActivityIds.has(activity.activityId) ? (
                      <button
                        onClick={() => {
                          const category = categories.find((item) => normalizeActivityType(item.activityCategory) === normalizeActivityType(activity.activityCategory));
                          if (category) {
                            openDomains(category);
                          } else {
                            Swal.fire('Category not found', 'Please refresh data and try again.', 'info');
                          }
                        }}
                        style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Explore Domains
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(activity)}
                        disabled={busyActivityId === activity.activityId}
                        style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: busyActivityId === activity.activityId ? 'wait' : 'pointer', fontWeight: 'bold', opacity: busyActivityId === activity.activityId ? 0.75 : 1 }}
                      >
                        {busyActivityId === activity.activityId ? 'Enrolling...' : 'Enroll'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data"><p>No activities found.</p></div>
      )}

      <div style={{ marginTop: '40px' }}>
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{ padding: '12px 30px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', marginBottom: '20px' }}
        >
          {showHistory ? 'Hide Progress' : 'View Assessment Progress'}
        </button>

        {showHistory && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '24px' }}>Assessment History</h3>
            {completedAttempts.length === 0 ? (
              <p>No domain tests attempted yet.</p>
            ) : (
              <div>
                {completedAttempts.map((attempt) => (
                  <div key={attempt.id} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '15px', border: '2px solid #e0e0e0' }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>{attempt.categoryName} - {attempt.domainName}</h4>
                    <p><strong>Score:</strong> {attempt.score}%</p>
                    <p><strong>Status:</strong> {attempt.resultLabel || (attempt.score >= 50 ? 'Passed' : 'Not Passed')}</p>
                    <p><strong>Certificate:</strong> {attempt.certificateIssued ? 'Issued' : 'Pending'}</p>
                    <button
                      onClick={() => handleReviewAttempt(attempt.id)}
                      style={{ padding: '10px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '8px' }}
                    >
                      Review Test
                    </button>
                  </div>
                ))}
              </div>
            )}

            <h3 style={{ margin: '30px 0 20px', fontSize: '24px' }}>Certificates</h3>
            {visibleCertificates.length === 0 ? (
              <p>No certificates issued yet.</p>
            ) : (
              <>
                <div style={{ marginBottom: '16px', color: '#0f172a', fontWeight: 'bold' }}>
                  {visibleCertificates.length} certificate{visibleCertificates.length > 1 ? 's' : ''} issued
                </div>
                {visibleCertificates.map((certificate) => (
                <div key={certificate.id} style={{ background: '#eef6ff', padding: '16px', borderRadius: '10px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #bfdbfe' }}>
                  <div>
                    <strong>{certificate.achievementTitle || certificate.moduleName}</strong>
                    <div style={{ fontSize: '13px', color: '#475569' }}>{certificate.categoryName} - {certificate.domainName} - {certificate.score}%</div>
                    <div style={{ fontSize: '12px', color: certificate.resultLabel === 'PASSED' ? '#047857' : '#b91c1c', fontWeight: 'bold', marginTop: '4px' }}>
                      {certificate.resultLabel}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => openCertificate(certificate, 'view')}
                      style={{ padding: '10px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => openCertificate(certificate, 'download')}
                      style={{ padding: '10px 16px', background: '#0f766e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipationTimeline;

