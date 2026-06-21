import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api.js';
import type { DashboardData, SleepLog, ActivityLog, HeartRateLog } from '../types/index.js';

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/health/dashboard')
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useSleepLogs(limit = 30) {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const res = await api.get(`/health/sleep?limit=${limit}`);
    setLogs(res.data.data);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { logs, loading, refetch: fetch };
}

export function useActivityLogs(limit = 30) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const res = await api.get(`/health/activity?limit=${limit}`);
    setLogs(res.data.data);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { logs, loading, refetch: fetch };
}

export function useHeartRateLogs(limit = 30) {
  const [logs, setLogs] = useState<HeartRateLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const res = await api.get(`/health/heartrate?limit=${limit}`);
    setLogs(res.data.data);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { logs, loading, refetch: fetch };
}
