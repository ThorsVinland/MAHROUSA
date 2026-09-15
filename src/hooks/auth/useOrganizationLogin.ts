// ============================================================
// src/hooks/auth/useOrganizationLogin.ts
// Hook encapsulating Organization OTP Login Logic & Countdown
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationLoginSchema, OrganizationLoginSchemaType } from '../../validation/authSchemas';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

export const useOrganizationLogin = (onSuccess: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setUser = useAuthStore((state) => state.setUser);

  const form = useForm<OrganizationLoginSchemaType>({
    resolver: zodResolver(organizationLoginSchema),
    defaultValues: {
      phone: '',
      otp: '',
    },
  });

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown]);

  const resendOTP = () => {
    if (countdown === 0) {
      setCountdown(60);
      form.setValue('otp', '1245');
    }
  };

  const onSubmit = async (data: OrganizationLoginSchemaType) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const user = await authService.organizationLogin(data);
      setUser(user);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'رمز التحقق غير صحيح';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    errorMessage,
    countdown,
    resendOTP,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
