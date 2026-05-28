// Hugging Face Model Configuration

const HF_API_ENDPOINT = 'https://api-inference.huggingface.co/models';

const models = {
  extraction: {
    id: 'meta-llama/Llama-3.1-8B-Instruct',
    endpoint: `${HF_API_ENDPOINT}/meta-llama/Llama-3.1-8B-Instruct`,
    purpose: 'Resume analysis and skill extraction',
    temperature: 0.3,
    maxTokens: 1000
  },
  interview: {
    id: 'deepseek-ai/DeepSeek-V4-Pro',
    endpoint: `${HF_API_ENDPOINT}/deepseek-ai/DeepSeek-V4-Pro`,
    purpose: 'Technical interview question generation',
    temperature: 0.5,
    maxTokens: 1200
  },
  rejection: {
    id: 'teknium/OpenHermes-2.5-Mistral-7B',
    endpoint: `${HF_API_ENDPOINT}/teknium/OpenHermes-2.5-Mistral-7B`,
    purpose: 'Rejection guidance and improvement suggestions',
    temperature: 0.4,
    maxTokens: 800
  },
  summary: {
    id: 'meta-llama/Llama-3.1-8B-Instruct',
    endpoint: `${HF_API_ENDPOINT}/meta-llama/Llama-3.1-8B-Instruct`,
    purpose: 'Executive recruiter summary generation',
    temperature: 0.3,
    maxTokens: 500
  }
};

module.exports = {
  HF_API_ENDPOINT,
  models
};
