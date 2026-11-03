import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors";
import { appConfig } from "./config/app.config";

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
// app.use(appConfig.apiPrefix, routes);