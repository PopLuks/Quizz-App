import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    console.log('ProtectedRoute - User:', user, 'Loading:', loading); // DEBUG

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '1.5rem'
            }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        console.log('No user found - redirecting to login'); // DEBUG
        return <Navigate to="/login" replace />;
    }

    console.log('User authenticated - rendering protected content'); // DEBUG
    return children;
};

export default ProtectedRoute;
