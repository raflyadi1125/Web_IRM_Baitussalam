import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { appConfig } from './config/app.config';
import { corsOptions } from './config/cors';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFound } from './middlewares/not-found.middleware';
import router from './routes';

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { name: appConfig.name, version: appConfig.version, status: 'ok' } });
});

app.use(appConfig.apiPrefix, router);

app.use(notFound);
app.use(errorMiddleware);

export default app;
