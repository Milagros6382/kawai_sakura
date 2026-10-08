import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './components/AuthProvider'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { CustomerPage } from './pages/CustomerPage'
import { SupplierPage } from './pages/SupplierPage'

// Mapa de URLs → páginas
function App() {
  return (
    <AuthProvider>
      {/* basename: en GitHub Pages las URLs empiezan con /kawai_sakura/ (ver vite.config.ts) */}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/customer"
            element={
              <ProtectedRoute role="customer">
                <CustomerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier"
            element={
              <ProtectedRoute role="supplier">
                <SupplierPage />
              </ProtectedRoute>
            }
          />
          {/* Cualquier otra URL: al login (que redirige al panel si ya hay sesión) */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
