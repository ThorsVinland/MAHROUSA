// ============================================================
// src/hooks/auth/useOrganizationSignUp.ts
// Hook encapsulating Organization Registration Logic
// ============================================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationSignUpSchema, OrganizationSignUpSchemaType } from '../../validation/authSchemas';
import { authService } from '../../services/authService';

export const useOrganizationSignUp = (onSuccess: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<OrganizationSignUpSchemaType>({
    resolver: zodResolver(organizationSignUpSchema),
    defaultValues: {
      orgName: '',
      orgType: 'charity',
      legalNumber: '',
      wilaya: '',
      commune: '',
      managerName: '',
      managerPhone: '',
    },
  });

  const onSubmit = async (data: OrganizationSignUpSchemaType) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await authService.organizationSignUp(data);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل إرسال طلب الجمعية';
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
