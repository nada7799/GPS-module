// src/controllers/AccidentController.ts
import { Request, Response } from 'express';
import { processAccident } from '../services/accidentService';

export const reportAccident = async (req: Request, res: Response) => {
    const { longitude,latitude, severity } = req.body;
    await processAccident(longitude,latitude, severity);
    res.status(200).json({ message: 'Accident processed successfully.' });
};
