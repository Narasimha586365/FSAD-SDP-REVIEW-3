import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const { fetchJson } = useAppContext();

  useEffect(() => {
    fetchJson('/categories')
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, [fetchJson]);

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => navigate('/participation')} style={{ marginBottom: '1rem', cursor: 'pointer' }}>
        Back
      </button>
      <h1>Assessment Categories</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => navigate(`/domains/${cat.id}`)}
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
            {cat.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
