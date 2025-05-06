import { Router } from 'express';
import passport from 'passport';
import config from '../config/index.js';

const router = Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (_req, res) => {
    // Redirect back to Vite dev server
    res.redirect(config.clientOrigin);
  }
);

router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.json({ ok: true });
  });
});

router.get('/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ user: null });
  }
  res.json({ user: req.user });
});

export default router;
