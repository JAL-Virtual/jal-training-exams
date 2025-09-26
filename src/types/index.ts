export interface Airline {
  id: number;
  icao: string;
  iata: string;
  name: string;
  country: string;
  logo: string | null;
}

export interface Rank {
  name: string;
  subfleets: any[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  apikey: string | null;
  rank_id: string;
  home_airport: string;
  curr_airport: string;
  last_pirep_id: number;
  flights: number;
  flight_time: number;
  balance: number;
  timezone: string;
  status: number;
  state: number;
  airline: Airline;
  bids: any[];
  rank: Rank;
}

export interface JALVirtualAPIResponse {
  data: User;
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
