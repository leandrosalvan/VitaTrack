import type { RequestHandler } from 'express';
import * as routineService from '../services/routineService.js';

export const create: RequestHandler = async (req, res, next) => {
  try {
    const routine = await routineService.createRoutine(req.user!.id, req.body);
    res.status(201).json({ success: true, data: routine });
  } catch (err) {
    next(err);
  }
};

export const list: RequestHandler = async (req, res, next) => {
  try {
    const routines = await routineService.listRoutines(req.user!.id);
    res.status(200).json({ success: true, data: routines });
  } catch (err) {
    next(err);
  }
};

export const getById: RequestHandler = async (req, res, next) => {
  try {
    const routine = await routineService.getRoutine(req.user!.id, req.params.id);
    res.status(200).json({ success: true, data: routine });
  } catch (err) {
    next(err);
  }
};

export const update: RequestHandler = async (req, res, next) => {
  try {
    const routine = await routineService.updateRoutine(
      req.user!.id,
      req.params.id,
      req.body
    );
    res.status(200).json({ success: true, data: routine });
  } catch (err) {
    next(err);
  }
};

export const remove: RequestHandler = async (req, res, next) => {
  try {
    await routineService.deleteRoutine(req.user!.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
