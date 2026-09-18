import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

function base64ToGenerativePart(base64Str) {
  const matches = base64Str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) throw new Error('Invalid base64 string');
  return { inlineData: { data: matches[2], mimeType: matches[1] } };
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const ANALYSIS_PROMPT = `
You are a world-class expert agricultural scientist, plant pathologist, and botanist with 30+ years of experience diagnosing plant diseases across all crop types — vegetables, fruits, grains, ornamentals, trees, and herbs worldwide.

Your task: Carefully analyze the plant image and/or description provided. Identify the plant species first, then diagnose any disease, pest infestation, nutrient deficiency, or environmental stress condition present.

CRITICAL FIRST STEP - IMAGE VALIDATION:
- BEFORE analyzing, verify this is actually a PLANT image
- If the image shows: animals, people, objects, buildings, food (non-plant), vehicles, or anything that is NOT a living plant → IMMEDIATELY respond with the "notAPlant" JSON format below
- Only proceed with plant analysis if you see actual plant material (leaves, stems, roots, flowers, fruits on the plant)

IMPORTANT RULES:
1. Look at EVERY visual detail: leaf color, spots, lesions, powdery coatings, wilting, root symptoms, stem damage, fruit damage, insect presence, etc.
2. If multiple diseases/issues are present, identify the PRIMARY one causing the most damage.
3. Be VERY SPECIFIC — don't say "fungal disease", say the exact scientific and common name (e.g., "Early Blight (Alternaria solani)").
4. Severity classification:
   - "high" = plant is severely affected, spread is likely, urgent action needed, crop loss risk
   - "medium" = moderate infection, treatable but needs prompt attention
   - "low" = early stage or mild infection, plant is mostly healthy
5. If the plant looks completely healthy, say "Healthy Plant" and explain why.
6. Confidence must reflect your certainty based on visible symptoms.
7. Keep suggestions CONCISE and ACTIONABLE - maximum 3-4 items per category.
8. Focus on the MOST EFFECTIVE treatments first.
9. Always include a detailed 7-day treatment roadmap.
10. Always mention the plant species you identified at the start of the description.

IF NOT A PLANT IMAGE, respond with this JSON:
{
  "notAPlant": true,
  "detectedObject": "Brief description of what you see (e.g., 'a cat', 'a building', 'a person')",
  "message": "This image does not appear to contain a plant. Please upload an image of a plant (leaves, stems, flowers, or fruits) for disease analysis."
}

IF IT IS A PLANT, respond ONLY with a single valid JSON object. No markdown fences, no extra text, just raw JSON:

{
  "diseaseName": "Exact disease name (Common Name + Scientific Name if applicable)",
  "plantIdentified": "Name of the plant species identified",
  "isHealthy": false,
  "severity": "high",
  "confidence": "High Confidence",
  "description": "Start with: 'The plant identified appears to be [plant name]. [Then 3-4 sentences describing the disease in expert detail — exact symptoms visible in the image, disease progression stage, how it spreads, which parts of the plant are affected, impact on yield/health, environmental conditions that favor it.]'",
  "causes": [
    "Primary causal organism with full scientific name",
    "Main environmental trigger with specific conditions",
    "Key contributing factor (irrigation, spacing, etc.)",
    "Primary spread mechanism"
  ],
  "homeRemedies": [
    "**Neem Oil Spray:** 5ml neem oil + 1L water + 2ml soap. Spray weekly evenings. Disrupts fungal membranes.",
    "**Baking Soda Solution:** 1 tbsp baking soda + 1 tsp oil + 1 tsp soap in 1L water. Spray weekly. Changes leaf pH.",
    "**Copper Fungicide:** Mix copper sulfate + lime in water. Classical antifungal treatment.",
    "**Remove Infected Parts:** Prune and destroy infected tissue immediately. Reduces disease spread."
  ],
  "chemicalTreatments": [
    "**Azoxystrobin 23% SC:** 1ml/L water. Spray every 10-14 days. Systemic fungicide. Max 3 applications.",
    "**Mancozeb 75% WP:** 2.5g/L water. Spray every 7-10 days. Contact fungicide for prevention.",
    "**Carbendazim + Mancozeb:** 2g/L water. Dual action systemic + contact protection.",
    "**Copper Oxychloride 50%:** 3g/L water. Broad-spectrum fungicide/bactericide."
  ],
  "prevention": [
    "**Disease-Free Seeds:** Use certified, treated seeds from reliable suppliers.",
    "**Crop Rotation:** Avoid same crop family for 2-3 years in same location.",
    "**Drip Irrigation:** Keep foliage dry. Avoid overhead watering.",
    "**Proper Spacing:** Ensure good air circulation between plants."
  ],
  "treatmentRoadmap": {
    "day1": "**Immediate Action:** Remove all infected leaves/stems. Spray with neem oil solution in evening. Improve drainage if waterlogged.",
    "day2": "**Follow-up:** Check for new symptoms. Apply copper fungicide if disease is spreading. Reduce watering frequency.",
    "day3": "**Monitoring:** Inspect plant thoroughly. If symptoms persist, switch to chemical treatment (Mancozeb). Ensure good air circulation.",
    "day4": "**Assessment:** Evaluate treatment effectiveness. If improvement seen, continue current treatment. If worsening, apply systemic fungicide.",
    "day5": "**Maintenance:** Continue monitoring. Apply second round of chosen treatment. Remove any new infected tissue immediately.",
    "day6": "**Progress Check:** Document improvement or decline. Adjust treatment intensity based on response. Consider soil treatment if root issues.",
    "day7": "**Weekly Review:** Assess overall plant health. Plan next week's treatment schedule. Switch treatments if no improvement seen."
  }
}

SEVERITY QUICK GUIDE for your assessment:
- High: >40% of plant/leaf area affected, wilting present, multiple plants affected, fruit/root damage visible
- Medium: 15-40% affected, localized lesions, single plant issue
- Low: <15% affected, early spots only, plant otherwise vigorous
`;

