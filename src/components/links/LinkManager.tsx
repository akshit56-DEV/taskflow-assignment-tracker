import React, { useState } from 'react';
import { AssignmentLink } from '@/types';
import { addAssignmentLink, updateAssignmentLink, deleteAssignmentLink } from '@/services/linkService';
import { Link2, Plus, ExternalLink, Trash2, Edit2, Check, X, AlertCircle } from 'lucide-react';

interface LinkManagerProps {
  assignmentId: string;
  links: AssignmentLink[];
  onLinksUpdated: () => void;
}

export const LinkManager: React.FC<LinkManagerProps> = ({
  assignmentId,
  links,
  onLinksUpdated,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newUrl.trim()) return;

    try {
      await addAssignmentLink(assignmentId, newTitle, newUrl);
      setNewTitle('');
      setNewUrl('');
      setIsAdding(false);
      onLinksUpdated();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to add link');
    }
  };

  const startEditing = (link: AssignmentLink) => {
    setEditingLinkId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setError(null);
  };

  const handleUpdateLink = async (linkId: string) => {
    setError(null);
    try {
      await updateAssignmentLink(linkId, editTitle, editUrl);
      setEditingLinkId(null);
      onLinksUpdated();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to update link');
    }
  };

  const handleDelete = async (linkId: string) => {
    if (window.confirm('Delete this link?')) {
      try {
        await deleteAssignmentLink(linkId);
        onLinksUpdated();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5" />
          Useful Links ({links.length})
        </h5>

        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Link
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Link Form */}
      {isAdding && (
        <form
          onSubmit={handleAddLink}
          className="p-3 rounded-xl border border-brand-200 dark:border-brand-900 bg-brand-50/40 dark:bg-brand-950/20 space-y-2 animate-fade-in"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Title (e.g. ERP Portal, Google Drive)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="URL (https://...)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              required
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setError(null);
              }}
              className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm"
            >
              Save Link
            </button>
          </div>
        </form>
      )}

      {/* Links List */}
      {links.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          {links.map((link) => (
            <div key={link.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              {editingLinkId === link.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingLinkId(null)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateLink(link.id)}
                      className="p-1 text-emerald-600 hover:text-emerald-700"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{link.title}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                      <p className="text-[11px] text-slate-400 truncate max-w-sm">{link.url}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditing(link)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(link.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        !isAdding && (
          <p className="text-xs text-slate-400 italic py-1">No useful links added yet.</p>
        )
      )}
    </div>
  );
};
