import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAppContext } from '../context/AppContext';

const StudyPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { fetchJson } = useAppContext();
  const [study, setStudy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canAttemptTest, setCanAttemptTest] = useState(false);
  const [accessMessage, setAccessMessage] = useState('Enroll in the related activity to unlock test access.');
  const [isDarkMode, setIsDarkMode] = useState(() => document.body.classList.contains('dark-mode'));

  const getDomainVisual = (index) => {
    const escapeXml = (value = '') => value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
    const category = (study?.categoryName || 'General').toUpperCase();
    const domain = (study?.domainName || 'Domain').toUpperCase();
    const safeCategory = escapeXml(category);
    const safeDomain = escapeXml(domain);
    const colors = [
      ['#1d4ed8', '#7c3aed'],
      ['#0f766e', '#2563eb'],
      ['#b45309', '#db2777'],
      ['#166534', '#0369a1'],
      ['#7c2d12', '#9333ea']
    ];
    const [start, end] = colors[index % colors.length];
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='500'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='${start}'/>
          <stop offset='100%' stop-color='${end}'/>
        </linearGradient>
      </defs>
      <rect width='1200' height='500' fill='url(#g)'/>
      <circle cx='180' cy='140' r='90' fill='rgba(255,255,255,0.16)'/>
      <circle cx='1020' cy='360' r='110' fill='rgba(255,255,255,0.14)'/>
      <text x='70' y='240' font-family='Arial' font-size='44' font-weight='700' fill='white'>${safeCategory}</text>
      <text x='70' y='300' font-family='Arial' font-size='58' font-weight='800' fill='white'>${safeDomain}</text>
      <text x='70' y='350' font-family='Arial' font-size='30' font-weight='600' fill='white'>STUDY PAGE ${index + 1}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  useEffect(() => {
    let isMounted = true;
    const loadStudy = async () => {
      try {
        setIsLoading(true);
        const data = await fetchJson(`/module-study/${moduleId}`);
        const participations = await fetchJson('/participations/me');
        const relatedParticipation = (participations || []).find((item) => Number(item.domainId) === Number(data.domainId));
        const isEnrolled = Boolean(relatedParticipation);
        const hasTestAccess = Boolean(relatedParticipation);
        if (isMounted) {
          setStudy(data);
          setCanAttemptTest(isEnrolled && hasTestAccess);
          if (!isEnrolled) {
            setAccessMessage('You are not enrolled in the related activity for this domain. Please enroll first.');
          } else {
            setAccessMessage('You have test access. Complete this material and start your test.');
          }
        }
      } catch (error) {
        if (isMounted) {
          Swal.fire('Study content unavailable', error.message || 'Unable to load study material.', 'error')
            .then(() => navigate('/participation'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadStudy();
    return () => {
      isMounted = false;
    };
  }, [fetchJson, moduleId, navigate]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.body.classList.contains('dark-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const pages = useMemo(() => {
    const rawContent = String(study?.content || '');
    if (!rawContent) return [];
    return rawContent
      .split(/\n(?=Page \d+:)/g)
      .map((section) => section.trim())
      .filter(Boolean);
  }, [study?.content]);

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', color: '#334155', fontWeight: 700 }}>
        Loading study material...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: isDarkMode ? '#0b1220' : '#f8fafc', padding: '24px' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => navigate(study?.categoryId ? `/domains/${study.categoryId}` : '/participation')}
          style={{ marginBottom: '16px', padding: '10px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: isDarkMode ? '#1f2937' : '#ffffff', color: isDarkMode ? '#e5e7eb' : '#111827' }}
        >
          Back
        </button>
        <div style={{ background: isDarkMode ? '#111827' : 'white', borderRadius: '16px', padding: '22px', marginBottom: '18px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' }}>
          <h1 style={{ margin: 0, color: isDarkMode ? '#f9fafb' : '#111827' }}>{study?.domainName} - Study Material</h1>
          <p style={{ marginTop: '8px', color: isDarkMode ? '#9ca3af' : '#475569' }}>
            Category: {study?.categoryName} | Module: {study?.moduleName}
          </p>
        </div>

        {pages.map((page, index) => (
          <div key={index} style={{ background: isDarkMode ? '#111827' : 'white', borderRadius: '16px', padding: '22px', marginBottom: '16px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' }}>
            <img
              src={getDomainVisual(index)}
              alt={`${study?.domainName} study visual ${index + 1}`}
              style={{ width: '100%', borderRadius: '12px', marginBottom: '14px', maxHeight: '280px', objectFit: 'cover' }}
            />
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.65, color: isDarkMode ? '#e5e7eb' : '#1f2937' }}>
              {page}
            </pre>
          </div>
        ))}

        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '14px 16px', marginBottom: '12px', color: '#9a3412', fontWeight: 700 }}>
          {accessMessage}
        </div>

        <button
          type="button"
          onClick={() => navigate(`/test/${moduleId}`)}
          disabled={!canAttemptTest}
          style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '16px', color: '#fff', background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', cursor: canAttemptTest ? 'pointer' : 'default', opacity: canAttemptTest ? 1 : 0.7 }}
        >
          Start Test Now
        </button>
      </div>
    </div>
  );
};

export default StudyPage;
