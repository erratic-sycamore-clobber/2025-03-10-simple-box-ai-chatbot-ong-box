import { ChangeEvent } from 'react';
import { AIModel } from '../types';

interface ModelSelectorProps {
  models: AIModel[];
  selectedModel: string;
  onChange: (model: string) => void;
}

export default function ModelSelector({ models, selectedModel, onChange }: ModelSelectorProps) {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="model-selector d-flex align-items-center">
      <label htmlFor="model-select" className="form-label mb-0 me-2 text-nowrap">
        <i className="bi bi-cpu me-1"></i>
        Model:
      </label>
      <select
        id="model-select"
        className="form-select form-select-sm"
        value={selectedModel}
        onChange={handleChange}
        aria-label="Select AI model"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}