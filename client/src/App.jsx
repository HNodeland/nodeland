import './index.css'; // loads Tailwind CSS and your global styles
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Import your images from the src/assets folder
import spotifqrIcon from './assets/wave-sound.png';
import weatherIcon  from './assets/weather.png';
import wishListIcon   from './assets/add-to-favorites.png';
import stackNoBg    from './assets/stack-no-bg.png';

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
              href="https://github.com/HNodeland"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-grow sm:flex-none px-6 py-3 bg-brand-accent text-brand-dark font-medium rounded-md transition hover:bg-brand-light text-center"
            >
              Here is my GitHub
            </a>
            <a
              href="mailto:haakon@nodeland.no"
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
            <div className="p-6 bg-brand-mid rounded-lg shadow-md">
              <img
                src={spotifqrIcon}
                alt="SpotifQR"
                className="h-12 w-12 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Spotify QR</h3>
              <p className="text-brand-light">
                Generate your own Hitster cards.
              </p>
            </div>
            <div className="p-6 bg-brand-mid rounded-lg shadow-md">
              <img
                src={weatherIcon}
                alt="Harestua Weather"
                className="h-12 w-12 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Harestua Weather</h3>
              <p className="text-brand-light">
                View today's temperature, conditions, and forecast for Harestua, Norway.
              </p>
            </div>
            <div className="p-6 bg-brand-mid rounded-lg shadow-md">
              <img
                src={wishListIcon}
                alt="Linkly URL Shortener"
                className="h-12 w-12 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Wish list</h3>
              <p className="text-brand-light">
                Create your own wish list and share it with others. Others can see what others will buy, but you can not.
              </p>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="py-12 px-6 text-center md:text-left mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">About Nodeland</h2>
          <p className="text-brand-light mb-4">
            I am Data Science student at the University of Stavanger. I am also a part-time developer for Ocean IMR.
          </p>
          <p className="text-brand-light">
            This page will be used to display of my programing and development capabilities.
          </p>
        </section>

        {/* TECH STACK */}
        <section id="stack" className="py-12 px-6 text-center md:text-left mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Tech Stack</h2>
          <p className="text-brand-light mb-6">
            Nodeland is powered by a modern JavaScript stack: React with React Router and Axios for dynamic, API-driven UI; Tailwind CSS and Vite for rapid, highly optimized front‑end builds; Node.js with Express for the server; MySQL for persistent data storage; and Passport.js (Google OAuth) for secure authentication.
          </p>

          <div className="bg-brand-deep p-6 rounded-lg">
            <div className="bg-white p-6 rounded-lg">
              <img
                src={stackNoBg}
                alt="Tech stack illustration"
                className="mx-auto max-w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* COURSES */}
        <section id="courses" className="bg-brand-deep py-12 px-6 rounded-lg shadow-inner mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">My thesis along with important courses i have completed at UiS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-brand-mid rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Bachelor Thesis</h3>
              <p className="text-brand-light">
                Positioning of vehicles and pedestrians in tunnels using Bluetooth beacons and mobile phones.
              </p>
            </div>
            <div className="p-6 bg-brand-mid rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">DAT200 – Algorithms & Data Structures</h3>
              <p className="text-brand-light">
                Implementation and analysis of core algorithms and data structures for efficient problem-solving.
              </p>
            </div>
            <div className="p-6 bg-brand-mid rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">DAT320 – Operating Systems & System Programming</h3>
              <p className="text-brand-light">
                Study of OS architectures, concurrency, memory management, and low-level system programming.
              </p>
            </div>
            <div className="p-6 bg-brand-mid rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">DAT230/240 – Communication Technology 1 & 2</h3>
              <p className="text-brand-light">
                Fundamentals of network communication, protocols, and data transmission methods.
              </p>
            </div>
            <div className="p-6 bg-brand-mid rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">DAT240 – Advanced Programming</h3>
              <p className="text-brand-light">
                Exploration of advanced programming paradigms, design patterns, and best practices.
              </p>
            </div>
            <div className="p-6 bg-brand-mid rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">DAT535 – Data-Intensive Systems & Engineering</h3>
              <p className="text-brand-light">
                Design and implementation of scalable, fault-tolerant data pipelines and storage solutions.
              </p>
            </div>
            <div className="p-6 bg-brand-mid rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">DAT600 – Algorithm Theory</h3>
              <p className="text-brand-light">
                In-depth study of computational complexity, proof techniques, and algorithmic theory.
              </p>
            </div>
            <div className="p-6 bg-brand-mid rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">ELE520 – Machine Learning</h3>
              <p className="text-brand-light">
                Principles and applications of supervised and unsupervised learning algorithms.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-brand-dark text-brand-light">
          <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm">© 2025 Nodeland. All rights reserved.</p>
            <nav className="flex space-x-4 mt-4 md:mt-0">
              <a href="https://www.flaticon.com/free-icons/rain" className="text-xs hover:text-brand-xlight">
                Rain icons by Freepik
              </a>
              <a href="https://www.flaticon.com/free-icons/radio" className="text-xs hover:text-brand-xlight">
                Radio icons by Freepik
              </a>
              <a href="https://www.flaticon.com/free-icons/wish" title="wish icons">
                Wish icons created by piksart - Flaticon
              </a>
            </nav>
          </div>
        </footer>

      </div>
    </div>
  );
}
