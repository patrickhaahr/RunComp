import SignUpForm from '@/components/auth/signup-form';

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignUpForm />
      </div>
    </main>
  );
} 