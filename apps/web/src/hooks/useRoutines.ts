import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import type { Routine } from '../types/index.js';

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const res = await api.get('/routines');
    setRoutines(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, []);

  return { routines, loading, refetch: fetch };
}

export function useRoutine(id?: string) {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    api
      .get(`/routines/${id}`)
      .then((res) => setRoutine(res.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  return { routine, loading };
}
