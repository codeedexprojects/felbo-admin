'use client';

import { useMutation } from '@tanstack/react-query';
import { loginAdmin } from './api';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { ApiResponse } from '@/types/api';
import { LoginInput, LoginResponse } from './types';

export const useLogin = () => {
  const router = useRouter();
  // Use store directly as hook inside component but outside mutation
  const login = useAuthStore((state) => state.login);

  return useMutation<ApiResponse<LoginResponse>, Error, LoginInput>({
    mutationFn: loginAdmin,
    onSuccess: (response: ApiResponse<LoginResponse>) => {
      // Explicit type
      if (response.success && response.data) {
        const { token, admin } = response.data;
        login(token, admin);
        router.push('/dashboard');
      } else {
        // Manually throw error for onError to catch if success is false but call succeeded
        throw new Error(response.error?.message || 'Login failed');
      }
    },
  });
};
