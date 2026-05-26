/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Personnel {
  id: string;
  stt: number;
  name: string;
  assignedCount: number; // 0, 1, or 2
  assignedDates: string[]; // dates array (e.g., ["03/06/2026", "15/07/2026"])
}

export interface Assignment {
  id: string; // unique ID
  date: string; // "YYYY-MM-DD" style key
  formattedDate: string; // "DD/MM/YYYY" or "Thứ ..., DD/MM"
  dayOfWeek: string; // Monday, Tuesday etc in Vietnamese
  personId: string | null; // ID of the assigned person
  personName: string | null; // Name of the assigned person
  timeSlot: string; // "08:00 - 09:00"
  note?: string; // "Ngày nghỉ lễ", "Tưới thêm", etc.
}

export interface Stats {
  totalDays: number;
  assignedDays: number;
  remainingDays: number;
  totalPersonnel: number;
  completedPersonnel: number; // personnel who got exactly 2 assignments
  partialPersonnel: number; // personnel who got 1 assignment
  unassignedPersonnel: number; // personnel who got 0 assignments
}

export type FilterType = 'all' | 'assigned' | 'unassigned';
