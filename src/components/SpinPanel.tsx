/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Play, RotateCcw, AlertTriangle, Check, Calendar, Trophy, Zap } from 'lucide-react';
import { Personnel, Assignment } from '../types';

interface SpinPanelProps {
  personnel: Personnel[];
  assignments: Assignment[];
  onAssignRandom: (personId: string, dateKey: string) => void;
  onAssignAllRandom: () => void;
  onReset: () => void;
}

export function SpinPanel({ 
  personnel, 
  assignments, 
  onAssignRandom, 
  onAssignAllRandom,
  onReset 
}: SpinPanelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSpinName, setCurrentSpinName] = useState('--- Sẵn sàng ---');
  const [currentSpinDate, setCurrentSpinDate] = useState('--- Sẵn sàng ---');
  
  // Confetti / Celebration popup
  const [celebration, setCelebration] = useState<{
    personName: string;
    date: string;
    dayOfWeek: string;
  } | null>(null);

  // Audio synthesizer helper for clicky sounds (No external MP3 file needed)
  const playClickSound = (freq = 400, type: OscillatorType = 'sine', duration = 0.05) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // AudioContext failed or blocked by autoplay
    }
  };

  // Find eligible candidates and dates
  const eligiblePersonnel = personnel.filter(p => p.assignedCount < 2);
  const unassignedDates = assignments.filter(a => !a.personId);

  const startSpin = () => {
    if (isSpinning) return;
    if (eligiblePersonnel.length === 0) {
      alert('Không còn nhân sự nào chưa làm đủ 2 lượt!');
      return;
    }
    if (unassignedDates.length === 0) {
      alert('Tất cả ngày trong lịch đã được phân công!');
      return;
    }

    setIsSpinning(true);
    setCelebration(null);

    // Pick final target
    const targetPerson = eligiblePersonnel[Math.floor(Math.random() * eligiblePersonnel.length)];
    const targetDate = unassignedDates[Math.floor(Math.random() * unassignedDates.length)];

    let ticks = 0;
    const maxTicks = 25;
    const intervalMs = 80;

    const runTicks = () => {
      if (ticks < maxTicks) {
        // Pick random visual candidates for effects
        const tempPerson = eligiblePersonnel[Math.floor(Math.random() * eligiblePersonnel.length)];
        const tempDate = unassignedDates[Math.floor(Math.random() * unassignedDates.length)];

        setCurrentSpinName(tempPerson.name);
        setCurrentSpinDate(tempDate.formattedDate + ` (${tempDate.dayOfWeek})`);
        
        // Play click sound with pitch that increases as we reach the end
        const pitch = 300 + (ticks * 20);
        playClickSound(pitch, 'triangle', 0.04);

        ticks++;
        setTimeout(runTicks, intervalMs + (ticks * 5)); // Decelerating scroll
      } else {
        // Lock on final target
        setCurrentSpinName(targetPerson.name);
        setCurrentSpinDate(targetDate.formattedDate + ` (${targetDate.dayOfWeek})`);
        
        // Winning sound
        playClickSound(587.33, 'sine', 0.15); // D5
        setTimeout(() => playClickSound(880, 'sine', 0.3), 150); // A5

        setTimeout(() => {
          onAssignRandom(targetPerson.id, targetDate.id);
          setIsSpinning(false);
          setCelebration({
            personName: targetPerson.name,
            date: targetDate.formattedDate,
            dayOfWeek: targetDate.dayOfWeek,
          });
        }, 300);
      }
    };

    runTicks();
  };

  const isScheduleFull = unassignedDates.length === 0 || eligiblePersonnel.length === 0;

  return (
    <div className="bg-[#5A5A40] text-[#F9F9F7] dark:bg-[#252520] dark:text-[#ebebe5] p-6 rounded-3xl shadow-sm mb-6 relative overflow-hidden border border-[#D9D9D2]/30 dark:border-[#3c3c35]">
      {/* Decorative ambient subtle circle */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        
        {/* Left column info & controls */}
        <div className="max-w-md">
          <div className="inline-flex items-center space-x-2 bg-white/10 dark:bg-[#1c1c18] border border-white/20 dark:border-[#3c3c35] px-3 py-1 rounded-full text-xs font-semibold text-[#D4A373] mb-3 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#D4A373]" />
            <span>Thuật toán Random thông minh</span>
          </div>
          <h2 className="text-2xl font-serif italic tracking-tight md:text-3xl font-bold">
            Vòng Quay <span className="text-[#D4A373]">Ngẫu Nhiên</span>
          </h2>
          <p className="text-[#EBEBE5] dark:text-natural-dark-muted text-sm mt-2 leading-relaxed">
            Hệ thống tự động lựa chọn 1 cán bộ (chưa đủ 2 lượt) và xếp vào 1 ngày bất kỳ còn trống trong thời gian 
            <span className="text-[#D4A373] font-semibold font-serif italic"> 01/06 - 31/07</span>. Bảo đảm chia đều 2 lượt/người, không trùng lắp.
          </p>

          <div className="flex flex-wrap gap-2.5 mt-5">
            <button
              onClick={startSpin}
              disabled={isSpinning || isScheduleFull}
              id="btn-spin-single"
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xs cursor-pointer ${
                isScheduleFull
                  ? 'bg-[#484833] dark:bg-[#20201b] text-[#9A9A8A] cursor-not-allowed border border-[#3c3c35]'
                  : 'bg-[#D4A373] hover:bg-[#c39262] text-[#434338] hover:text-white'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isSpinning ? 'Đang quay...' : 'Quay ngẫu nhiên'}</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Hệ thống sẽ xếp ngẫu nhiên hoàn toàn lịch còn lại cho tất cả nhân sự. Bạn có đồng ý?')) {
                  onAssignAllRandom();
                  playClickSound(600, 'sine', 0.2);
                }
              }}
              disabled={isSpinning || isScheduleFull}
              id="btn-spin-all"
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] border cursor-pointer ${
                isScheduleFull
                  ? 'border-[#484833] text-[#9A9A8A] cursor-not-allowed'
                  : 'border-[#D4A373]/40 bg-white/10 hover:bg-white/25 text-[#EBEBE5]'
              }`}
            >
              <Zap className="w-4 h-4 text-[#D4A373] fill-[#D4A373]" />
              <span>Xếp toàn bộ lịch còn lại</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Hành động này sẽ XÓA TOÀN BỘ lịch phân công hiện tại. Bạn chắc chắn muốn reset?')) {
                  onReset();
                  setCelebration(null);
                  playClickSound(150, 'sawtooth', 0.3);
                }
              }}
              id="btn-reset"
              className="flex items-center space-x-2 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-200 font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset dữ liệu</span>
            </button>
          </div>
        </div>

        {/* Right column - Dual Slots Display */}
        <div className="flex-1 w-full max-w-lg">
          <div className="bg-[#484833] dark:bg-[#1a1a15] border border-white/10 dark:border-[#3c3c35] rounded-2xl p-4 md:p-6 shadow-xs relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Personnel Reel */}
              <div className="bg-[#5A5A40] dark:bg-[#252520] border border-white/10 dark:border-[#3c3c35] rounded-xl p-4 relative overflow-hidden">
                <span className="absolute top-2 left-2 text-[10px] font-mono tracking-wider text-[#9A9A8A] uppercase">Cán bộ</span>
                <div className="h-24 flex items-center justify-center text-center mt-2">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={currentSpinName}
                      initial={{ y: isSpinning ? 20 : 0, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="font-serif italic font-extrabold text-lg md:text-xl text-[#F9F9F7] tracking-tight"
                    >
                      {currentSpinName}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="w-full bg-[#484833] dark:bg-black/20 h-1.5 rounded-full overflow-hidden absolute bottom-0 left-0">
                  {isSpinning && <div className="h-full bg-[#D4A373] animate-pulse w-full" />}
                </div>
              </div>

              {/* Date Reel */}
              <div className="bg-[#5A5A40] dark:bg-[#252520] border border-white/10 dark:border-[#3c3c35] rounded-xl p-4 relative overflow-hidden">
                <span className="absolute top-2 left-2 text-[10px] font-mono tracking-wider text-[#9A9A8A] uppercase">Ngày trực</span>
                <div className="h-24 flex items-center justify-center text-center mt-2">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={currentSpinDate}
                      initial={{ y: isSpinning ? 20 : 0, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="font-serif italic font-extrabold text-[#D4A373] text-lg md:text-xl font-mono"
                    >
                      {currentSpinDate}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="w-full bg-[#484833] dark:bg-black/20 h-1.5 rounded-full overflow-hidden absolute bottom-0 left-0">
                  {isSpinning && <div className="h-full bg-[#D4A373] animate-pulse w-full" />}
                </div>
              </div>

            </div>

            {/* Complete banner when fully assigned */}
            {isScheduleFull && !isSpinning && (
              <div className="mt-4 p-4 bg-[#D4A373]/10 border border-[#D4A373]/30 rounded-xl flex items-center space-x-3 text-[#D4A373]">
                <Trophy className="w-6 h-6 shrink-0 text-[#D4A373]" />
                <div className="text-xs">
                  <p className="font-bold text-sm">Hoàn thành phân công lịch trực!</p>
                  <p className="opacity-80">Tất cả ngày trực đã được ghép đôi hoặc toàn bộ cán bộ đã đủ định mức 2 ngày trực.</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Celebration Popup Alert */}
      <AnimatePresence>
        {celebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -15 }}
            className="mt-5 p-4 bg-white/10 border border-[#D4A373]/40 rounded-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-[#D4A373] animate-bounce">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <span className="text-[10px] text-[#EBEBE5] font-bold uppercase tracking-wider block">Phân công thành công</span>
                <span className="text-sm font-semibold text-white">
                  Thầy/Cô <strong className="text-[#D4A373]">{celebration.personName}</strong> trực ngày{' '}
                  <strong className="text-[#D4A373]">{celebration.date} ({celebration.dayOfWeek})</strong>
                </span>
              </div>
            </div>
            <button 
              onClick={() => setCelebration(null)}
              className="text-xs text-[#EBEBE5] hover:text-white px-2.5 py-1.5 bg-[#484833] rounded-md transition-all active:scale-95 cursor-pointer"
            >
              Đóng
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
