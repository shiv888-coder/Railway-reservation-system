import React from 'react';
import { Award, GraduationCap } from 'lucide-react';

interface ProjectBadgeProps {
  onOpenOOPModal?: () => void;
}

export const ProjectBadge: React.FC<ProjectBadgeProps> = ({ onOpenOOPModal }) => {
  return (
    <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white px-4 py-2 border-b border-blue-900/50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="font-semibold text-slate-100">B.Tech CSE OOP Mini Project</span>
          <span className="text-blue-300 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden sm:inline">Student: <strong className="text-white font-medium">Shiv Shankar Mal</strong></span>
          <span className="text-blue-300 hidden md:inline">|</span>
          <span className="text-slate-300 hidden md:inline">Group: <strong className="text-white font-medium">9</strong></span>
          <span className="text-blue-300 hidden lg:inline">|</span>
          <span className="text-slate-300 hidden lg:inline">Roll No: <strong className="text-white font-mono font-medium">2760012408</strong></span>
        </div>

        <button
          onClick={onOpenOOPModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-800/60 hover:bg-blue-700/80 text-blue-100 transition-colors cursor-pointer border border-blue-700/50"
        >
          <Award className="w-3.5 h-3.5 text-amber-300" />
          <span>OOP Concepts & Architecture</span>
        </button>
      </div>
    </div>
  );
};
