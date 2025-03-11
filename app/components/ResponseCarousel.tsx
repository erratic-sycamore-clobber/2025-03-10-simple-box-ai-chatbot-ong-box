import { useState, useRef, useEffect } from 'react';
import { ResponseVariant } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AI_MODELS } from '../utils';

interface ResponseCarouselProps {
  original: {
    content: string;
    timestamp: Date;
    model?: string;
    responseTimeMs?: number;
  };
  variants: ResponseVariant[];
  onCopy: (content: string) => void;
  copySuccess: boolean;
}

export default function ResponseCarousel({ original, variants, onCopy, copySuccess }: ResponseCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Combine original and variants for display
  const allResponses = [
    { 
      id: 'original', 
      content: original.content, 
      timestamp: original.timestamp,
      model: original.model,
      responseTimeMs: original.responseTimeMs,
      withHistory: true // Original responses always have history
    },
    ...variants
  ];

  // Scroll to a specific card
  const scrollToCard = (index: number) => {
    if (carouselRef.current) {
      const cards = carouselRef.current.querySelectorAll('.carousel-card');
      if (cards[index]) {
        cards[index].scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    }
  };

  // Handle navigation
  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < allResponses.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  // Scroll when active index changes
  useEffect(() => {
    scrollToCard(activeIndex);
  }, [activeIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Clean up
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex]);

  return (
    <div className="response-carousel">
      {/* Navigation buttons */}
      <div className="carousel-controls d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center">
          <button 
            className="btn btn-sm btn-outline-secondary me-2" 
            onClick={handlePrev}
            disabled={activeIndex === 0}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <span className="small">
            {activeIndex === 0 ? 'Original' : `Variant ${activeIndex}`} 
            <span className="text-secondary ms-1">({activeIndex + 1}/{allResponses.length})</span>
          </span>
          <button 
            className="btn btn-sm btn-outline-secondary ms-2" 
            onClick={handleNext}
            disabled={activeIndex === allResponses.length - 1}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
        {/* Copy button */}
        <button 
          onClick={() => onCopy(allResponses[activeIndex].content)}
          className="btn btn-sm text-body-secondary"
          title="Copy to clipboard"
          aria-label="Copy to clipboard"
        >
          {copySuccess ? (
            <i className="bi bi-check"></i>
          ) : (
            <i className="bi bi-clipboard"></i>
          )}
        </button>
      </div>

      {/* Carousel container */}
      <div 
        ref={carouselRef} 
        className="carousel-container d-flex overflow-auto pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {allResponses.map((response, index) => (
          <div 
            key={response.id} 
            className={`carousel-card flex-shrink-0 ${activeIndex === index ? 'active' : ''}`}
            style={{ 
              width: '100%', 
              scrollSnapAlign: 'center',
              scrollSnapStop: 'always',
              flexBasis: '100%',
            }}
          >
            <div className="card border shadow-sm">
              <div className="card-body">
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {response.content}
                  </ReactMarkdown>
                </div>
              </div>
              <div className="card-footer bg-light d-flex justify-content-between align-items-center py-2">
                <div>
                  {index === 0 ? (
                    <span className="badge bg-primary text-white me-2">Original</span>
                  ) : (
                    <span className="badge bg-secondary text-white me-2">Variant {index}</span>
                  )}
                  {response.withHistory ? (
                    <span className="badge bg-info text-white">With history</span>
                  ) : (
                    <span className="badge bg-warning text-dark">No history</span>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2">
                  {/* Model badge */}
                  {response.model && (
                    <span className="badge bg-secondary bg-opacity-10 text-body small model-badge">
                      <i className="bi bi-cpu me-1 small"></i>
                      {(() => {
                        // Get a short display name for the model
                        const model = AI_MODELS.find(m => m.id === response.model);
                        if (model) {
                          // Return just the model type (e.g., "GPT-4o Mini" from "Azure GPT-4o Mini")
                          const parts = model.name.split(' ');
                          return parts.length > 1 ? parts.slice(1).join(' ') : model.name;
                        }
                        return response.model.split('_').slice(-1)[0].toUpperCase();
                      })()}
                    </span>
                  )}
                  
                  {/* Response time */}
                  {response.responseTimeMs && (
                    <span className="badge bg-secondary bg-opacity-10 text-body small model-badge">
                      <i className="bi bi-stopwatch me-1 small"></i>
                      {(() => {
                        // Format the response time in seconds or milliseconds
                        const ms = response.responseTimeMs;
                        return ms >= 1000 
                          ? `${(ms / 1000).toFixed(1)}s`  // Show in seconds for times ≥ 1 second
                          : `${ms}ms`;                    // Show in milliseconds otherwise
                      })()}
                    </span>
                  )}
                  
                  {/* Timestamp */}
                  <span>
                    {new Date(response.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="carousel-indicators d-flex justify-content-center mt-2">
        {allResponses.map((_, index) => (
          <button
            key={index}
            className={`carousel-indicator mx-1 rounded-circle ${activeIndex === index ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
            style={{ 
              width: '8px', 
              height: '8px', 
              border: 'none',
              backgroundColor: activeIndex === index ? 'var(--bs-primary)' : '#ccc'
            }}
          ></button>
        ))}
      </div>
    </div>
  );
}