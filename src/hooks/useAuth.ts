import { useUser } from '@clerk/react';
import type { AppUser, UserRole } from '@/types';

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();

  const appUser: AppUser | null = user
    ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? '',
        name: user.fullName ?? user.username ?? 'User',
        role: (user.publicMetadata?.role as UserRole) ?? 'client',
        avatarUrl: user.imageUrl,
      }
    : null;

  return {
    user: appUser,
    isLoading: !isLoaded,
    isSignedIn: !!isSignedIn,
    isAdmin: appUser?.role === 'admin',
    isClient: appUser?.role === 'client',
  };
}
