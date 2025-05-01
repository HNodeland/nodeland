import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';

export default function Profile() {
  const { t } = useTranslation();
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/profile', { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const changeLanguage = async e => {
    const lng = e.target.value;
    try {
      await axios.patch(
        '/api/profile/language',
        { language: lng },
        { withCredentials: true }
      );
      // apply immediately
      i18n.changeLanguage(lng);
      setUser(u => ({ ...u, language: lng }));
      localStorage.setItem('user', JSON.stringify({ ...user, language: lng }));
    } catch (err) {
      console.error('Language update failed', err);
    }
  };

  if (loading) {
    return <p className="text-center mt-20 text-brand-light">{t('loadingProfile')}</p>;
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4 md:px-8 lg:px-16">
        <div className="bg-brand-deep rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
          <p className="text-red-500 mb-4">{t('mustLogIn')}</p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-brand-accent hover:bg-brand-light text-brand-dark rounded-md transition"
          >
            &larr; {t('backHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col">
      <div className="container mx-auto px-6 flex-grow flex items-center justify-center">
        <div className="bg-brand-deep rounded-lg shadow-lg p-8 max-w-md w-full space-y-8">

          {/* Profile Header */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('profile')}</h2>
            <p><span className="font-semibold">ID:</span> {user.id}</p>
            <p><span className="font-semibold">{t('username')}:</span> {user.displayName}</p>
          </div>

          {/* Settings Menu */}
          <div className="space-y-6">

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <span className="font-medium">{t('darkMode')}</span>
              <button className="px-4 py-2 bg-brand-accent hover:bg-brand-light text-brand-dark rounded-md transition">
                Toggle
              </button>
            </div>

            {/* Language Selector */}
            <div className="flex items-center justify-between">
              <span className="font-medium">{t('language')}</span>
              <select
                className="px-4 py-2 bg-brand-mid text-brand-light rounded-md focus:outline-none"
                value={user.language}
                onChange={changeLanguage}
              >
                <option value="en">English</option>
                <option value="no">Norsk</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <span className="font-medium">{t('notifications')}</span>
              <button className="px-4 py-2 border-2 border-brand-light rounded-md hover:bg-brand-light hover:text-brand-dark transition">
                Toggle
              </button>
            </div>

            {/* Logout Button */}
            <div className="flex items-center justify-between">
              <span className="font-medium">{t('logout')}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
              >
                {t('logout')}
              </button>
            </div>

          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link
              to="/"
              className="inline-block px-4 py-2 bg-brand-accent hover:bg-brand-light text-brand-dark rounded-md transition"
            >
              &larr; {t('backHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
