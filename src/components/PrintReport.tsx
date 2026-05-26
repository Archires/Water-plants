/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Assignment, Personnel } from '../types';

interface PrintReportProps {
  assignments: Assignment[];
  personnel: Personnel[];
}

export function PrintReport({ assignments, personnel }: PrintReportProps) {
  const totalDays = assignments.length;
  const assignedDays = assignments.filter((a) => a.personId !== null).length;
  const todayStr = new Date().toLocaleDateString('vi-VN');

  return (
    <div className="hidden print:block p-8 bg-white text-black min-h-screen font-sans" id="print-report-container">
      {/* Formal Header */}
      <div className="text-center mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#5A5A40]">TRƯỜNG MƯỜNG MEN — SƠN LA</p>
        <h1 className="text-2xl font-serif italic mt-2 text-slate-950 uppercase border-b-2 border-[#5A5A40] pb-2 inline-block px-4">
          BẢNG PHÂN CÔNG LỊCH TRỰC TƯỚI CÂY
        </h1>
        <p className="text-sm mt-3 text-slate-700 font-medium">
          Thời gian: Bắt đầu từ <strong>01/06/2026</strong> đến hết <strong>31/07/2026</strong>
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Khung giờ tưới cố định: <strong>08:00 - 09:00</strong> hàng ngày (1 người/ngày)
        </p>
      </div>

      {/* Brief Stats Section */}
      <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded-lg p-4 mb-6 bg-slate-50 text-xs">
        <div>
          <p>• <strong>Tổng số ngày trực:</strong> {totalDays} ngày</p>
          <p>• <strong>Đã phân công:</strong> {assignedDays} / {totalDays} ngày ({(assignedDays / totalDays * 100).toFixed(0)}%)</p>
        </div>
        <div>
          <p>• <strong>Tổng số nhân sự:</strong> {personnel.length} nhân sự</p>
          <p>• <strong>Xuất bản ngày:</strong> {todayStr}</p>
        </div>
      </div>

      {/* Grid of All Days */}
      <table className="w-full text-left text-xs border-collapse border border-slate-400">
        <thead>
          <tr className="bg-slate-100 text-slate-800 uppercase font-bold">
            <th className="border border-slate-400 p-2 text-center w-12">STT</th>
            <th className="border border-slate-400 p-2 text-center w-28">Ngày Trực</th>
            <th className="border border-slate-400 p-2 text-center w-24">Thứ</th>
            <th className="border border-slate-400 p-2 text-center w-28">Khung Giờ</th>
            <th className="border border-slate-400 p-2 text-center min-w-[120px]">Ghi chú</th>
            <th className="border border-slate-400 p-2">Nhân sự Phân Công</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((day, idx) => (
            <tr key={day.date} className="even:bg-slate-50">
              <td className="border border-slate-400 p-2 text-center font-mono">{idx + 1}</td>
              <td className="border border-slate-400 p-2 text-center font-bold text-slate-900">{day.formattedDate}</td>
              <td className="border border-slate-400 p-2 text-center">{day.dayOfWeek}</td>
              <td className="border border-slate-400 p-2 text-center font-mono">{day.timeSlot}</td>
              <td className="border border-slate-400 p-2 text-slate-700 italic text-[11px]">{day.note || ''}</td>
              <td className="border border-slate-400 p-2 font-bold text-slate-800">
                {day.personName || '--- Chưa phân công ---'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Office Signature blocks */}
      <div className="mt-12 flex justify-between text-xs px-10">
        <div className="text-center w-48">
          <p className="font-bold">NGƯỜI LẬP BIỂU</p>
          <p className="italic text-slate-500 mt-1">(Ký và ghi rõ họ tên)</p>
          <div className="h-20" />
        </div>
        <div className="text-center w-48">
          <p className="font-bold">BAN GIÁM HIỆU DUYỆT</p>
          <p className="italic text-slate-500 mt-1">(Ký tên và đóng dấu)</p>
          <div className="h-20" />
        </div>
      </div>
    </div>
  );
}
