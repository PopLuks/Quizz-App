import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ManageQuizzes from './components/admin/ManageQuizzes';
import ManageQuestions from './components/admin/ManageQuestions';
import UserList from './components/admin/UserList';
import Statistics from './components/admin/Statistics';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/quizzes" 
            element={
              <ProtectedRoute>
                <ManageQuizzes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/questions" 
            element={
              <ProtectedRoute>
                <ManageQuestions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute>
                <UserList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/statistics" 
            element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
