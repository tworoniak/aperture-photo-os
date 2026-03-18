import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useClerk } from '@clerk/react';
import {
  ImageIcon,
  CalendarDays,
  FileText,
  Receipt,
  LogOut,
  Menu,
} from 'lucide-react';

const navItems = [
  { to: '/my-gallery', label: 'My Gallery', icon: ImageIcon },
  { to: '/my-bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/my-contracts', label: 'Contracts', icon: FileText },
  { to: '/my-invoices', label: 'Invoices', icon: Receipt },
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  return (
    <>
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onClick}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
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
    </>
  );
}

export function ClientLayout() {
  const { user } = useAuth();
  const { signOut } = useClerk();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className='flex min-h-screen bg-background'>
      {/* Desktop sidebar */}
      <aside className='hidden md:flex w-60 shrink-0 border-r border-border flex-col'>
        <div className='h-16 flex items-center px-6 border-b border-border'>
          <span className='font-semibold tracking-tight text-foreground'>
            Your Photos
          </span>
        </div>
        <nav className='flex-1 py-4 px-3 flex flex-col gap-0.5'>
          <NavLinks />
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

      {/* Main */}
      <div className='flex-1 flex flex-col min-w-0'>
        {/* Mobile top bar */}
        <header className='md:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-4 border-b border-border bg-[hsl(var(--background))] backdrop-blur-md shrink-0'>
          <span className='font-semibold tracking-tight text-foreground'>
            Your Photos
          </span>
          <Button
            variant='ghost'
            size='icon'
            className='w-8 h-8'
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className='w-5 h-5' />
          </Button>
        </header>

        <main className='flex-1 flex flex-col min-w-0 overflow-hidden'>
          <Outlet />
        </main>
      </div>

      {/* Mobile drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side='left'
          className='w-72 p-0 flex flex-col bg-[hsl(var(--background))]'
        >
          <div className='h-14 flex items-center px-5 border-b border-border shrink-0'>
            <span className='font-semibold tracking-tight text-foreground'>
              Your Photos
            </span>
          </div>
          <nav className='flex-1 py-3 px-3 flex flex-col gap-0.5'>
            <NavLinks onClick={() => setMobileNavOpen(false)} />
          </nav>
          <Separator />
          <div className='p-4 flex items-center gap-3 shrink-0'>
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
        </SheetContent>
      </Sheet>
    </div>
  );
}
