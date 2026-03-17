import { SignIn } from '@clerk/clerk-react';

export function LoginPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <SignIn
        routing='path'
        path='/login'
        signUpUrl='/sign-up'
        forceRedirectUrl='/dashboard'
        fallbackRedirectUrl='/dashboard'
      />
    </div>
  );
}
