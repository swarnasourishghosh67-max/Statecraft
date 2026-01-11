
import { GoogleGenAI, Type } from "@google/genai";
import { GameState, AIResponse, TimeScale, ChatMessage, ExplorationResponse } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Processes a life action using Gemini 3 Flash.
 * The system acts as a "Self-Improving Game Master" by analyzing tacticalProfile.
 */
export async function processLifeAction(
  currentState: GameState,
  actionText: string,
  timeScale: TimeScale
): Promise<AIResponse> {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';

  const systemInstructions = `
    SYSTEM CORE: "DYNAMIC CHRONICLE ADAPTATION"
    
    You are a self-evolving game engine. You must analyze the provided Player Tactical Profile to "improve" the game's challenge:
    1. ECONOMIC HOARDING: If the player hoards wealth, trigger inflation crises, burglaries, or wealth-tithes.
    2. AGGRESSION: If the player is violent, trigger defensive coalitions or local militia revolts.
    3. SUBTERFUGE: If the player relies on whispers, introduce counter-intelligence or burned spy networks.
    4. PROMOTING NEWS: If a player promotes news, it MUST consume a significant amount of treasury (coins). However, this action should significantly popularise the event, improving Public Image or Faction Standing depending on the headline content.
    
    EVOLUTION RULE: 
    - Every turn, increase "adaptationLevel" slightly if the player is successful.
    - As "adaptationLevel" increases, the world's responses should become more complex and institutional.
    - Provide an "adaptationNote" explaining how the world is reacting to the player's specific tactical trends.
    
    TONE: Authentic, brutal, 15th-century. Use specific historical consequences.
  `;

  const profile = currentState.tacticalProfile;

  const prompt = `
    PLAYER TACTICAL PROFILE:
    - Economic Bias: ${profile.economicActions}
    - Aggression Bias: ${profile.aggressiveActions}
    - Diplomatic Bias: ${profile.diplomaticActions}
    - Subterfuge Bias: ${profile.subterfugeActions}
    - Success Rate: ${profile.successRate}%
    - World Adaptation Level: ${profile.adaptationLevel}

    Context: Turn ${currentState.turn}, Loc: ${currentState.locationPath.join('/')}, Gold: ${currentState.treasury}
    Stats: H:${currentState.health}, S:${currentState.safety}, Rep: P:${currentState.publicImage}/N:${currentState.nobleStanding}/C:${currentState.clergyTrust}
    
    Current Action: "${actionText}" (Scale: ${timeScale})
    
    Analyze the action and evolve the simulation. Respond strictly in JSON.
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
            adaptationNote: { type: Type.STRING, description: 'Internal AI thought on how it is improving/adjusting the game' },
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
                adaptationIncrease: { type: Type.NUMBER, description: 'How much the world learned from this turn' },
                newTraits: { type: Type.ARRAY, items: { type: Type.STRING } },
                newRankTitle: { type: Type.STRING },
                newLocationPath: { type: Type.ARRAY, items: { type: Type.STRING } },
                updatedScenarios: { type: Type.ARRAY, items: { type: Type.STRING } },
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
    console.error("AI Core Error:", e);
    return {
      narrative: `The cycle of power continues, indifferent to your choices.`,
      suggestions: ["Observe local rumors"],
      stateUpdates: { treasuryChange: 0, incomeChange: 0, expenseChange: 0, publicChange: 0, nobleChange: 0, clergyChange: 0, cunningChange: 0, safetyChange: 0, healthChange: 0 }
    };
  }
}

export async function exploreLocation(locationName: string): Promise<ExplorationResponse> {
  const ai = getAI();
  const model = 'gemini-2.5-flash';

  const prompt = `Research the EXACT historical hierarchy for "${locationName}" circa 1400-1450 AD using Google Maps grounding. 
  Identify Sovereign, Peerage, and Ecclesiastical seat. Return strictly in JSON.`;

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
      hierarchy: [{ rank: 'King', name: 'Charles VI', influence: 90 }],
      churchInfo: { title: 'Pope', ruler: 'Benedict XIII' },
      description: 'Records are obscured by time.'
    };
  }
}

export async function getChatbotResponse(history: ChatMessage[]): Promise<string> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })),
      config: { systemInstruction: "You are the Chronicle Sage. Provide short, atmospheric medieval answers." }
    });
    return response.text || "The archives are sealed.";
  } catch (e) {
    return "The ink has run dry.";
  }
}
