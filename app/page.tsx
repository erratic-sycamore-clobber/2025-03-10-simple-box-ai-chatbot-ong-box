'use client';

import { useState, useEffect, useRef } from 'react';
import ChatContainer from './components/ChatContainer';
import ChatInput from './components/ChatInput';
import ThemeToggle from './components/ThemeToggle';
import ModelSelector from './components/ModelSelector';
import { Message, Role } from './types';
import { generateId } from './utils/index';
import { AI_MODELS } from './utils';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreamingResponse, setIsStreamingResponse] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('azure__openai__gpt_4o_mini');
  const [modelChanged, setModelChanged] = useState<boolean>(false);
  const [contextCleared, setContextCleared] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null);

  // Load messages and settings from localStorage on initial load
  useEffect(() => {
    // Load saved messages
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
    
    // Load saved model preference
    const savedModel = localStorage.getItem('selectedModel');
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);
  
  // Save selected model to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedModel', selectedModel);
    
    // If model changed and there's an active conversation, add a system message
    if (modelChanged && messages.length > 0) {
      const modelName = AI_MODELS.find(m => m.id === selectedModel)?.name || selectedModel;
      const systemMessage: Message = {
        id: generateId(),
        role: Role.Assistant,
        content: `Model changed to ${modelName}. Subsequent responses will use this model.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, systemMessage]);
      setModelChanged(false);
    }
  }, [selectedModel, modelChanged, messages.length]);

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

    // Track response time
    const startTime = performance.now();

    try {
      // Prepare all messages for the API, respecting context cleared flag
      let messagesToSend;
      
      if (contextCleared) {
        // If context was cleared, only send the current message
        messagesToSend = [userMessage];
        // Reset the flag after using it
        setContextCleared(false);
      } else {
        // Otherwise send all messages
        messagesToSend = [...messages, userMessage];
      }
      
      const allMessages = messagesToSend.map(msg => ({
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
        body: JSON.stringify({ 
          messages: allMessages,
          model: selectedModel
        }),
      });

      // Calculate response time
      const endTime = performance.now();
      const responseTimeMs = Math.round(endTime - startTime);

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
        model: selectedModel, // Store which model generated this response
        responseTimeMs, // Store response time
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError(error.message || 'An error occurred while processing your request');
      
      // Calculate response time even for errors
      const endTime = performance.now();
      const responseTimeMs = Math.round(endTime - startTime);
      
      // Add error message from assistant
      const errorMessage: Message = {
        id: generateId(),
        role: Role.Assistant,
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        model: selectedModel, // Include model info even for error messages
        responseTimeMs, // Include response time for error messages
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
    setContextCleared(false);
  };
  
  const handleClearContext = () => {
    // Add a system message indicating context has been cleared
    const systemMessage: Message = {
      id: generateId(),
      role: Role.Assistant,
      content: "🔄 Context cleared. The AI will respond to your next message without considering previous conversation history.",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, systemMessage]);
    setContextCleared(true);
    setError(null);
  };
  
  const handleSamplePrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };
  
  // Handle regenerating a response
  const handleRegenerateResponse = async (messageId: string, withHistory: boolean) => {
    if (isRegenerating || isLoading) return;
    
    setError(null);
    setIsRegenerating(true);
    setRegeneratingMessageId(messageId);
    
    // Find the message to regenerate
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1 || messageIndex === 0) {
      setError("Invalid message for regeneration");
      setIsRegenerating(false);
      setRegeneratingMessageId(null);
      return;
    }
    
    // Get the user message that prompted this assistant message
    const userMessage = messages[messageIndex - 1];
    
    // Track response time
    const startTime = performance.now();
    
    try {
      // Prepare messages for the API
      let messagesToSend;
      
      if (withHistory) {
        // Include conversation history up to the user message
        messagesToSend = messages.slice(0, messageIndex);
      } else {
        // Only include the user message that prompted this response
        messagesToSend = [userMessage];
      }
      
      const allMessages = messagesToSend.map(msg => ({
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
        body: JSON.stringify({ 
          messages: allMessages,
          model: selectedModel
        }),
      });
      
      // Calculate response time
      const endTime = performance.now();
      const responseTimeMs = Math.round(endTime - startTime);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to get a response');
      }
      
      // Create new variant response
      const newVariant: ResponseVariant = {
        id: generateId(),
        content: data.response,
        timestamp: new Date(),
        model: selectedModel,
        responseTimeMs,
        withHistory: withHistory
      };
      
      // Update the message with the new variant
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          // Add the variant to the existing variants array or create a new array
          const variants = msg.variants ? [...msg.variants, newVariant] : [newVariant];
          return {
            ...msg,
            variants
          };
        }
        return msg;
      }));
    } catch (error: any) {
      console.error('Error regenerating response:', error);
      setError(error.message || 'An error occurred while regenerating the response');
    } finally {
      setIsRegenerating(false);
      setRegeneratingMessageId(null);
    }
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
    <div className="vh-100 d-flex flex-column">
      <div className="container-fluid p-0 d-flex flex-column h-100">
        <header className="bg-body-tertiary py-3 px-4 d-flex justify-content-between align-items-center border-bottom position-sticky top-0 z-1">
          <div className="d-flex align-items-center">
            <h1 className="h5 mb-0 text-primary fw-semibold">
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
              onRegenerateResponse={handleRegenerateResponse}
              isRegenerating={isRegenerating}
              regeneratingMessageId={regeneratingMessageId || undefined}
            />
          </div>
          
          <div className="bg-body-tertiary px-4 py-4 mt-auto border-top position-sticky bottom-0 z-1">
            {isStreamingResponse && (
              <div className="spinner-container mb-2">
                <div className="loading-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            )}
            
            {/* Controls above input */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <ModelSelector 
                models={AI_MODELS} 
                selectedModel={selectedModel} 
                onChange={(model: string) => {
                  if (model !== selectedModel && messages.length > 0) {
                    setModelChanged(true);
                  }
                  setSelectedModel(model);
                }} 
              />
              
              {messages.length > 0 && (
                <button 
                  onClick={handleClearContext}
                  className="btn btn-sm btn-outline-primary ms-3"
                  aria-label="Clear context"
                  title="Clear conversation context while keeping message history"
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Clear Context
                </button>
              )}
            </div>
            
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