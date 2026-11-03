import { app } from "./app"
import { appConfig } from "./config/app.config";
import { connectDatabase, disconnectDatabase } from "./config/database";

async function bootstrap() {
  await connectDatabase();

  const server = app.listen(appConfig.port, () => {
    console.log(`Server jalan di http://localhost:${appConfig.port}`);
  });

  const shutdown = async () => {
    server.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((error) => {
  console.error("Gagal menjalankan server:", error);
  process.exit(1);
});