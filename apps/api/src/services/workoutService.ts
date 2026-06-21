import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { AppError, NotFoundError } from '../utils/errors.js';

const setLogSchema = z.object({
  exerciseId: z.string().uuid(),
  setNumber: z.number().int().min(1),
  weight: z.number().min(0),
  reps: z.number().int().min(0),
});

const workoutSessionSchema = z.object({
  routineId: z.string().uuid().optional(),
  date: z.coerce.date().optional(),
  duration: z.number().int().min(0).optional(),
  notes: z.string().optional(),
  sets: z.array(setLogSchema).min(1),
});

export type WorkoutSessionInput = z.infer<typeof workoutSessionSchema>;

export async function createSession(userId: string, input: WorkoutSessionInput) {
  const data = workoutSessionSchema.parse(input);

  if (data.routineId) {
    const routine = await prisma.routine.findFirst({
      where: { id: data.routineId, userId },
    });
    if (!routine) throw new NotFoundError('Routine not found');
  }

  const exerciseIds = [...new Set(data.sets.map((s) => s.exerciseId))];
  const existingExercises = await prisma.exercise.findMany({
    where: { id: { in: exerciseIds } },
  });
  if (existingExercises.length !== exerciseIds.length) {
    throw new AppError('One or more exercises not found', 400);
  }

  return prisma.workoutSession.create({
    data: {
      userId,
      routineId: data.routineId,
      date: data.date ?? new Date(),
      duration: data.duration,
      notes: data.notes,
      setLogs: {
        create: data.sets.map((s) => ({
          exerciseId: s.exerciseId,
          setNumber: s.setNumber,
          weight: s.weight,
          reps: s.reps,
        })),
      },
    },
    include: {
      setLogs: { include: { exercise: true }, orderBy: { setNumber: 'asc' } },
      routine: true,
    },
  });
}

export async function listSessions(userId: string) {
  return prisma.workoutSession.findMany({
    where: { userId },
    include: {
      setLogs: { include: { exercise: true }, orderBy: { setNumber: 'asc' } },
      routine: { select: { name: true } },
    },
    orderBy: { date: 'desc' },
  });
}

export async function getSession(userId: string, id: string) {
  const session = await prisma.workoutSession.findFirst({
    where: { id, userId },
    include: {
      setLogs: { include: { exercise: true }, orderBy: { setNumber: 'asc' } },
      routine: true,
    },
  });

  if (!session) throw new NotFoundError('Workout session not found');
  return session;
}

export async function deleteSession(userId: string, id: string) {
  await getSession(userId, id);
  return prisma.workoutSession.delete({ where: { id } });
}

export async function getWeeklyVolume(userId: string) {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId },
    include: { setLogs: true },
  });

  const volumeByWeek: Record<string, number> = {};

  for (const session of sessions) {
    const weekStart = getWeekStart(session.date);
    const key = weekStart.toISOString().split('T')[0];
    const volume = session.setLogs.reduce(
      (sum: number, set: { weight: number; reps: number }) => sum + set.weight * set.reps,
      0
    );
    volumeByWeek[key] = (volumeByWeek[key] || 0) + volume;
  }

  return Object.entries(volumeByWeek)
    .map(([week, volume]) => ({ week, volume }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}
