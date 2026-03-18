import { NavLink } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogOut } from 'lucide-react';

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navItems: {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export function MobileNav({ open, onOpenChange, navItems }: MobileNavProps) {
  const { user } = useAuth();
  const { signOut } = useClerk();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='left'
        className='w-72 p-0 flex flex-col bg-white dark:bg-zinc-950'
      >
        {/* Brand */}
        <div className='h-14 flex items-center px-5 border-b border-border shrink-0'>
          <span className='font-semibold tracking-tight text-foreground'>
            Aperture
          </span>
        </div>

        {/* Nav items */}
        <nav className='flex-1 py-3 px-3 flex flex-col gap-0.5 overflow-y-auto'>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => onOpenChange(false)}
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
        </nav>

        <Separator />

        {/* User footer */}
        <div className='p-4 flex items-center gap-3 shrink-0'>
          <Avatar className='w-8 h-8 shrink-0'>
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
  );
}
