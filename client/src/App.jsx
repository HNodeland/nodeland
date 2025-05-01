// client/src/App.jsx
import './index.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';

import spotifqrIcon from './assets/wave-sound.png';
import weatherIcon  from './assets/weather.png';
import wishListIcon from './assets/add-to-favorites.png';
import stackNoBg    from './assets/stack-no-bg.png';

export default function App() {
  const { t } = useTranslation();
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    axios
      .get('/api/auth/user', { withCredentials: true })
      .then(res => {
        const u = res.data.user;
        setUser(u);
        if (u) {
          localStorage.setItem('user', JSON.stringify(u));
          if (u.language) {
            i18n.changeLanguage(u.language);
          }
        }
      })
      .catch(() => {
        localStorage.removeItem('user');
        setUser(null);
      });
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col">
      <div className="container mx-auto px-6 flex-grow flex flex-col">

        {/* HERO */}
        <header className="relative py-24 flex flex-col items-center text-center">
          {user ? (
            <Link
              to="/profile"
              className="absolute top-6 right-6 px-4 py-2 bg-brand-accent text-brand-dark rounded-md font-medium hover:bg-brand-light transition"
            >
              {t('profile')}
            </Link>
          ) : (
            <a
              href="/auth/google"
              className="absolute top-6 right-6 px-4 py-2 bg-brand-accent text-brand-dark rounded-md font-medium hover:bg-brand-light transition"
            >
              {t('login')}
            </a>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-brand-xlight">
            {user
              ? t('welcomeLoggedIn', { name: user.displayName })
              : t('welcomeLoggedOut')}
          </h1>
          <p className="text-lg md:text-xl mb-8 text-brand-light">
            {t('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <a
              href="https://github.com/HNodeland"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-grow sm:flex-none px-6 py-3 bg-brand-accent text-brand-dark font-medium rounded-md hover:bg-brand-light transition text-center"
            >
              {t('github')}
            </a>
            <a
              href="mailto:haakon@nodeland.no"
              className="flex-grow sm:flex-none px-6 py-3 border-2 border-brand-light text-brand-light font-medium rounded-md hover:bg-brand-light hover:text-brand-dark transition text-center"
            >
              {t('email')}
            </a>
          </div>
        </header>

        {/* FEATURES */}
        <section id="features" className="bg-brand-deep py-12 px-6 rounded-lg shadow-inner mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {['spotify','weather','wishlist'].map(key => {
              const icons = {
                spotify: spotifqrIcon,
                weather: weatherIcon,
                wishlist: wishListIcon,
              };
              const route = `/${key}`; // e.g. /spotify, /weather, /wishlist
              return (
                <Link
                  key={key}
                  to={route}
                  className="transform hover:scale-105 hover:shadow-lg transition duration-300"
                >
                  <div className="p-6 bg-brand-mid rounded-lg shadow-md h-full flex flex-col items-center">
                    <img
                      src={icons[key]}
                      alt={t(`features.${key}.title`)}
                      className="h-12 w-12 mx-auto mb-4"
                    />
                    <h3 className="text-xl font-semibold mb-2">
                      {t(`features.${key}.title`)}
                    </h3>
                    <p className="text-brand-light">
                      {t(`features.${key}.desc`)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="py-12 px-6 text-center md:text-left mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('aboutTitle')}</h2>
          <p className="text-brand-light mb-4">{t('aboutLine1')}</p>
          <p className="text-brand-light">{t('aboutLine2')}</p>
        </section>

        {/* TECH STACK */}
        <section id="stack" className="py-12 px-6 text-center md:text-left mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('stackTitle')}</h2>
          <p className="text-brand-light mb-6">{t('stackDesc')}</p>
          <div className="bg-brand-deep p-6 rounded-lg">
            <div className="bg-white p-6 rounded-lg">
              <img
                src={stackNoBg}
                alt={t('stackTitle')}
                className="mx-auto max-w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* COURSES */}
        <section id="courses" className="bg-brand-deep py-12 px-6 rounded-lg shadow-inner mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">{t('coursesTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(t('course', { returnObjects: true })).map(
              ([key, { title, desc }]) => (
                <div key={key} className="p-6 bg-brand-mid rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-2">{title}</h3>
                  <p className="text-brand-light">{desc}</p>
                </div>
              )
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-brand-dark text-brand-light">
          <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm">{t('footer.copy')}</p>
            <nav className="flex space-x-4 mt-4 md:mt-0 text-xs">
              <a href="https://www.flaticon.com/free-icons/rain" className="hover:text-brand-xlight">Rain icons by Freepik</a>
              <a href="https://www.flaticon.com/free-icons/radio" className="hover:text-brand-xlight">Radio icons by Freepik</a>
              <a href="https://www.flaticon.com/free-icons/wish"   className="hover:text-brand-xlight">Wish icons by piksart</a>
              <a href="https://www.flaticon.com/free-icons/letter-n" className="hover:text-brand-xlight">Letter n icons by Kian Bonanno</a>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
