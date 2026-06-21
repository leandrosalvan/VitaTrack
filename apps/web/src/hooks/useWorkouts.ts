import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import type { WorkoutSession } from '../types/index.js';

export function useWorkouts() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const res = await api.get('/workouts');
    setSessions(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, []);

  return { sessions, loading, refetch: fetch };
}

export function useWeeklyVolume() {
  const [volume, setVolume] = useState<{ week: string; volume: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/workouts/volume')
      .then((res) => setVolume(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return { volume, loading };
}
