// Swappable AI provider adapter (OR-04).
// All AI calls must go through this single interface so switching between
// OpenAI / Gemini is a configuration change, not a code change.
const providers = {
  openai: async (prompt) => {
    throw new Error('OpenAI provider not implemented yet');
  },
  gemini: async (prompt) => {
    throw new Error('Gemini provider not implemented yet');
  },
};

async function generateText(prompt) {
  const provider = providers[process.env.AI_PROVIDER] || providers.openai;
  return provider(prompt);
}

module.exports = { generateText };