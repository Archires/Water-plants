/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Printer, 
  FileSpreadsheet, 
  FileDown, 
  Leaf, 
  School,
  Sparkles,
  HelpCircle,
  Clock
} from 'lucide-react';

import { Personnel, Assignment, Stats } from './types';
import { generateDatesList } from './utils/dateUtils';
import { DEFAULT_PERSONNEL } from './utils/mockData';
import { PersonnelList } from './components/PersonnelList';
import { SpinPanel } from './components/SpinPanel';
import { StatsPanel } from './components/StatsPanel';
import { ScheduleBoard } from './components/ScheduleBoard';
import { PrintReport } from './components/PrintReport';
import { parseExcelPersonnel, exportScheduleToExcel } from './utils/excelUtils';
import { exportScheduleToPDF, printScheduleHTML } from './utils/pdfUtils';

export default function App() {
  // --- Dark Mode State ---
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('muong_men_theme');
    return saved === 'dark';
  });

  // --- Personnel Roster State ---
  const [personnel, setPersonnel] = useState<Personnel[]>(() => {
    const saved = localStorage.getItem('muong_men_personnel');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse personnel storage', e);
      }
    }
    return [];
  });

  // --- Date Assignments State ---
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('muong_men_assignments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse assignments storage', e);
      }
    }
    // Generate initial flat June-July 2026 calendar (61 days)
    return generateDatesList(2026);
  });

  // --- Theme syncing effect ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('muong_men_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('muong_men_theme', 'light');
    }
  }, [isDarkMode]);

  // --- Auto-persist data effect ---
  useEffect(() => {
    localStorage.setItem('muong_men_personnel', JSON.stringify(personnel));
  }, [personnel]);

  useEffect(() => {
    localStorage.setItem('muong_men_assignments', JSON.stringify(assignments));
  }, [assignments]);

  // --- STATS ENGINE ---
  const getStats = (): Stats => {
    const totalDays = assignments.length;
    const assignedDays = assignments.filter((a) => a.personId !== null).length;
    const remainingDays = totalDays - assignedDays;
    const totalPersonnel = personnel.length;

    const completedPersonnel = personnel.filter((p) => p.assignedCount === 2).length;
    const partialPersonnel = personnel.filter((p) => p.assignedCount === 1).length;
    const unassignedPersonnel = personnel.filter((p) => p.assignedCount === 0).length;

    return {
      totalDays,
      assignedDays,
      remainingDays,
      totalPersonnel,
      completedPersonnel,
      partialPersonnel,
      unassignedPersonnel,
    };
  };

  const stats = getStats();

  // --- ACTION HANDLERS ---

  // Upload parsed personnel roster via XLS
  const handleUploadExcel = async (file: File) => {
    try {
      const parsed = await parseExcelPersonnel(file);
      if (parsed.length === 0) {
        alert('File Excel không có dòng nhân sự hợp lệ. Vui lòng kiểm tra tiêu đề và nội dung.');
        return;
      }

      // Map to structured Personnel
      const newPersonnel: Personnel[] = parsed.map((item) => ({
        id: `person-${item.stt}-${Math.random().toString(36).substr(2, 6)}`,
        stt: item.stt,
        name: item.name,
        assignedCount: 0,
        assignedDates: [],
      }));

      // Set personnel, and clear existing assignments to avoid key mismatch
      setPersonnel(newPersonnel);
      setAssignments(generateDatesList(2026));
      
      alert(`Đã tải lên thành công danh sách gồm ${parsed.length} nhân sự từ file Excel!`);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi import file Excel. Hãy chắc chắn đúng định dạng.');
    }
  };

  // Prepopulate with 30 suggested school staff
  const handleUseDefaultMock = () => {
    const initialList: Personnel[] = DEFAULT_PERSONNEL.map((p) => ({
      id: `person-${p.stt}-${Math.random().toString(36).substr(2, 5)}`,
      stt: p.stt,
      name: p.name,
      assignedCount: 0,
      assignedDates: [],
    }));

    setPersonnel(initialList);
    setAssignments(generateDatesList(2026));
  };

  // Add individual worker manually
  const handleAddPerson = (name: string) => {
    const maxSTT = personnel.length > 0 ? Math.max(...personnel.map((p) => p.stt)) : 0;
    const newP: Personnel = {
      id: `person-${maxSTT + 1}-${Math.random().toString(36).substr(2, 5)}`,
      stt: maxSTT + 1,
      name,
      assignedCount: 0,
      assignedDates: [],
    };
    setPersonnel([...personnel, newP]);
  };

  // Remove worker and automatically free up their days
  const handleRemovePerson = (id: string) => {
    const target = personnel.find((p) => p.id === id);
    if (!target) return;

    if (window.confirm(`Xóa cán bộ "${target.name}"? Mọi ngày trực của họ sẽ trở về trạng thái trống.`)) {
      // Free calendar days
      const updatedAssignments = assignments.map((as) => {
        if (as.personId === id) {
          return { ...as, personId: null, personName: null };
        }
        return as;
      });

      // Filter from roster
      const updatedRoster = personnel.filter((p) => p.id !== id);
      
      // Re-index remaining workers' STT
      const reIndexed = updatedRoster.map((p, idx) => ({
        ...p,
        stt: idx + 1,
      }));

      setAssignments(updatedAssignments);
      setPersonnel(reIndexed);
    }
  };

  // Single random draw pairing (1 person, 1 date)
  const handleAssignRandom = (personId: string, dateKey: string) => {
    // 1. Update calendar day details
    const chosenPerson = personnel.find((p) => p.id === personId);
    if (!chosenPerson) return;

    const targetDate = assignments.find((a) => a.date === dateKey);
    if (!targetDate) return;

    const updatedAssignments = assignments.map((day) => {
      if (day.date === dateKey) {
        return {
          ...day,
          personId: personId,
          personName: chosenPerson.name,
        };
      }
      return day;
    });

    // 2. Update personnel assignments record
    const updatedRoster = personnel.map((p) => {
      if (p.id === personId) {
        return {
          ...p,
          assignedCount: p.assignedCount + 1,
          assignedDates: [...p.assignedDates, targetDate.formattedDate],
        };
      }
      return p;
    });

    setAssignments(updatedAssignments);
    setPersonnel(updatedRoster);
  };

  // Force automatic randomized solver for all remaining tasks
  const handleAssignAllRandomFields = () => {
    if (personnel.length === 0) {
      alert('Vui lòng tải lên danh sách nhân sự trước khi phân công!');
      return;
    }

    // Work on local copies to avoid mid-render state tearing
    let tempAssignments = [...assignments];
    let tempPersonnel = [...personnel];

    // Find days needing placement
    const vacantDayKeys = tempAssignments.filter((a) => !a.personId).map((a) => a.date);
    
    if (vacantDayKeys.length === 0) {
      alert('Tất cả ngày trên lịch đã được phân công đầy đủ!');
      return;
    }

    // Shuffle days for absolute fair distribution
    const shuffledDays = vacantDayKeys.sort(() => Math.random() - 0.5);

    for (const dateKey of shuffledDays) {
      // Find person who has less than 2 duties
      const eligible = tempPersonnel.filter((p) => p.assignedCount < 2);
      if (eligible.length === 0) {
        break; // No candidates have slots remaining
      }

      // Prioritize staff with 0 assignments first to guarantee absolute fairness,
      // fall back to staff with 1 assignment
      let candidates = eligible.filter((p) => p.assignedCount === 0);
      if (candidates.length === 0) {
        candidates = eligible;
      }

      // Draw random
      const selected = candidates[Math.floor(Math.random() * candidates.length)];
      
      const targetDayIndex = tempAssignments.findIndex((a) => a.date === dateKey);
      if (targetDayIndex !== -1) {
        tempAssignments[targetDayIndex] = {
          ...tempAssignments[targetDayIndex],
          personId: selected.id,
          personName: selected.name,
        };
      }

      tempPersonnel = tempPersonnel.map((p) => {
        if (p.id === selected.id) {
          return {
            ...p,
            assignedCount: p.assignedCount + 1,
            assignedDates: [...p.assignedDates, tempAssignments[targetDayIndex].formattedDate],
          };
        }
        return p;
      });
    }

    setAssignments(tempAssignments);
    setPersonnel(tempPersonnel);
    alert('Đã hoàn thiện xếp lịch tự động thành công cho tất cả các ngày trống!');
  };

  // Remove pairing of a specific date
  const handleRemoveAssignment = (dateKey: string) => {
    const targetAssignment = assignments.find((a) => a.date === dateKey);
    if (!targetAssignment || !targetAssignment.personId) return;

    const personId = targetAssignment.personId;
    const formattedDate = targetAssignment.formattedDate;

    // Remove from calendar
    const updatedAssignments = assignments.map((day) => {
      if (day.date === dateKey) {
        return {
          ...day,
          personId: null,
          personName: null,
        };
      }
      return day;
    });

    // Decrement worker counts
    const updatedRoster = personnel.map((p) => {
      if (p.id === personId) {
        return {
          ...p,
          assignedCount: Math.max(0, p.assignedCount - 1),
          assignedDates: p.assignedDates.filter((d) => d !== formattedDate),
        };
      }
      return p;
    });

    setAssignments(updatedAssignments);
    setPersonnel(updatedRoster);
  };

  // Manually attach a worker to a specific date slot
  const handleManualAssign = (dateKey: string, personId: string) => {
    const chosenPerson = personnel.find((p) => p.id === personId);
    if (!chosenPerson) return;

    if (chosenPerson.assignedCount >= 2) {
      alert(`Đã quá giới hạn! Cán bộ "${chosenPerson.name}" đã làm đủ 2 lượt.`);
      return;
    }

    // If day was already assigned to someone else, clear them first
    const day = assignments.find((a) => a.date === dateKey);
    let updatedRoster = [...personnel];

    if (day && day.personId) {
      const currentId = day.personId;
      const currentFormatted = day.formattedDate;
      updatedRoster = updatedRoster.map((p) => {
        if (p.id === currentId) {
          return {
            ...p,
            assignedCount: Math.max(0, p.assignedCount - 1),
            assignedDates: p.assignedDates.filter((d) => d !== currentFormatted),
          };
        }
        return p;
      });
    }

    // Now update the selected date content
    const updatedAssignments = assignments.map((d) => {
      if (d.date === dateKey) {
        return {
          ...d,
          personId: personId,
          personName: chosenPerson.name,
        };
      }
      return d;
    });

    // Increment newly chosen attendee
    updatedRoster = updatedRoster.map((p) => {
      if (p.id === personId) {
        return {
          ...p,
          assignedCount: p.assignedCount + 1,
          assignedDates: [...p.assignedDates, day?.formattedDate || ''],
        };
      }
      return p;
    });

    setAssignments(updatedAssignments);
    setPersonnel(updatedRoster);
  };

  const handleSaveNote = (dateKey: string, note: string) => {
    setAssignments(assignments.map(a => 
      a.date === dateKey ? { ...a, note: note } : a
    ));
  };

  // Reset entire timetable
  const handleReset = () => {
    const emptyCalendar = generateDatesList(2026);
    const clearedRoster = personnel.map((p) => ({
      ...p,
      assignedCount: 0,
      assignedDates: [],
    }));

    setAssignments(emptyCalendar);
    setPersonnel(clearedRoster);
  };

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text dark:bg-natural-dark-bg dark:text-natural-dark-text transition-colors duration-300 font-sans">
      
      {/* 1. STYLED NAV LOGO & CONTROL HEADER FOR SCREEN */}
      <header className="no-print sticky top-0 z-30 bg-white/80 dark:bg-[#252520]/80 backdrop-blur-md border-b border-[#EBEBE5] dark:border-[#3c3c35] px-4 py-3 md:py-4 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Institution Title Area */}
          <div className="flex items-center space-x-3" id="brand-logo-area">
            <div className="p-2.5 bg-[#5A5A40] dark:bg-[#8c8c70] rounded-2xl text-white shadow-xs shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg md:text-2xl font-serif italic font-bold text-[#5A5A40] dark:text-[#8c8c70] tracking-tight" id="app-heading">
                  Trường Mường Men
                </h1>
                <span className="text-[10px] font-bold bg-[#D4A373]/10 text-[#D4A373] dark:text-[#D4A373] border border-[#D4A373]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Hè 2026
                </span>
              </div>
              <p className="text-xs text-[#9A9A8A] mt-0.5 flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-[#5A5A40] dark:text-[#8c8c70] animate-pulse" />
                <span>Phân công lịch tự động, ngẫu nhiên & tối ưu</span>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Dark Mode selector */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              id="theme-toggle"
              className="p-2.5 rounded-xl border border-[#EBEBE5] dark:border-[#3c3c35] bg-white dark:bg-[#20201a] text-[#434338] dark:text-[#ebebe5] hover:bg-[#F5F5F0] dark:hover:bg-[#2d2d25] transition-all shadow-xs cursor-pointer"
              title={isDarkMode ? 'Đổi sang Chế độ sáng' : 'Đổi sang Chế độ tối'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-[#D4A373]" /> : <Moon className="w-4 h-4 text-[#5A5A40]" />}
            </button>

            {/* Print Action button */}
            <button
              onClick={printScheduleHTML}
              id="btn-print"
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-[#EBEBE5] dark:border-[#3c3c35] bg-white dark:bg-[#20201a] text-xs font-semibold text-[#434338] dark:text-[#ebebe5] hover:bg-[#F5F5F0] dark:hover:bg-[#2d2d25] hover:text-[#5A5A40] transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">In Lịch Trực</span>
            </button>

            {/* Export Spreadsheet Excel */}
            <button
              onClick={() => exportScheduleToExcel(assignments)}
              id="btn-export-excel"
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#20201a] text-xs font-semibold border border-[#EBEBE5] dark:border-[#3c3c35] text-[#434338] dark:text-[#ebebe5] hover:bg-[#F5F5F0] dark:hover:bg-[#2d2d25] hover:text-[#D4A373] transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#D4A373]" />
              <span>Xuất Excel</span>
            </button>

            {/* Export PDF direct download */}
            <button
              onClick={() => exportScheduleToPDF(assignments, personnel)}
              id="btn-export-pdf"
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-xs font-serif italic font-bold text-white transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Tải PDF</span>
            </button>

          </div>

        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="no-print max-w-7xl mx-auto px-4 py-6">
        
        {/* Statistics Dashboard Cards */}
        <StatsPanel stats={stats} />

        {/* Visual Spin Center (Draw machines) */}
        <SpinPanel 
          personnel={personnel}
          assignments={assignments}
          onAssignRandom={handleAssignRandom}
          onAssignAllRandom={handleAssignAllRandomFields}
          onReset={handleReset}
        />

        {/* Double column schedule management */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Column A: Personnel (Takes up 4 cols on big display) */}
          <div className="lg:col-span-4 h-full">
            <PersonnelList 
              personnel={personnel}
              onUploadExcel={handleUploadExcel}
              onUseDefaultMock={handleUseDefaultMock}
              onAddPerson={handleAddPerson}
              onRemovePerson={handleRemovePerson}
            />
          </div>

          {/* Column B: Timetable Board (Takes up 8 cols on big display) */}
          <div className="lg:col-span-8 h-full">
            <ScheduleBoard 
              assignments={assignments}
              personnel={personnel}
              onRemoveAssignment={handleRemoveAssignment}
              onManualAssign={handleManualAssign}
              onSaveNote={handleSaveNote}
            />
          </div>

        </div>

      </main>

      {/* 3. PRINT-ONLY COMPONENT LAYOUT */}
      <PrintReport 
        assignments={assignments}
        personnel={personnel}
      />

    </div>
  );
}

