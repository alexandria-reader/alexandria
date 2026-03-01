import http from 'http';
import app from './app';
import env from './lib/env';
import dbQuery from './model/db-query';

async function start() {
  try {
    await dbQuery('SELECT 1');
  } catch (error) {
    console.error('Failed to connect to database:', (error as Error).message);
    process.exit(1);
  }

  const server = http.createServer(app);

  server.listen(env.PORT, env.HOST, () => {
    console.log(`Alexandria is listening on port ${env.PORT} of ${env.HOST}.`);
  });
}

start();
