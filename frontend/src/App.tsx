import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, TaskProvider, NotificationProvider } from './contexts';
import { ProtectedRoute, Layout } from './components';
import { LoginPage, RegisterPage, DashboardPage, TasksPage, AnalyticsPage, KanbanPage } from './pages';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
          <NotificationProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes with Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TasksPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AnalyticsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kanban"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <KanbanPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Redirect to login by default */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </NotificationProvider>
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
