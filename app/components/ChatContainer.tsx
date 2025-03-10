import { useEffect, useRef, useState } from 'react';
import { Message } from '../types';
import ChatMessage from './ChatMessage';

interface ChatContainerProps {
  messages: Message[];
  onSamplePromptClick?: (prompt: string) => void;
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

export default function ChatContainer({ messages, onSamplePromptClick }: ChatContainerProps) {
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
          {messages.map((message, index) => (
            <ChatMessage key={message.id} message={message} isFirst={index === 0} />
          ))}
          <div ref={messagesEndRef} className="pt-3" />
          
          {/* Loading indicator for incoming messages */}
          {false && ( // This will be controlled by props later
            <div className="spinner-container">
              <div className="loading-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}