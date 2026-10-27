// ============================================================
// src/data/homeMockData.ts
// Mock data exactly matching the MAHROUSA Home Screen design
// ============================================================

import {
  NeedCardItem,
  VolunteerStats,
  NextTask,
  MapMarker,
} from '../types/home.types';

export const VOLUNTEER_NAME = 'محمد';
export const NEW_NEEDS_COUNT = 3;
export const CURRENT_WILAYA = 'وهران';

export const STATS: VolunteerStats = {
  rating: 4.8,
  documentedHours: 20,
  completedTasks: 5,
};

export const NEEDS: NeedCardItem[] = [
  {
    id: '1',
    title: 'شاحنة نقل – تيزي وزو',
    organization: 'الهلال الأحمر',
    location: '45 كم',
    distanceKm: 45,
    date: 'غداً',
    time: '8:00 ص',
    volunteersNeeded: 20,
    volunteersJoined: 14,
    priority: 'urgent',
  },
  {
    id: '2',
    title: 'يد عاملة – 20 شخص – بجاية',
    organization: 'جمعية الرحمة',
    location: '12 كم',
    distanceKm: 12,
    date: '15 أغسطس',
    time: '',
    volunteersNeeded: 20,
    volunteersJoined: 8,
    priority: 'high',
  },
  {
    id: '3',
    title: 'معلمون ومدربون لمخيم صيفي 🏕️',
    organization: 'نادي شباب جيجل',
    location: '80 كم',
    distanceKm: 80,
    date: '20 أغسطس',
    time: '',
    volunteersNeeded: 10,
    volunteersJoined: 3,
    priority: 'summer_camp',
  },
];

export const NEXT_TASK: NextTask = {
  id: '1',
  title: 'تفريغ شاحنة مؤن – بجاية',
  date: 'غداً',
  time: '7:00 صباحاً',
  duration: '4 ساعات',
};

export const MAP_MARKERS: MapMarker[] = [
  { id: '1', city: 'وهران', latitude: 35.69, longitude: -0.63, type: 'resource' },
];
