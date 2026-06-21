import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import type { Exercise } from '../types/index.js';

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const res = await api.get('/exercises');
    setExercises(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, []);

  return { exercises, loading, refetch: fetch };
}

export function useExerciseProgress(id: string) {
  const [progress, setProgress] = useState<{ date: string; weight: number; reps: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/exercises/${id}/progress`)
      .then((res) => {
        const data = res.data.data.map((log: any) => ({
          date: log.session.date.split('T')[0],
          weight: log.weight,
          reps: log.reps,
        }));
        setProgress(data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { progress, loading };
}
