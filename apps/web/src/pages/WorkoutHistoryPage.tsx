import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useWorkouts } from '../hooks/useWorkouts.js';
import { api } from '../services/api.js';
import { Card, CardContent } from '../components/ui/Card.js';

export default function WorkoutHistoryPage() {
  const { sessions, loading, refetch } = useWorkouts();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este treino?')) return;
    try {
      await api.delete(`/workouts/${id}`);
      toast.success('Treino excluído');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao excluir treino');
    }
  };

  if (loading) return <p className="text-center text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Histórico de treinos</h1>

      {sessions.length === 0 && (
        <Card>
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            Nenhum treino registrado ainda.
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {sessions.map((session) => {
          const isExpanded = expandedId === session.id;
          const volume = session.setLogs.reduce((sum, s) => sum + s.weight * s.reps, 0);

          return (
            <Card key={session.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {session.routine?.name || 'Treino livre'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(session.date)} • {session.duration || 0} min • Volume: {volume} kg
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : session.id)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-1 border-t border-border pt-3">
                    {session.setLogs.map((set) => (
                      <div
                        key={set.id}
                        className="flex justify-between text-sm"
                      >
                        <span>{set.exercise.name} — Série {set.setNumber}</span>
                        <span className="font-medium">
                          {set.weight} kg × {set.reps} reps
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
