import React, { useEffect, useState } from 'react';

const ToastNotification = ({ message, type = 'success', onClose, duration = 8000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {onClose();}
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {onClose();}
  };

  if (!isVisible) {return null;}

  const backgroundColor = type === 'error' ? '#FFEBE6' : '#E3FCEF';
  const textColor = type === 'error' ? '#DE350B' : '#006644';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor,
        color: textColor,
        padding: '12px 16px',
        borderRadius: '3px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
        maxWidth: '400px',
        fontSize: '14px',
        fontWeight: 500,
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div>{message}</div>
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginLeft: '12px',
          padding: '4px',
          color: textColor,
          fontSize: '16px',
          fontWeight: 'bold',
          lineHeight: 1
        }}
        aria-label="Close notification"
      >
        ×
      </button>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ToastNotification;
