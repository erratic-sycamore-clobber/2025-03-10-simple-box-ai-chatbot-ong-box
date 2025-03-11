import { useRef } from 'react';
import { Message } from '../types';
import ChatMessage from './ChatMessage';

interface ChatContainerProps {
  messages: Message[];
  onSamplePromptClick?: (prompt: string) => void;
  onRegenerateResponse?: (messageId: string, withHistory: boolean) => void;
  isRegenerating?: boolean;
  regeneratingMessageId?: string;
}

// Sample prompts for the empty state
const SAMPLE_PROMPTS = [
  {
    title: "What is Box AI?",
    description: "Learn about Box's AI capabilities"
  },
  {
    title: "How to build a chatbot?",
    description: "Get steps to create an AI chatbot"
  },
  {
    title: "Tell me about France",
    description: "Learn about French history and culture"
  },
  {
    title: "Write a poem about technology",
    description: "Get creative AI-generated content"
  }
];

export default function ChatContainer({ 
  messages, 
  onSamplePromptClick,
  onRegenerateResponse,
  isRegenerating = false,
  regeneratingMessageId
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll is now handled at the parent level

  const handleSamplePromptClick = (prompt: string) => {
    if (onSamplePromptClick) {
      onSamplePromptClick(prompt);
    } else {
      console.log('Clicked sample prompt:', prompt);
    }
  };

  return (
    <div className="chat-container h-100">
      {messages.length === 0 ? (
        <div className="welcome-container d-flex flex-column align-items-center justify-content-center text-center h-100">
          <div className="logo-container mb-4">
            <div className="bg-primary d-inline-flex justify-content-center align-items-center rounded-circle p-3" 
                 style={{ width: '80px', height: '80px' }}>
              <i className="bi bi-chat-square-text text-white fs-2"></i>
            </div>
          </div>
          <h1 className="fs-3 mb-4">How can I help you today?</h1>
          <div className="row mt-2 mb-4 w-100" style={{ maxWidth: '900px' }}>
            {SAMPLE_PROMPTS.map((prompt, index) => (
              <div className="col-md-6 mb-3" key={index}>
                <div 
                  className="p-3 border rounded-3 text-start shadow-sm bg-body-tertiary cursor-pointer"
                  onClick={() => handleSamplePromptClick(prompt.title)}
                >
                  <p className="fw-medium mb-1">{prompt.title}</p>
                  <p className="mb-0 text-muted small">{prompt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="container py-4 px-md-4">
          {messages.map((message, index) => {
            // Find the last meaningful AI message for regeneration
            let isLastMeaningfulAIMessage = false;
            
            // Only Box AI responses can be regenerated (must have model and responseTimeMs properties)
            if (message.role === 'assistant' && message.model && message.responseTimeMs) {
              
              // Check if this is the last meaningful AI message
              isLastMeaningfulAIMessage = true;
              for (let i = index + 1; i < messages.length; i++) {
                const laterMsg = messages[i];
                // If we find a later Box AI response, this is not the latest one
                if (laterMsg.role === 'assistant' && laterMsg.model && laterMsg.responseTimeMs) {
                  isLastMeaningfulAIMessage = false;
                  break;
                }
              }
            }
            
            return (
              <ChatMessage 
                key={message.id} 
                message={message} 
                isFirst={index === 0}
                // Only pass regeneration handler to the last meaningful AI message
                onRegenerateResponse={isLastMeaningfulAIMessage ? onRegenerateResponse : undefined}
                isRegenerating={isRegenerating && message.id === regeneratingMessageId}
              />
            );
          })}
          <div ref={messagesEndRef} className="pt-3" />
        </div>
      )}
    </div>
  );
}