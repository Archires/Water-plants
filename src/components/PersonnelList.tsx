/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, Users, Plus, Trash2, Search, Sparkles, CheckCircle, HelpCircle } from 'lucide-react';
import { Personnel } from '../types';
import { parseExcelPersonnel } from '../utils/excelUtils';

interface PersonnelListProps {
  personnel: Personnel[];
  onUploadExcel: (file: File) => void;
  onUseDefaultMock: () => void;
  onAddPerson: (name: string) => void;
  onRemovePerson: (id: string) => void;
}

export function PersonnelList({
  personnel,
  onUploadExcel,
  onUseDefaultMock,
  onAddPerson,
  onRemovePerson
}: PersonnelListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [newName, setNewName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadExcel(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadExcel(e.dataTransfer.files[0]);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddPerson(newName.trim());
      setNewName('');
    }
  };

  // Filter names based on search
  const filteredPersonnel = personnel.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-[#252520] rounded-2xl border border-[#EBEBE5] dark:border-[#3c3c35] shadow-xs p-5 flex flex-col h-full">
      {/* Title block */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EBEBE5] dark:border-[#3c3c35]">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-[#F5F5F0] dark:bg-[#1c1c18] text-[#5A5A40] dark:text-[#8c8c70] rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif italic font-bold text-[#434338] dark:text-[#ebebe5] text-base">Danh Sách Nhân Sự</h3>
            <p className="text-xs text-[#9A9A8A]">Tổng cộng: {personnel.length} nhân sự</p>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      {personnel.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center py-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-sm p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? 'border-[#D4A373] bg-[#F5F5F0]/50 dark:bg-[#1c1c18] scale-[1.01]'
                : 'border-[#EBEBE5] dark:border-[#3c3c35] hover:border-[#D4A373] hover:bg-[#F9F9F7] dark:hover:bg-[#1c1c18]'
            }`}
          >
            <Upload className="w-10 h-10 text-[#9A9A8A] mb-3 animate-bounce" />
            <p className="text-sm font-semibold text-[#434338] dark:text-[#ebebe5]">Tải lên file Excel</p>
            <p className="text-xs text-[#9A9A8A] mt-1 max-w-xs">
              Kéo thả file .xlsx / .xls hoặc click để chọn. File gồm cột <strong className="text-[#5A5A40] dark:text-[#8c8c70]">STT</strong> và <strong className="text-[#5A5A40] dark:text-[#8c8c70]">Họ và tên</strong>.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls"
              className="hidden"
            />
          </div>

          <div className="mt-5 text-center">
            <span className="text-xs text-[#9A9A8A] block mb-2">— HOẶC —</span>
            <button
              onClick={onUseDefaultMock}
              className="text-xs font-semibold px-4 py-2 text-[#5A5A40] dark:text-[#8c8c70] bg-[#F5F5F0] dark:bg-[#1c1c18] hover:bg-[#EBEBE5] rounded-lg transition-all border border-[#EBEBE5] dark:border-[#3c3c35] cursor-pointer inline-flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sử dụng danh sách 30 cán bộ mẫu</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Controls & Search */}
          <div className="space-y-3 mb-4">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#9A9A8A]">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên giáo viên, cán bộ..."
                className="w-full pl-9 pr-4 py-2 border border-[#EBEBE5] dark:border-[#3c3c35] rounded-xl bg-[#F9F9F7] dark:bg-[#1a1a15] text-xs text-[#434338] dark:text-[#ebebe5] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] focus:border-[#5A5A40]"
              />
            </div>

            {/* Quick manual additions */}
            <form onSubmit={handleAddSubmit} className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Thêm nhanh công tác viên..."
                className="flex-1 px-3 py-2 border border-[#EBEBE5] dark:border-[#3c3c35] rounded-xl bg-transparent text-xs text-[#434338] dark:text-[#ebebe5] focus:outline-none focus:ring-1 focus:ring-[#D4A373]"
              />
              <button
                type="submit"
                className="p-2 bg-[#F5F5F0] dark:bg-[#32322a] hover:bg-[#5A5A40] dark:hover:bg-[#8c8c70] text-[#5A5A40] dark:text-[#ebebe5] hover:text-white rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* List Scroll Area */}
          <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-2">
            {filteredPersonnel.length === 0 ? (
              <p className="text-center text-xs text-[#9A9A8A] py-4">Không tìm thấy cán bộ phù hợp.</p>
            ) : (
              filteredPersonnel.map((person) => {
                const remaining = 2 - person.assignedCount;
                let badgeClass = 'bg-[#EBEBE5] text-[#9A9A8A] dark:bg-[#32322a] dark:text-[#9A9A8A]';
                let textRemaining = '0/2 lượt';
                
                if (remaining === 1) {
                  badgeClass = 'bg-[#D4A373] text-white';
                  textRemaining = '1/2 lượt';
                } else if (remaining === 0) {
                  badgeClass = 'bg-[#5A5A40] text-white';
                  textRemaining = '2/2 lượt';
                }

                return (
                  <div 
                    key={person.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-[#EBEBE5] dark:border-[#3c3c35]/60 bg-[#F9F9F7] dark:bg-[#20201a] hover:bg-[#F5F5F0] dark:hover:bg-[#2d2d25] transition-colors group"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-[10px] text-[#9A9A8A] font-mono w-5">#{person.stt}</span>
                      <p className="text-xs font-semibold text-[#434338] dark:text-[#ebebe5] truncate pr-2">
                        {person.name}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${badgeClass}`}>
                        {remaining === 0 && <CheckCircle className="w-2.5 h-2.5 inline mr-1 fill-current" />}
                        {textRemaining}
                      </span>
                      
                      <button
                        onClick={() => onRemovePerson(person.id)}
                        className="text-[#9A9A8A] hover:text-red-500 opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all hover:bg-red-50 dark:hover:bg-[#1a1a15]"
                        title="Xóa nhân sự"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Help box */}
          <div className="mt-4 pt-3 border-t border-[#EBEBE5] dark:border-[#3c3c35] flex gap-2 justify-between items-center text-[10px] text-[#9A9A8A]">
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-[#9A9A8A] shrink-0" />
              <span>Gợi ý: Click "Quay Ngẫu Nhiên" để bắt đầu xếp lịch.</span>
            </span>
            <button
              onClick={() => {
                if (window.confirm('Hành động này sẽ xóa danh mục nhân sự hiện tại để tải lại từ đầu. Bạn đồng ý?')) {
                  onUseDefaultMock();
                }
              }}
              className="text-[#5A5A40] dark:text-[#8c8c70] hover:underline shrink-0 font-semibold"
            >
              Reset cán bộ
            </button>
          </div>
        </>
      )}
    </div>
  );
}
