import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAppContext } from '../context/AppContext';

const CATEGORY_COLORS = [
  'linear-gradient(135deg, #5b7cff 0%, #7c4dff 100%)',
  'linear-gradient(135deg, #36c6ff 0%, #4facfe 100%)',
  'linear-gradient(135deg, #2dd4bf 0%, #22c55e 100%)',
  'linear-gradient(135deg, #fb7185 0%, #fb923c 100%)',
  'linear-gradient(135deg, #c084fc 0%, #60a5fa 100%)',
  'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
];

const DomainsPage = () => {
  const { categoryId } = useParams();
  const [domains, setDomains] = useState([]);
  const [categoryName, setCategoryName] = useState('Domains');
  const [busyDomainId, setBusyDomainId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => document.body.classList.contains('dark-mode'));
  const navigate = useNavigate();
  const { currentUser, fetchJson, addEnrollment, activityList, participationList, testAttemptList, refreshPlatformData } = useAppContext();
  const currentUserId = Number(currentUser?.id);

  const enrolledDomainIds = useMemo(
    () => new Set(
      (participationList || [])
        .filter((item) => Number(item.studentId) === currentUserId)
        .map((item) => Number(item.domainId))
        .filter(Boolean)
    ),
    [currentUserId, participationList]
  );

  useEffect(() => {
    const loadDomains = async () => {
      try {
        const categories = await fetchJson('/categories');
        const selected = (categories || []).find((item) => String(item.id) === String(categoryId));
        const normalizedName = (selected?.name || '').toLowerCase().replace(/\s+/g, ' ').replace('ncc/nss', 'ncc / nss').trim();
        const candidateCategories = (categories || []).filter((item) => {
          const itemName = (item.name || '').toLowerCase().replace(/\s+/g, ' ').replace('ncc/nss', 'ncc / nss').trim();
          return selected
            ? itemName === normalizedName || item.activityCategory === selected.activityCategory
            : String(item.id) === String(categoryId);
        });

        let resolvedDomains = [];
        let resolvedCategory = selected;
        for (const candidate of candidateCategories.length ? candidateCategories : [{ id: categoryId }]) {
          const data = await fetchJson(`/domains/${candidate.id}`);
          if (data?.length) {
            resolvedDomains = data;
            resolvedCategory = candidate;
            break;
          }
        }

        setDomains(resolvedDomains);
        setCategoryName(resolvedCategory?.name || 'Domains');
      } catch {
        setDomains([]);
      }
    };

    loadDomains();
  }, [categoryId, fetchJson]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.body.classList.contains('dark-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const enrollForDomain = async (domainId) => {
    if (!currentUser?.id) {
      navigate('/login');
      return;
    }
    const selectedActivity = (activityList || []).find((item) => Number(item.domainId) === Number(domainId));
    if (!selectedActivity) {
      Swal.fire('No activity available', 'Admin has not added an activity for this domain yet.', 'info');
      return;
    }
    try {
      setBusyDomainId(domainId);
      await addEnrollment({ studentId: currentUser.id, activityId: selectedActivity.activityId });
      await refreshPlatformData();
      Swal.fire('Enrolled', 'Enrollment completed. You can start the test now.', 'success');
    } catch (error) {
      Swal.fire('Enrollment failed', error.message, 'error');
    } finally {
      setBusyDomainId(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: isDarkMode ? 'linear-gradient(135deg, #0f172a 0%, #111827 100%)' : 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/participation')}
          style={{ marginBottom: '18px', cursor: 'pointer', padding: '10px 18px', borderRadius: '12px', border: 'none', background: isDarkMode ? '#1f2937' : '#ffffff', color: isDarkMode ? '#e5e7eb' : '#334155', boxShadow: '0 8px 18px rgba(37,99,235,0.12)' }}
        >
          Back to My Participants
        </button>

        <div style={{ background: isDarkMode ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.88)', borderRadius: '24px', padding: '28px', boxShadow: '0 18px 40px rgba(59,130,246,0.12)', marginBottom: '24px' }}>
          <h1 style={{ margin: 0, color: isDarkMode ? '#f3f4f6' : '#1e293b', fontSize: '34px' }}>{categoryName}</h1>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%)', border: '1px solid #fed7aa', borderRadius: '20px', padding: '20px 22px', marginBottom: '28px', boxShadow: '0 10px 24px rgba(249,115,22,0.12)' }}>
          <div style={{ fontWeight: 800, color: '#9a3412', marginBottom: '6px' }}>Access Required For Tests</div>
          <div style={{ color: '#7c2d12', lineHeight: 1.6 }}>
            First enroll in this category, then start the domain test from any card below.
          </div>
        </div>

        {domains.length === 0 ? (
          <div style={{ background: isDarkMode ? '#1f2937' : '#ffffff', borderRadius: '24px', padding: '36px', textAlign: 'center', color: isDarkMode ? '#d1d5db' : '#475569', boxShadow: '0 18px 40px rgba(59,130,246,0.12)' }}>
            No domains found.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
            {domains.map((domain, index) => (
              (() => {
                const linkedActivity = (activityList || []).find((item) => Number(item.domainId) === Number(domain.id));
                const isEnrolled = linkedActivity ? enrolledDomainIds.has(Number(domain.id)) : false;
                const completedDomainAttempts = (testAttemptList || []).filter(
                  (attempt) =>
                    Number(attempt.moduleId) === Number(domain.moduleId)
                    && String(attempt.status).toUpperCase() === 'COMPLETED'
                );
                const passedAttempt = completedDomainAttempts.some((attempt) => Number(attempt.score) >= 50);
                const completedAllAttempts = passedAttempt || completedDomainAttempts.length >= 2;
                const startLabel = completedAllAttempts
                  ? 'Completed Test'
                  : completedDomainAttempts.length === 1
                    ? '2nd Chance'
                    : 'Start Test';

                return (
                  <div
                    key={domain.id}
                    onClick={() => {
                      if (!domain.moduleId) return;
                      navigate(`/study/${domain.moduleId}`);
                    }}
                    style={{
                      minHeight: '156px',
                      borderRadius: '22px',
                      padding: '22px',
                      textAlign: 'left',
                      color: '#ffffff',
                      background: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                      boxShadow: '0 16px 34px rgba(59,130,246,0.18)',
                      cursor: domain.moduleId ? 'pointer' : 'default'
                    }}
                  >
                    <div style={{ fontSize: '15px', opacity: 0.92, marginBottom: '22px', fontWeight: 700 }}>Domain {index + 1}</div>
                    <div style={{ fontSize: '24px', lineHeight: 1.25, fontWeight: 900, marginBottom: '18px' }}>{domain.name}</div>
                    <div style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.95 }}>
                      {linkedActivity
                        ? `Activity: ${linkedActivity.activityName}`
                        : 'Admin has not added a domain activity yet.'}
                    </div>
                    <div style={{ marginTop: '18px', display: 'flex', gap: '10px', flexWrap: 'wrap' }} onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => enrollForDomain(domain.id)}
                        disabled={!linkedActivity || isEnrolled || busyDomainId === domain.id}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '12px',
                          border: 'none',
                          background: 'rgba(255,255,255,0.22)',
                          color: '#ffffff',
                          cursor: !linkedActivity || isEnrolled || busyDomainId === domain.id ? 'default' : 'pointer',
                          fontWeight: 800,
                          opacity: isEnrolled ? 0.85 : 1,
                        }}
                      >
                        {isEnrolled ? 'Enrolled' : busyDomainId === domain.id ? 'Enrolling...' : 'Enroll'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (completedAllAttempts) {
                            Swal.fire('Completed Test', 'You have already completed the available test chances for this domain.', 'info');
                            return;
                          }
                          if (!domain.moduleId) {
                            Swal.fire('Module unavailable', 'Study module is not ready for this domain yet.', 'warning');
                            return;
                          }
                          if (!isEnrolled) {
                            Swal.fire('Access Required', 'Please enroll for this domain activity first.', 'warning');
                            return;
                          }
                          navigate(`/test/${domain.moduleId}`);
                        }}
                        disabled={completedAllAttempts || !domain.moduleId || !isEnrolled}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '12px',
                          border: 'none',
                          background: '#ffffff',
                          color: '#1e293b',
                          cursor: completedAllAttempts || !domain.moduleId || !isEnrolled ? 'default' : 'pointer',
                          fontWeight: 800,
                          opacity: completedAllAttempts || !domain.moduleId || !isEnrolled ? 0.75 : 1,
                        }}
                      >
                        {startLabel}
                      </button>
                    </div>
                  </div>
                );
              })()
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainsPage;
