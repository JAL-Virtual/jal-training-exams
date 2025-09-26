export interface User {
  id: string;
  name: string;
  rank: string;
  country: string;
  pilotId: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface TrainingStats {
  totalTrainingRequested: number;
  totalTrainingCompleted: number;
  totalTrainers: number;
  totalExaminers: number;
}

export interface TrainingData {
  year: string;
  PP: number;
  SPP: number;
  CP: number;
  ADC: number;
  APC: number;
  ACC: number;
  GCA: number;
}

export interface QuickReferenceItem {
  title: string;
  icon: string;
  color: string;
  dot: string;
  url?: string;
}

export interface LoginFormData {
  apiKey: string;
}
