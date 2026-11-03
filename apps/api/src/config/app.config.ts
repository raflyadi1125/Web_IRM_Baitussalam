import { env } from "./env";

export const appConfig = {
  name: "API",
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === "production",
  isDevelopment: env.NODE_ENV === "development",
  port: env.PORT,
  apiPrefix: "/api",
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
} as const;

export type AppConfig = typeof appConfig;