// ============================================================
// src/hooks/auth/useVolunteerSignUp.ts
// Hook encapsulating Volunteer Registration Logic
// ============================================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { volunteerSignUpSchema, VolunteerSignUpSchemaType } from '../../validation/authSchemas';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

export const useVolunteerSignUp = (onSuccess: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const setUser = useAuthStore((state) => state.setUser);

  const form = useForm<VolunteerSignUpSchemaType>({
    resolver: zodResolver(volunteerSignUpSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      wilaya: '',
      commune: '',
      skill: 'logistics',
      password: '',
    },
  });

  const onSubmit = async (data: VolunteerSignUpSchemaType) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const user = await authService.volunteerSignUp(data);
      setUser(user);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل تسجيل المتطوع';
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
