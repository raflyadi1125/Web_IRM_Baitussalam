import app from './app';
import { prisma } from './config/database';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`Server berjalan di http://localhost:${env.PORT}`);
});

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
