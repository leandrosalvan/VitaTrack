import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { env } from '../config/env.js';
import { AppError, UnauthorizedError } from '../utils/errors.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export async function register(input: RegisterInput) {
  const data = registerSchema.parse(input);

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new AppError('Email already in use', 409);
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  return { user, token: generateToken(user) };
}

export async function login(input: LoginInput) {
  const data = loginSchema.parse(input);

  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isValid = await bcrypt.compare(data.password, user.passwordHash);

  if (!isValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const publicUser = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  return { user: publicUser, token: generateToken(publicUser) };
}

function generateToken(user: { id: string; email: string; name: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as `${number}${'d' | 'h' | 'm' | 's'}` }
  );
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      birthDate: true,
      weight: true,
      height: true,
      goal: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  return user;
}

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  birthDate: z.coerce.date().optional(),
  weight: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  goal: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function updateProfile(id: string, input: UpdateProfileInput) {
  const data = updateProfileSchema.parse(input);

  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      birthDate: true,
      weight: true,
      height: true,
      goal: true,
      createdAt: true,
    },
  });
}
