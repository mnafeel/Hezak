import { env } from './config/env';
import { app } from './app';

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 API server ready at http://localhost:${env.PORT}`);
});

const shutdown = () => {
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('🛑 Server closed gracefully');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);


