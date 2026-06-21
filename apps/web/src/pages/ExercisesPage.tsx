import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { useExercises } from '../hooks/useExercises.js';
import { api } from '../services/api.js';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import type { Exercise } from '../types/index.js';

export default function ExercisesPage() {
  const { exercises, loading, refetch } = useExercises();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    muscleGroup: '',
    equipment: '',
    instructions: '',
  });

  const resetForm = () => {
    setForm({ name: '', muscleGroup: '', equipment: '', instructions: '' });
    setIsCreating(false);
    setEditingId(null);
  };

  const startEdit = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setForm({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment || '',
      instructions: exercise.instructions || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/exercises/${editingId}`, form);
        toast.success('Exercício atualizado');
      } else {
        await api.post('/exercises', form);
        toast.success('Exercício criado');
      }
      resetForm();
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao salvar exercício');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) return;
    try {
      await api.delete(`/exercises/${id}`);
      toast.success('Exercício excluído');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao excluir exercício');
    }
  };

  if (loading) return <p className="text-center text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exercícios</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" /> Novo
        </button>
      </div>

      {(isCreating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar exercício' : 'Novo exercício'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="Nome"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <input
                  placeholder="Grupo muscular"
                  value={form.muscleGroup}
                  onChange={(e) => setForm({ ...form, muscleGroup: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <input
                  placeholder="Equipamento (opcional)"
                  value={form.equipment}
                  onChange={(e) => setForm({ ...form, equipment: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  placeholder="Instruções (opcional)"
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
                >
                  <X className="h-4 w-4" /> Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  <Check className="h-4 w-4" /> Salvar
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {exercises.map((exercise) => (
          <Card key={exercise.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{exercise.name}</p>
                <p className="text-sm text-muted-foreground">
                  {exercise.muscleGroup}
                  {exercise.equipment && ` • ${exercise.equipment}`}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(exercise)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(exercise.id)}
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
