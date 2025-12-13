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
import CreateQuiz from './components/quiz/CreateQuiz';
import EditQuiz from './components/quiz/EditQuiz';
import AvailableQuizzes from './components/user/AvailableQuizzes';
import TakeQuiz from './components/user/TakeQuiz';
import QuizResult from './components/user/QuizResult';
import ViewAttemptResult from './components/user/ViewAttemptResult';
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
            path="/admin/quizzes/create" 
            element={
              <ProtectedRoute>
                <CreateQuiz />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/quizzes/edit/:id" 
            element={
              <ProtectedRoute>
                <EditQuiz />
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
          <Route 
            path="/quizzes" 
            element={
              <ProtectedRoute>
                <AvailableQuizzes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quiz/:id" 
            element={
              <ProtectedRoute>
                <TakeQuiz />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quiz-result" 
            element={
              <ProtectedRoute>
                <QuizResult />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quiz-result/:attemptId" 
            element={
              <ProtectedRoute>
                <ViewAttemptResult />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
