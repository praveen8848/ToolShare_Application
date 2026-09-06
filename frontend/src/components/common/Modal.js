import React from 'react';

const Modal = ({ show, onHide, title, children, footer, size = 'md' }) => {
  if (!show) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onHide();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content-custom modal-${size}`}>
        {title && (
          <div className="modal-header">
            <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>{title}</h4>
            <button
              onClick={onHide}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                lineHeight: '1'
              }}
            >
              ×
            </button>
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
      <style jsx>{`
        .modal-${size} {
          max-width: ${size === 'sm' ? '400px' : size === 'lg' ? '800px' : '500px'};
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }
        .modal-body {
          color: var(--text-secondary);
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-lg);
        }
      `}</style>
    </div>
  );
};

export default Modal;
