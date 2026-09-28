import React, { useState } from 'react';
import { AssignmentAttachment } from '@/types';
import {
  uploadAttachment,
  downloadAttachment,
  deleteAttachment,
  getAttachmentDownloadUrl,
} from '@/services/attachmentService';
import {
  Paperclip,
  UploadCloud,
  File,
  FileText,
  Image as ImageIcon,
  Download,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { formatFriendlyDate } from '@/utils/dateUtils';

interface AttachmentUploaderProps {
  assignmentId: string;
  attachments: AssignmentAttachment[];
  onAttachmentsUpdated: () => void;
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  assignmentId,
  attachments,
  onAttachmentsUpdated,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <ImageIcon className="w-4 h-4 text-emerald-500" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('officedocument'))
      return <FileText className="w-4 h-4 text-blue-500" />;
    return <File className="w-4 h-4 text-slate-500" />;
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds maximum allowed file size of 50MB.`);
        }
        await uploadAttachment(assignmentId, file);
      }
      onAttachmentsUpdated();
    } catch (err: unknown) {
      console.error('File upload error:', err);
      setUploadError((err as Error).message || 'Failed to upload attachment.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (attachment: AssignmentAttachment) => {
    try {
      await downloadAttachment(attachment.file_path, attachment.file_name);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file. Please try again.');
    }
  };

  const handleOpen = async (attachment: AssignmentAttachment) => {
    try {
      const url = await getAttachmentDownloadUrl(attachment.file_path);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Open file error:', err);
      alert('Failed to open file. Please try again.');
    }
  };

  const handleDelete = async (attachment: AssignmentAttachment) => {
    if (window.confirm(`Delete "${attachment.file_name}"?`)) {
      try {
        await deleteAttachment(attachment.id, attachment.file_path, assignmentId);
        onAttachmentsUpdated();
      } catch (err) {
        console.error('Delete attachment error:', err);
        alert('Failed to delete file.');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
          isDragOver
            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-brand-600 dark:text-brand-400">
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <UploadCloud className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isUploading ? 'Uploading files to secure storage...' : 'Click or drag files here to upload'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Supports PDF, Word, PPT, Excel, Images, ZIP (up to 50MB)
            </p>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/80 rounded-xl text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5" />
            Uploaded Attachments ({attachments.length})
          </h5>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-3 gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {getFileIcon(att.file_type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {att.file_name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatFileSize(att.file_size)} • {formatFriendlyDate(att.created_at.split('T')[0])}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpen(att)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(att)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                    title="Download file"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(att)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                    title="Delete attachment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
