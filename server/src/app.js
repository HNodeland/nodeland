import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import config from './config/index.js';
import pool from './db/pool.js';
import setupPassport from './services/authService.js';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import weatherRoutes from './routes/weather.js';
import healthRoutes from './routes/health.js';

const app = express();
app.use(express.json());

app.use(cors({ origin: config.clientOrigin, credentials: true }));

app.use(
  session({ secret: config.sessionSecret, resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport strategy setup
setupPassport(passport, pool);

// Share DB pool
app.locals.db = pool;

// Mount routes
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/health', healthRoutes);

export default app;