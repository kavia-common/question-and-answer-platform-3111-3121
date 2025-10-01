export interface Token {
  access_token: string;
  token_type: string;
}

export interface UserCreate {
  email: string;
  password: string;
  full_name?: string | null;
}

export interface UserOut {
  id: number;
  email: string;
  full_name?: string | null;
}

export interface QuestionCreate {
  title: string;
  body: string;
}

export interface QuestionOut {
  id: number;
  title: string;
  body: string;
  user_id: number;
  created_at: string;
}

export interface GenerateAnswerRequest {
  question_id: number;
  use_ai?: boolean;
  body?: string | null;
}

export interface AnswerOut {
  id: number;
  question_id: number;
  body: string;
  user_id?: number | null;
  created_at: string;
  is_ai_generated?: boolean;
}
