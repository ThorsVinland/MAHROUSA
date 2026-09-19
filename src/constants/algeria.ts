// ============================================================
// src/constants/algeria.ts
// Algerian Administrative Data & Application Constants
// ============================================================

import { VolunteerSkill, OrganizationType } from '../types/auth.types';
import communesData from '../utils/communes.json';

export interface SelectOption {
  value: string;
  label: string;
}

export const WILAYAS: SelectOption[] = Array.from(new Set((communesData as any[]).map(c => parseInt(c.wilaya_code)))).map(code => {
  const commune = (communesData as any[]).find(c => parseInt(c.wilaya_code) === code);
  // Using the exact format used in RegisterScreen.js: "code - commune_name_ar"
  return {
    label: `${code} - ${commune?.name_ar || ''}`,
    value: code.toString()
  };
}).sort((a, b) => parseInt(a.value) - parseInt(b.value));

export const getCommunesByWilaya = (wilayaId: string): SelectOption[] => {
  const wilayaCodeInt = parseInt(wilayaId, 10);
  const communes = (communesData as any[]).filter(c => parseInt(c.wilaya_code) === wilayaCodeInt);
  
  if (communes.length === 0) {
    return [{ value: 'مركز البلدية', label: 'مركز البلدية' }];
  }
  
  return communes.map((c) => ({ value: c.id.toString(), label: c.name_ar }));
};

export const SKILLS: { value: VolunteerSkill; label: string }[] = [
  { value: 'medical', label: '⚕️ طب وإسعاف أولي' },
  { value: 'logistics', label: '📦 لوجستيك وتخزين' },
  { value: 'driving', label: '🚛 قيادة شاحنات' },
  { value: 'cooking', label: '🍳 طبخ وتموين' },
  { value: 'teaching', label: '📚 تعليم ودعم نفسي' },
  { value: 'construction', label: '👷 بناء وإصلاح' },
  { value: 'other', label: '🔧 أخرى' },
];

export const ORG_TYPES: { value: OrganizationType; label: string }[] = [
  { value: 'charity', label: '🤲 جمعية خيرية' },
  { value: 'red_crescent', label: '🏥 الهلال الأحمر الجزائري' },
  { value: 'youth_club', label: '🌟 نادي شبابي' },
  { value: 'sports_club', label: '⚽ نادي رياضي' },
  { value: 'municipality', label: '🏛️ إدارة بلدية' },
  { value: 'other', label: '🏢 أخرى' },
];
