import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/authRoutes.js';
import { errorHandler } from '../src/middlewares/errorHandler.js';
import { prisma } from '../src/utils/prisma.js';

jest.setTimeout(15000);

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

describe('Auth Routes', () => {
  beforeEach(async () => {
    await prisma.$transaction([
      prisma.setLog.deleteMany(),
      prisma.workoutSession.deleteMany(),
      prisma.routineExercise.deleteMany(),
      prisma.routine.deleteMany(),
      prisma.sleepLog.deleteMany(),
      prisma.activityLog.deleteMany(),
      prisma.heartRateLog.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: '123456',
      name: 'Test User',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('test@example.com');
  });

  it('should not register with invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'invalid',
      password: '123456',
      name: 'Test',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should login a registered user', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'login@example.com',
      password: '123456',
      name: 'Login User',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: '123456',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });
});
