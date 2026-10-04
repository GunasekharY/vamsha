import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FamiliesPage } from './pages/FamiliesPage';
import { FamilyDetailPage } from './pages/FamilyDetailPage';
import { PersonDetailPage } from './pages/PersonDetailPage';
import { PersonFormPage } from './pages/PersonFormPage';
import { ProtectedRoute } from './components/ProtectedRoute';

const queryClient = new QueryClient();

export function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/families"
            element={
              <ProtectedRoute>
                <FamiliesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/families/:familyId"
            element={
              <ProtectedRoute>
                <FamilyDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/families/:familyId/persons/:personId"
            element={
              <ProtectedRoute>
                <PersonDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/families/:familyId/persons/:personId/edit"
            element={
              <ProtectedRoute>
                <PersonFormPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/families" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
