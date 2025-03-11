export enum Role {
  User = "user",
  Assistant = "assistant",
}

export interface ResponseVariant {
  id: string;
  content: string;
  timestamp: Date;
  model?: string;
  responseTimeMs?: number;
  withHistory: boolean; // Whether this response was generated with dialogue history
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  model?: string; // Optional model used to generate this message
  responseTimeMs?: number; // Time taken to generate response in milliseconds
  variants?: ResponseVariant[]; // Store regenerated responses as cards in a carousel
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