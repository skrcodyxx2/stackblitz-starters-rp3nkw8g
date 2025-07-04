import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import ClientLayout from './components/client/ClientLayout';
import { Toaster } from 'react-hot-toast';
import { testConnection } from './lib/database.js';

// Public pages
import HomePage from './pages/public/HomePage';
import MenuPage from './pages/public/MenuPage';
import ServicesPage from './pages/public/ServicesPage';
import GalleryPage from './pages/public/GalleryPage';
import ContactPage from './pages/public/ContactPage';
import ReservationPage from './pages/public/ReservationPage';
import LegalPage from './pages/public/LegalPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMenu from './pages/admin/AdminMenu';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReservations from './pages/admin/AdminReservations';
import AdminGallery from './pages/admin/AdminGallery';
import AdminSettings from './pages/admin/AdminSettings';

// Client pages
import ClientDashboard from './pages/client/ClientDashboard';
import ClientProfile from './pages/client/ClientProfile';
import ClientOrders from './pages/client/ClientOrders';
import ClientReservations from './pages/client/ClientReservations';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Test database connection on app start
  useEffect(() => {
    testConnection();
  }, []);

  // Redirect to appropriate dashboard if accessing root admin or client routes
  useEffect(() => {
    if (location.pathname === '/admin') {
      navigate('/admin');
    } else if (location.pathname === '/client') {
      navigate('/client');
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/galerie" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/legal/:type" element={<LegalPage />} />
        <Route path="/politique-confidentialite" element={<LegalPage />} />
        <Route path="/conditions-utilisation" element={<LegalPage />} />
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/inscription" element={<RegisterPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/utilisateurs" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/menu" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminMenu />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/commandes" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminOrders />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/reservations" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminReservations />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/galerie" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminGallery />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/parametres" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </ProtectedRoute>
        } />

        {/* Client Routes */}
        <Route path="/client" element={
          <ProtectedRoute requiredRole="client">
            <ClientLayout>
              <ClientDashboard />
            </ClientLayout>
          </ProtectedRoute>
        } />
        <Route path="/client/profil" element={
          <ProtectedRoute requiredRole="client">
            <ClientLayout>
              <ClientProfile />
            </ClientLayout>
          </ProtectedRoute>
        } />
        <Route path="/client/commandes" element={
          <ProtectedRoute requiredRole="client">
            <ClientLayout>
              <ClientOrders />
            </ClientLayout>
          </ProtectedRoute>
        } />
        <Route path="/client/reservations" element={
          <ProtectedRoute requiredRole="client">
            <ClientLayout>
              <ClientReservations />
            </ClientLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;