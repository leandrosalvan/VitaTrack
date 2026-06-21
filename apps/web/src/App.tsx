import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useThemeStore } from './store/themeStore.js';
import { useAuthStore } from './store/authStore.js';
import Layout from './components/Layout.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';
import DashboardPage from './pages/DashboardPage.js';
import ExercisesPage from './pages/ExercisesPage.js';
import RoutinesPage from './pages/RoutinesPage.js';
import RoutineFormPage from './pages/RoutineFormPage.js';
import WorkoutPage from './pages/WorkoutPage.js';
import WorkoutHistoryPage from './pages/WorkoutHistoryPage.js';
import HealthPage from './pages/HealthPage.js';
import ProfilePage from './pages/ProfilePage.js';
import PrivateRoute from './components/PrivateRoute.js';

function App() {
  const { initTheme } = useThemeStore();
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initTheme();
    initAuth();
  }, [initTheme, initAuth]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/routines" element={<RoutinesPage />} />
          <Route path="/routines/new" element={<RoutineFormPage />} />
          <Route path="/routines/:id" element={<RoutineFormPage />} />
          <Route path="/workout" element={<WorkoutPage />} />
          <Route path="/workout/history" element={<WorkoutHistoryPage />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
