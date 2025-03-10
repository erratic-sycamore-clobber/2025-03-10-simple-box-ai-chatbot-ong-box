import { useState, useRef, useEffect } from 'react';
import { Message, Role } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: Message;
  isFirst?: boolean;
}

export default function ChatMessage({ message, isFirst = false }: ChatMessageProps) {
  const isUser = message.role === Role.User;
  const [copySuccess, setCopySuccess] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`row mb-4 theme-transition ${isUser ? 'justify-content-end' : 'justify-content-start'}`}>
      {!isUser && (
        <div className="col-auto d-none d-md-block me-2">
          <div 
            className="rounded-circle bg-box-blue d-flex align-items-center justify-content-center"
            style={{ width: '32px', height: '32px' }}
          >
            <i className="bi bi-robot text-white small"></i>
          </div>
        </div>
      )}
      
      <div className={`col-${isUser ? '10' : '10'} col-md-${isUser ? '7' : '8'}`}>
        <div 
          ref={messageRef}
          className={`position-relative theme-transition ${
            isUser 
              ? 'message-user' 
              : 'message-assistant'
          }`}
        >
          {/* Copy Button */}
          {!isUser && (
            <button 
              onClick={copyToClipboard}
              className="copy-button position-absolute top-0 end-0 bg-transparent border-0 p-2"
              title="Copy to clipboard"
              aria-label="Copy to clipboard"
            >
              {copySuccess ? (
                <i className="bi bi-check"></i>
              ) : (
                <i className="bi bi-clipboard"></i>
              )}
            </button>
          )}
          
          
          <div className={`markdown-content ${isUser ? 'user-markdown' : ''}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
          <div className="timestamp mt-1 text-end">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
      
      {isUser && (
        <div className="col-auto d-none d-md-block ms-2">
          <div 
            className="rounded-circle bg-light d-flex align-items-center justify-content-center border"
            style={{ width: '32px', height: '32px' }}
          >
            <i className="bi bi-person text-secondary small"></i>
          </div>
        </div>
      )}
    </div>
  );
}