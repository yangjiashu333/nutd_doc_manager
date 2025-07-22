import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import Layout from '@/layouts/root-layout';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import Dashboard from '@/pages/dashboard';
import LoginPage from './pages/login';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dataset" element={<Dashboard />} />
          <Route path="code" element={<Dashboard />} />
          <Route path="paper" element={<Dashboard />} />
          <Route path="patent" element={<Dashboard />} />
          <Route path="chart" element={<Dashboard />} />
        </Route>
        <Route path="/login" element={<LoginPage />}></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
