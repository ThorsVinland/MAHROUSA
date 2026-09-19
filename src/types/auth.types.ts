// ============================================================
// src/types/auth.types.ts
// Strict TypeScript types for Authentication & User Roles
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
  skill: VolunteerSkill | string;
}

export interface VolunteerLoginForm {
  phone: string;
  verificationCode?: string;
}

export interface OrganizationSignUpForm {
  organizationName?: string;
  orgName?: string;
  legalNumber?: string;
  orgType: OrganizationType | string;
  phone?: string;
  wilaya: string;
  commune: string;
  managerName?: string;
  managerPhone?: string;
}

export interface OrganizationLoginForm {
  phone: string;
  verificationCode?: string;
}

export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  fullName?: string;
  role: UserRole;
  token: string;
  wilaya?: string;
  commune?: string;
  skill?: string;
  orgType?: string;
  orgName?: string;
  legalNumber?: string;
  status?: string;
  isActive?: boolean;
  isSupervisor?: boolean;
  hasPendingUpgrade?: boolean;
  supervisorResources?: any;
  teamCount?: number;
}


export type AuthStackParamList = {
  RoleSelection: undefined;
  VolunteerLogin: undefined;
  VolunteerSignUp: undefined;
  OrganizationLogin: undefined;
  OrganizationSignUp: undefined;
  WaitingApproval: undefined;
};
