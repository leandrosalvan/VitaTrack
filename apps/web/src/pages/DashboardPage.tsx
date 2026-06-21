import { Link } from 'react-router-dom';
import { Activity, BedDouble, HeartPulse, Dumbbell, TrendingUp } from 'lucide-react';
import { useDashboard } from '../hooks/useHealth.js';
import { useWeeklyVolume } from '../hooks/useWorkouts.js';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { ChartContainer } from '../components/ui/ChartContainer.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function DashboardPage() {
  const { data, loading } = useDashboard();
  const { volume, loading: volumeLoading } = useWeeklyVolume();

  if (loading || volumeLoading) {
    return <div className="py-10 text-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Resumo</h1>
        <p className="text-muted-foreground">Acompanhe seu treino e saúde de um jeito só.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          icon={Dumbbell}
          label="Último treino"
          value={data?.lastWorkout ? formatDate(data.lastWorkout.date) : '—'}
          href="/workout/history"
        />
        <SummaryCard
          icon={BedDouble}
          label="Sono"
          value={data?.lastSleep ? `${data.lastSleep.totalHours}h` : '—'}
          href="/health"
        />
        <SummaryCard
          icon={Activity}
          label="Passos"
          value={data?.lastActivity?.steps?.toString() ?? '—'}
          href="/health"
        />
        <SummaryCard
          icon={HeartPulse}
          label="FC repouso"
          value={data?.lastHeartRate?.restingHr?.toString() ?? '—'}
          href="/health"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ChartContainer title="Volume semanal" icon={TrendingUp}>
          {volume.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={volume}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="week"
                  tickFormatter={(v) => formatShortDate(v)}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--card-foreground))',
                  }}
                />
                <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum treino registrado ainda.</p>
          )}
        </ChartContainer>

        <Card>
          <CardHeader>
            <CardTitle>Ações rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link
              to="/workout"
              className="rounded-lg bg-primary-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-700"
            >
              Iniciar treino
            </Link>
            <Link
              to="/health"
              className="rounded-lg border border-border bg-background px-4 py-2 text-center text-sm font-medium hover:bg-muted"
            >
              Registrar saúde
            </Link>
            <Link
              to="/routines/new"
              className="rounded-lg border border-border bg-background px-4 py-2 text-center text-sm font-medium hover:bg-muted"
            >
              Nova rotina
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link to={href} className="group">
      <Card className="transition hover:border-primary-500/50">
        <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
          <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold">{value}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
}
