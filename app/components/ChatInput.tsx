import { useState, FormEvent, KeyboardEvent, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  maxCharacters?: number;
}

export default function ChatInput({ onSendMessage, isLoading, maxCharacters = 10000 }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && characterCount <= maxCharacters) {
      onSendMessage(input);
      setInput('');
      setCharacterCount(0);
      
      // Reset height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea and update character count
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    
    // Don't allow typing more than maxCharacters
    if (newText.length <= maxCharacters) {
      setInput(newText);
      setCharacterCount(newText.length);
    }
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      
      // Calculate half viewport height (matching CSS 50vh)
      const maxHeight = window.innerHeight * 0.5;
      
      // Adjust height based on content, capped at half viewport height
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
    }
  };

  // Focus textarea on mount and handle window resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    
    // Re-calculate max height on window resize
    const handleResize = () => {
      if (textareaRef.current && input.length > 0) {
        const maxHeight = window.innerHeight * 0.5;
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [input.length]);

  // Calculate character limit status
  const isNearLimit = characterCount > maxCharacters * 0.8;
  const isAtLimit = characterCount === maxCharacters;
  const characterCountClass = isAtLimit ? 'text-danger fw-bold' : 
                             isNearLimit ? 'text-warning' : 
                             'text-muted';

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit} className="position-relative">
        {/* Character counter - moved above textarea */}
        <div className={`character-counter small mb-1 text-end ${characterCountClass}`}>
          <span>{characterCount}</span>
          <span className="text-muted"> / </span>
          <span>{maxCharacters}</span>
        </div>
        
        <div className="position-relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="form-control auto-grow-textarea pe-5"
            rows={1}
            disabled={isLoading}
            maxLength={maxCharacters}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || characterCount > maxCharacters}
            className="btn btn-primary position-absolute end-0 bottom-0 me-2 mb-2 rounded-circle p-0 d-flex align-items-center justify-content-center"
            style={{ width: "38px", height: "38px" }}
            aria-label="Send message"
          >
            {isLoading ? (
              <i className="bi bi-arrow-clockwise fs-5" style={{ animation: 'spin 1s linear infinite' }}></i>
            ) : (
              <i className="bi bi-send-fill fs-5"></i>
            )}
          </button>
        </div>
      </form>
      
      {isLoading && (
        <div className="text-center mt-3 text-muted">
          <small>Getting response from Box AI...</small>
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}