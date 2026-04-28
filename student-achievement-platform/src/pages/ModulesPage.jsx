import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const ModulesPage = () => {
  const { domainId } = useParams();
  const [modules, setModules] = useState([]);
  const navigate = useNavigate();
  const { fetchJson } = useAppContext();

  useEffect(() => {
    fetchJson(`/modules/${domainId}`)
      .then((data) => setModules(data))
      .catch(() => setModules([]));
  }, [domainId, fetchJson]);

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem', cursor: 'pointer' }}>
        Back
      </button>
      <h1>Available Assessments</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
        {modules.length === 0 && <p>No modules found.</p>}
        {modules.map((mod) => (
          <div
            key={mod.id}
            onClick={() => navigate(`/study/${mod.id}`)}
            style={{
              padding: '1.5rem 2rem',
              background: '#667eea',
              color: '#fff',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            {mod.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModulesPage;
