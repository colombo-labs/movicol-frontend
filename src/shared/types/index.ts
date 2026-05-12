export interface Station {
  id: string;
  name: string;
  lat: number;
  lon: number;
  route?: string;
  zone?: string;
  degree: number;
}

export interface Prediction {
  stationId: string;
  stationName: string;
  congestionLevel: number;
  riskLabel: 'low' | 'medium' | 'high' | 'critical';
  horizonMinutes: number;
  confidence: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
