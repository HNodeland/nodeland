// client/src/App.jsx

import './App.css';      // ← ensure your custom component styles (and Tailwind classes) get pulled in
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    axios.get('/api/auth/user', { withCredentials: true })
      .then(res => {
        setUser(res.data.user);
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('user');
      });
  }, []);

  if (user === undefined) return <p>Loading…</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {user ? (
        <>
          <h1 className="text-3xl font-semibold">Hello, {user.displayName}</h1>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={async () => {
                await axios.post('/api/auth/logout', {}, { withCredentials: true });
                setUser(null);
                localStorage.removeItem('user');
              }}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Logout
            </button>
            <Link
              to="/profile"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              View Profile
            </Link>
          </div>
          <div className="bg-red-500 p-4 text-white">
            🔥 Tailwind is finally working!
          </div>
        </>
      ) : (
        <button
          onClick={() => { window.location.href = '/auth/google' }}
          className="px-6 py-3 bg-blue-600 text-white rounded-full text-lg"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
