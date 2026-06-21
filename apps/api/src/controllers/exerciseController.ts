import type { RequestHandler } from 'express';
import * as exerciseService from '../services/exerciseService.js';

export const create: RequestHandler = async (req, res, next) => {
  try {
    const exercise = await exerciseService.createExercise(req.body);
    res.status(201).json({ success: true, data: exercise });
  } catch (err) {
    next(err);
  }
};

export const list: RequestHandler = async (_req, res, next) => {
  try {
    const exercises = await exerciseService.listExercises();
    res.status(200).json({ success: true, data: exercises });
  } catch (err) {
    next(err);
  }
};

export const getById: RequestHandler = async (req, res, next) => {
  try {
    const exercise = await exerciseService.getExercise(req.params.id);
    res.status(200).json({ success: true, data: exercise });
  } catch (err) {
    next(err);
  }
};

export const update: RequestHandler = async (req, res, next) => {
  try {
    const exercise = await exerciseService.updateExercise(req.params.id, req.body);
    res.status(200).json({ success: true, data: exercise });
  } catch (err) {
    next(err);
  }
};

export const remove: RequestHandler = async (req, res, next) => {
  try {
    await exerciseService.deleteExercise(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getProgress: RequestHandler = async (req, res, next) => {
  try {
    const progress = await exerciseService.getExerciseProgress(
      req.user!.id,
      req.params.id
    );
    res.status(200).json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
};
