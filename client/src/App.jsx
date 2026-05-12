import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import EntrevistasPage from './pages/EntrevistasPage'
import PublicationDetailPage from './pages/PublicationDetailPage'
import ShowsPage from './pages/ShowsPage'
import ShowDetailPage from './pages/ShowDetailPage'
import SobreNosotrosPage from './pages/SobreNosotrosPage'
import ArtistPage from './pages/ArtistPage'
import NotFoundPage from './pages/NotFoundPage'
import ContactoPage from './pages/ContactoPage'
import LoginPage from './admin/pages/LoginPage'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import PublicacionesPage from './admin/pages/PublicacionesPage'
import NuevaPublicacionPage from './admin/pages/NuevaPublicacionPage'
import EditarPublicacionPage from './admin/pages/EditarPublicacionPage'
import DashboardPage from './admin/pages/DashboardPage'
import ArtistasPage from './admin/pages/ArtistasPage'
import ShowsAdminPage from './admin/pages/ShowsAdminPage'
import ContactoAdminPage from './admin/pages/ContactoAdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/entrevistas" element={<EntrevistasPage />} />
          <Route path="/entrevistas/:slug" element={<PublicationDetailPage />} />
          <Route path="/shows" element={<ShowsPage />} />
          <Route path="/shows/:slug" element={<ShowDetailPage />} />
          <Route path="/artistas/:slug" element={<ArtistPage />} />
          <Route path="/sobre-nosotros" element={<SobreNosotrosPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
          <Route path="/404" element={<NotFoundPage />} />
        </Route>

        <Route path="/admin/login" element={<LoginPage />} />

        {/* Admin protected routes */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="publicaciones" element={<PublicacionesPage />} />
            <Route path="publicaciones/nueva" element={<NuevaPublicacionPage />} />
            <Route path="publicaciones/:id/editar" element={<EditarPublicacionPage />} />
            <Route path="artistas" element={<ArtistasPage />} />
            <Route path="shows" element={<ShowsAdminPage />} />
            <Route path="contacto" element={<ContactoAdminPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