const withRetry = async (fn, maxRetries = 5, initialDelay = 2000) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorMsg = error.message || '';
      const isRetryable = errorMsg.includes('503') || 
                         errorMsg.includes('429') || 
                         errorMsg.includes('UNAVAILABLE') ||
                         errorMsg.includes('high demand') ||
                         errorMsg.includes('overloaded');
      
      if (!isRetryable || i === maxRetries - 1) break;
      
      const delay = initialDelay * Math.pow(2, i);
      console.warn(`AI Model busy (Attempt ${i + 1}/${maxRetries}). Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};

export const analyzePlant = async (imageFileOrBase64, textDescription, lang = 'en', extraContext = null) => {
  if (!ai) {
    throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  const langInstruction = lang === 'hi'
    ? 'IMPORTANT: Translate ALL text values in the JSON response to Hindi. Keep JSON keys in English but all values must be in Hindi.'
    : 'Provide all text in English.';

  let promptText = ANALYSIS_PROMPT + '\n\n' + langInstruction;

  if (textDescription) {
    promptText += `\n\nUser's description of the plant symptoms: ${textDescription}`;
  }

  if (extraContext) {
    promptText += `\n\nADDITIONAL SMART CONTEXT (USE THIS IN YOUR ANALYSIS):
    - Recent Weather: ${extraContext.weather || 'Unknown'}
    - Plant Age: ${extraContext.age || 'Unknown'}
    - Watering Frequency: ${extraContext.watering || 'Unknown'}
    - Environment: ${extraContext.environment || 'Unknown'}`;
  }

  const parts = [{ text: promptText }];

  if (imageFileOrBase64) {
    if (typeof imageFileOrBase64 === 'string') {
      if (imageFileOrBase64.startsWith('data:')) {
        parts.push(base64ToGenerativePart(imageFileOrBase64));
      } else {
        // Handle URLs (Sample Library)
        try {
          const response = await fetch(imageFileOrBase64);
          const blob = await response.blob();
          const base64 = await fileToBase64(new File([blob], 'sample.png', { type: blob.type }));
          parts.push(base64ToGenerativePart(base64));
        } catch (e) {
          console.error("Failed to fetch image URL:", e);
          throw new Error("Could not process the sample image. Please try again.");
        }
      }
    } else if (imageFileOrBase64 instanceof File) {
      const base64 = await fileToBase64(imageFileOrBase64);
      parts.push(base64ToGenerativePart(base64));
    }
  }

  if (!imageFileOrBase64 && !textDescription) {
    throw new Error("Please provide either an image or a text description.");
  }

  try {
    const textOutput = await withRetry(async () => {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [{ role: 'user', parts }],
        config: {
          temperature: 0.2,
          topP: 0.85,
          topK: 20,
        }
      });
      return result.text;
    });

    const cleanedText = textOutput.replace(/```json\n?|```\n?/g, '').trim();
    const parsed = JSON.parse(cleanedText);
    
    // Check if it's not a plant
    if (parsed.notAPlant) {
      throw new Error(parsed.message || "This image does not appear to contain a plant. Please upload an image of a plant for disease analysis.");
    }
    
    return parsed;
  } catch (e) {
    console.error("AI Service Error:", e);
    if (e.message.includes('503') || e.message.includes('UNAVAILABLE')) {
      throw new Error("The AI service is currently overloaded. Please wait 10 seconds and try again.");
    }
    throw new Error(e.message || "The AI returned an unreadable response. Please try again with a clearer image.");
  }
};

export const chatFollowUp = async (question, diseaseContext, plantContext, lang = 'en') => {
  if (!ai) throw new Error("Gemini API key is not configured.");

  const langInstruction = lang === 'hi'
    ? 'Answer strictly in Hindi.'
    : 'Answer strictly in English.';

  const systemPrompt = `You are an expert agricultural scientist and plant pathologist. The user's plant was diagnosed with "${diseaseContext}" on a "${plantContext}". Answer their follow-up question with expert knowledge — be specific, practical and helpful. Keep your answer concise (3-5 sentences) unless a longer answer is clearly needed. ${langInstruction}\n\nUser question: ${question}`;

  try {
    return await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        config: { temperature: 0.3 }
      });
      return response.text;
    });
  } catch (e) {
    console.error("Chat Error:", e);
    throw new Error("Failed to get follow-up answer. The AI might be busy.");
  }
};
