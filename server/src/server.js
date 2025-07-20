// server/src/server.js
import migrate from './services/migrate.js';
import config from './config/index.js';

(async () => {
  try {
    await migrate();
    console.log('Database ready — starting server');

    // only import the Express app after migrations complete
    const { default: app } = await import('./app.js');

    app.listen(config.port, () => {
      console.log('Backend listening on port ${config.port}');
    });
  } catch (err) {
    console.error('Failed to migrate database, exiting.', err);
    process.exit(1);
  }
})();