// Hugging Face Inference Service using OpenAI Client

const { OpenAI } = require('openai');

const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
  console.warn('WARNING: HF_TOKEN not set in environment');
}

// Initialize OpenAI client with Hugging Face router
const client = new OpenAI({
  baseURL: 'https://router.huggingface.co/v1',
  apiKey: HF_TOKEN,
});

/**
 * Call Hugging Face via OpenAI client
 * @param {string} modelType - Type of model (extraction, interview, rejection, summary)
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string>} The model's response
 */
async function callHuggingFace(modelType, prompt) {
  if (!HF_TOKEN) {
    throw new Error('HF_TOKEN environment variable is not set');
  }

  try {
    console.log(`Calling HF model for ${modelType}...`);

    const completion = await client.chat.completions.create({
      model: 'meta-llama/Llama-3.1-8B-Instruct:novita',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error('No response from Hugging Face API');
    }

    const responseText = completion.choices[0].message?.content;

    if (!responseText) {
      throw new Error('Empty response from Hugging Face API');
    }

    console.log(`✅ HF response received for ${modelType}`);
    return responseText;

  } catch (error) {
    console.error(`HF API Error for ${modelType}:`, error.message);
    throw new Error(`Extraction failed: ${error.message}`);
  }
}

/**
 * Extract JSON from LLM response
 * @param {string} response - Raw response from LLM
 * @returns {Object} Parsed JSON
 */
function extractJSON(response) {
  if (typeof response !== 'string') {
    return response;
  }

  // Clean response - remove markdown code blocks if present
  let cleanedResponse = response
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  // Try to find JSON in the response
  const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.warn('Could not extract JSON from response:', cleanedResponse.substring(0, 100));
    throw new Error('No JSON found in response');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error('JSON parse error:', error.message);
    console.error('Attempted to parse:', jsonMatch[0].substring(0, 200));
    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
}

module.exports = {
  callHuggingFace,
  extractJSON
};
