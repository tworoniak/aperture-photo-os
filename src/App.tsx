import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

import { LoginPage } from '@/pages/LoginPage';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { ShootDetailPage } from '@/pages/admin/ShootDetailPage';

import {
  // Admin
  DashboardPage,
  ClientsPage,
  BookingsPage,
  ShootsPage,
  GearPage,
  PricingPage,
  GalleriesPage,
  // Client
  ClientGalleryPage,
  ClientBookingsPage,
  ClientContractsPage,
  ClientInvoicesPage,
  // Public
  PublicGalleryPage,
  UnauthorizedPage,
  NotFoundPage,
} from '@/pages';

export default function App() {
  return (
    <>
      <Routes>
        {/* ── Public ─────────────────────────────────────────── */}
        <Route path='/' element={<Navigate to='/dashboard' replace />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/gallery/:token' element={<PublicGalleryPage />} />
        <Route path='/unauthorized' element={<UnauthorizedPage />} />

        {/* ── Admin (photographer only) ───────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path='/dashboard' element={<DashboardPage />} />
            <Route path='/clients' element={<ClientsPage />} />
            <Route path='/bookings' element={<BookingsPage />} />
            <Route path='/shoots' element={<ShootsPage />} />
            <Route path='/shoots/:id' element={<ShootDetailPage />} />
            <Route path='/gear' element={<GearPage />} />
            <Route path='/pricing' element={<PricingPage />} />
            <Route path='/galleries' element={<GalleriesPage />} />
          </Route>
        </Route>

        {/* ── Client portal ───────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['client']} />}>
          <Route element={<ClientLayout />}>
            <Route path='/my-gallery' element={<ClientGalleryPage />} />
            <Route path='/my-bookings' element={<ClientBookingsPage />} />
            <Route path='/my-contracts' element={<ClientContractsPage />} />
            <Route path='/my-invoices' element={<ClientInvoicesPage />} />
          </Route>
        </Route>

        {/* ── 404 ─────────────────────────────────────────────── */}
        <Route path='*' element={<NotFoundPage />} />
      </Routes>

      <Toaster position='bottom-right' richColors />
    </>
  );
}
