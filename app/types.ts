export enum Role {
  User = "user",
  Assistant = "assistant",
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  title: string;
}