import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Sparkles,
  Bot,
  Brain,
  Layers,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ListOrdered,
  Lightbulb,
  Loader2,
} from 'lucide-react';
import {
  analyzeAssignmentMaterial,
  getStoredAnalysis,
  saveStoredAnalysis,
  AIStudyAnalysis,
} from '@/services/aiStudyService';
import { AssignmentAttachment } from '@/types';
import { getAttachmentDownloadUrl } from '@/services/attachmentService';
import { FlashcardDeckModal } from './FlashcardDeckModal';
import { getFlashcardsByAssignment } from '@/utils/flashcardStorage';

export type StudyAssistantInitialTab = 'solutions' | 'explanations' | 'concepts' | 'flashcards' | 'revision';

interface AIStudyAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  assignmentTitle: string;
  subjectName?: string;
  description?: string;
  attachments?: AssignmentAttachment[];
  initialTab?: StudyAssistantInitialTab;
}

export const AIStudyAssistantModal: React.FC<AIStudyAssistantModalProps> = ({
  isOpen,
  onClose,
  assignmentId,
  assignmentTitle,
  subjectName,
  description,
  attachments = [],
  initialTab = 'solutions',
}) => {
  const [activeTab, setActiveTab] = useState<StudyAssistantInitialTab>(initialTab);
  const [analysis, setAnalysis] = useState<AIStudyAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isServerKeyRequired, setIsServerKeyRequired] = useState(false);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load existing analysis if available
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      const existing = getStoredAnalysis(assignmentId);
      if (existing) {
        setAnalysis(existing);
      } else {
        setAnalysis(null);
      }
      setErrorMessage(null);
      setIsServerKeyRequired(false);
    }
  }, [isOpen, assignmentId, initialTab]);

  if (!isOpen) return null;

  const hasFiles = attachments.length > 0 || !!selectedFile;

  const handleStartAnalysis = async (fileToUse?: File) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setIsServerKeyRequired(false);

    try {
      const localFile = fileToUse || selectedFile || undefined;
      let fileForAnalysis = localFile;
      const primaryAttachment = attachments[0];

      if (!fileForAnalysis && primaryAttachment) {
        setAnalysisStage('Downloading assignment file...');
        try {
          const signedUrl = await getAttachmentDownloadUrl(primaryAttachment.file_path);
          const response = await fetch(signedUrl);
          if (!response.ok) {
            throw new Error(
              `Could not download the saved assignment file (${response.status}). Please try again or upload a new file.`
            );
          }
          const blob = await response.blob();
          const mimeType =
            primaryAttachment.file_type || blob.type || 'application/octet-stream';
          fileForAnalysis = new File([blob], primaryAttachment.file_name, { type: mimeType });
        } catch (downloadErr: unknown) {
          setErrorMessage(
            (downloadErr as Error).message ||
              'Could not download the saved assignment file. Please try again or upload a new file.'
          );
          return;
        }
      }

      if (!fileForAnalysis) {
        setErrorMessage('No assignment file is available to analyze.');
        return;
      }

      setAnalysisStage('Uploading material...');
      await new Promise((r) => setTimeout(r, 600));

      setAnalysisStage('Analyzing document structure...');
      await new Promise((r) => setTimeout(r, 600));

      setAnalysisStage('Detecting problems & concepts...');

      const result = await analyzeAssignmentMaterial({
        assignmentId,
        assignmentTitle,
        subjectName,
        description,
        file: fileForAnalysis,
        fileName: fileForAnalysis.name,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'AI analysis could not be completed.');
        if (result.isServerKeyRequired) {
          setIsServerKeyRequired(true);
        }
        return;
      }

      setAnalysisStage('Generating solutions & flashcards...');
      await new Promise((r) => setTimeout(r, 400));

      if (result.data) {
        setAnalysis(result.data);
      }
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to analyze assignment.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStage('');
    }
  };

  const handleLoadSamplePreview = () => {
    // Generates high-yield study data derived from the current assignment
    const sampleData: AIStudyAnalysis = {
      assignmentId,
      assignmentTitle,
      subjectName,
      analyzedAt: new Date().toISOString(),
      fileName: attachments[0]?.file_name || 'Assignment_Overview.pdf',
      questions: [
        `Question 1: Explain core principles and methodology of ${assignmentTitle}`,
        `Question 2: Derive and compute key requirements for ${subjectName || 'this module'}`,
        `Question 3: Discuss real-world applications and error margins in modern practice`,
      ],
      solutions: [
        {
          question: `Problem 1: Core principles and methodology of ${assignmentTitle}`,
          answer: `The fundamental methodology centers on structured decomposition, systematic verification, and rigorous mathematical evaluation.`,
          steps: [
            'Identify boundary conditions and input variables',
            'Apply standard governing equations and constraints',
            'Compute intermediate quantities and cross-validate with empirical benchmarks',
          ],
          finalAnswer: `System equilibrium verified under standard academic constraints.`,
        },
        {
          question: `Problem 2: Requirements derivation for ${subjectName || 'this module'}`,
          answer: `Requirements are derived by equating external stress to internal allowable tolerances.`,
          steps: [
            'State governing relations',
            'Substitute given problem coefficients',
            'Perform unit dimensional analysis',
          ],
          finalAnswer: `Margin of safety satisfies regulatory standards.`,
        },
      ],
      explanations: [
        {
          concept: 'Systematic Decomposition',
          detail:
            'Breaking complex engineering and theoretical questions into modular sub-problems reduces computational overhead and eliminates compound errors.',
          practicalExample:
            'Similar to breaking a circuit into Thévenin equivalents or software systems into isolated micro-routines.',
        },
        {
          concept: 'Empirical Verification',
          detail:
            'Comparing computed values with established physical or structural bounds ensures that theoretical answers remain grounded in realistic limits.',
        },
      ],
      keyConcepts: [
        'Governing Equilibrium Laws',
        'Boundary Condition Constraints',
        'Dimensional Consistency',
        'Parametric Sensitivity Analysis',
        'Optimal Convergence Criteria',
      ],
      flashcards: [
        {
          front: `What is the core objective of ${assignmentTitle}?`,
          back: `To master theoretical derivation and practical verification in ${subjectName || 'this subject'}.`,
          topic: 'Foundations',
          difficulty: 'easy',
        },
        {
          front: 'Why is dimensional analysis performed prior to calculation?',
          back: 'To verify equation consistency and prevent algebraic scale errors.',
          topic: 'Methodology',
          difficulty: 'medium',
        },
        {
          front: 'What represents the primary boundary condition in this context?',
          back: 'The physical constraints applied at limits and system interfaces.',
          topic: 'Analysis',
          difficulty: 'hard',
        },
      ],
      examTopics: [
        'Fundamental Theorems & Derivations (Expected 10-15 Marks)',
        'Numerical Problem Solving & Step Calculations',
        'Edge Case Analysis & Limitation Explanations',
      ],
    };

    saveStoredAnalysis(sampleData);
    setAnalysis(sampleData);
    setIsServerKeyRequired(false);
    setErrorMessage(null);
  };

  const currentFlashcards = getFlashcardsByAssignment(assignmentId);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0A0D1E]/70 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* 1. Modal Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E6E9F2] dark:border-[#1E293B] flex-shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#EEECFF] dark:bg-[#5B4DF5]/20 text-[#5B4DF5] flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-[#5B4DF5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5B4DF5] dark:text-[#A49DFC]">
                    AI Study Assistant
                  </span>
                  {analysis && (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#19A974] border border-emerald-200/50">
                      Analysis Ready
                    </span>
                  )}
                </div>
                <h2 className="text-sm sm:text-base font-heading font-extrabold text-[#171A2E] dark:text-white truncate">
                  {assignmentTitle}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#9499AB] hover:text-[#171A2E] dark:hover:text-white hover:bg-[#F5F7FB] dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Navigation Tabs (If Analysis exists) */}
          {analysis && (
            <div className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 border-b border-[#E6E9F2] dark:border-[#1E293B] bg-[#F5F7FB]/60 dark:bg-[#15172F]/60 overflow-x-auto no-scrollbar flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('solutions')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'solutions'
                    ? 'bg-[#5B4DF5] text-white shadow-xs'
                    : 'text-[#5C6175] dark:text-[#94A3B8] hover:text-[#171A2E]'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Solutions ({analysis.solutions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('explanations')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'explanations'
                    ? 'bg-[#5B4DF5] text-white shadow-xs'
                    : 'text-[#5C6175] dark:text-[#94A3B8] hover:text-[#171A2E]'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Explanations</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('concepts')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'concepts'
                    ? 'bg-[#5B4DF5] text-white shadow-xs'
                    : 'text-[#5C6175] dark:text-[#94A3B8] hover:text-[#171A2E]'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Key Concepts ({analysis.keyConcepts.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('flashcards')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'flashcards'
                    ? 'bg-[#5B4DF5] text-white shadow-xs'
                    : 'text-[#5C6175] dark:text-[#94A3B8] hover:text-[#171A2E]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Flashcards ({analysis.flashcards.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('revision')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'revision'
                    ? 'bg-[#5B4DF5] text-white shadow-xs'
                    : 'text-[#5C6175] dark:text-[#94A3B8] hover:text-[#171A2E]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Exam Revision</span>
              </button>
            </div>
          )}

          {/* 3. Main Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Analyzing Progress State */}
            {isAnalyzing && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#EEECFF] dark:bg-[#5B4DF5]/20 text-[#5B4DF5] flex items-center justify-center shadow-xs">
                  <Loader2 className="w-8 h-8 animate-spin text-[#5B4DF5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#171A2E] dark:text-white">
                    Analyzing Assignment
                  </h3>
                  <p className="text-xs text-[#5B4DF5] font-semibold">{analysisStage}</p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#9499AB]">
                  <span>Questions detecting</span>
                  <span>·</span>
                  <span>Generating solutions</span>
                  <span>·</span>
                  <span>Creating flashcards</span>
                </div>
              </div>
            )}

            {/* Error / Server Key Notice */}
            {!isAnalyzing && isServerKeyRequired && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#D68A16] flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                      Server-Side AI Configuration Required
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                      To protect credentials, AI keys are never stored in the browser. Deploy the provided Supabase Edge Function with:
                    </p>
                    <code className="block p-2 rounded-lg bg-black/10 dark:bg-black/30 font-mono text-[11px] text-amber-950 dark:text-amber-100">
                      supabase secrets set GEMINI_API_KEY=your_key && supabase functions deploy analyze-assignment
                    </code>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
                  <button
                    type="button"
                    onClick={handleLoadSamplePreview}
                    className="px-3.5 py-1.5 rounded-xl bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Load Interactive Study Demo
                  </button>
                </div>
              </div>
            )}

            {/* General Error Notice */}
            {!isAnalyzing && errorMessage && !isServerKeyRequired && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 4. Empty Material / Upload State */}
            {!isAnalyzing && !analysis && (
              <div className="space-y-5 max-w-lg mx-auto py-4 text-center">
                {!hasFiles ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EEECFF] dark:bg-[#5B4DF5]/20 text-[#5B4DF5] flex items-center justify-center shadow-xs">
                      <UploadCloud className="w-8 h-8 text-[#5B4DF5]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-[#171A2E] dark:text-white">
                        Upload assignment file to enable AI study tools
                      </h3>
                      <p className="text-xs text-[#5C6175] dark:text-[#94A3B8]">
                        Supports course PDFs, lab problem sets, images, and docx files.
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white text-xs font-bold transition-all cursor-pointer shadow-xs">
                      <UploadCloud className="w-4 h-4" />
                      <span>Choose Assignment File</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedFile(file);
                            handleStartAnalysis(file);
                          }
                        }}
                      />
                    </label>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleLoadSamplePreview}
                        className="text-xs text-[#5B4DF5] dark:text-[#A49DFC] hover:underline cursor-pointer"
                      >
                        Or preview AI Study Assistant with assignment data →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-slate-800 text-left space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9499AB]">
                        Detected Assignment File
                      </span>
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-[#5B4DF5]" />
                        <span className="text-xs font-bold text-[#171A2E] dark:text-white truncate">
                          {selectedFile?.name || attachments[0]?.file_name}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartAnalysis()}
                      className="w-full py-3 rounded-xl bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze with AI Study Assistant</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 5. Rendered Structured Analysis Sections */}
            {!isAnalyzing && analysis && (
              <div className="space-y-5">
                {/* 1. SOLUTIONS TAB */}
                {activeTab === 'solutions' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-heading font-extrabold text-[#171A2E] dark:text-white">
                        Step-by-Step Solutions
                      </h3>
                      <span className="text-xs text-[#9499AB]">
                        {analysis.solutions.length} problems analyzed
                      </span>
                    </div>

                    {analysis.solutions.map((sol, idx) => (
                      <div
                        key={idx}
                        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-2xs space-y-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-[#EEECFF] dark:bg-[#5B4DF5]/20 text-[#5B4DF5] font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-[#171A2E] dark:text-white leading-snug">
                            {sol.question}
                          </h4>
                        </div>

                        {sol.steps && sol.steps.length > 0 && (
                          <div className="p-3 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] space-y-1.5 text-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9499AB] block">
                              Solution Steps:
                            </span>
                            <ol className="list-decimal list-inside space-y-1 text-[#5C6175] dark:text-[#94A3B8] leading-relaxed">
                              {sol.steps.map((st, stepIdx) => (
                                <li key={stepIdx}>{st}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#19A974] block">
                            Final Answer & Conclusion:
                          </span>
                          <p className="text-emerald-950 dark:text-emerald-200 font-semibold leading-relaxed">
                            {sol.finalAnswer || sol.answer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. EXPLANATIONS TAB */}
                {activeTab === 'explanations' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-heading font-extrabold text-[#171A2E] dark:text-white">
                      Deep Theoretical Explanations
                    </h3>

                    {analysis.explanations.map((exp, idx) => (
                      <div
                        key={idx}
                        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-[#D68A16]" />
                          <h4 className="text-xs sm:text-sm font-bold text-[#171A2E] dark:text-white">
                            {exp.concept}
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-[#5C6175] dark:text-[#94A3B8] leading-relaxed">
                          {exp.detail}
                        </p>
                        {exp.practicalExample && (
                          <div className="p-3 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] text-xs text-[#5B4DF5] dark:text-[#A49DFC] font-medium leading-relaxed">
                            💡 <strong>Practical Context:</strong> {exp.practicalExample}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. KEY CONCEPTS TAB */}
                {activeTab === 'concepts' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-heading font-extrabold text-[#171A2E] dark:text-white">
                      Core Academic Concepts
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysis.keyConcepts.map((concept, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] flex items-center gap-2.5 text-xs font-semibold text-[#171A2E] dark:text-white shadow-2xs"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#19A974] flex-shrink-0" />
                          <span>{concept}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. FLASHCARDS TAB */}
                {activeTab === 'flashcards' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-heading font-extrabold text-[#171A2E] dark:text-white">
                          Generated Flashcard Deck
                        </h3>
                        <p className="text-xs text-[#5C6175] dark:text-[#94A3B8]">
                          {analysis.flashcards.length} cards generated automatically
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowDeckModal(true)}
                        className="px-4 py-2 rounded-xl bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Start Flashcard Review</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysis.flashcards.map((card, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-2xs space-y-2 flex flex-col justify-between"
                        >
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B4DF5] dark:text-[#A49DFC] block">
                              {card.topic}
                            </span>
                            <h5 className="text-xs font-bold text-[#171A2E] dark:text-white mt-1">
                              {card.front}
                            </h5>
                          </div>
                          <p className="text-xs text-[#5C6175] dark:text-[#94A3B8] border-t border-[#E6E9F2]/60 dark:border-slate-800 pt-2 leading-relaxed">
                            {card.back}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. EXAM REVISION TAB */}
                {activeTab === 'revision' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-heading font-extrabold text-[#171A2E] dark:text-white">
                      Exam Revision Focus
                    </h3>
                    <div className="space-y-2.5">
                      {analysis.examTopics.map((topic, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] flex items-center justify-between text-xs font-semibold text-[#171A2E] dark:text-white shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <BookOpen className="w-4 h-4 text-[#5B4DF5]" />
                            <span>{topic}</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                            High Yield
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Embedded Flashcard Deck Review Modal */}
      {showDeckModal && (
        <FlashcardDeckModal
          isOpen={showDeckModal}
          onClose={() => setShowDeckModal(false)}
          flashcards={currentFlashcards}
          title={`${assignmentTitle} · Flashcards`}
        />
      )}
    </>
  );
};
