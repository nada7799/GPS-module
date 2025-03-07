// src/app.ts
import express from 'express';
import { reportAccident } from './controllers/accidentController';
import {firestore} from './database/firebase'

const app = express();
app.use(express.json());

app.post('/report-accident', reportAccident);

export default app;
