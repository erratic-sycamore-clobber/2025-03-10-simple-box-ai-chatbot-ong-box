export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const AI_MODELS = [
  { id: 'azure__openai__gpt_4o_mini', name: 'Azure GPT-4o Mini' },
  { id: 'google__gemini_1_5_pro_001', name: 'Gemini 1.5 Pro' },
  { id: 'google__gemini_1_5_flash_001', name: 'Gemini 1.5 Flash' },
  { id: 'google__gemini_2_0_flash_001', name: 'Gemini 2.0 Flash' },
  { id: 'google__gemini_2_0_flash_lite_preview', name: 'Gemini 2.0 Flash Lite' },
  { id: 'aws__claude_3_haiku', name: 'Claude 3 Haiku' },
  { id: 'aws__claude_3_sonnet', name: 'Claude 3 Sonnet' },
  { id: 'aws__claude_3_5_sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'aws__claude_3_7_sonnet', name: 'Claude 3.7 Sonnet' },
  { id: 'aws__titan_text_lite', name: 'AWS Titan Text Lite' },
];