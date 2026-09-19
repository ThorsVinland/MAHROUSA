// ============================================================
// src/types/home.types.ts
// Strict TypeScript types for Volunteer Home Screen
// ============================================================

export type PriorityLevel =
  | 'urgent' // عاجل 🔴
  | 'high' // أولوية عالية 🟠
  | 'normal' // عادي 🟢
  | 'summer_camp'; // مخيم صيفي 🏕️

export type FilterType = 'all' | 'urgent' | 'labor' | 'resources';

export interface NeedCardItem {
  id: string;
  title: string;
  organization: string;
  location: string;
  distanceKm: number;
  date: string;
  time: string;
  volunteersNeeded: number;
  volunteersJoined: number;
  priority: PriorityLevel;
}

export interface VolunteerStats {
  rating: number;
  documentedHours: number;
  completedTasks: number;
}

export interface NextTask {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
}

export interface MapMarker {
  id: string;
  city: string;
  latitude: number;
  longitude: number;
  type: 'crisis' | 'resource' | 'meetup';
}

export type HomeTabType = 'home' | 'map' | 'tasks' | 'profile' | 'supervisor';
