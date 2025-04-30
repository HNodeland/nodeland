// client/src/main.jsx¨
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import App from './App';
import Profile from './profile';
import './index.css';

// Make sure Axios sends cookies
axios.defaults.withCredentials = true;

// Simple auth guard using your stored user (you could move this into context or a hook)
function RequireAuth({ children }) {
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  return user ? children : <Navigate to="/" />;
}

// Create the root and mount your router
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
