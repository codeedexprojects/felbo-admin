'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div
        className="hidden lg:flex w-1/2 items-center justify-center p-12 relative"
        style={{ backgroundColor: '#041919' }}
      >
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-40 sm:w-48 md:w-56 aspect-square mb-6">
            <Image src="/felboIcon.png" alt="Felbo Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-[0.2em] text-white">FELBO</h1>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile & Tablet Logo (Icon Only) */}
          <div className="flex lg:hidden justify-center mb-2 mt-[-2rem]">
            <div
              className="relative w-24 sm:w-28 aspect-square rounded-2xl shadow-lg border-[4px] border-white z-10"
              style={{ backgroundColor: '#041919' }}
            >
              <Image
                src="/felboIcon.png"
                alt="Felbo Logo"
                fill
                className="object-contain p-3 sm:p-4"
                priority
              />
            </div>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
