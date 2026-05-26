/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Assignment } from '../types';

const DAYS_OF_WEEK_VN = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
];

/**
 * Generates initial empty watering assignments list from 01/06 to 31/07
 * Year defaults to 2026 reflecting the current system year
 */
export function generateDatesList(year: number = 2026): Assignment[] {
  const assignments: Assignment[] = [];
  
  // June starts on Monday (01/06/2026 is Monday)
  // July starts on Wednesday (01/07/2026 is Wednesday)
  
  // Let's generate days for June (Month 5/index 5 in JS Date because month is 0-indexed)
  // Let's iterate from 1 to 30 for June, then 1 to 31 for July
  
  const addDaysForMonth = (monthIndex: number, maxDays: number) => {
    for (let day = 1; day <= maxDays; day++) {
      const dateObj = new Date(year, monthIndex, day);
      
      // Formatting
      const dayStr = String(day).padStart(2, '0');
      const monthStr = String(monthIndex + 1).padStart(2, '0');
      const dateKey = `${year}-${monthStr}-${dayStr}`; // "YYYY-MM-DD"
      const formattedDate = `${dayStr}/${monthStr}/${year}`; // "DD/MM/YYYY"
      const dayOfWeekNum = dateObj.getDay();
      const dayOfWeek = DAYS_OF_WEEK_VN[dayOfWeekNum];
      
      assignments.push({
        id: dateKey,
        date: dateKey,
        formattedDate,
        dayOfWeek,
        personId: null,
        personName: null,
        timeSlot: '08:00 - 09:00',
      });
    }
  };

  // June (0-indexed 5)
  addDaysForMonth(5, 30);
  // July (0-indexed 6)
  addDaysForMonth(6, 31);

  return assignments;
}

/**
 * Formats short date e.g. "01/06"
 */
export function getShortDate(formattedDate: string): string {
  if (!formattedDate) return '';
  const parts = formattedDate.split('/');
  if (parts.length >= 2) {
    return `${parts[0]}/${parts[1]}`;
  }
  return formattedDate;
}
