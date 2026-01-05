import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Toast from '../Toast';
import './Admin.css';
import './UserModal.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
        role: '',
        password: ''
    });
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

    const handleEditUser = (user) => {
        setEditingUser(user);
        setEditForm({
            username: user.username,
            email: user.email,
            role: user.role,
            password: '' // Lasă gol pentru a nu schimba parola
        });
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setEditForm({
            username: '',
            email: '',
            role: '',
            password: ''
        });
    };

    const handleSaveEdit = async () => {
        try {
            const updateData = {
                username: editForm.username,
                email: editForm.email,
                role: editForm.role
            };
            
            // Adaugă parola doar dacă a fost introdusă
            if (editForm.password && editForm.password.trim() !== '') {
                updateData.password = editForm.password;
            }

            const response = await adminAPI.updateUser(editingUser.id, updateData);
            
            setUsers(prevUsers => 
                prevUsers.map(u => 
                    u.id === editingUser.id ? response.data : u
                )
            );
            
            setToast({ 
                message: 'User updated successfully!', 
                type: 'success' 
            });
            
            handleCancelEdit();
        } catch (error) {
            console.error('❌ Update error:', error);
            setToast({ 
                message: error.response?.data?.message || 'Failed to update user.', 
                type: 'error' 
            });
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
                                            onClick={() => handleEditUser(user)} 
                                            className="edit-btn-small"
                                        >
                                            ✏️
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

            {/* Edit User Modal */}
            {editingUser && (
                <div className="modal-overlay" onClick={handleCancelEdit}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>✏️ Edit User</h2>
                            <button className="modal-close" onClick={handleCancelEdit}>✕</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={editForm.username}
                                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    className="form-input"
                                >
                                    <option value="USER">USER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>New Password (leave blank to keep current)</label>
                                <input
                                    type="password"
                                    value={editForm.password}
                                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                    className="form-input"
                                    placeholder="Enter new password or leave blank"
                                />
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={handleCancelEdit}>
                                Cancel
                            </button>
                            <button className="btn-save" onClick={handleSaveEdit}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;