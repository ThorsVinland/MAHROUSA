// ============================================================
// src/types/task.types.ts
// Strict TypeScript types for Volunteer Tasks System
// ============================================================

import { NeedItem } from "./need.types";

export type TaskTabType = "active" | "completed" | "all";

export interface VolunteerTaskItem extends NeedItem {
  isCompletedByMe: boolean;
  isAttendanceConfirmed: boolean;
  estimatedHours: number;
}

export interface TaskStatsData {
  activeCount: number;
  completedCount: number;
  totalHours: number;
}
