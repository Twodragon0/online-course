export type MessageCategory = 
  | 'general'
  | 'technical'
  | 'security'
  | 'devops'
  | 'programming'
  | 'error'
  | 'other';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  category: MessageCategory;
  timestamp: Date;
  isCopied?: boolean;
}

export interface ChatLog {
  sessionId: string;
  messages: ChatMessage[];
  category: MessageCategory;
  summary?: string;
} 