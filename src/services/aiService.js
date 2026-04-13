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
7. Product names for chemical treatments must be REAL, commercially available products with accurate active ingredients and dosages.
8. Home remedies must be practical, proven, with exact preparation methods.
9. Prevention advice must be specific to THIS disease, not generic.
10. Always mention the plant species you identified at the start of the description.

Respond ONLY with a single valid JSON object. No markdown fences, no extra text, just raw JSON:

{
  "diseaseName": "Exact disease name (Common Name + Scientific Name if applicable)",
  "plantIdentified": "Name of the plant species identified",
  "isHealthy": false,
  "severity": "high",
  "confidence": "High Confidence",
  "description": "Start with: 'The plant identified appears to be [plant name]. [Then 5-7 sentences describing the disease in expert detail — exact symptoms visible in the image, disease progression stage, how it spreads, which parts of the plant are affected, impact on yield/health, environmental conditions that favor it.]'",
  "causes": [
    "Primary causal organism with full scientific name, e.g., 'Fungal pathogen Phytophthora infestans, a water mold that produces zoospores'",
    "Environmental trigger 1 with specific thresholds (e.g., 'High humidity above 90% combined with temperatures of 10-25°C creates ideal sporulation conditions')",
    "Environmental trigger 2",
    "Agronomic practice that contributed (e.g., 'Overhead irrigation wetting foliage, extended leaf wetness periods exceeding 4 hours')",
    "Soil/root factor if applicable",
    "Spread mechanism (wind, water splash, insects, infected seeds, contaminated tools)"
  ],
  "homeRemedies": [
    "**Neem Oil Spray:** Mix 5ml pure cold-pressed neem oil + 1 liter warm water + 2ml liquid dish soap. Shake well. Spray on all leaf surfaces including undersides every 7 days in the evening. Effective due to azadirachtin which disrupts fungal cell membranes.",
    "**Baking Soda Solution:** Dissolve 1 tablespoon baking soda + 1 teaspoon vegetable oil + 1 teaspoon dish soap in 1 liter water. Spray weekly. Changes leaf surface pH making it hostile to fungal growth.",
    "**Copper-Lime Bordeaux Mixture:** Mix 100g copper sulfate + 100g hydrated lime in 10 liters water. Apply as spray. Classical antifungal/antibacterial treatment used for 150+ years.",
    "**Garlic Extract Spray:** Blend 10 garlic cloves in 500ml water, strain, dilute 1:10 with water, add few drops soap. Spray every 5-7 days. Allicin in garlic is a natural broad-spectrum antimicrobial.",
    "**Turmeric-Ginger Paste Spray:** Blend 50g turmeric + 50g fresh ginger in 1L water, strain, spray on leaves. Both have proven antifungal and antibacterial compounds.",
    "**Apple Cider Vinegar Spray:** Mix 3 tablespoons ACV in 4 liters water. Spray every 7-10 days — the acidity disrupts pathogen cell walls.",
    "**Ash Treatment:** Dust dry wood ash directly on infected areas. Ash raises local pH and provides potassium while creating inhospitable conditions for most pathogens.",
    "**Compost Tea:** Brew finished compost in water for 24-48 hours, strain, apply as foliar spray. Introduces beneficial microorganisms that outcompete pathogens.",
    "**Remove & Destroy Infected Tissue:** Prune and bag infected leaves/stems immediately. Do NOT compost. This reduces inoculum pressure dramatically.",
    "**Improve Air Circulation:** Space plants further apart or prune dense canopy. Faster leaf drying time under 4 hours is critical to break infection cycle."
  ],
  "chemicalTreatments": [
    "**Syngenta Amistar (Azoxystrobin 23% SC):** Dosage: 1ml per liter of water. Apply as foliar spray every 10-14 days. Systemic strobilurin fungicide — absorbed into plant tissue and translocated. Do not apply more than 3 times per season to prevent resistance.",
    "**Bayer Dithane M-45 (Mancozeb 75% WP):** Dosage: 2.5g per liter of water. Apply every 7-10 days as protective spray before infection. Contact fungicide with multi-site action — excellent for preventing spread.",
    "**UPL Saaf (Carbendazim 12% + Mancozeb 63% WP):** Dosage: 2g per liter. Apply every 7-10 days. Dual mode of action — systemic + contact protection against a wide range of fungal diseases.",
    "**BASF Cabrio Top (Metiram 55% + Pyraclostrobin 5% WG):** Dosage: 2g per liter. Apply every 10-15 days. Strobilurin + dithiocarbamate combination provides both systemic and contact protection.",
    "**Coromandel Indofil Z-78 (Zineb 75% WP):** Dosage: 2g per liter. Spray every 7-10 days. Protectant fungicide especially effective against early-stage infections.",
    "**PI Industries Custodia (Azoxystrobin 11% + Tebuconazole 18.3% SC):** Dosage: 1ml per liter. Apply every 10-14 days. Triazole + strobilurin dual systemic action, broad spectrum.",
    "**Dhanuka Taqat (Hexaconazole 4% + Zineb 68% WP):** Dosage: 2g per liter. Apply every 10-15 days. Excellent for systemic diseases with curative and protective properties.",
    "**Rallis Blitox (Copper Oxychloride 50% WP):** Dosage: 3g per liter. Spray every 10 days. Broad-spectrum copper-based fungicide/bactericide with good patient safety profile."
  ],
  "prevention": [
    "**Certified Disease-Free Seeds/Planting Material:** Always source seeds or seedlings from certified suppliers tested for major pathogens. Treat seeds with Thiram or Captan (2g/kg seed) before sowing.",
    "**Crop Rotation:** Never plant the same crop family in the same location for at least 2-3 years. This breaks the soil-borne disease cycle as most pathogens are host-specific.",
    "**Drip Irrigation Over Overhead:** Switch to drip/furrow irrigation to keep foliage dry. Most fungal and bacterial diseases require free moisture on leaves for 4+ hours to infect.",
    "**Proper Plant Spacing:** Maintain recommended inter-row and intra-row spacing to maximize air flow. Dense canopies trap humidity and create microclimates favorable to disease.",
    "**Soil pH Management:** Maintain soil pH between 6.0-6.8. Proper pH optimizes nutrient availability and reduces susceptibility to soil-borne pathogens. Test and amend with lime or sulfur as needed.",
    "**Balanced NPK Fertilization:** Avoid excess nitrogen which promotes soft, lush tissue highly susceptible to infection. Ensure adequate potassium and calcium for cell wall strength.",
    "**Tool Sanitation:** Sterilize pruning tools with 70% alcohol or 10% bleach solution between cuts and between plants to prevent mechanical transmission.",
    "**Field Hygiene:** Remove and destroy all crop residues after harvest. Many pathogens overwinter in debris and reinfect next season's crop.",
    "**Early Monitoring:** Scout fields weekly. Early detection allows treatment before exponential spread. Use sticky yellow traps for insect vectors that transmit diseases.",
    "**Resistant Varieties:** Select varieties bred for resistance to this specific disease when available. Check with your local agricultural extension office for regionally appropriate resistant cultivars."
  ]
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

export const analyzePlant = async (imageFileOrBase64, textDescription, lang = 'en') => {
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
        contents: systemPrompt,
        config: { temperature: 0.3 }
      });
      return response.text;
    });
  } catch (e) {
    console.error("Chat Error:", e);
    throw new Error("Failed to get follow-up answer. The AI might be busy.");
  }
};
