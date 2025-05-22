// Question types for coding contests

export interface ContestQuestion {
  id?: string;
  title: string;
  description: string;
  contestType: 'speed-coding-with-ai' | 'devathon';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  sampleInput?: string;
  sampleOutput?: string;
  constraints?: string;
  hints?: string[];
  releaseTime: Date | string; // When the question should be visible to participants
  endTime: Date | string; // When the question submission period ends
  createdAt?: Date | string;
  updatedAt?: Date | string;
  isActive: boolean;
}

export interface QuestionSubmission {
  id?: string;
  questionId: string;
  participantId: string;
  submissionText: string;
  codeUrl?: string; // GitHub or other code repository URL
  submittedAt: Date | string;
  score?: number;
  feedback?: string;
  status: 'pending' | 'reviewed' | 'rejected';
}
