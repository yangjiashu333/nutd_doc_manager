import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import Layout from '@/layouts/root-layout';
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
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dataset" element={<Dataset />} />
          <Route path="code" element={<Code />} />
          <Route path="paper" element={<Paper />} />
          <Route path="patent" element={<Patent />} />
          <Route path="chart" element={<Chart />} />
        </Route>
        <Route path="/login" element={<LoginPage />}></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
