export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  learningPreferences?: string;
  createdAt: string;
  passwordHash?: string;
  disabled?: boolean;
  featuresDisabled?: string[];
  enrolledCourseIds?: string[];
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  learningPreferences: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningDomain {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  deadline?: string;
  instructor?: string;
  instructorId?: string;
  status?: 'active' | 'archived';
  enrolledStudentsCount?: number;
  assignedStudentIds?: string[];
}

export interface Competency {
  id: string;
  domainId: string;
  name: string;
  description: string;
  parentId?: string;
}

export interface Question {
  id: string;
  assessmentId: string;
  competencyId: string;
  questionText: string;
  questionType: 'mcq';
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface AssessmentTemplate {
  id: string;
  domainId: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  deadline?: string;
  proctoringStrict: boolean;
  questions: Question[];
  createdBy?: string;
  createdById?: string;
  createdAt: string;
  isPublished: boolean;
  assignedStudentIds?: string[]; // specific student assignments, or empty for course-wide
}

export interface Answer {
  id: string;
  assessmentId: string;
  questionId: string;
  studentAnswer: string;
  isCorrect: boolean;
  answeredAt: string;
}

export interface Assessment {
  id: string;
  templateId?: string;
  title?: string;
  studentId: string;
  domainId: string;
  status: 'started' | 'completed';
  startedAt: string;
  submittedAt?: string;
  questions: Question[];
  answers: Record<string, string>;
  score?: number;
  aiProvider?: string;
  aiModel?: string;
  generationTimestamp?: string;
  promptVersion?: string;
  timeLimitMinutes?: number;
  deadline?: string;
  autoSubmittedReason?: string;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  studentId: string;
  overallScore: number;
  completedAt: string;
  topicBreakdown: Record<string, {
    competencyId: string;
    competencyName: string;
    correct: number;
    total: number;
    percentage: number;
  }>;
  autoSubmittedReason?: string;
  assessment?: Assessment;
}

export interface SkillGap {
  id: string;
  studentId: string;
  competencyId: string;
  competencyName: string;
  domainId: string;
  score: number;
  level: 'Weak' | 'Moderate' | 'Strong';
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  updatedAt: string;
}

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  resourceType: 'article' | 'video' | 'documentation' | 'tutorial';
  source: string;
  url: string;
  domainId: string;
  competencyId: string;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  studentId: string;
  competencyId: string;
  competencyName: string;
  resourceId?: string;
  customTitle?: string;
  customDescription?: string;
  customUrl?: string;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
  createdAt: string;
  completed?: boolean;
}

export interface Material {
  id: string;
  studentId: string;
  fileName: string;
  fileType: string;
  content: string;
  processingStatus: 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  studentId: string;
  materialId?: string;
  title: string;
  status: 'draft' | 'completed';
  createdAt: string;
  questions: QuizQuestion[];
  aiProvider?: string;
  aiModel?: string;
  generationTimestamp?: string;
  promptVersion?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  answers: Record<string, string>;
  startedAt: string;
  completedAt: string;
}

export interface ProgressSummary {
  overallCompetency: number;
  topicScores: Array<{
    competencyId: string;
    competencyName: string;
    score: number;
    level: 'Weak' | 'Moderate' | 'Strong';
  }>;
  assessmentHistory: Array<{
    id: string;
    domainName: string;
    score: number;
    date: string;
  }>;
  quizHistory: Array<{
    id: string;
    quizTitle: string;
    score: number;
    date: string;
  }>;
  streakDays: number;
  completedResourcesCount: number;
}

export interface AIGenerationLog {
  id: string;
  studentId?: string;
  operation: 'QUESTION_GENERATION' | 'ANSWER_EVALUATION' | 'SKILL_GAP_ANALYSIS' | 'RECOMMENDATION_GENERATION' | 'QUIZ_GENERATION' | 'AI_TUTOR';
  provider: string;
  model: string;
  status: 'success' | 'failed';
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCost?: number;
  errorType?: string;
  createdAt: string;
}

export interface AITutorMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface AITutorConversation {
  id: string;
  studentId: string;
  domainId?: string;
  competencyId?: string;
  title: string;
  createdAt: string;
  messages: AITutorMessage[];
}

export interface FreePracticeSource {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  difficulty: string;
  features: string[];
  cost: string;
  recommendedTopics: string[];
  iconType?: string;
  badge?: string;
  provider: string;
  interactive: boolean;
  requiresAccount: boolean;
}

export interface AIProviderPreset {
  id: string;
  name: string;
  defaultBaseUrl: string;
  defaultModel: string;
  recommendedModels: string[];
  requiresApiKey: boolean;
  description: string;
}

export interface AIConfigResponse {
  provider: string;
  model: string;
  baseUrl?: string;
  hasApiKey: boolean;
  maskedApiKey: string;
  presets: Record<string, AIProviderPreset>;
}

export interface FeatureFlags {
  enableAIAssessments: boolean;
  enableAITutor: boolean;
  enableAIQuizStudio: boolean;
  enableStrictProctoring: boolean;
  enableFreePracticeSources: boolean;
  enableStudentRegistration: boolean;
  enablePeerDiscussions: boolean;
}

export interface StudentAssessmentReport {
  student: User;
  assessmentCount: number;
  averageScore: number;
  lastAssessmentDate?: string;
  weakTopicsCount: number;
  strongTopicsCount: number;
  enrolledCourses?: string[];
  topicBreakdowns?: Array<{
    competencyName: string;
    domainName?: string;
    score: number;
  }>;
  attempts: Array<{
    assessment: Assessment;
    result?: AssessmentResult;
  }>;
}
