import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, X, GripVertical } from 'lucide-react';
import { useExercises } from '../hooks/useExercises.js';
import { useRoutine } from '../hooks/useRoutines.js';
import { api } from '../services/api.js';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface RoutineExerciseForm {
  id?: string;
  exerciseId: string;
  sets: number;
  targetReps: string;
  restSeconds: number;
  order: number;
}

export default function RoutineFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { exercises, loading: loadingExercises } = useExercises();
  const { routine, loading: loadingRoutine } = useRoutine(id);

  const [name, setName] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [routineExercises, setRoutineExercises] = useState<RoutineExerciseForm[]>([]);

  useEffect(() => {
    if (routine) {
      setName(routine.name);
      setDaysOfWeek(routine.daysOfWeek);
      setRoutineExercises(
        routine.exercises.map((e) => ({
          id: e.id,
          exerciseId: e.exerciseId,
          sets: e.sets,
          targetReps: e.targetReps,
          restSeconds: e.restSeconds || 60,
          order: e.order,
        }))
      );
    }
  }, [routine]);

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const addExercise = () => {
    if (exercises.length === 0) return;
    setRoutineExercises((prev) => [
      ...prev,
      {
        exerciseId: exercises[0].id,
        sets: 3,
        targetReps: '8-12',
        restSeconds: 60,
        order: prev.length,
      },
    ]);
  };

  const updateExercise = (index: number, field: keyof RoutineExerciseForm, value: any) => {
    setRoutineExercises((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
  };

  const removeExercise = (index: number) => {
    setRoutineExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (daysOfWeek.length === 0) {
      toast.error('Selecione pelo menos um dia da semana');
      return;
    }
    if (routineExercises.length === 0) {
      toast.error('Adicione pelo menos um exercício');
      return;
    }

    const payload = {
      name,
      daysOfWeek,
      exercises: routineExercises.map((e, i) => ({
        exerciseId: e.exerciseId,
        sets: Number(e.sets),
        targetReps: e.targetReps,
        restSeconds: Number(e.restSeconds),
        order: i,
      })),
    };

    try {
      if (id) {
        await api.put(`/routines/${id}`, payload);
        toast.success('Rotina atualizada');
      } else {
        await api.post('/routines', payload);
        toast.success('Rotina criada');
      }
      navigate('/routines');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao salvar rotina');
    }
  };

  if (loadingExercises || (id && loadingRoutine)) {
    return <p className="text-center text-muted-foreground">Carregando...</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{id ? 'Editar rotina' : 'Nova rotina'}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardContent className="space-y-4 p-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Nome da rotina</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Treino A - Peito e Tríceps"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Dias da semana</label>
              <div className="flex flex-wrap gap-2">
                {dayNames.map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
                      daysOfWeek.includes(index)
                        ? 'bg-primary-600 text-white'
                        : 'border border-border bg-background hover:bg-muted'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Exercícios</CardTitle>
            <button
              type="button"
              onClick={addExercise}
              className="flex items-center gap-1 rounded-lg bg-primary-600 px-2 py-1 text-xs font-medium text-white hover:bg-primary-700"
            >
              <Plus className="h-3 w-3" /> Adicionar
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            {routineExercises.map((exercise, index) => (
              <div
                key={index}
                className="flex items-start gap-2 rounded-lg border border-border p-3"
              >
                <GripVertical className="mt-2 h-4 w-4 text-muted-foreground" />
                <div className="grid flex-1 gap-2 sm:grid-cols-4">
                  <select
                    value={exercise.exerciseId}
                    onChange={(e) => updateExercise(index, 'exerciseId', e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-2 py-2 text-sm"
                  >
                    {exercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={exercise.sets}
                    onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                    placeholder="Séries"
                    className="w-full rounded-lg border border-input bg-background px-2 py-2 text-sm"
                    min={1}
                  />
                  <input
                    type="text"
                    value={exercise.targetReps}
                    onChange={(e) => updateExercise(index, 'targetReps', e.target.value)}
                    placeholder="Reps alvo"
                    className="w-full rounded-lg border border-input bg-background px-2 py-2 text-sm"
                  />
                  <input
                    type="number"
                    value={exercise.restSeconds}
                    onChange={(e) => updateExercise(index, 'restSeconds', e.target.value)}
                    placeholder="Descanso (s)"
                    className="w-full rounded-lg border border-input bg-background px-2 py-2 text-sm"
                    min={0}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeExercise(index)}
                  className="mt-2 text-muted-foreground hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {routineExercises.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum exercício adicionado.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/routines')}
            className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 rounded-lg bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
