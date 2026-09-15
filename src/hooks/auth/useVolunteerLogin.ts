// ============================================================
// src/hooks/auth/useVolunteerLogin.ts
// Hook encapsulating Volunteer Login Logic
// ============================================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { volunteerLoginSchema, VolunteerLoginSchemaType } from '../../validation/authSchemas';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

export const useVolunteerLogin = (onSuccess: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const setUser = useAuthStore((state) => state.setUser);

  const form = useForm<VolunteerLoginSchemaType>({
    resolver: zodResolver(volunteerLoginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  });

  const onSubmit = async (data: VolunteerLoginSchemaType) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const user = await authService.volunteerLogin(data);
      setUser(user);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل تسجيل الدخول';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    errorMessage,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
