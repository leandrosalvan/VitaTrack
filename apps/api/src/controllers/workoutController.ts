import type { RequestHandler } from 'express';
import * as workoutService from '../services/workoutService.js';

export const create: RequestHandler = async (req, res, next) => {
  try {
    const session = await workoutService.createSession(req.user!.id, req.body);
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
};

export const list: RequestHandler = async (req, res, next) => {
  try {
    const sessions = await workoutService.listSessions(req.user!.id);
    res.status(200).json({ success: true, data: sessions });
  } catch (err) {
    next(err);
  }
};

export const getById: RequestHandler = async (req, res, next) => {
  try {
    const session = await workoutService.getSession(req.user!.id, req.params.id);
    res.status(200).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
};

export const remove: RequestHandler = async (req, res, next) => {
  try {
    await workoutService.deleteSession(req.user!.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getVolume: RequestHandler = async (req, res, next) => {
  try {
    const volume = await workoutService.getWeeklyVolume(req.user!.id);
    res.status(200).json({ success: true, data: volume });
  } catch (err) {
    next(err);
  }
};
