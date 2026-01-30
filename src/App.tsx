import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';

import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/DashboardPage';
import QuizPage from '@/pages/QuizPage';
import ProfilePage from '@/pages/ProfilePage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import HelpPage from '@/pages/HelpPage';
import AdminPage from '@/pages/AdminPage';
import AnnouncementsPage from '@/pages/AnnouncementsPage';

import AchievementsList from '@/components/gamification/AchievementsList';
import TeamCompetitions from '@/components/gamification/TeamCompetitions';
import Layout from '@/components/layout/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AchievementsPage: React.FC = () => (
  <Layout headerTitle="Achievements" headerSubtitle="Unlock badges and complete achievements">
    <AchievementsList />
  </Layout>
);

const CompetitionsPage: React.FC = () => (
  <Layout headerTitle="Team Competitions" headerSubtitle="Compete with other departments">
    <TeamCompetitions />
  </Layout>
);

const App: React.FC = () => {
  const { isDark } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/login" />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz/:courseCode"
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/achievements"
          element={
            <ProtectedRoute>
              <AchievementsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/competitions"
          element={
            <ProtectedRoute>
              <CompetitionsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/help" element={<HelpPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/announcements"
          element={
            <ProtectedRoute>
              <AnnouncementsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;