import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import App from './App';
import Profile from './profile';
import Weather from './Weather';
import './index.css';
import './i18n';

// send cookies automatically
axios.defaults.withCredentials = true;

function RequireAuth({ children }) {
  return localStorage.getItem('user') ? children : <Navigate to="/" />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/profile" element={<RequireAuth><Profile/></RequireAuth>} />
        <Route path="/weather" element={<Weather />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
