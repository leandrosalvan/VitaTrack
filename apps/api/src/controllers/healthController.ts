import type { RequestHandler } from 'express';
import * as healthService from '../services/healthService.js';

export const createSleep: RequestHandler = async (req, res, next) => {
  try {
    const log = await healthService.createSleepLog(req.user!.id, req.body);
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
};

export const listSleep: RequestHandler = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
    const logs = await healthService.listSleepLogs(req.user!.id, limit);
    res.status(200).json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
};

export const createActivity: RequestHandler = async (req, res, next) => {
  try {
    const log = await healthService.createActivityLog(req.user!.id, req.body);
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
};

export const listActivity: RequestHandler = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
    const logs = await healthService.listActivityLogs(req.user!.id, limit);
    res.status(200).json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
};

export const createHeartRate: RequestHandler = async (req, res, next) => {
  try {
    const log = await healthService.createHeartRateLog(req.user!.id, req.body);
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
};

export const listHeartRate: RequestHandler = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
    const logs = await healthService.listHeartRateLogs(req.user!.id, limit);
    res.status(200).json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
};

export const getDashboard: RequestHandler = async (req, res, next) => {
  try {
    const data = await healthService.getDashboardData(req.user!.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const type = req.params.type as 'sleep' | 'activity' | 'heartrate';
    await healthService.deleteHealthLog(req.user!.id, type, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
