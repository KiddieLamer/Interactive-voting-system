import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import io from 'socket.io-client';

import AuthPage from './components/AuthPage';
import VotingPage from './components/VotingPage';
import ResultsPage from './components/ResultsPage';
import AdminDashboard from './components/AdminDashboard';
import ParticleBackground from './components/ParticleBackground';

const socket = io('http://localhost:3011');

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
      }
    }
  }, [token]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <div className="App">
      <ParticleBackground />
      <Router>
        <Routes>
          <Route 
            path="/auth" 
            element={
              !token ? (
                <AuthPage onLogin={login} />
              ) : (
                <Navigate to="/vote" replace />
              )
            } 
          />
          
          <Route 
            path="/vote" 
            element={
              token ? (
                <VotingPage 
                  user={user} 
                  token={token} 
                  socket={socket}
                  onLogout={logout}
                />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
          
          <Route 
            path="/results" 
            element={<ResultsPage socket={socket} />} 
          />
          
          <Route 
            path="/admin" 
            element={
              token && user?.email === 'admin@votingsystem.com' ? (
                <AdminDashboard 
                  token={token} 
                  socket={socket}
                  onLogout={logout}
                />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
          
          <Route path="/" element={<Navigate to="/auth" replace />} />
        </Routes>
      </Router>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  );
}

export default App;