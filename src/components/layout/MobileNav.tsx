import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  Columns3,
  Target,
  Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileNavProps {
  onOpenAddModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenAddModal }) => {
  return (
    <>
      {/* Figma Floating Quick Add Button (Figma 16 — Mobile / Quick add #7:34386) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95, y: 1 }}
        transition={{ duration: 0.2 }}
        type="button"
        onClick={onOpenAddModal}
        className="lg:hidden fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-[#5B4DF5] text-white shadow-tf-modal flex items-center justify-center cursor-pointer border-2 border-white dark:border-[#0B1020]"
        title="Quick Add Assignment"
      >
        <Plus className="w-5 h-5" />
      </motion.button>

      {/* Figma Mobile Bottom Tabs (Figma 16 — Mobile / Mobile bottom tabs #7:34370) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B1020]/95 backdrop-blur-lg border-t border-[#E6E9F2] dark:border-[#1E293B] px-2 py-2 pb-safe shadow-tf-modal">
        <div className="flex items-center justify-around">
          {/* 1. Dashboard */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-bold transition-colors ${
                isActive
                  ? 'text-[#5B4DF5]'
                  : 'text-[#5C6175] dark:text-[#94A3B8] hover:text-[#171A2E]'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>

          {/* 2. Assignments */}
          <NavLink
            to="/assignments"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-bold transition-colors ${
                isActive
                  ? 'text-[#5B4DF5]'
                  : 'text-[#5C6175] dark:text-[#94A3B8] hover:text-[#171A2E]'
              }`
            }
          >
            <ListTodo className="w-4 h-4" />
            <span>Assignments</span>
          </NavLink>

          {/* 3. Calendar */}
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-bold transition-colors ${
                isActive
                  ? 'text-[#5B4DF5]'
                  : 'text-[#5C6175] dark:text-[#94A3B8] hover:text-[#171A2E]'
              }`
            }
          >
            <CalendarDays className="w-4 h-4" />
            <span>Calendar</span>
          </NavLink>

          {/* 4. Kanban */}
          <NavLink
            to="/kanban"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-bold transition-colors ${
                isActive
                  ? 'text-[#5B4DF5]'
                  : 'text-[#5C6175] dark:text-[#94A3B8] hover:text-[#171A2E]'
              }`
            }
          >
            <Columns3 className="w-4 h-4" />
            <span>Kanban</span>
          </NavLink>

          {/* 5. Focus Mode */}
          <NavLink
            to="/focus"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-bold transition-colors ${
                isActive
                  ? 'text-[#5B4DF5]'
                  : 'text-[#5C6175] dark:text-[#94A3B8] hover:text-[#171A2E]'
              }`
            }
          >
            <Target className="w-4 h-4" />
            <span>Focus</span>
          </NavLink>
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
