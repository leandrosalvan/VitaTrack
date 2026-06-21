import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { AppError, NotFoundError } from '../utils/errors.js';

const routineExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
  sets: z.number().int().min(1),
  targetReps: z.string().min(1),
  restSeconds: z.number().int().optional(),
  order: z.number().int().default(0),
});

const routineSchema = z.object({
  name: z.string().min(2),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
  isActive: z.boolean().optional(),
  exercises: z.array(routineExerciseSchema).min(1),
});

export type RoutineInput = z.infer<typeof routineSchema>;

export async function createRoutine(userId: string, input: RoutineInput) {
  const data = routineSchema.parse(input);

  const exerciseIds = [...new Set(data.exercises.map((e) => e.exerciseId))];
  const existing = await prisma.exercise.findMany({
    where: { id: { in: exerciseIds } },
  });

  if (existing.length !== exerciseIds.length) {
    throw new AppError('One or more exercises not found', 400);
  }

  return prisma.routine.create({
    data: {
      userId,
      name: data.name,
      daysOfWeek: data.daysOfWeek,
      isActive: data.isActive ?? true,
      exercises: {
        create: data.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          sets: e.sets,
          targetReps: e.targetReps,
          restSeconds: e.restSeconds,
          order: e.order,
        })),
      },
    },
    include: {
      exercises: { include: { exercise: true } },
    },
  });
}

export async function listRoutines(userId: string) {
  return prisma.routine.findMany({
    where: { userId },
    include: { exercises: { include: { exercise: true }, orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getRoutine(userId: string, id: string) {
  const routine = await prisma.routine.findFirst({
    where: { id, userId },
    include: { exercises: { include: { exercise: true }, orderBy: { order: 'asc' } } },
  });

  if (!routine) throw new NotFoundError('Routine not found');
  return routine;
}

export async function updateRoutine(
  userId: string,
  id: string,
  input: Partial<RoutineInput>
) {
  await getRoutine(userId, id);
  const data = routineSchema.partial().parse(input);

  return prisma.routine.update({
    where: { id },
    data: {
      name: data.name,
      daysOfWeek: data.daysOfWeek,
      isActive: data.isActive,
    },
    include: { exercises: { include: { exercise: true } } },
  });
}

export async function deleteRoutine(userId: string, id: string) {
  await getRoutine(userId, id);
  return prisma.routine.delete({ where: { id } });
}
