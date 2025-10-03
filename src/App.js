import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Dashboard Components
import PLDashboard from './pages/Dashboard/PLDashboard';
import PRLDashboard from './pages/Dashboard/PRLDashboard';
import LecturerDashboard from './pages/Dashboard/LecturerDashboard';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } />
              
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Dashboard Router based on user role
const DashboardRouter = () => {
  const { currentUser } = useAuth();

  switch (currentUser?.role) {
    case 'pl':
      return <PLDashboard />;
    case 'prl':
      return <PRLDashboard />;
    case 'lecturer':
      return <LecturerDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

export default App;