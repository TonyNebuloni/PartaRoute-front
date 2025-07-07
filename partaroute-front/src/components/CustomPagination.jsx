import React from 'react';

const GlutenFont = {
  fontFamily: 'Gluten, cursive',
};

function getPages(current, total) {
  // Affiche max 5 pages, avec ellipsis si besoin
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, '...', total];
  if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export default function CustomPagination({ page, count, onChange, limit, onLimitChange }) {
  const pages = getPages(page, count);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      margin: '32px 0',
      flexWrap: 'wrap',
    }}>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        style={{
          ...GlutenFont,
          background: '#232323',
          color: page === 1 ? '#aaa' : '#D6FFB7',
          border: 'none',
          borderRadius: 20,
          padding: '8px 18px',
          fontSize: 18,
          cursor: page === 1 ? 'not-allowed' : 'pointer',
          opacity: page === 1 ? 0.5 : 1,
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        Précédent
      </button>
      {pages.map((p, i) =>
        p === '...'
          ? <span key={i} style={{ ...GlutenFont, color: '#232323', fontSize: 20, margin: '0 6px' }}>…</span>
          : <button
              key={p}
              onClick={() => onChange(p)}
              style={{
                ...GlutenFont,
                background: p === page ? '#D6FFB7' : '#232323',
                color: p === page ? '#232323' : '#D6FFB7',
                border: 'none',
                borderRadius: 20,
                padding: '8px 16px',
                fontSize: 20,
                fontWeight: p === page ? 700 : 400,
                margin: '0 2px',
                cursor: p === page ? 'default' : 'pointer',
                boxShadow: p === page ? '0 2px 8px #d6ffb73a' : 'none',
                transition: 'background 0.2s, color 0.2s',
              }}
              disabled={p === page}
            >
              {p}
            </button>
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === count}
        style={{
          ...GlutenFont,
          background: '#232323',
          color: page === count ? '#aaa' : '#D6FFB7',
          border: 'none',
          borderRadius: 20,
          padding: '8px 18px',
          fontSize: 18,
          cursor: page === count ? 'not-allowed' : 'pointer',
          opacity: page === count ? 0.5 : 1,
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        Suivant
      </button>
      {onLimitChange && (
        <select
          value={limit}
          onChange={e => onLimitChange(Number(e.target.value))}
          style={{
            ...GlutenFont,
            marginLeft: 16,
            padding: '6px 12px',
            borderRadius: 12,
            border: '1px solid #D6FFB7',
            background: '#fff',
            color: '#232323',
            fontSize: 16,
          }}
        >
          {[5, 10, 20, 50].map(opt => (
            <option key={opt} value={opt}>{opt} / page</option>
          ))}
        </select>
      )}
    </div>
  );
} 