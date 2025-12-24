'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container" style={{ marginTop: '100px', textAlign: 'center' }}>
      <h2>Something went wrong!</h2>
      <p style={{ margin: '20px 0', color: '#475532' }}>
        {error.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={reset}
        style={{
          backgroundColor: '#D2FF8B',
          color: '#111111',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}
