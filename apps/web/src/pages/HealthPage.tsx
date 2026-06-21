import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  useSleepLogs,
  useActivityLogs,
  useHeartRateLogs,
} from '../hooks/useHealth.js';
import { api } from '../services/api.js';
import { Card, CardContent } from '../components/ui/Card.js';
import { ChartContainer } from '../components/ui/ChartContainer.js';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { BedDouble, Activity, HeartPulse } from 'lucide-react';

export default function HealthPage() {
  const { logs: sleepLogs, refetch: refetchSleep } = useSleepLogs(14);
  const { logs: activityLogs, refetch: refetchActivity } = useActivityLogs(14);
  const { logs: heartRateLogs, refetch: refetchHeartRate } = useHeartRateLogs(14);

  const [activeTab, setActiveTab] = useState<'sleep' | 'activity' | 'heartrate'>('sleep');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Saúde</h1>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <TabButton
          active={activeTab === 'sleep'}
          onClick={() => setActiveTab('sleep')}
          icon={BedDouble}
          label="Sono"
        />
        <TabButton
          active={activeTab === 'activity'}
          onClick={() => setActiveTab('activity')}
          icon={Activity}
          label="Atividade"
        />
        <TabButton
          active={activeTab === 'heartrate'}
          onClick={() => setActiveTab('heartrate')}
          icon={HeartPulse}
          label="FC"
        />
      </div>

      {activeTab === 'sleep' && (
        <SleepSection logs={sleepLogs} onSave={refetchSleep} />
      )}
      {activeTab === 'activity' && (
        <ActivitySection logs={activityLogs} onSave={refetchActivity} />
      )}
      {activeTab === 'heartrate' && (
        <HeartRateSection logs={heartRateLogs} onSave={refetchHeartRate} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap ${
        active
          ? 'bg-primary-600 text-white'
          : 'border border-border bg-background hover:bg-muted'
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function SleepSection({
  logs,
  onSave,
}: {
  logs: { date: string; totalHours: number; quality?: number | null }[];
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    bedTime: '22:00',
    wakeTime: '06:00',
    totalHours: 8,
    quality: 3,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const date = new Date(form.date);
    const bedTime = new Date(`${form.date}T${form.bedTime}`);
    const wakeTime = new Date(`${form.date}T${form.wakeTime}`);
    if (wakeTime <= bedTime) wakeTime.setDate(wakeTime.getDate() + 1);

    try {
      await api.post('/health/sleep', {
        date,
        bedTime,
        wakeTime,
        totalHours: form.totalHours,
        quality: form.quality,
      });
      toast.success('Sono registrado');
      onSave();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao registrar sono');
    }
  };

  const chartData = [...logs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({ date: formatShortDate(log.date), horas: log.totalHours, qualidade: log.quality || 0 }));

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                required
              />
              <input
                type="number"
                value={form.totalHours}
                onChange={(e) => setForm({ ...form, totalHours: Number(e.target.value) })}
                placeholder="Horas totais"
                step="0.5"
                min="0"
                max="24"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                required
              />
              <input
                type="time"
                value={form.bedTime}
                onChange={(e) => setForm({ ...form, bedTime: e.target.value })}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                required
              />
              <input
                type="time"
                value={form.wakeTime}
                onChange={(e) => setForm({ ...form, wakeTime: e.target.value })}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                required
              />
              <input
                type="number"
                value={form.quality}
                onChange={(e) => setForm({ ...form, quality: Number(e.target.value) })}
                placeholder="Qualidade (1-5)"
                min="1"
                max="5"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Registrar sono
            </button>
          </form>
        </CardContent>
      </Card>

      <ChartContainer title="Últimos 14 dias de sono" icon={BedDouble}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--card-foreground))',
                }}
              />
              <Line
                type="monotone"
                dataKey="horas"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum dado de sono registrado.</p>
        )}
      </ChartContainer>
    </div>
  );
}

function ActivitySection({
  logs,
  onSave,
}: {
  logs: { date: string; steps?: number | null; activeCalories?: number | null; exerciseMinutes?: number | null }[];
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    steps: 0,
    activeCalories: 0,
    exerciseMinutes: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/health/activity', {
        date: new Date(form.date),
        steps: form.steps || undefined,
        activeCalories: form.activeCalories || undefined,
        exerciseMinutes: form.exerciseMinutes || undefined,
      });
      toast.success('Atividade registrada');
      onSave();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao registrar atividade');
    }
  };

  const chartData = [...logs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({ date: formatShortDate(log.date), passos: log.steps || 0 }));

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                required
              />
              <input
                type="number"
                value={form.steps || ''}
                onChange={(e) => setForm({ ...form, steps: Number(e.target.value) })}
                placeholder="Passos"
                min="0"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={form.activeCalories || ''}
                onChange={(e) => setForm({ ...form, activeCalories: Number(e.target.value) })}
                placeholder="Calorias ativas"
                min="0"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={form.exerciseMinutes || ''}
                onChange={(e) => setForm({ ...form, exerciseMinutes: Number(e.target.value) })}
                placeholder="Minutos de exercício"
                min="0"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Registrar atividade
            </button>
          </form>
        </CardContent>
      </Card>

      <ChartContainer title="Passos nos últimos 14 dias" icon={Activity}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--card-foreground))',
                }}
              />
              <Line
                type="monotone"
                dataKey="passos"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
        )}
      </ChartContainer>
    </div>
  );
}

function HeartRateSection({
  logs,
  onSave,
}: {
  logs: { date: string; restingHr?: number | null; avgWorkoutHr?: number | null }[];
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    restingHr: 0,
    avgWorkoutHr: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/health/heartrate', {
        date: new Date(form.date),
        restingHr: form.restingHr || undefined,
        avgWorkoutHr: form.avgWorkoutHr || undefined,
      });
      toast.success('Frequência cardíaca registrada');
      onSave();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao registrar FC');
    }
  };

  const chartData = [...logs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({ date: formatShortDate(log.date), repouso: log.restingHr || 0 }));

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                required
              />
              <input
                type="number"
                value={form.restingHr || ''}
                onChange={(e) => setForm({ ...form, restingHr: Number(e.target.value) })}
                placeholder="FC em repouso"
                min="0"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={form.avgWorkoutHr || ''}
                onChange={(e) => setForm({ ...form, avgWorkoutHr: Number(e.target.value) })}
                placeholder="FC média no treino"
                min="0"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Registrar FC
            </button>
          </form>
        </CardContent>
      </Card>

      <ChartContainer title="FC de repouso - últimos 14 dias" icon={HeartPulse}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--card-foreground))',
                }}
              />
              <Line
                type="monotone"
                dataKey="repouso"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma FC registrada.</p>
        )}
      </ChartContainer>
    </div>
  );
}

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
