// ============================================================
// src/types/auth.types.ts
// Strict TypeScript types for MAHROUSA Authentication Architecture
// ============================================================

export type UserRole = 'volunteer' | 'organization';

export type VolunteerSkill =
  | 'medical'
  | 'logistics'
  | 'construction'
  | 'cooking'
  | 'teaching'
  | 'driving'
  | 'other';

export type OrganizationType =
  | 'charity'
  | 'red_crescent'
  | 'youth_club'
  | 'sports_club'
  | 'municipality'
  | 'other';

export interface VolunteerSignUpForm {
  fullName: string;
  phone: string;
  wilaya: string;
  commune: string;
  skill: VolunteerSkill;
  password: string;
}

export interface VolunteerLoginForm {
  phone: string;
  password: string;
}

export interface OrganizationSignUpForm {
  orgName: string;
  orgType: OrganizationType;
  legalNumber: string;
  wilaya: string;
  commune: string;
  managerName: string;
  managerPhone: string;
}

export interface OrganizationLoginForm {
  phone: string;
  otp: string;
}

export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  wilaya: string;
  token: string;
  isActive: boolean;
}

export type AuthStackParamList = {
  RoleSelection: undefined;
  VolunteerSignUp: undefined;
  VolunteerLogin: undefined;
  OrganizationSignUp: undefined;
  OrganizationLogin: undefined;
  WaitingApproval: undefined;
};
