import type { Recipe } from '../types.ts';

export const ollama: Recipe = {
  id: 'ollama',
  name: 'Ollama (local)',
  tier: 'openai-compat',
  implementation: 'openai-compatible',
  base_url_default: 'http://localhost:11434/v1',
  auth_env: {
    required: [], // Ollama runs unauthenticated locally; users pass `ollama` as the key.
    optional: ['OLLAMA_BASE_URL', 'OLLAMA_API_KEY'],
    setup_url: 'https://ollama.ai',
  },
  touchpoints: {
    embedding: {
      models: ['nomic-embed-text', 'mxbai-embed-large', 'all-minilm'],
      default_dims: 768, // nomic-embed-text native dim
      cost_per_1m_tokens_usd: 0,
      price_last_verified: '2026-04-20',
      // Ollama's exact batch capacity depends on the locally loaded model +
      // OLLAMA_NUM_PARALLEL, but local embedding models still enforce a context
      // window. Keep a conservative budget so multi-chunk pages are pre-split
      // before the OpenAI-compatible endpoint rejects the request with
      // "input length exceeds the context length".
      max_batch_tokens: 2048,
      chars_per_token: 1,
      safety_factor: 0.75,
    },
  },
  setup_hint: 'Install Ollama from https://ollama.ai, then `ollama pull nomic-embed-text` and `ollama serve`.',
};
