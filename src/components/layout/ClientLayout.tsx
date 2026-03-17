import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  ImageIcon,
  CalendarDays,
  FileText,
  Receipt,
  LogOut,
} from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { to: '/my-gallery', label: 'My Gallery', icon: ImageIcon },
  { to: '/my-bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/my-contracts', label: 'Contracts', icon: FileText },
  { to: '/my-invoices', label: 'Invoices', icon: Receipt },
];

export function ClientLayout() {
  const { user } = useAuth();
  const { signOut } = useClerk();

  return (
    <div className='flex min-h-screen bg-background'>
      <aside className='w-60 shrink-0 border-r border-border flex flex-col'>
        <div className='h-16 flex items-center px-6 border-b border-border'>
          <span className='font-semibold tracking-tight text-foreground'>
            Your Photos
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

      <main className='flex-1 flex flex-col min-w-0'>
        <Outlet />
      </main>
    </div>
  );
}
