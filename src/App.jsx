import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/Layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Login } from './pages/Login';
import { DocumentosAdmin } from './pages/DocumentosAdmin';
import { DocumentosOperativo } from './pages/DocumentosOperativo';
import { DocumentoForm } from './pages/DocumentoForm';
import { VisorDocumento } from './pages/VisorDocumento';
import { Departamentos } from './pages/Departamentos';
import { Usuarios } from './pages/Usuarios';

// Redirección inicial según rol
const HomeRedirect = () => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? "/admin/documentos" : "/documentos"} replace />;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Redirección raíz */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Rutas protegidas operativas (Cualquier usuario autenticado) */}
          <Route element={<ProtectedRoute requireAdmin={false} />}>
            <Route element={<AppLayout />}>
              <Route path="/documentos" element={<DocumentosOperativo />} />
              <Route path="/visor/:id" element={<VisorDocumento />} />
            </Route>
          </Route>

          {/* Rutas protegidas exclusivas de Administrador */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route element={<AppLayout />}>
              <Route path="/admin/documentos" element={<DocumentosAdmin />} />
              <Route path="/admin/documentos/nuevo" element={<DocumentoForm />} />
              <Route path="/admin/documentos/editar/:id" element={<DocumentoForm />} />
              <Route path="/admin/departamentos" element={<Departamentos />} />
              <Route path="/admin/usuarios" element={<Usuarios />} />
            </Route>
          </Route>

          {/* Ruta 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
