import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDarkMode } from '@/hooks/useDarkMode';
import { cn } from '@/lib/utils';
import { navItems } from '@/lib/nav-items';
import { MobileNav } from '@/components/layout/MobileNav';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useClerk } from '@clerk/react';
import { LogOut, Menu, Sun, Moon } from 'lucide-react';

export function AdminLayout() {
  const { user } = useAuth();
  const { signOut } = useClerk();
  const { isDark, toggle } = useDarkMode();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className='flex min-h-screen bg-background'>
      {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
      <aside className='hidden md:flex w-56 shrink-0 border-r border-border flex-col'>
        {/* Brand */}
        <div className='h-14 flex items-center px-5 border-b border-border'>
          <span className='font-semibold text-sm tracking-[0.15em] uppercase text-(--color-ink-black-400)'>
            {/* Aperture */}
            Apertur OS
          </span>
        </div>

        {/* Nav */}
        <nav className='flex-1 py-3 px-2 flex flex-col gap-0.5'>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
                )
              }
            >
              <Icon className='w-4 h-4 shrink-0' />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className='p-3 border-t border-border space-y-2'>
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className='w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors'
          >
            {isDark ? (
              <Sun className='w-4 h-4 shrink-0' />
            ) : (
              <Moon className='w-4 h-4 shrink-0' />
            )}
            {isDark ? 'Light mode' : 'Dark mode'}
          </button>

          {/* User */}
          <div className='flex items-center gap-2.5 px-1'>
            <Avatar className='w-7 h-7 shrink-0'>
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className='text-xs'>
                {user?.name?.[0] ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <p className='text-xs font-medium truncate'>{user?.name}</p>
              <p className='text-xs text-muted-foreground truncate'>
                {user?.email}
              </p>
            </div>
            <Button
              variant='ghost'
              size='icon'
              className='shrink-0 w-7 h-7'
              onClick={() => signOut()}
            >
              <LogOut className='w-3.5 h-3.5' />
            </Button>
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className='flex-1 flex flex-col min-w-0'>
        {/* Mobile top bar */}
        <header className='md:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-4 border-b border-border bg-background backdrop-blur-md shrink-0'>
          <span className='font-semibold text-sm tracking-[0.15em] uppercase text-foreground'>
            Apertur OS
          </span>
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='w-8 h-8'
              onClick={toggle}
            >
              {isDark ? (
                <Sun className='w-4 h-4' />
              ) : (
                <Moon className='w-4 h-4' />
              )}
            </Button>
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
