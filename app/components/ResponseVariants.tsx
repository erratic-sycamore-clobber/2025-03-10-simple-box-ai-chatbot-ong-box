import { useState } from 'react';
import { ResponseVariant } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AI_MODELS } from '../utils';
import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';

interface ResponseVariantsProps {
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

export default function ResponseVariants({ original, variants, onCopy, copySuccess }: ResponseVariantsProps) {
  const [activeKey, setActiveKey] = useState('original');

  // Combine original and variants for display
  const allResponses = [
    { 
      id: 'original', 
      content: original.content, 
      timestamp: original.timestamp,
      model: original.model,
      responseTimeMs: original.responseTimeMs,
      withHistory: true, // Original responses always have history
      label: 'Original'
    },
    ...variants.map((variant, index) => ({
      ...variant,
      label: `Variant ${index + 1}`
    }))
  ];

  // Helper function to get model display name
  const getModelDisplayName = (modelId?: string) => {
    if (!modelId) return '';
    
    const model = AI_MODELS.find(m => m.id === modelId);
    if (model) {
      // Return just the model type (e.g., "GPT-4o Mini" from "Azure GPT-4o Mini")
      const parts = model.name.split(' ');
      return parts.length > 1 ? parts.slice(1).join(' ') : model.name;
    }
    return modelId.split('_').slice(-1)[0].toUpperCase();
  };

  // Reusable tab navigation component
  const TabNavigation = () => (
    <Nav variant="tabs" className="small">
      {allResponses.map((response) => (
        <Nav.Item key={response.id}>
          <Nav.Link 
            eventKey={response.id} 
            active={activeKey === response.id}
            onClick={() => setActiveKey(response.id)}
            className="py-1 px-3 d-flex align-items-center gap-1"
          >
            <div>
              {response.label}
            </div>
            {/* History indicator */}
            {response.withHistory ? (
              <i className="bi bi-clock-history small text-muted"></i>
            ) : (
              <i className="bi bi-lightning small text-warning"></i>
            )}
            {/* Model badge */}
            {response.model && (
              <span className="badge bg-secondary bg-opacity-25 text-body small ms-1 d-flex align-items-center">
                <i className="bi bi-cpu me-1 small"></i>
                {getModelDisplayName(response.model)}
              </span>
            )}
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );

  const hasVariants = variants.length > 0;

  // If there are no variants, use a simpler layout
  if (!hasVariants) {
    return (
      <div className="mb-3">
        <div className="p-3">
          {/* Content */}
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {original.content}
            </ReactMarkdown>
          </div>
          
          {/* Footer with metadata */}
          <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
            <div>
              {original.model && (
                <span className="badge bg-secondary bg-opacity-25 text-body me-2">
                  Response
                </span>
              )}
            </div>
            <div className="d-flex align-items-center gap-2">
              {/* Copy button */}
              <button
                onClick={() => onCopy(original.content)}
                className="btn btn-sm p-0 text-body-secondary"
                title="Copy to clipboard"
                aria-label="Copy to clipboard"
              >
                {copySuccess ? (
                  <i className="bi bi-check"></i>
                ) : (
                  <i className="bi bi-clipboard"></i>
                )}
              </button>

              {/* Model badge */}
              {original.model && (
                <span className="badge bg-secondary bg-opacity-10 text-body small model-badge">
                  <i className="bi bi-cpu me-1 small"></i>
                  {getModelDisplayName(original.model)}
                </span>
              )}
              
              {/* Response time */}
              {original.responseTimeMs && (
                <span className="badge bg-secondary bg-opacity-10 text-body small model-badge">
                  <i className="bi bi-stopwatch me-1 small"></i>
                  {(() => {
                    // Format the response time in seconds or milliseconds
                    const ms = original.responseTimeMs;
                    return ms >= 1000 
                      ? `${(ms / 1000).toFixed(1)}s`  // Show in seconds for times ≥ 1 second
                      : `${ms}ms`;                    // Show in milliseconds otherwise
                  })()}
                </span>
              )}
              
              {/* Timestamp */}
              <span className="text-muted small">
                {new Date(original.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If there are variants, use the tabbed layout
  return (
    <div className="mb-3 bg-body-tertiary rounded">
      {/* Top Tab Navigation */}
      <div className="pt-3 px-3">
        <TabNavigation />
      </div>

      {/* Tab Content */}
      <Tab.Content>
        {allResponses.map((response) => (
          <Tab.Pane key={response.id} active={activeKey === response.id}>
            <div className="p-3">
              {/* Content */}
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {response.content}
                </ReactMarkdown>
              </div>
              
              {/* Footer with metadata */}
              <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                <div>
                  {response.id === 'original' ? (
                    <span className="badge bg-primary me-2">Original</span>
                  ) : (
                    <span className="badge bg-secondary me-2">{response.label}</span>
                  )}
                  {response.withHistory ? (
                    <span className="badge bg-info text-dark">With history</span>
                  ) : (
                    <span className="badge bg-warning text-dark">No history</span>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2">
                  {/* Copy button */}
                  <button
                    onClick={() => onCopy(response.content)}
                    className="btn btn-sm p-0 text-body-secondary"
                    title="Copy to clipboard"
                    aria-label="Copy to clipboard"
                  >
                    {copySuccess && activeKey === response.id ? (
                      <i className="bi bi-check"></i>
                    ) : (
                      <i className="bi bi-clipboard"></i>
                    )}
                  </button>

                  {/* Model badge */}
                  {response.model && (
                    <span className="badge bg-secondary bg-opacity-10 text-body small model-badge">
                      <i className="bi bi-cpu me-1 small"></i>
                      {getModelDisplayName(response.model)}
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
                  <span className="text-muted small">
                    {new Date(response.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          </Tab.Pane>
        ))}
      </Tab.Content>
      
      {/* Bottom Tab Navigation */}
      <div className="pb-2 px-3">
        <TabNavigation />
      </div>
    </div>
  );
}