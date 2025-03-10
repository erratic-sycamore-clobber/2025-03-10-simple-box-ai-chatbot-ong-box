export enum Role {
  User = "user",
  Assistant = "assistant",
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  model?: string; // Optional model used to generate this message
  responseTimeMs?: number; // Time taken to generate response in milliseconds
}

export interface ChatSession {
  id: string;
  messages: Message[];
  title: string;
}

export interface AIModel {
  id: string;
  name: string;
}