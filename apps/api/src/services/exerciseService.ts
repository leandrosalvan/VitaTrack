import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { NotFoundError } from '../utils/errors.js';

const exerciseSchema = z.object({
  name: z.string().min(2),
  muscleGroup: z.string().min(2),
  equipment: z.string().optional(),
  instructions: z.string().optional(),
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;

export async function createExercise(input: ExerciseInput) {
  const data = exerciseSchema.parse(input);
  return prisma.exercise.create({ data });
}

export async function listExercises() {
  return prisma.exercise.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getExercise(id: string) {
  const exercise = await prisma.exercise.findUnique({ where: { id } });
  if (!exercise) throw new NotFoundError('Exercise not found');
  return exercise;
}

export async function updateExercise(id: string, input: Partial<ExerciseInput>) {
  await getExercise(id);
  const data = exerciseSchema.partial().parse(input);
  return prisma.exercise.update({ where: { id }, data });
}

export async function deleteExercise(id: string) {
  await getExercise(id);
  return prisma.exercise.delete({ where: { id } });
}

export async function getExerciseProgress(userId: string, exerciseId: string) {
  const logs = await prisma.setLog.findMany({
    where: {
      exerciseId,
      session: { userId },
    },
    include: {
      session: { select: { date: true } },
    },
    orderBy: { session: { date: 'asc' } },
  });

  return logs;
}
