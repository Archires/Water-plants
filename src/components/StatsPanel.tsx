/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Users, CheckCircle2, Hourglass } from 'lucide-react';
import { Stats } from '../types';

interface StatsPanelProps {
  stats: Stats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const percentDays = stats.totalDays > 0 ? (stats.assignedDays / stats.totalDays) * 100 : 0;
  const percentCompleted = stats.totalPersonnel > 0 ? (stats.completedPersonnel / stats.totalPersonnel) * 100 : 0;
  const percentRemaining = stats.totalDays > 0 ? (stats.remainingDays / stats.totalDays) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. COMPLETED TURNS (Completed 2 assigned turns) */}
      <div 
        id="stats-completed-personnel"
        className="bg-white dark:bg-[#252520] p-5 rounded-2xl border border-[#EBEBE5] dark:border-[#3c3c35] shadow-xs relative overflow-hidden transition-all duration-300 hover:shadow-sm"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <CheckCircle2 className="w-20 h-20 text-[#5A5A40] dark:text-[#8c8c70]" />
        </div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-[#F5F5F0] dark:bg-[#1c1c18] text-[#5A5A40] dark:text-[#8c8c70] rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-[#9A9A8A] uppercase tracking-widest">Đạt Chỉ Tiêu (2/2)</span>
        </div>
        <div className="text-3xl font-serif italic font-bold text-[#434338] dark:text-[#ebebe5] mb-1">
          {stats.completedPersonnel} <span className="text-sm font-sans font-normal text-[#9A9A8A]">người</span>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-[#9A9A8A] mb-1">
            <span>Tỷ lệ hoàn thành nhiệm vụ</span>
            <span className="font-semibold text-[#5A5A40] dark:text-[#8c8c70]">{percentCompleted.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-[#EBEBE5] dark:bg-[#32322a] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#5A5A40] dark:bg-[#8c8c70] h-full transition-all duration-500 ease-out"
              style={{ width: `${percentCompleted}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. TOTAL DAYS ASSIGNED */}
      <div 
        id="stats-total-assigned"
        className="bg-white dark:bg-[#252520] p-5 rounded-2xl border border-[#EBEBE5] dark:border-[#3c3c35] shadow-xs relative overflow-hidden transition-all duration-300 hover:shadow-sm"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Calendar className="w-20 h-20 text-[#D4A373]" />
        </div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-[#F5F5F0] dark:bg-[#1c1c18] text-[#D4A373] rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-[#9A9A8A] uppercase tracking-widest">Đã Phân Công</span>
        </div>
        <div className="text-3xl font-serif italic font-bold text-[#5A5A40] dark:text-[#8c8c70] mb-1">
          {stats.assignedDays} <span className="text-sm font-sans font-normal text-[#9A9A8A]">ngày trực</span>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-[#9A9A8A] mb-1">
            <span>Tiến độ xếp lịch</span>
            <span className="font-semibold text-[#D4A373]">{percentDays.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-[#EBEBE5] dark:bg-[#32322a] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#D4A373] h-full transition-all duration-500 ease-out"
              style={{ width: `${percentDays}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. REMAINING DAYS */}
      <div 
        id="stats-remaining-days"
        className="bg-white dark:bg-[#252520] p-5 rounded-2xl border border-[#EBEBE5] dark:border-[#3c3c35] shadow-xs relative overflow-hidden transition-all duration-300 hover:shadow-sm"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Hourglass className="w-20 h-20 text-[#D4A373]" />
        </div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-[#F5F5F0] dark:bg-[#1c1c18] text-[#D4A373] rounded-lg">
            <Hourglass className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-[#9A9A8A] uppercase tracking-widest">Số Ngày Còn Lại</span>
        </div>
        <div className="text-3xl font-serif italic font-bold text-[#434338] dark:text-[#ebebe5] mb-1">
          {stats.remainingDays} <span className="text-sm font-sans font-normal text-[#9A9A8A]">ngày trống</span>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-[#9A9A8A] mb-1">
            <span>Tỷ lệ ngày trống còn lại</span>
            <span className="font-semibold text-[#D4A373]">{percentRemaining.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-[#EBEBE5] dark:bg-[#32322a] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#D4A373] h-full transition-all duration-500 ease-out opacity-40"
              style={{ width: `${percentRemaining}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. TOTAL PERSONNEL & BREAKDOWN */}
      <div 
        id="stats-total-personnel"
        className="bg-white dark:bg-[#252520] p-5 rounded-2xl border border-[#EBEBE5] dark:border-[#3c3c35] shadow-xs relative overflow-hidden transition-all duration-300 hover:shadow-sm"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Users className="w-20 h-20 text-[#5A5A40] dark:text-[#8c8c70]" />
        </div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-[#F5F5F0] dark:bg-[#1c1c18] text-[#5A5A40] dark:text-[#8c8c70] rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-[#9A9A8A] uppercase tracking-widest">Tổng Cán Bộ</span>
        </div>
        <div className="text-3xl font-serif italic font-bold text-[#434338] dark:text-[#ebebe5] mb-1">
          {stats.totalPersonnel} <span className="text-sm font-sans font-normal text-[#9A9A8A]">nhân sự</span>
        </div>
        <div className="mt-3 flex justify-between items-center text-xs text-[#9A9A8A] border-t border-[#EBEBE5] dark:border-[#32322a] pt-2">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase">Có 1 lượt trực:</span>
            <span className="font-semibold text-[#434338] dark:text-[#ebebe5]">{stats.partialPersonnel} người</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase">Chưa có lượt:</span>
            <span className="font-semibold text-[#434338] dark:text-[#ebebe5]">{stats.unassignedPersonnel} người</span>
          </div>
        </div>
      </div>

    </div>
  );
}
