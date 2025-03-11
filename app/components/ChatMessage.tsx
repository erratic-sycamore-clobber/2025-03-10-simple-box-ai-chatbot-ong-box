import { useState, useRef } from 'react';
import { Message, Role } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AI_MODELS } from '../utils';
import ResponseVariants from './ResponseVariants';

interface ChatMessageProps {
  message: Message;
  isFirst?: boolean;
  onRegenerateResponse?: (messageId: string, withHistory: boolean) => void;
  isRegenerating?: boolean;
}

export default function ChatMessage({ 
  message, 
  isFirst = false, 
  onRegenerateResponse, 
  isRegenerating = false 
}: ChatMessageProps) {
  const isUser = message.role === Role.User;
  const [copySuccess, setCopySuccess] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const hasVariants = !isUser && message.variants && message.variants.length > 0;
  
  // Determine if this is a meaningful AI response from Box AI
  const isBoxAIResponse = !isUser && message.model && message.responseTimeMs;
  
  // If it's an assistant message but not a Box AI response, it's a system message
  const isSystemMessage = !isUser && !isBoxAIResponse;
  
  const copyToClipboard = async (content: string = message.content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`row mb-4 ${isUser ? 'justify-content-end' : 'justify-content-start'}`}>
      <div className={`col-${isUser ? '10' : '11'} col-md-${isUser ? '7' : '10'}`}>
        <div 
          ref={messageRef}
          className={`position-relative ${
            isUser 
              ? 'message-user' 
              : 'message-assistant'
          }`}
        >
          {/* For user messages */}
          {isUser && (
            <div className={`markdown-content user-markdown`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          
          {/* For system messages - display as simple centered text */}
          {isSystemMessage && (
            <div className="text-muted small opacity-75 my-2 text-center">
              {message.content}
            </div>
          )}
          
          {/* For meaningful Box AI responses - use ResponseVariants */}
          {isBoxAIResponse && (
            <>
              <ResponseVariants
                original={{
                  content: message.content,
                  timestamp: message.timestamp,
                  model: message.model,
                  responseTimeMs: message.responseTimeMs
                }}
                variants={message.variants || []}
                onCopy={copyToClipboard}
                copySuccess={copySuccess}
              />
              
              {/* Action buttons for regeneration */}
              {onRegenerateResponse && (
                <div className="message-actions d-flex mt-3">
                  <button 
                    onClick={() => onRegenerateResponse(message.id, true)}
                    className="btn btn-sm btn-outline-primary me-2"
                    disabled={isRegenerating}
                  >
                    {isRegenerating ? (
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="bi bi-arrow-counterclockwise me-1"></i>
                    )}
                    Regenerate
                  </button>
                  <button 
                    onClick={() => onRegenerateResponse(message.id, false)}
                    className="btn btn-sm btn-outline-secondary"
                    disabled={isRegenerating}
                  >
                    <i className="bi bi-lightning me-1"></i>
                    Regenerate (no history)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}