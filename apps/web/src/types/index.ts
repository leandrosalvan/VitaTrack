export interface User {
  id: string;
  email: string;
  name: string;
  birthDate?: string | null;
  weight?: number | null;
  height?: number | null;
  goal?: string | null;
  createdAt?: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment?: string | null;
  instructions?: string | null;
  createdAt?: string;
}

export interface RoutineExercise {
  id: string;
  routineId: string;
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  targetReps: string;
  restSeconds?: number | null;
  order: number;
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  daysOfWeek: number[];
  isActive: boolean;
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface SetLog {
  id: string;
  sessionId: string;
  exerciseId: string;
  exercise: Exercise;
  setNumber: number;
  weight: number;
  reps: number;
  createdAt: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  routineId?: string | null;
  date: string;
  duration?: number | null;
  notes?: string | null;
  setLogs: SetLog[];
  routine?: { name: string } | null;
  createdAt: string;
}

export interface SleepLog {
  id: string;
  userId: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  totalHours: number;
  quality?: number | null;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  date: string;
  steps?: number | null;
  activeCalories?: number | null;
  exerciseMinutes?: number | null;
  createdAt: string;
}

export interface HeartRateLog {
  id: string;
  userId: string;
  date: string;
  restingHr?: number | null;
  avgWorkoutHr?: number | null;
  source: string;
  createdAt: string;
}

export interface DashboardData {
  lastSleep: SleepLog | null;
  lastActivity: ActivityLog | null;
  lastHeartRate: HeartRateLog | null;
  lastWorkout: WorkoutSession | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
