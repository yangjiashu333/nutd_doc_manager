import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import Layout from '@/layouts/root-layout';
import { AuthGuard } from '@/layouts/auth-guard';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import Dashboard from '@/pages/dashboard';
import LoginPage from './pages/login';
import Dataset from './pages/dataset';
import Code from './pages/code';
import Paper from './pages/paper';
import Patent from './pages/patent';
import Chart from './pages/chart';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dataset" element={<Dataset />} />
          <Route path="code" element={<Code />} />
          <Route path="paper" element={<Paper />} />
          <Route path="patent" element={<Patent />} />
          <Route path="chart" element={<Chart />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
