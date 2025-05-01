// client/src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Hero / Nav
      welcomeLoggedIn: 'Welcome, {{name}}!',
      welcomeLoggedOut: 'Welcome to my site!',
      subtitle: 'Here are some of my projects',
      github: 'Here is my GitHub',
      email: 'Send me an Email',
      profile: 'Profile',
      login: 'Log In',

      // Features
      features: {
        spotify: {
          title: 'Spotify QR',
          desc: 'Generate your own Hitster cards.'
        },
        weather: {
          title: 'Harestua Weather',
          desc: "View today's temperature, conditions, and forecast for Harestua, Norway."
        },
        wishlist: {
          title: 'Wish List',
          desc: 'Create your own wish list and share it with others.'
        }
      },

      // Compass header
      windDirection: 'Wind Direction',

      // Temperature Gauge
      temperatureGauge: {
        title: 'Temperature Scale (°C)',
        stats: {
          low: "Today's Low",
          current: 'Current',
          high: "Today's High",
        },
        feels: {
          low: 'Felt like',
          current: 'Feels like',
          high: 'Felt like',
        }
      },

      // About
      aboutTitle: 'About the Author',
      aboutLine1: 'Håkon Nodeland is a Data Science student at the University of Stavanger. He is also a part-time developer for Ocean IMR.',
      aboutLine2: 'This page will be used to display his programming, development and design capabilities in a full-stack project.',

      // Tech Stack
      stackTitle: 'Tech Stack',
      stackDesc: 'Nodeland.no is powered by a modern JavaScript stack: React with React Router and Axios for dynamic, API-driven UI; Tailwind CSS and Vite for rapid, highly optimized front-end builds; Node.js with Express for the server; MySQL for persistent data storage; and Passport.js (Google OAuth) for secure authentication.',

      // Courses
      coursesTitle: 'My thesis along with important courses I have completed at UiS',
      course: {
        bachelor: {
          title: 'Bachelor Thesis',
          desc: 'Positioning of vehicles and pedestrians in tunnels using Bluetooth beacons and mobile phones.'
        },
        dat200: {
          title: 'DAT200 – Algorithms & Data Structures',
          desc: 'Implementation and analysis of core algorithms and data structures for efficient problem-solving.'
        },
        dat320: {
          title: 'DAT320 – Operating Systems & System Programming',
          desc: 'Study of OS architectures, concurrency, memory management, and low-level system programming.'
        },
        dat230_240: {
          title: 'DAT230/240 – Communication Technology 1 & 2',
          desc: 'Fundamentals of network communication, protocols, and data transmission methods.'
        },
        dat240: {
          title: 'DAT240 – Advanced Programming',
          desc: 'Exploration of advanced programming paradigms, design patterns, and best practices.'
        },
        dat535: {
          title: 'DAT535 – Data-Intensive Systems & Engineering',
          desc: 'Design and implementation of scalable, fault-tolerant data pipelines and storage solutions.'
        },
        dat600: {
          title: 'DAT600 – Algorithm Theory',
          desc: 'In-depth study of computational complexity, proof techniques, and algorithmic theory.'
        },
        ele520: {
          title: 'ELE520 – Machine Learning',
          desc: 'Principles and applications of supervised and unsupervised learning algorithms.'
        }
      },

      // Profile / Settings
      loadingProfile: 'Loading profile…',
      mustLogIn: 'You must be logged in to view this page.',
      backHome: 'Back to Home',
      username: 'Name',
      logout: 'Log Out',
      darkMode: 'Dark Mode',
      language: 'Language',
      notifications: 'Notifications',

      // Footer
      footer: {
        copy: '© 2025 Nodeland. All rights reserved.'
      }
    }
  },
  no: {
    translation: {
      // Hero / Nav
      welcomeLoggedIn: 'Velkommen, {{name}}!',
      welcomeLoggedOut: 'Velkommen til siden min!',
      subtitle: 'Her er noen av mine prosjekter',
      github: 'Her er min GitHub',
      email: 'Send meg en e-post',
      profile: 'Profil',
      login: 'Logg inn',

      // Features
      features: {
        spotify: {
          title: 'Spotify QR',
          desc: 'Generer dine egne Hitster-kort.'
        },
        weather: {
          title: 'Harestua-vær',
          desc: 'Se dagens temperatur, forhold og prognose for Harestua, Norge.'
        },
        wishlist: {
          title: 'Ønskeliste',
          desc: 'Lag din egen ønskeliste og del den med andre.'
        }
      },

      // Compass header
      windDirection: 'Vindretning',

      //Temperatur
      temperatureGauge: {
        title: 'Temperaturskala (°C)',
        stats: {
          low: 'Dagens laveste',
          current: 'Aktuell',
          high: 'Dagens høyeste',
        },
        feels: {
          low: 'Føltes som',
          current: 'Føles som',
          high: 'Føltes som',
        }
      },

      // About
      aboutTitle: 'Om forfatteren',
      aboutLine1: 'Håkon Nodeland er data science-student ved Universitetet i Stavanger. Han jobber også deltid som utvikler for Ocean IMR.',
      aboutLine2: 'Denne siden vil bli brukt til å vise hans programmerings-, utviklings- og designkapasitet i et fullstack-prosjekt.',

      // Tech Stack
      stackTitle: 'Teknologier',
      stackDesc: 'Nodeland.no drives av en moderne JavaScript-stack: React med React Router og Axios for dynamisk, API-drevet UI; Tailwind CSS og Vite for raske, svært optimaliserte front-end-builds; Node.js med Express for serveren; MySQL for vedvarende datalagring; og Passport.js (Google OAuth) for sikker autentisering.',

      // Courses
      coursesTitle: 'Min hovedoppgave og viktige fag ved UiS',
      course: {
        bachelor: {
          title: 'Bacheloroppgave',
          desc: 'Posisjonering av kjøretøy og fotgjengere i tunneler ved bruk av Bluetooth-beacons og mobiltelefoner.'
        },
        dat200: {
          title: 'DAT200 – Algoritmer og datastrukturer',
          desc: 'Implementering og analyse av kjernealgoritmer og datastrukturer for effektiv problemløsning.'
        },
        dat320: {
          title: 'DAT320 – Operativsystemer og systemprogrammering',
          desc: 'Studie av OS-arkitekturer, samtidighet, minnehåndtering og systemprogrammering på lavt nivå.'
        },
        dat230_240: {
          title: 'DAT230/240 – Kommunikasjonsteknologi 1 & 2',
          desc: 'Grunnleggende nettverkskommunikasjon, protokoller og datatransmisjonsmetoder.'
        },
        dat240: {
          title: 'DAT240 – Avansert programmering',
          desc: 'Utforskning av avanserte programmeringsparadigmer, designmønstre og beste praksis.'
        },
        dat535: {
          title: 'DAT535 – Datain­tensive systemer & ingeniørkunst',
          desc: 'Design og implementering av skalerbare, feiltolerante datapipelines og lagringsløsninger.'
        },
        dat600: {
          title: 'DAT600 – Algoritmeteori',
          desc: 'Inngående studie av beregningskompleksitet, bevisteknikker og algoritmeteori.'
        },
        ele520: {
          title: 'ELE520 – Maskinlæring',
          desc: 'Prinsipper og anvendelser av overvåket og ikke-overvåket læring.'
        }
      },

      // Profile / Settings
      loadingProfile: 'Laster profil…',
      mustLogIn: 'Du må være logget inn for å se denne siden.',
      backHome: 'Tilbake',
      username: 'Navn',
      logout: 'Logg ut',
      darkMode: 'Mørk modus',
      language: 'Språk',
      notifications: 'Varsler',

      // Footer
      footer: {
        copy: '© 2025 Nodeland. Alle rettigheter reservert.'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
