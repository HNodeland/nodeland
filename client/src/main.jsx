import './index.css';
import './i18n'; // initialize i18n

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import App from './App';
import Profile from './profile';
import i18n from './i18n';

// keep <html lang> in sync
document.documentElement.lang = i18n.language;
i18n.on('languageChanged', lng => {
  document.documentElement.lang = lng;
});

// Axios must send cookies
axios.defaults.withCredentials = true;

// Simple auth guard
function RequireAuth({ children }) {
  const userJson = localStorage.getItem('user');
  return userJson ? children : <Navigate to="/" />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/profile" element={<RequireAuth><Profile/></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
