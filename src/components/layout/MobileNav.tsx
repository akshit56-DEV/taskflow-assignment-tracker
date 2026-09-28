import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListTodo, CalendarDays, BookOpen, Plus } from 'lucide-react';

interface MobileNavProps {
  onOpenAddModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenAddModal }) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2">
      <div className="flex items-center justify-around">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium ${
              isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/assignments"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium ${
              isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <ListTodo className="w-5 h-5" />
          <span>Tasks</span>
        </NavLink>

        {/* Center Quick Add Floating Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="w-11 h-11 -mt-5 rounded-full bg-brand-600 text-white shadow-lg flex items-center justify-center hover:bg-brand-700 active:scale-95 transition-all"
          title="Add New Assignment"
        >
          <Plus className="w-6 h-6" />
        </button>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium ${
              isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <CalendarDays className="w-5 h-5" />
          <span>Calendar</span>
        </NavLink>

        <NavLink
          to="/subjects"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium ${
              isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <BookOpen className="w-5 h-5" />
          <span>Subjects</span>
        </NavLink>
      </div>
    </div>
  );
};
