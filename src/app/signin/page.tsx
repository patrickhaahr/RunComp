import SignInForm from '@/components/auth/signin-form';

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </main>
  );
} 