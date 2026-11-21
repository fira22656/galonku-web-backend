export interface AiLog {
  id: number;
  user_id?: number | null;
  prompt: string;
  response: string;
  feature?: string;
  created_at?: Date;
}

export interface CreateAiLogInput {
  user_id?: number | null;
  prompt: string;
  response: string;
  feature?: string;
}