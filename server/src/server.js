// server/src/server.js
import migrate from './services/migrate.js';
import config from './config/index.js';
import cron from 'node-cron';  // Added import

(async () => {
  try {
    await migrate();
    console.log('Database ready — starting server');

    // only import the Express app after migrations complete
    const { default: app } = await import('./app.js');

    app.listen(config.port, () => {
      console.log(`Backend listening on port ${config.port}`);

      // Schedule daily wipe at midnight (00:00 server time)
      cron.schedule('0 0 * * *', async () => {
        console.log('Running daily wipe');
        try {
          await app.locals.db.query('CALL daily_wipe();');
          console.log('Daily wipe completed');
        } catch (err) {
          console.error('Daily wipe failed', err);
        }
      }, {
        timezone: 'Europe/Oslo'  // Adjust to your server's timezone if needed
      });
    });
  } catch (err) {
    console.error('Failed to migrate database, exiting.', err);
    process.exit(1);
  }
})();