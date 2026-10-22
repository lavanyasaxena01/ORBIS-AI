import type { Request, Response } from 'express';
import { app, appReady } from '../server';

export default async function handler(req: Request, res: Response) {
  await appReady;
  app(req, res);
}
