import { Router } from 'express';
import ensureAuth from '../middleware/ensureAuth.js';
import pool from '../db/pool.js';

const router = Router();

router.get('/', ensureAuth, (req, res) => {
  res.json({ user: req.user });
});

router.patch('/language', ensureAuth, async (req, res) => {
  const { language } = req.body;
  if (!['en','no'].includes(language))
    return res.status(400).json({ error: 'Invalid language' });
  try {
    await pool.execute(
      `UPDATE users SET language = ? WHERE id = ?`,
      [ language, req.user.id ]
    );
    req.user.language = language;
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;