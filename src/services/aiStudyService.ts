import { supabase } from '@/lib/supabase';
import { saveAssignmentFlashcards } from '@/utils/flashcardStorage';

export interface AISolutionItem {
  question: string;
  answer: string;
  steps?: string[];
  finalAnswer?: string;
}

export interface AIExplanationItem {
  concept: string;
  detail: string;
  practicalExample?: string;
}

export interface AIFlashcardGenerated {
  front: string;
  back: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AIStudyAnalysis {
  assignmentId: string;
  assignmentTitle: string;
  subjectName?: string;
  analyzedAt: string;
  fileName?: string;
  questions: string[];
  solutions: AISolutionItem[];
  explanations: AIExplanationItem[];
  keyConcepts: string[];
  flashcards: AIFlashcardGenerated[];
  examTopics: string[];
}

export interface AIAnalysisResult {
  success: boolean;
  data?: AIStudyAnalysis;
  error?: string;
  isServerKeyRequired?: boolean;
}

const STORAGE_PREFIX = 'taskflow_ai_study_';

function isServerKeyRequiredPayload(payload: unknown): boolean {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    (payload as { isServerKeyRequired?: boolean }).isServerKeyRequired === true
  );
}

async function readInvokeErrorPayload(error: unknown, data: unknown): Promise<unknown> {
  if (data && typeof data === 'object') return data;

  const context = (error as { context?: Response })?.context;
  if (context && typeof context.json === 'function') {
    try {
      return await context.json();
    } catch {
      return null;
    }
  }

  return null;
}

export function getStoredAnalysis(assignmentId: string): AIStudyAnalysis | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${assignmentId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load stored AI analysis:', err);
    return null;
  }
}

export function saveStoredAnalysis(analysis: AIStudyAnalysis): void {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${analysis.assignmentId}`,
      JSON.stringify(analysis)
    );
  } catch (err) {
    console.error('Failed to cache AI analysis:', err);
  }
}

export function deleteStoredAnalysis(assignmentId: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${assignmentId}`);
  } catch (err) {
    console.error('Failed to delete stored AI analysis:', err);
  }
}

/**
 * Executes AI Assignment Study Assistant analysis.
 * Adheres strictly to security guidelines: Zero AI API keys in client-side code.
 * Routes securely through Supabase Edge Function: React -> Edge Function -> AI Provider -> Structured JSON -> React.
 */
export async function analyzeAssignmentMaterial(params: {
  assignmentId: string;
  assignmentTitle: string;
  subjectName?: string;
  description?: string;
  file?: File;
  fileName?: string;
  fileUrl?: string;
}): Promise<AIAnalysisResult> {
  const { assignmentId, assignmentTitle, subjectName, description, file, fileName, fileUrl } = params;

  try {
    // 1. Prepare payload for edge function
    let fileBase64: string | undefined;
    let fileMimeType: string | undefined;

    if (file) {
      fileMimeType = file.type || 'application/octet-stream';
      // Read file as base64 for multimodal analysis if size is reasonable (< 15MB)
      if (file.size <= 15 * 1024 * 1024) {
        fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // strip data:*/*;base64,
            const base64 = result.split(',')[1] || result;
            resolve(base64);
          };
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(file);
        });
      }
    }

    // 2. Invoke Supabase Edge Function 'analyze-assignment'
    const { data, error } = await supabase.functions.invoke('analyze-assignment', {
      body: {
        assignmentId,
        assignmentTitle,
        subjectName,
        description,
        fileName: fileName || file?.name,
        fileUrl,
        fileBase64,
        fileMimeType,
      },
    });

    if (error) {
      console.warn('Edge function call error:', error);
      const payload = await readInvokeErrorPayload(error, data);
      const missingKey = isServerKeyRequiredPayload(payload);
      const payloadError =
        typeof payload === 'object' && payload !== null
          ? (payload as { error?: string }).error
          : undefined;
      return {
        success: false,
        error: payloadError || error.message || 'AI service call failed.',
        isServerKeyRequired: missingKey,
      };
    }

    if (!data || !data.questions) {
      const missingKey = isServerKeyRequiredPayload(data);
      const payloadError =
        typeof data === 'object' && data !== null ? (data as { error?: string }).error : undefined;
      return {
        success: false,
        error: payloadError || 'Edge function returned invalid or empty response structure.',
        isServerKeyRequired: missingKey,
      };
    }

    const structuredAnalysis: AIStudyAnalysis = {
      assignmentId,
      assignmentTitle,
      subjectName,
      analyzedAt: new Date().toISOString(),
      fileName: fileName || file?.name,
      questions: data.questions || [],
      solutions: data.solutions || [],
      explanations: data.explanations || [],
      keyConcepts: data.keyConcepts || [],
      flashcards: data.flashcards || [],
      examTopics: data.examTopics || [],
    };

    // 3. Cache analysis locally
    saveStoredAnalysis(structuredAnalysis);

    // 4. Automatically generate and persist flashcards
    if (structuredAnalysis.flashcards && structuredAnalysis.flashcards.length > 0) {
      saveAssignmentFlashcards(
        assignmentId,
        assignmentTitle,
        subjectName,
        structuredAnalysis.flashcards
      );
    }

    return {
      success: true,
      data: structuredAnalysis,
    };
  } catch (err: unknown) {
    console.error('AI Study Assistant invocation exception:', err);
    return {
      success: false,
      error: (err as Error).message || 'Failed to analyze assignment.',
      isServerKeyRequired: isServerKeyRequiredPayload(err),
    };
  }
}
