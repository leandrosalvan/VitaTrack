import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { NotFoundError } from '../utils/errors.js';

const sleepSchema = z.object({
  date: z.coerce.date(),
  bedTime: z.coerce.date(),
  wakeTime: z.coerce.date(),
  totalHours: z.number().min(0).max(24),
  quality: z.number().int().min(1).max(5).optional(),
});

const activitySchema = z.object({
  date: z.coerce.date(),
  steps: z.number().int().min(0).optional(),
  activeCalories: z.number().int().min(0).optional(),
  exerciseMinutes: z.number().int().min(0).optional(),
});

const heartRateSchema = z.object({
  date: z.coerce.date(),
  restingHr: z.number().int().min(0).optional(),
  avgWorkoutHr: z.number().int().min(0).optional(),
  source: z.enum(['manual', 'wearable']).default('manual'),
});

export type SleepInput = z.infer<typeof sleepSchema>;
export type ActivityInput = z.infer<typeof activitySchema>;
export type HeartRateInput = z.infer<typeof heartRateSchema>;

export async function createSleepLog(userId: string, input: SleepInput) {
  const data = sleepSchema.parse(input);
  return prisma.sleepLog.upsert({
    where: { userId_date: { userId, date: data.date } },
    create: { userId, ...data },
    update: data,
  });
}

export async function listSleepLogs(userId: string, limit: number = 30) {
  return prisma.sleepLog.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: limit,
  });
}

export async function createActivityLog(userId: string, input: ActivityInput) {
  const data = activitySchema.parse(input);
  return prisma.activityLog.upsert({
    where: { userId_date: { userId, date: data.date } },
    create: { userId, ...data },
    update: data,
  });
}

export async function listActivityLogs(userId: string, limit: number = 30) {
  return prisma.activityLog.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: limit,
  });
}

export async function createHeartRateLog(userId: string, input: HeartRateInput) {
  const data = heartRateSchema.parse(input);
  return prisma.heartRateLog.upsert({
    where: { userId_date: { userId, date: data.date } },
    create: { userId, ...data },
    update: data,
  });
}

export async function listHeartRateLogs(userId: string, limit: number = 30) {
  return prisma.heartRateLog.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: limit,
  });
}

export async function getDashboardData(userId: string) {
  const [lastSleep, lastActivity, lastHeartRate] = await Promise.all([
    prisma.sleepLog.findFirst({ where: { userId }, orderBy: { date: 'desc' } }),
    prisma.activityLog.findFirst({ where: { userId }, orderBy: { date: 'desc' } }),
    prisma.heartRateLog.findFirst({ where: { userId }, orderBy: { date: 'desc' } }),
  ]);

  const lastWorkout = await prisma.workoutSession.findFirst({
    where: { userId },
    orderBy: { date: 'desc' },
    include: { routine: { select: { name: true } } },
  });

  return { lastSleep, lastActivity, lastHeartRate, lastWorkout };
}

export async function deleteHealthLog(
  userId: string,
  type: 'sleep' | 'activity' | 'heartrate',
  id: string
) {
  switch (type) {
    case 'sleep': {
      const sleep = await prisma.sleepLog.findFirst({ where: { id, userId } });
      if (!sleep) throw new NotFoundError('Log not found');
      return prisma.sleepLog.delete({ where: { id } });
    }
    case 'activity': {
      const activity = await prisma.activityLog.findFirst({ where: { id, userId } });
      if (!activity) throw new NotFoundError('Log not found');
      return prisma.activityLog.delete({ where: { id } });
    }
    case 'heartrate': {
      const hr = await prisma.heartRateLog.findFirst({ where: { id, userId } });
      if (!hr) throw new NotFoundError('Log not found');
      return prisma.heartRateLog.delete({ where: { id } });
    }
  }
}
