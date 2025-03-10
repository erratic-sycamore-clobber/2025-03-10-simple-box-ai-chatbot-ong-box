'use client';

import { useState, useEffect, useRef } from 'react';
import ChatContainer from './components/ChatContainer';
import ChatInput from './components/ChatInput';
import ThemeToggle from './components/ThemeToggle';
import { Message, Role } from './types';
import { generateId } from './utils/index';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreamingResponse, setIsStreamingResponse] = useState(false);

  // Load messages from localStorage on initial load
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert string timestamps back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Error parsing saved messages:', error);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    setError(null);

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: Role.User,
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setIsStreamingResponse(true);

    try {
      // Prepare all messages for the API
      const allMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      }));

      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to get a response');
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: generateId(),
        role: Role.Assistant,
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError(error.message || 'An error occurred while processing your request');
      
      // Add error message from assistant
      const errorMessage: Message = {
        id: generateId(),
        role: Role.Assistant,
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreamingResponse(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
    setError(null);
  };
  
  const handleSamplePrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  // Auto-scroll to bottom container when new messages are added
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-interface min-vh-100 d-flex flex-column">
      <div className="container-fluid p-0 d-flex flex-column h-100">
        <header className="app-header py-3 px-4 d-flex justify-content-between align-items-center border-bottom position-sticky top-0 z-1">
          <div className="d-flex align-items-center">
            <h1 className="h5 mb-0 box-blue fw-semibold">
              <i className="bi bi-chat-square-text me-2"></i>
              Box AI Chat
            </h1>
          </div>
          <div className="d-flex align-items-center gap-3">
            <ThemeToggle />
            {messages.length > 0 && (
              <button 
                onClick={handleClearChat}
                className="btn btn-sm btn-outline-secondary"
                aria-label="New chat"
              >
                <i className="bi bi-plus-lg me-1"></i>
                New Chat
              </button>
            )}
          </div>
        </header>
        
        {error && (
          <div className="alert alert-danger mx-4 mt-3 mb-0 py-2 px-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}
        
        <div className="chat-content-wrapper flex-grow-1 d-flex flex-column">
          <div ref={chatContainerRef} className="chat-scroll-container flex-grow-1 overflow-auto">
            <ChatContainer 
              messages={messages}
              onSamplePromptClick={handleSamplePrompt}
            />
          </div>
          
          <div className="input-container px-4 py-4 mt-auto border-top position-sticky bottom-0 z-1 theme-transition">
            {isStreamingResponse && (
              <div className="spinner-container mb-2">
                <div className="loading-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            )}
            
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            <div className="text-center mt-3">
              <p className="text-muted small mb-0">Box AI Chat may produce inaccurate information about people, places, or facts.</p>
              <div className="credits mt-2 mb-0">
                <p className="mb-1">Created by <a href="mailto:ong@box.com">ong@box.com</a></p>
                <div className="tech-stack">
                  <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer">Next.js</a>
                  <span>•</span>
                  <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">React</a>
                  <span>•</span>
                  <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer">TypeScript</a>
                  <span>•</span>
                  <a href="https://github.com/box/box-typescript-sdk-gen" target="_blank" rel="noopener noreferrer">Box TypeScript SDK Gen</a>
                  <span>•</span>
                  <a href="https://www.box.com/ai" target="_blank" rel="noopener noreferrer">Box AI</a>
                  <span>•</span>
                  <a href="https://claude.ai/code" target="_blank" rel="noopener noreferrer">Claude Code</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}