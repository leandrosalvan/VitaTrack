import { Link } from 'react-router-dom';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRoutines } from '../hooks/useRoutines.js';
import { api } from '../services/api.js';
import { Card, CardContent } from '../components/ui/Card.js';

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function RoutinesPage() {
  const { routines, loading, refetch } = useRoutines();

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta rotina?')) return;
    try {
      await api.delete(`/routines/${id}`);
      toast.success('Rotina excluída');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao excluir rotina');
    }
  };

  if (loading) return <p className="text-center text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rotinas</h1>
        <Link
          to="/routines/new"
          className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" /> Nova
        </Link>
      </div>

      <div className="space-y-2">
        {routines.map((routine) => (
          <Card key={routine.id}>
            <CardContent className="flex items-center justify-between p-4">
              <Link to={`/routines/${routine.id}`} className="flex-1">
                <p className="font-medium">{routine.name}</p>
                <p className="text-sm text-muted-foreground">
                  {routine.daysOfWeek.map((d) => dayNames[d]).join(', ')} • {routine.exercises.length} exercícios
                </p>
              </Link>
              <div className="flex items-center gap-1">
                <Link
                  to={`/workout?routineId=${routine.id}`}
                  className="rounded-lg p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950"
                  title="Iniciar treino"
                >
                  <ChevronRight className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => handleDelete(routine.id)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
