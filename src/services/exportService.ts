import { AssignmentWithDetails, Subject } from '@/types';
import { getDerivedWorkflowStage, getWorkflowStageLabel } from '@/utils/workflowUtils';

export function exportAssignmentsToCsv(
  assignments: AssignmentWithDetails[],
  subjects: Subject[]
): void {
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  const headers = [
    'Title',
    'Subject',
    'Assigned Date',
    'Due Date',
    'Priority',
    'Workflow Status',
    'Completed',
    'Completed Date',
    'Uploaded to ERP',
    'ERP Upload Date',
    'Professor Checked',
    'Professor Checked Date',
    'Description',
    'Notes',
    'Attachments Count',
    'Links Count',
    'Created At',
  ];

  const escapeCsv = (val: unknown) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = assignments.map((a) => {
    const stage = getDerivedWorkflowStage(a);
    return [
      escapeCsv(a.title),
      escapeCsv(a.subject?.name || subjectMap.get(a.subject_id) || 'Unknown'),
      escapeCsv(a.assigned_date || ''),
      escapeCsv(a.due_date),
      escapeCsv(a.priority),
      escapeCsv(getWorkflowStageLabel(stage)),
      escapeCsv(a.completed ? 'Yes' : 'No'),
      escapeCsv(a.completed_at || ''),
      escapeCsv(a.uploaded_to_erp ? 'Yes' : 'No'),
      escapeCsv(a.erp_upload_date || ''),
      escapeCsv(a.professor_checked ? 'Yes' : 'No'),
      escapeCsv(a.checked_at || ''),
      escapeCsv(a.description || ''),
      escapeCsv(a.notes || ''),
      escapeCsv(a.attachments?.length || 0),
      escapeCsv(a.links?.length || 0),
      escapeCsv(a.created_at),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TaskFlow_Assignments_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAssignmentsToJson(
  assignments: AssignmentWithDetails[],
  subjects: Subject[]
): void {
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  const cleanData = assignments.map((a) => {
    const stage = getDerivedWorkflowStage(a);
    return {
      id: a.id,
      title: a.title,
      subject: a.subject?.name || subjectMap.get(a.subject_id) || 'Unknown',
      description: a.description,
      assigned_date: a.assigned_date,
      due_date: a.due_date,
      priority: a.priority,
      progress_status: a.progress_status,
      derived_stage: getWorkflowStageLabel(stage),
      completed: a.completed,
      completed_at: a.completed_at,
      uploaded_to_erp: a.uploaded_to_erp,
      erp_upload_date: a.erp_upload_date,
      professor_checked: a.professor_checked,
      checked_at: a.checked_at,
      notes: a.notes,
      attachments_count: a.attachments?.length || 0,
      links: a.links?.map((l) => ({ title: l.title, url: l.url })) || [],
      created_at: a.created_at,
      updated_at: a.updated_at,
    };
  });

  const jsonStr = JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      app: 'TaskFlow',
      version: '1.0',
      total_records: cleanData.length,
      assignments: cleanData,
    },
    null,
    2
  );

  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TaskFlow_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
