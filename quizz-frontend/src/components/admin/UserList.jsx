import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Toast from '../Toast';
import './Admin.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            console.log('🔄 Fetching users...');
            setLoading(true);
            const response = await adminAPI.getAllUsers();
            console.log('✅ Users fetched:', response.data);
            setUsers(response.data);
        } catch (error) {
            console.error('❌ Error fetching users:', error);
            setToast({ 
                message: 'Failed to load users. Please try again.', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId) => {
        const user = users.find(u => u.id === userId);
        const currentStatus = user?.enabled;
        
        console.log(`🔄 Attempting to ${currentStatus ? 'disable' : 'enable'} user:`, userId, 'Current status:', currentStatus);
        
        try {
            const response = await adminAPI.toggleUserStatus(userId);
            
            console.log('✅ Toggle response received:', response.data);
            console.log('User enabled field:', response.data.enabled);
            console.log('Full user object:', JSON.stringify(response.data, null, 2));
            
            // Actualizează state-ul cu întregul obiect user actualizat
            setUsers(prevUsers => 
                prevUsers.map(u => 
                    u.id === userId ? response.data : u
                )
            );
            
            setToast({ 
                message: `User ${response.data.enabled ? 'enabled' : 'disabled'} successfully!`, 
                type: 'success' 
            });
            
        } catch (error) {
            console.error('❌ Toggle error:', error);
            setToast({ 
                message: error.response?.data?.message || 'Failed to update user status.', 
                type: 'error' 
            });
            
            // Reîmprospătează lista
            await fetchUsers();
        }
    };

    const handleDeleteUser = async (userId) => {
        const user = users.find(u => u.id === userId);
        
        if (window.confirm(`Are you sure you want to delete user "${user?.username}"?`)) {
            try {
                console.log('🗑️ Deleting user:', userId);
                await adminAPI.deleteUser(userId);
                console.log('✅ User deleted successfully');
                
                setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
                
                setToast({ 
                    message: 'User deleted successfully!', 
                    type: 'success' 
                });
            } catch (error) {
                console.error('❌ Delete error:', error);
                setToast({ 
                    message: 'Failed to delete user.', 
                    type: 'error' 
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="loading-spinner">Loading users...</div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}
            
            <div className="admin-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>
                <h1>👥 User List</h1>
                <div className="user-count">Total Users: {users.length}</div>
            </div>

            <div className="users-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.enabled ? 'active' : 'inactive'}`}>
                                            {user.enabled ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleToggleStatus(user.id)} 
                                            className="toggle-btn"
                                        >
                                            {user.enabled ? '🔒 Disable' : '✅ Enable'}
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUser(user.id)} 
                                            className="delete-btn-small"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserList;