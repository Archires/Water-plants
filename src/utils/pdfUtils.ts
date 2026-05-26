/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { Assignment, Personnel } from '../types';

/**
 * Triggers a native document print. 
 * This is the gold standard for full CSS-to-PDF exports in Vietnamese,
 * ensuring zero diacritic issues and beautifully formatted multi-page documents.
 */
export function printScheduleHTML() {
  window.print();
}

/**
 * Generates a standard report document using jsPDF.
 * Clean, safe, auto-wrapped.
 */
export function exportScheduleToPDF(assignments: Assignment[], personnel: Personnel[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Since default jsPDF fonts don't support Vietnamese accented characters (diacritics) out-of-the-box,
  // we generate a report with stripped accents for universal readability, or clean transliteration,
  // while instructing the user about the native Web Print option for identical CSS-perfect Vietnamese prints.
  
  const removeDiacritics = (str: string): string => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  // Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('LICH TRUC TUOI CAY - TRUONG MUONG MEN', 105, 20, { align: 'center' });
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Thoi gian: Tu ngay 01/06 den ngay 31/07 | Khung gio: 08:00 - 09:00', 105, 27, { align: 'center' });
  doc.text('Generated at: ' + new Date().toLocaleDateString('vi-VN'), 105, 33, { align: 'center' });
  
  doc.line(15, 37, 195, 37);

  // Stats Card
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('THONG KE TIEN DO:', 15, 45);
  
  const totalDays = assignments.length;
  const assignedDays = assignments.filter(a => a.personId).length;
  const percent = ((assignedDays / totalDays) * 100).toFixed(0);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`- Tong so ngay truc: ${totalDays} ngay`, 15, 51);
  doc.text(`- Da phan cong: ${assignedDays} / ${totalDays} ngay (${percent}%)`, 15, 57);
  doc.text(`- Con lai: ${totalDays - assignedDays} ngay`, 105, 51);
  doc.text(`- Tong so nhan su: ${personnel.length} nguoi`, 105, 57);

  doc.line(15, 63, 195, 63);

  // Table header
  doc.setFont('Helvetica', 'bold');
  doc.text('STT', 18, 70);
  doc.text('NGAY', 32, 70);
  doc.text('THU', 60, 70);
  doc.text('KHUNG GIO', 85, 70);
  doc.text('NHAN SU DUOC PHAN CONG', 125, 70);

  doc.line(15, 73, 195, 73);

  // Table content
  doc.setFont('Helvetica', 'normal');
  let y = 78;
  const pageHeight = doc.internal.pageSize.height;

  assignments.forEach((as, index) => {
    // Page breaking check
    if (y > pageHeight - 15) {
      doc.addPage();
      doc.setFont('Helvetica', 'bold');
      // Re-draw table header on new page
      doc.text('STT', 18, 15);
      doc.text('NGAY', 32, 15);
      doc.text('THU', 60, 15);
      doc.text('KHUNG GIO', 85, 15);
      doc.text('NHAN SU DUOC PHAN CONG', 125, 15);
      doc.line(15, 18, 195, 18);
      doc.setFont('Helvetica', 'normal');
      y = 24;
    }

    const name = as.personName ? removeDiacritics(as.personName) : '--- Chua phan cong ---';
    const dayName = removeDiacritics(as.dayOfWeek);

    doc.text(String(index + 1), 18, y);
    doc.text(as.formattedDate, 32, y);
    doc.text(dayName, 60, y);
    doc.text(as.timeSlot, 85, y);
    doc.text(name, 125, y);

    y += 7.5;
  });

  // Footer/Signatures on last page
  if (y > pageHeight - 40) {
    doc.addPage();
    y = 20;
  }
  
  doc.line(15, y, 195, y);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('* Luu y: De xuat ban PDF co dau Tieng Viet dep am ban dung tieu chuan quoc te,', 15, y + 8);
  doc.text('quy khach can nhan nut "In Lich Truc" de in hoac luu dang PDF truc tiep tu trinh duyet.', 15, y + 13);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('BAN GIAM HIEU TRUONG', 140, y + 25);
  doc.setFont('Helvetica', 'normal');
  doc.text('(Ky và ghi ro ho ten)', 143, y + 30);

  doc.save('Lich_Tuoi_Muong_Men.pdf');
}
