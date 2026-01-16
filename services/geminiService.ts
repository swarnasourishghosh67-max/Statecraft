import { GoogleGenAI, Type } from "@google/genai";
import { GameState, AIResponse, TimeScale, ChatMessage, ExplorationResponse } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Processes a life action using Gemini 3 Flash.
 */
export async function processLifeAction(
  currentState: GameState,
  actionText: string,
  timeScale: TimeScale
): Promise<AIResponse> {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';

  const systemInstructions = `
    SYSTEM CORE: "HISTORICAL CHRONICLE ENGINE"
    
    You are a high-fidelity historical simulator. You must ground your narrative in the current year: ${currentState.year} AD.
    
    ERA CONTEXT:
    1. 1400-1550 (FEUDAL): Heavy focus on knights, castles, the Church's iron grip, and local lords.
    2. 1550-1750 (IMPERIAL): Rise of gunpowder, colonization, absolute monarchs, and scientific curiosity.
    3. 1750-1850 (REVOLUTIONARY): The Enlightenment, Napoleonic influence, republics vs monarchs, and the birth of modern ideology.
    4. 1850-1950 (INDUSTRIAL/MODERN): Steam, rail, factories, labor unions, world wars, and the decay of old royalty.

    DYNAMIC ADAPTATION:
    - ECONOMIC: If year > 1850, use factory strikes or stock market crashes instead of "tithes".
    - PROMOTING NEWS: Costs treasury. Spreads influence. In 1400, this is "Heralds and Criers". In 1890, it is "Newspaper Propaganda".
    - WORLD EVENTS: Interleave real historical trends (e.g., if year is ~1415, mention Agincourt; if ~1789, mention the Bastille; if ~1914, mention the Great War).
    
    TONE: Brutal, immersive, and historically cynical. Power is zero-sum.
  `;

  const profile = currentState.tacticalProfile;

  const prompt = `
    CURRENT DATE: Month ${currentState.month}, ${currentState.year} AD.
    PLAYER STATUS: ${currentState.characterName} (${currentState.rankTitle}), Age ${currentState.age}.
    STATS: Gold: ${currentState.treasury}, Health: ${currentState.health}, Safety: ${currentState.safety}.
    
    PLAYER TACTICAL PROFILE (for AI adaptation):
    - Econ Bias: ${profile.economicActions}, Aggr Bias: ${profile.aggressiveActions}, Dipl Bias: ${profile.diplomaticActions}, Subt Bias: ${profile.subterfugeActions}.
    
    Current Action: "${actionText}" (Time Scale: ${timeScale}).
    
    Evolve the story. Respond strictly in JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstructions,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narrative: { type: Type.STRING },
            adaptationNote: { type: Type.STRING },
            whisper: { type: Type.STRING },
            rippleContext: { type: Type.STRING },
            stateUpdates: {
              type: Type.OBJECT,
              properties: {
                treasuryChange: { type: Type.NUMBER },
                incomeChange: { type: Type.NUMBER },
                expenseChange: { type: Type.NUMBER },
                publicChange: { type: Type.NUMBER },
                nobleChange: { type: Type.NUMBER },
                clergyChange: { type: Type.NUMBER },
                cunningChange: { type: Type.NUMBER },
                safetyChange: { type: Type.NUMBER },
                healthChange: { type: Type.NUMBER },
                adaptationIncrease: { type: Type.NUMBER },
                newTraits: { type: Type.ARRAY, items: { type: Type.STRING } },
                newRankTitle: { type: Type.STRING },
                newLocationPath: { type: Type.ARRAY, items: { type: Type.STRING } },
                newWorldEvent: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    category: { type: Type.STRING },
                    headline: { type: Type.STRING },
                    body: { type: Type.STRING },
                    impactLabel: { type: Type.STRING }
                  }
                }
              },
              required: ["treasuryChange", "incomeChange", "expenseChange", "publicChange", "nobleChange", "clergyChange", "healthChange", "safetyChange"]
            },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            gameOver: { type: Type.BOOLEAN },
            gameOverReason: { type: Type.STRING }
          },
          required: ["narrative", "stateUpdates", "suggestions"]
        }
      }
    });

    return JSON.parse(response.text.replace(/```json\s?|```/g, "").trim());
  } catch (e) {
    return {
      narrative: `The tide of history turns at ${currentState.year} AD.`,
      suggestions: ["Consult the chronicles"],
      stateUpdates: { treasuryChange: 0, incomeChange: 0, expenseChange: 0, publicChange: 0, nobleChange: 0, clergyChange: 0, cunningChange: 0, safetyChange: 0, healthChange: 0 }
    };
  }
}

export async function exploreLocation(locationName: string, year: number): Promise<ExplorationResponse> {
  const ai = getAI();
  const model = 'gemini-2.5-flash';

  const prompt = `Identify the EXACT historical power structure for "${locationName}" during the year ${year} AD. 
  
  ADJUST TITLES FOR ERA:
  - If year < 1800: Use Duke, Bishop, Count, Lord.
  - If 1800 < year < 1900: Use Governor, Mayor, Prime Minister, Industrial Baron.
  - If year > 1900: Use President, General, CEO, Secretary.
  
  Identify Sovereign (Secular), Ecclesiastical (or ideological) seat, and the hierarchy of influence. 
  Return strictly in JSON. Use Google Maps grounding for accuracy.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hierarchy: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rank: { type: Type.STRING },
                  name: { type: Type.STRING },
                  influence: { type: Type.NUMBER }
                }
              }
            },
            churchInfo: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                ruler: { type: Type.STRING }
              }
            },
            description: { type: Type.STRING }
          },
          required: ["hierarchy", "churchInfo", "description"]
        }
      }
    });

    const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const mapsUri = grounding?.find((chunk: any) => chunk.maps)?.maps?.uri;

    const data = JSON.parse(response.text.replace(/```json\s?|```/g, "").trim());
    return { ...data, mapsUri };
  } catch (e) {
    return {
      hierarchy: [{ rank: 'Executive', name: 'Unknown Figure', influence: 50 }],
      churchInfo: { title: 'Leader', ruler: 'Anonymous' },
      description: 'The archives of this era are difficult to parse.'
    };
  }
}

export async function getChatbotResponse(history: ChatMessage[]): Promise<string> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })),
      config: { systemInstruction: "You are the Chronicle Sage. Provide short, atmospheric historical answers relevant to the 15th-20th centuries." }
    });
    return response.text || "The archives are sealed.";
  } catch (e) {
    return "The ink has run dry.";
  }
}