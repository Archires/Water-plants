/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar as CalendarIcon, List, Eye, Trash2, ShieldAlert, ArrowUpDown, Filter, Sparkles, Edit3, Save, X, MessageSquare } from 'lucide-react';
import { Assignment, FilterType, Personnel } from '../types';

interface ScheduleBoardProps {
  assignments: Assignment[];
  personnel: Personnel[];
  onRemoveAssignment: (dateKey: string) => void;
  onManualAssign: (dateKey: string, personId: string) => void;
  onSaveNote: (dateKey: string, note: string) => void;
}

export function ScheduleBoard({
  assignments,
  personnel,
  onRemoveAssignment,
  onManualAssign,
  onSaveNote
}: ScheduleBoardProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [assigningDateKey, setAssigningDateKey] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState<string>('');

  // Sorting logic
  const sortedAssignments = [...assignments].sort((a, b) => {
    if (sortOrder === 'asc') return a.date.localeCompare(b.date);
    return b.date.localeCompare(a.date);
  });

  // Filtering logic
  const filteredAssignments = sortedAssignments.filter((as) => {
    if (filter === 'assigned') return as.personId !== null;
    if (filter === 'unassigned') return as.personId === null;
    return true;
  });

  // Calculate day cells for June 2026 and July 2026 calendars
  // June 2026 starts on Monday (1st June => index 0 in T2-CN grid, or let's map standard JS day of week 1)
  // Weekday layout helper: Monday (0), Tuesday (1), Wednesday (2), Thursday (3), Friday (4), Saturday (5), Sunday (6)
  const getWeekdayIndex = (dayOfWeekStr: string) => {
    switch (dayOfWeekStr) {
      case 'Thứ Hai': return 0;
      case 'Thứ Ba': return 1;
      case 'Thứ Tư': return 2;
      case 'Thứ Năm': return 3;
      case 'Thứ Sáu': return 4;
      case 'Thứ Bảy': return 5;
      case 'Chủ Nhật': return 6;
      default: return 0;
    }
  };

  const renderMonthCalendar = (monthName: string, monthNumStr: string) => {
    const monthAssignments = assignments.filter(as => as.date.includes(`-${monthNumStr}-`));
    if (monthAssignments.length === 0) return null;

    // Get the first assignment to see what day of the week it starts on
    const firstDay = monthAssignments[0];
    const startIndex = getWeekdayIndex(firstDay.dayOfWeek);

    // Grid headers
    const weekdaysShort = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    // Empty spacers at the beginning
    const spacers = Array(startIndex).fill(null);

    return (
      <div className="bg-[#F9F9F7] dark:bg-[#1c1c18] p-4 rounded-xl border border-[#EBEBE5] dark:border-[#3c3c35]">
        <h4 className="text-sm font-serif italic font-bold text-center text-[#5A5A40] dark:text-[#8c8c70] mb-3 uppercase tracking-wider">
          {monthName} 2026
        </h4>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#9A9A8A] mb-2">
          {weekdaysShort.map((wk, idx) => (
            <div key={idx} className="py-1 bg-[#F5F5F0] dark:bg-[#252520] rounded-sm">
              {wk}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {spacers.map((_, idx) => (
            <div key={`spacer-${idx}`} className="aspect-square bg-transparent" />
          ))}

          {monthAssignments.map((day) => {
            const dateNum = day.date.split('-')[2];
            const isAssigned = day.personId !== null;
            let theme = 'bg-white dark:bg-[#252520] hover:bg-[#F5F5F0] text-[#434338] dark:text-[#ebebe5]';
            
            if (isAssigned) {
              theme = 'bg-[#F5F5F0] dark:bg-[#252520] hover:opacity-90 border border-[#D4A373] dark:border-[#8c8c70] text-[#5A5A40] dark:text-[#ebebe5]';
            }

            return (
              <div
                key={day.date}
                id={`calendar-cell-${day.date}`}
                className={`aspect-square p-1 rounded-lg border border-[#EBEBE5] dark:border-[#3c3c35]/60 flex flex-col justify-between text-left transition-all group relative cursor-pointer ${theme}`}
                onClick={() => {
                  if (isAssigned) {
                    if (window.confirm(`Hủy phân công ngày ${day.formattedDate}?`)) {
                      onRemoveAssignment(day.date);
                    }
                  } else {
                    setAssigningDateKey(day.date);
                  }
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold">{parseInt(dateNum, 10)}</span>
                  <div className="flex gap-1 items-center">
                    {day.note && <MessageSquare className="w-2.5 h-2.5 text-[#5A5A40] dark:text-[#8c8c70]" />}
                    {isAssigned && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373] shrink-0" />
                    )}
                  </div>
                </div>

                <div className="min-h-[16px] flex flex-col justify-end gap-0.5">
                  {day.note && !isAssigned && (
                    <p className="text-[8px] font-medium leading-tight line-clamp-1 truncate text-[#5A5A40] dark:text-[#8c8c70]">
                      {day.note}
                    </p>
                  )}
                  {isAssigned ? (
                    <p className="text-[8px] font-semibold leading-tight line-clamp-2 truncate max-w-full text-[#434338] dark:text-[#ebebe5]">
                      {day.personName?.split(' ').pop()}
                    </p>
                  ) : (
                    <p className="text-[8px] text-[#9A9A8A] font-medium italic group-hover:block hidden">
                      + Ghép
                    </p>
                  )}
                </div>

                {/* Hover overlay delete action */}
                {isAssigned && (
                  <div className="absolute inset-0 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-[#252520] rounded-2xl border border-[#EBEBE5] dark:border-[#3c3c35] shadow-xs p-5 flex flex-col h-full">
      
      {/* View Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-[#EBEBE5] dark:border-[#3c3c35]">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-[#F5F5F0] dark:bg-[#1c1c18] text-[#5A5A40] dark:text-[#8c8c70] rounded-lg">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif italic font-bold text-[#434338] dark:text-[#ebebe5] text-base">Bảng Phân Công Chi Tiết</h3>
            <p className="text-xs text-[#9A9A8A]">Thời gian cố định: 08:00 - 09:00 hàng ngày</p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex bg-[#F5F5F0] dark:bg-[#1c1c18] p-1 rounded-xl items-center text-xs shrink-0 font-medium border border-[#EBEBE5] dark:border-[#3c3c35]">
          <button
            onClick={() => { setActiveTab('list'); setAssigningDateKey(null); }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'bg-white dark:bg-[#252520] text-[#5A5A40] dark:text-white shadow-xs font-semibold'
                : 'text-[#9A9A8A] hover:text-[#434338]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Dạng danh sách</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-white dark:bg-[#252520] text-[#5A5A40] dark:text-white shadow-xs font-semibold'
                : 'text-[#9A9A8A] hover:text-[#434338]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem lịch tháng</span>
          </button>
        </div>
      </div>

      {/* FILTER & SORT (LIST TAB ONLY) */}
      {activeTab === 'list' && (
        <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#9A9A8A]">
            <Filter className="w-3.5 h-3.5 text-[#9A9A8A] shrink-0" />
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#F2F2EC] dark:bg-[#32322a] font-semibold text-[#5A5A40] dark:text-white'
                  : 'hover:bg-[#F9F9F7] dark:hover:bg-[#1c1c18]'
              }`}
            >
              Tất cả ({assignments.length})
            </button>
            <button
              onClick={() => setFilter('assigned')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filter === 'assigned'
                  ? 'bg-[#5A5A40] text-white font-semibold'
                  : 'hover:bg-[#F9F9F7] dark:hover:bg-[#1c1c18]'
              }`}
            >
              Đã xếp ({assignments.filter(a => a.personId).length})
            </button>
            <button
              onClick={() => setFilter('unassigned')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filter === 'unassigned'
                  ? 'bg-[#EBEBE5] dark:bg-[#3c3c35] font-semibold text-[#434338] dark:text-[#ebebe5]'
                  : 'hover:bg-[#F9F9F7] dark:hover:bg-[#1c1c18]'
              }`}
            >
              Chưa xếp ({assignments.filter(a => !a.personId).length})
            </button>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="text-xs flex items-center space-x-1.5 px-3 py-1 bg-white dark:bg-[#1c1c18] border border-[#EBEBE5] dark:border-[#3c3c35] hover:bg-[#F5F5F0] rounded-lg text-[#434338] dark:text-[#ebebe5] transition-all font-medium cursor-pointer"
          >
            <ArrowUpDown className="w-3 h-3 text-[#9A9A8A]" />
            <span>Sắp xếp: {sortOrder === 'asc' ? 'Ngày tăng dần' : 'Ngày giảm dần'}</span>
          </button>
        </div>
      )}

      {/* Manual Assign Selector Modal inside Board */}
      {assigningDateKey && (
        <div className="mb-4 p-3 bg-[#F5F5F0] dark:bg-[#1c1c18] border border-[#D9D9D2] dark:border-[#3c3c35] rounded-xl relative z-20">
          <p className="text-xs font-serif italic font-bold text-[#434338] dark:text-[#ebebe5] mb-1.5">
            Ghép nhanh cán bộ cho ngày {assignments.find(a => a.date === assigningDateKey)?.formattedDate}:
          </p>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-white dark:bg-[#252520] rounded-lg">
            {personnel.filter(p => p.assignedCount < 2).length === 0 ? (
              <span className="text-[10px] text-[#9A9A8A] p-2 italic w-full text-center">
                Không còn giáo viên nào trống lượt thỏa điều kiện (tối đa 2 buổi/người)
              </span>
            ) : (
              personnel
                .filter(p => p.assignedCount < 2)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onManualAssign(assigningDateKey, p.id);
                      setAssigningDateKey(null);
                    }}
                    className="text-[10px] font-medium px-2 py-1 bg-[#F9F9F7] hover:bg-[#F5F5F0] hover:text-[#5A5A40] dark:bg-[#252520] dark:hover:bg-[#32322a] dark:hover:text-[#D4A373] rounded border border-[#EBEBE5] dark:border-[#3c3c35] transition-colors cursor-pointer"
                  >
                    {p.name} ({p.assignedCount}/2)
                  </button>
                ))
            )}
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setAssigningDateKey(null)}
              className="text-[10px] text-[#9A9A8A] hover:text-[#434338] px-2 py-1 hover:bg-[#EBEBE5] rounded cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* RENDER MODES */}
      <div className="flex-1 overflow-y-auto pr-1">
        
        {/* LIST VIEW TAB */}
        {activeTab === 'list' && (
          <div className="border border-[#EBEBE5] dark:border-[#3c3c35] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-[#434338] dark:text-[#ebebe5]">
              <thead className="bg-[#F9F9F7] dark:bg-[#1c1c18] text-[#5A5A40] dark:text-[#8c8c70] uppercase tracking-wider text-[10px] font-bold border-b border-[#EBEBE5] dark:border-[#3c3c35]">
                <tr>
                  <th className="p-3 w-12 text-center">STT</th>
                  <th className="p-3 w-28">Ngày trực</th>
                  <th className="p-3 w-24">Thứ</th>
                  <th className="p-3 w-28">Khung Giờ</th>
                  <th className="p-3 min-w-[200px]">Ghi chú</th>
                  <th className="p-3">Nhân sự Đảm Nhận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBE5] dark:divide-[#3c3c35]">
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#9A9A8A] italic">
                      Không có ngày nào khớp với bộ lọc dữ liệu.
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((day, idx) => {
                    const isAssigned = day.personId !== null;
                    return (
                      <tr 
                        key={day.date}
                        className={`hover:bg-[#F5F5F0] dark:hover:bg-[#2d2d25] transition-colors ${
                          isAssigned ? 'bg-white dark:bg-[#252520]' : 'bg-[#F9F9F7]/60 dark:bg-[#1c1c18]/40'
                        }`}
                      >
                        <td className="p-3 text-center font-mono text-[#9A9A8A]">{idx + 1}</td>
                        <td className="p-3 font-semibold text-[#434338] dark:text-[#ebebe5]">
                          {day.formattedDate}
                        </td>
                        <td className="p-3">{day.dayOfWeek}</td>
                        <td className="p-3">
                          <span className="font-mono text-[10px] px-2 py-0.5 bg-[#F5F5F0] dark:bg-[#1c1c18] text-[#5A5A40] dark:text-[#8c8c70] rounded border border-[#EBEBE5] dark:border-[#3c3c35]/40">
                            {day.timeSlot}
                          </span>
                        </td>
                        <td className="p-3">
                          {editingNote === day.date ? (
                            <div className="flex items-center space-x-1.5">
                              <input
                                autoFocus
                                type="text"
                                value={noteValue}
                                onChange={(e) => setNoteValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    onSaveNote(day.date, noteValue);
                                    setEditingNote(null);
                                  } else if (e.key === 'Escape') {
                                    setEditingNote(null);
                                  }
                                }}
                                className="text-xs px-2 py-1 bg-white dark:bg-[#1c1c18] border border-[#EBEBE5] dark:border-[#3c3c35] rounded-md focus:outline-none focus:ring-1 focus:ring-[#5A5A40] w-full"
                                placeholder="..."
                              />
                              <button
                                onClick={() => {
                                  onSaveNote(day.date, noteValue);
                                  setEditingNote(null);
                                }}
                                className="p-1 rounded bg-[#5A5A40] text-white hover:bg-[#484833]"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingNote(null)}
                                className="p-1 rounded bg-white dark:bg-[#252520] border border-[#EBEBE5] dark:border-[#3c3c35] text-[#9A9A8A]"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 group/note">
                              {day.note ? (
                                <span className="font-medium text-[11px] text-[#5A5A40] dark:text-[#8c8c70]">
                                  {day.note}
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#9A9A8A] italic">Chưa có...</span>
                              )}
                              <button
                                onClick={() => {
                                  setEditingNote(day.date);
                                  setNoteValue(day.note || '');
                                }}
                                className="p-1 rounded opacity-0 group-hover/note:opacity-100 hover:bg-[#F9F9F7] dark:hover:bg-[#1c1c18] transition-opacity"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#9A9A8A]" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          {isAssigned ? (
                            <div className="flex items-center justify-between group/row">
                              <span className="font-bold text-[#5A5A40] dark:text-[#ebebe5] bg-[#F5F5F0] dark:bg-[#1c1c18] px-2.5 py-1 rounded-lg border border-[#EBEBE5] dark:border-[#3c3c35]">
                                {day.personName}
                              </span>
                              <button
                                onClick={() => onRemoveAssignment(day.date)}
                                className="text-[#9A9A8A] hover:text-red-500 lg:opacity-0 group-hover/row:opacity-100 p-1.5 rounded transition-all hover:bg-red-50 dark:hover:bg-[#1c1c18] cursor-pointer shrink-0"
                                title="Hủy phân công ngày này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAssigningDateKey(day.date)}
                              className="text-[10px] font-semibold text-[#D4A373] hover:underline border border-dashed border-[#D4A373]/60 px-3 py-1 rounded-lg hover:bg-[#F5F5F0] dark:hover:bg-[#32322a] transition-all cursor-pointer"
                            >
                              + Phân công thủ công
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* CALENDAR MONTHS VIEW TAB */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="p-2.5 bg-[#F5F5F0] dark:bg-[#1c1c18] border border-[#EBEBE5] dark:border-[#3c3c35] rounded-xl text-[#5A5A40] dark:text-[#8c8c70] text-xs flex gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-[#D4A373] mt-0.5" />
              <div>
                <span className="font-serif italic font-bold">Mẹo chế độ Lịch Tháng:</span>
                <p className="opacity-80">
                  Nhập vào ngày bất kỳ có dấu <strong className="text-[#D4A373]">chấm tròn</strong> để hủy phân công, 
                  hoặc các ô trống chưa phân công để gán nhanh cán bộ trực tiếp.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderMonthCalendar('Tháng Sáu', '06')}
              {renderMonthCalendar('Tháng Bảy', '07')}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
