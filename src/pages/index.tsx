// Re-export the real dashboard page
export { DashboardPage } from '@/pages/admin/DashboardPage';
export { ClientsPage } from '@/pages/admin/ClientsPage';
export { BookingsPage } from '@/pages/admin/BookingsPage';
export { ShootsPage } from '@/pages/admin/ShootsPage';
export { GearPage } from '@/pages/admin/GearPage';
export { PricingPage } from '@/pages/admin/PricingPage';
export { GalleriesPage } from '@/pages/admin/GalleriesPage';

// ─── Admin stubs (to be built out) ───────────────────────────────────────────

// export function ClientsPage() {
//   return <PageShell title='Clients' description='Manage leads and clients' />;
// }

// export function BookingsPage() {
//   return <PageShell title='Bookings' description='Sessions and contracts' />;
// }

// export function ShootsPage() {
//   return <PageShell title='Shoots' description='Plan upcoming shoots' />;
// }

// export function GearPage() {
//   return <PageShell title='Gear' description='Inventory and kit lists' />;
// }

// export function PricingPage() {
//   return <PageShell title='Pricing' description='Packages and quote builder' />;
// }

// export function GalleriesPage() {
//   return (
//     <PageShell
//       title='Galleries'
//       description='Manage client proofing galleries'
//     />
//   );
// }

// ─── Client stubs ─────────────────────────────────────────────────────────────

export function ClientGalleryPage() {
  return <PageShell title='My Gallery' description='Your photos' />;
}

export function ClientBookingsPage() {
  return <PageShell title='My Bookings' description='Your upcoming sessions' />;
}

export function ClientContractsPage() {
  return <PageShell title='Contracts' description='Your signed agreements' />;
}

export function ClientInvoicesPage() {
  return <PageShell title='Invoices' description='Your payment history' />;
}

// ─── Public ───────────────────────────────────────────────────────────────────

export function PublicGalleryPage() {
  return <PageShell title='Gallery' description='Shared proofing gallery' />;
}

export function UnauthorizedPage() {
  return (
    <PageShell
      title='Unauthorized'
      description="You don't have permission to view this page."
    />
  );
}

export function NotFoundPage() {
  return <PageShell title='404' description='Page not found.' />;
}

// ─── Shared shell ─────────────────────────────────────────────────────────────

function PageShell({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className='flex-1 p-8'>
      <div className='max-w-5xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
          <p className='text-muted-foreground mt-1'>{description}</p>
        </div>
        <div className='rounded-lg border border-dashed border-border h-64 flex items-center justify-center'>
          <p className='text-sm text-muted-foreground'>Coming soon</p>
        </div>
      </div>
    </div>
  );
}
