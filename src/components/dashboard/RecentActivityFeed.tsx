import React, { useEffect, useState } from 'react';
import { ActivityLog } from '@/types';
import { getRecentActivity } from '@/services/activityService';
import { formatFriendlyDateTime } from '@/utils/dateUtils';
import {
  Activity,
  PlusCircle,
  CheckCircle2,
  UploadCloud,
  CheckCheck,
  Trash2,
  Edit,
  RotateCcw,
  Paperclip,
} from 'lucide-react';

export const RecentActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getRecentActivity(15)
      .then((data) => setActivities(data))
      .finally(() => setLoading(false));
  }, []);

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'assignment_created':
        return <PlusCircle className="w-3.5 h-3.5 text-blue-500" />;
      case 'assignment_completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'erp_uploaded':
        return <UploadCloud className="w-3.5 h-3.5 text-indigo-500" />;
      case 'professor_checked':
        return <CheckCheck className="w-3.5 h-3.5 text-purple-500" />;
      case 'assignment_deleted':
      case 'assignment_permanently_deleted':
        return <Trash2 className="w-3.5 h-3.5 text-red-500" />;
      case 'assignment_restored':
        return <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />;
      case 'attachment_uploaded':
        return <Paperclip className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Edit className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getActivityText = (act: ActivityLog) => {
    const details = act.details as Record<string, unknown> | null;
    const title = details?.title || details?.name || 'an item';

    switch (act.action) {
      case 'assignment_created':
        return `Created assignment "${title}"`;
      case 'assignment_updated':
        return `Updated assignment "${title}"`;
      case 'assignment_completed':
        return `Completed assignment "${title}"`;
      case 'assignment_uncompleted':
        return `Marked "${title}" as not completed`;
      case 'erp_uploaded':
        return `Uploaded "${title}" to ERP`;
      case 'erp_upload_removed':
        return `Removed ERP upload for "${title}"`;
      case 'professor_checked':
        return `Marked "${title}" as Professor Checked`;
      case 'attachment_uploaded':
        return `Uploaded attachment for assignment`;
      case 'attachment_deleted':
        return `Deleted attachment`;
      case 'assignment_deleted':
        return `Moved "${title}" to trash`;
      case 'assignment_restored':
        return `Restored "${title}" from trash`;
      case 'subject_created':
        return `Added subject "${title}"`;
      default:
        return act.action.replace(/_/g, ' ');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-600" />
          Recent Activity
        </h4>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 py-4 text-center animate-pulse">Loading activity...</p>
      ) : activities.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-72 overflow-y-auto pr-1">
          {activities.map((act) => (
            <div key={act.id} className="py-2.5 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 mt-0.5">
                {getActivityIcon(act.action)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                  {getActivityText(act)}
                </p>
                <p className="text-[10px] text-slate-400">
                  {formatFriendlyDateTime(act.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic py-4 text-center">No recent activity logged yet.</p>
      )}
    </div>
  );
};
