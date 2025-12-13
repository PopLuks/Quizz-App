import React from 'react';
import './Toast.css';

const Toast = ({ message, type, onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'info':
                return 'ℹ';
            default:
                return '✓';
        }
    };

    const displayMessage = typeof message === 'object' ? JSON.stringify(message) : message;

    return (
        <div className={`toast toast-${type}`}>
            <div className="toast-icon">{getIcon()}</div>
            <div className="toast-message">{displayMessage}</div>
            <button className="toast-close" onClick={onClose}>×</button>
        </div>
    );
};

export default Toast;
