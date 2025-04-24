import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Components
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BusinessDashboard from './pages/business/BusinessDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Auth Context
import { AuthProvider, useAuth } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route 
                path="/dashboard/customer" 
                element={
                  <PrivateRoute role="customer">
                    <CustomerDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/dashboard/business" 
                element={
                  <PrivateRoute role="business">
                    <BusinessDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/dashboard/admin" 
                element={
                  <PrivateRoute role="admin">
                    <AdminDashboard />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

// Private route component
const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (user.role !== role) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }
  
  return children;
};

export default App; 