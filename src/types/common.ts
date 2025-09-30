import { ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  apiKey?: string;
  rank?: {
    name: string;
  };
}

export interface Student {
  id: string;
  name: string;
  status: string;
  trainingId?: string;
  progress?: number;
  completedAt?: string;
}

export interface TrainingRequest {
  id: string;
  studentId: string;
  type: string;
  status: string;
  requestedAt: string;
  comments?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  topics?: string[];
}

export interface TestToken {
  id: string;
  value: string;
  token: string;
  status: string;
  expiresAt: string;
  issuedAt?: string;
  courseTitle?: string;
  studentName?: string;
  courseId?: string;
  studentId?: string;
}

export interface Section {
  id: string;
  title: string;
  content?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Array<{
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
  }>;
}

export interface Assignment {
  trainerName: string;
  rating(rating: any): unknown;
  topicName: ReactNode;
  pilotId: ReactNode;
  pilotName: ReactNode;
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  status: string;
}
