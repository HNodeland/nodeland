// client/src/App.jsx

import './index.css'; // loads Tailwind CSS and your global styles
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    axios
      .get('/api/auth/user', { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col">
      {/* CENTERED WRAPPER */}
      <div className="container mx-auto px-6 flex-grow flex flex-col">
        
        {/* HERO */}
        <header className="relative py-24 flex flex-col items-center text-center">
          {/* Profile or Log In button top-right */}
          {user ? (
            <Link
              to="/profile"
              className="absolute top-6 right-6 px-4 py-2 bg-brand-accent text-brand-dark rounded-md font-medium hover:bg-brand-light transition"
            >
              Profile
            </Link>
          ) : (
            <a
              href="/auth/google"
              className="absolute top-6 right-6 px-4 py-2 bg-brand-accent text-brand-dark rounded-md font-medium hover:bg-brand-light transition"
            >
              Log In
            </a>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-brand-xlight">
            {user
              ? `Welcome, ${user.displayName}!`
              : 'Welcome to my site!'}
          </h1>
          <p className="text-lg md:text-xl mb-8 text-brand-light">
            Here are some of my projects
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <a
              href="https://github.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-grow sm:flex-none px-6 py-3 bg-brand-accent text-brand-dark font-medium rounded-md transition hover:bg-brand-light text-center"
            >
              Here is my GitHub
            </a>
            <a
              href="mailto:youremail@example.com"
              className="flex-grow sm:flex-none px-6 py-3 border-2 border-brand-light text-brand-light font-medium rounded-md transition hover:bg-brand-light hover:text-brand-dark text-center"
            >
              Send me an Email
            </a>
          </div>
        </header>

        {/* FEATURES */}
        <section
          id="features"
          className="bg-brand-deep py-12 px-6 rounded-lg shadow-inner mb-12"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            
            {/* Card 1: Spotify QR Generator */}
            <div className="p-6 bg-brand-mid rounded-lg shadow-md">
              <img
                src="/assets/icon-spotify-qr.svg"
                alt="SpotifQR"
                className="h-12 w-12 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">SpotifQR</h3>
              <p className="text-brand-light">
                Generate Spotify QR codes on the fly for “Blinding Lights” (2019) by
                The Weeknd.
              </p>
            </div>

            {/* Card 2: Harestua Weather */}
            <div className="p-6 bg-brand-mid rounded-lg shadow-md">
              <img
                src="/assets/icon-weather.svg"
                alt="Harestua Weather"
                className="h-12 w-12 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Harestua Weather</h3>
              <p className="text-brand-light">
                View today’s temperature, conditions, and forecast for Harestua,
                Norway.
              </p>
            </div>

            {/* Card 3: Linkly URL Shortener */}
            <div className="p-6 bg-brand-mid rounded-lg shadow-md">
              <img
                src="/assets/icon-url.svg"
                alt="Linkly URL Shortener"
                className="h-12 w-12 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Linkly</h3>
              <p className="text-brand-light">
                Shorten any URL quickly with customizable slugs and view click
                analytics in real time.
              </p>
            </div>

          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="py-12 px-6 text-center md:text-left mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">About Nodeland</h2>
          <p className="text-brand-light mb-4">
            Built by developers, for developers. Nodeland makes deploying and
            managing Node.js applications effortless—so you can focus on code,
            not servers.
          </p>
          <p className="text-brand-light">
            Trusted by startups and enterprises worldwide, our platform
            delivers rock-solid performance and reliability for your
            mission-critical apps.
          </p>
        </section>

        {/* TESTIMONIALS */}
        <section
          id="testimonials"
          className="bg-brand-deep py-12 px-6 rounded-lg shadow-inner mb-12"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">Trusted by</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 items-center">
            <img
              src="/assets/logo-client1.png"
              alt="Client 1"
              className="mx-auto h-12"
            />
            <img
              src="/assets/logo-client2.png"
              alt="Client 2"
              className="mx-auto h-12"
            />
            <img
              src="/assets/logo-client3.png"
              alt="Client 3"
              className="mx-auto h-12"
            />
            <img
              src="/assets/logo-client4.png"
              alt="Client 4"
              className="mx-auto h-12"
            />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 px-6 bg-brand-dark">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <h4 className="text-lg font-semibold mb-2">Stay Updated</h4>
              <p className="text-brand-light">
                Join our newsletter for the latest releases.
              </p>
            </div>
            <form action="#" className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-grow px-4 py-2 rounded-l-md focus:outline-none text-brand-dark"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-brand-accent hover:bg-brand-light rounded-r-md transition"
              >
                Subscribe
              </button>
            </form>
          </div>
          <div className="border-t border-brand-mid pt-6 text-center text-brand-light text-sm">
            &copy; 2025 Nodeland. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
