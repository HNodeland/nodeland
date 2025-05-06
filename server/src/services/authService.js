import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from '../config/index.js';
import pool from '../db/pool.js';

export default function setupPassport(passport) {
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));

  passport.use(new GoogleStrategy(
    {
      clientID:     config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL:  config.google.callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails } = profile;
      const email = emails?.[0]?.value || null;
      try {
        // Upsert user
        await pool.execute(
          `INSERT INTO users (id, displayName, email)
             VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE
             displayName = VALUES(displayName),
             email       = VALUES(email)`,
          [id, displayName, email]
        );
        // Fetch preferred language
        const [rows] = await pool.execute(
          `SELECT language FROM users WHERE id = ?`,
          [id]
        );
        const language = rows[0]?.language || 'en';
        done(null, { id, displayName, email, language });
      } catch (err) {
        console.error('Error in GoogleStrategy callback:', err);
        done(err, null);
      }
    }
  ));
}
