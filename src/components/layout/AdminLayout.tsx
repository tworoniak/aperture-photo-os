import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { MobileNav } from '@/components/layout/MobileNav';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useClerk } from '@clerk/clerk-react';
import { navItems } from '@/lib/nav-items';
import { LogOut, Menu } from 'lucide-react';

export function AdminLayout() {
  const { user } = useAuth();
  const { signOut } = useClerk();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className='flex min-h-screen bg-background'>
      {/* ── Desktop sidebar (hidden on mobile) ───────────────────────────── */}
      <aside className='hidden md:flex w-60 shrink-0 border-r border-border flex-col'>
        <div className='h-16 flex items-center px-6 border-b border-border'>
          <span className='font-semibold tracking-tight text-foreground'>
            Aperture
          </span>
        </div>

        <nav className='flex-1 py-4 px-3 flex flex-col gap-0.5'>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                )
              }
            >
              <Icon className='w-4 h-4 shrink-0' />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className='p-3 border-t border-border flex items-center gap-3'>
          <Avatar className='w-8 h-8'>
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback>{user?.name?.[0] ?? 'U'}</AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium truncate'>{user?.name}</p>
            <p className='text-xs text-muted-foreground truncate'>
              {user?.email}
            </p>
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='shrink-0 w-8 h-8'
            onClick={() => signOut()}
          >
            <LogOut className='w-4 h-4' />
          </Button>
        </div>
      </aside>

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <div className='flex-1 flex flex-col min-w-0'>
        {/* Mobile top bar (hidden on desktop) */}
        <header className='md:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-4 border-b border-border bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shrink-0'>
          <span className='font-semibold tracking-tight text-foreground'>
            Aperture
          </span>
          <div className='flex items-center gap-2'>
            <Avatar className='w-7 h-7'>
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className='text-xs'>
                {user?.name?.[0] ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <Button
              variant='ghost'
              size='icon'
              className='w-8 h-8'
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className='w-5 h-5' />
            </Button>
          </div>
        </header>

        <main className='flex-1 flex flex-col min-w-0 overflow-hidden'>
          <Outlet />
        </main>
      </div>

      {/* Mobile nav drawer */}
      <MobileNav
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
        navItems={navItems}
      />
    </div>
  );
}
