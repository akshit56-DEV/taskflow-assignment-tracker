import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { AssignmentFormModal } from '@/components/assignments/AssignmentFormModal';
import { AssignmentDetailsModal } from '@/components/assignments/AssignmentDetailsModal';
import { AssignmentWithDetails } from '@/types';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global Assignment Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<AssignmentWithDetails | null>(null);
  const [activeDetailsAssignmentId, setActiveDetailsAssignmentId] = useState<string | null>(null);

  const handleOpenAddModal = () => {
    setAssignmentToEdit(null);
    setAddModalOpen(true);
  };

  const handleEditAssignment = (assignment: AssignmentWithDetails) => {
    setAssignmentToEdit(assignment);
    setAddModalOpen(true);
  };

  const handleOpenDetails = (assignmentId: string) => {
    setActiveDetailsAssignmentId(assignmentId);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Header
          onOpenAddModal={handleOpenAddModal}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onSelectAssignment={handleOpenDetails}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet
            context={{
              onOpenAddModal: handleOpenAddModal,
              onEditAssignment: handleEditAssignment,
              onOpenDetails: handleOpenDetails,
            }}
          />
        </main>

        <MobileNav onOpenAddModal={handleOpenAddModal} />
      </div>

      {/* Add / Edit Assignment Modal */}
      <AssignmentFormModal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setAssignmentToEdit(null);
        }}
        assignmentToEdit={assignmentToEdit}
      />

      {/* Assignment Details Inspector Modal */}
      <AssignmentDetailsModal
        assignmentId={activeDetailsAssignmentId}
        isOpen={!!activeDetailsAssignmentId}
        onClose={() => setActiveDetailsAssignmentId(null)}
        onEdit={handleEditAssignment}
      />
    </div>
  );
};
