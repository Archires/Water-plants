/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { Assignment } from '../types';

/**
 * Parses an uploaded Excel file for personnel (Họ và tên, STT)
 */
export function parseExcelPersonnel(file: File): Promise<{ stt: number; name: string }[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        const parsed: { stt: number; name: string }[] = [];
        jsonData.forEach((row, idx) => {
          let nameVal = '';
          let sttVal = idx + 1;
          
          for (const key of Object.keys(row)) {
            const cleanKey = key.trim().toLowerCase();
            const val = String(row[key]).trim();
            
            if (
              cleanKey === 'stt' || 
              cleanKey === 'số thứ tự' || 
              cleanKey === 'no' || 
              cleanKey === 'số thứ tự' ||
              cleanKey === 'id'
            ) {
              const num = parseInt(val, 10);
              if (!isNaN(num)) {
                sttVal = num;
              }
            } else if (
              cleanKey === 'họ và tên' || 
              cleanKey === 'ho va ten' || 
              cleanKey === 'họ tên' || 
              cleanKey === 'ho ten' || 
              cleanKey === 'tên' || 
              cleanKey === 'ten' || 
              cleanKey === 'name' || 
              cleanKey === 'nhân sự' ||
              cleanKey === 'nhan su' ||
              cleanKey === 'fullname'
            ) {
              nameVal = val;
            }
          }
          
          // Fallback if specific header was not matched, or header labels differed
          if (!nameVal) {
            for (const key of Object.keys(row)) {
              if (key.trim().toLowerCase() === 'stt') continue;
              const val = String(row[key]).trim();
              if (isNaN(Number(val)) && val.length > 2) {
                nameVal = val;
                break;
              }
            }
          }
          
          if (nameVal && nameVal.trim() !== '') {
            parsed.push({
              stt: sttVal,
              name: nameVal,
            });
          }
        });
        
        // Sort by STT
        parsed.sort((a, b) => a.stt - b.stt);
        resolve(parsed);
      } catch (err) {
        console.error('Excel parse error:', err);
        reject(new Error('Không thể đọc file Excel. Vui lòng đảm bảo file hợp lệ và chứa danh sách tên.'));
      }
    };
    reader.onerror = () => reject(new Error('Lỗi khi đọc file Excel'));
    reader.readAsBinaryString(file);
  });
}

/**
 * Exports current schedule assignments to Excel sheet with styling
 */
export function exportScheduleToExcel(assignments: Assignment[]) {
  const data = assignments.map((as, index) => ({
    'STT': index + 1,
    'Ngày tưới': as.formattedDate,
    'Thứ': as.dayOfWeek,
    'Khung giờ': as.timeSlot,
    'Người phân công': as.personName || '--- Chưa phân công ---',
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set page layout helper
  worksheet['!cols'] = [
    { wch: 6 },   // STT
    { wch: 15 },  // Ngày tưới
    { wch: 15 },  // Thứ
    { wch: 18 },  // Khung giờ
    { wch: 30 },  // Người phân công
  ];
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lịch tưới');
  
  XLSX.writeFile(workbook, 'Lich_Tuoi_Truong_Muong_Men.xlsx');
}
