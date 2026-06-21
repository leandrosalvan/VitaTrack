import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../services/api.js';
import { useAuthStore } from '../store/authStore.js';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import type { User } from '../types/index.js';

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    birthDate: '',
    weight: '',
    height: '',
    goal: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then((res) => {
      const u = res.data.data as User;
      setForm({
        name: u.name || '',
        birthDate: u.birthDate ? u.birthDate.split('T')[0] : '',
        weight: u.weight?.toString() || '',
        height: u.height?.toString() || '',
        goal: u.goal || '',
      });
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/me', {
        name: form.name,
        birthDate: form.birthDate ? new Date(form.birthDate) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        height: form.height ? Number(form.height) : undefined,
        goal: form.goal || undefined,
      });

      const updated = res.data.data as User;
      if (user && updated) {
        setAuth(updated, localStorage.getItem('vitatrack_token') || '');
      }
      toast.success('Perfil atualizado');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Perfil</h1>

      <Card>
        <CardHeader>
          <CardTitle>Dados pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Nome</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Data de nascimento</label>
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Altura (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Objetivo</label>
              <select
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecione</option>
                <option value="strength">Ganho de força/massa</option>
                <option value="fatloss">Perda de gordura</option>
                <option value="endurance">Resistência</option>
                <option value="health">Saúde geral</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Email:</strong> {user?.email}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
