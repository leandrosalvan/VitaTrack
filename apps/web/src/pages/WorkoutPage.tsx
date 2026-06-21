import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Play, Pause, RotateCcw, Save, CheckCircle2 } from 'lucide-react';
import { useRoutines } from '../hooks/useRoutines.js';
import { useExercises } from '../hooks/useExercises.js';
import { api } from '../services/api.js';
import { Card, CardContent } from '../components/ui/Card.js';

interface SetEntry {
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  done: boolean;
}

export default function WorkoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const routineId = searchParams.get('routineId') || undefined;
  const { routines } = useRoutines();
  const { exercises } = useExercises();

  const [selectedRoutineId, setSelectedRoutineId] = useState(routineId || '');
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [finished, setFinished] = useState(false);

  const selectedRoutine = routines.find((r) => r.id === selectedRoutineId);

  useEffect(() => {
    let interval: number;
    if (isRunning) {
      interval = window.setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (selectedRoutine) {
      const entries: SetEntry[] = [];
      selectedRoutine.exercises.forEach((ex) => {
        for (let i = 1; i <= ex.sets; i++) {
          entries.push({
            exerciseId: ex.exerciseId,
            setNumber: i,
            weight: 0,
            reps: 0,
            done: false,
          });
        }
      });
      setSets(entries);
    }
  }, [selectedRoutine]);

  const updateSet = (index: number, field: keyof SetEntry, value: any) => {
    setSets((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const toggleDone = (index: number) => {
    setSets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, done: !s.done } : s))
    );
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    const completedSets = sets.filter((s) => s.done && s.weight > 0 && s.reps > 0);
    if (completedSets.length === 0) {
      toast.error('Complete pelo menos uma série com carga e repetições');
      return;
    }

    setSaving(true);
    try {
      await api.post('/workouts', {
        routineId: selectedRoutineId || undefined,
        duration: Math.floor(duration / 60),
        notes,
        sets: completedSets.map((s) => ({
          exerciseId: s.exerciseId,
          setNumber: s.setNumber,
          weight: s.weight,
          reps: s.reps,
        })),
      });
      setFinished(true);
      toast.success('Treino salvo com sucesso!');
      setTimeout(() => navigate('/workout/history'), 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao salvar treino');
    } finally {
      setSaving(false);
    }
  };

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
        <h1 className="text-2xl font-bold">Treino finalizado!</h1>
        <p className="text-muted-foreground">Você será redirecionado para o histórico.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Treino</h1>
        <div className="flex items-center gap-2 rounded-xl bg-card px-4 py-2 font-mono text-lg font-semibold">
          {formatTime(duration)}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="rounded-lg p-1 hover:bg-muted"
          >
            {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <label className="mb-1 block text-sm font-medium">Rotina (opcional)</label>
          <select
            value={selectedRoutineId}
            onChange={(e) => setSelectedRoutineId(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Sem rotina</option>
            {routines.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {sets.map((set, index) => {
          const exercise = exercises.find((e) => e.id === set.exerciseId);
          return (
            <Card key={index} className={set.done ? 'border-green-500/50' : ''}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">
                    {exercise?.name} — Série {set.setNumber}
                  </span>
                  <button
                    onClick={() => toggleDone(index)}
                    className={`rounded-full p-1 ${
                      set.done ? 'bg-green-500 text-white' : 'border border-border text-muted-foreground'
                    }`}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={set.weight || ''}
                    onChange={(e) => updateSet(index, 'weight', Number(e.target.value))}
                    placeholder="Carga (kg)"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    min={0}
                  />
                  <input
                    type="number"
                    value={set.reps || ''}
                    onChange={(e) => updateSet(index, 'reps', Number(e.target.value))}
                    placeholder="Reps"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    min={0}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {sets.length === 0 && (
          <Card>
            <CardContent className="p-4 text-center text-sm text-muted-foreground">
              Selecione uma rotina para carregar os exercícios, ou registre manualmente sem rotina.
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <label className="mb-1 block text-sm font-medium">Observações</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
          />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setSets([]);
            setDuration(0);
            setIsRunning(false);
          }}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-3 text-sm font-medium hover:bg-muted"
        >
          <RotateCcw className="h-4 w-4" /> Limpar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary-600 py-3 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {saving ? 'Salvando...' : 'Finalizar'}
        </button>
      </div>
    </div>
  );
}
