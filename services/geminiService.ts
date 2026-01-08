
import { GoogleGenAI, Type } from "@google/genai";
import { GameState, AIResponse, TimeScale, ChatMessage } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Processes a life action using Gemini 3 Flash for low-latency, reliable strategic output.
 */
export async function processLifeAction(
  currentState: GameState,
  actionText: string,
  timeScale: TimeScale
): Promise<AIResponse> {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';

  const systemInstructions = `
    SYSTEM BLUEPRINT: "THE REALM OF POWER"
    
    CONTINUITY & CONTEXT:
    - You MUST track the active scenarios and narrative threads listed in the state.
    - Reference previous turns (provided in recent logs) to ensure story consistency.
    - If a war or crisis is ongoing, your narrative MUST reflect its progression.
    
    PRECISE RESOURCE ALLOCATION:
    - If the user specifies a numerical amount of gold to spend (e.g., "Spend 50 gold on X"), you MUST reflect that EXACT amount in treasuryChange (as a negative value).
    - Spend gold ONLY on what the player explicitly commands.
    - Do NOT auto-invest treasury into factions or groups unless requested.
    
    WORLD EVENTS: War, plague, heresy, trade (news every 3-5 turns).
    RULES: Balanced difficulty. Reward clever play. Plots need prep. 
    Reputation: Public, Noble, Clergy. 
    TONE: Authentic, medieval, concise. Avoid instant game overs unless critical.
  `;

  // Provide recent logs for context maintenance
  const recentHistory = currentState.logs.slice(-5).map(l => `T-${l.turn}: ${l.message}`).join('\n');
  const activeScenariosText = currentState.activeScenarios.join(', ') || 'None';

  const prompt = `
    Active Scenarios: ${activeScenariosText}
    Recent History:
    ${recentHistory}

    Context: Loc: ${currentState.locationPath.join('/')}, Age: ${currentState.age}, Gold: ${currentState.treasury}
    Stats: Health:${currentState.health}, Safety:${currentState.safety}, Rep: P:${currentState.publicImage}/N:${currentState.nobleStanding}/C:${currentState.clergyTrust}
    Action: "${actionText}" (Scale: ${timeScale})
    
    Respond strictly in JSON per schema. 
    - Ensure treasuryChange reflects EXACT amounts if specified in action.
    - update updatedScenarios to reflect new or resolved narrative threads.
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
                },
                factionUpdates: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      opinion: { type: Type.NUMBER },
                      influence: { type: Type.NUMBER }
                    }
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

    const text = response.text;
    if (!text) throw new Error("Empty response");
    const cleaned = text.replace(/```json\s?|```/g, "").trim();
    return JSON.parse(cleaned);

  } catch (e) {
    console.warn("AI Interaction Issue, using fallback:", e);
    return {
      narrative: `You spent a period focusing on your duties as a ${currentState.rankTitle}. The world continues to turn, and your survival is for now assured.`,
      suggestions: [
        "Inquire about local rumors",
        "Seek to increase your meager savings",
        "Train your mind and body"
      ],
      stateUpdates: {
        treasuryChange: 0, // Fallback safe: don't spend money automatically
        incomeChange: 0,
        expenseChange: 0,
        publicChange: 0,
        nobleChange: 0,
        clergyChange: 0,
        cunningChange: 1,
        safetyChange: 0,
        healthChange: 0
      }
    };
  }
}

export async function getChatbotResponse(history: ChatMessage[]): Promise<string> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })),
      config: { 
        systemInstruction: "You are the Chronicle Sage. Short, helpful, medieval style answers only."
      }
    });
    return response.text || "History awaits your next move.";
  } catch (e) {
    return "The quill has run dry. Ask again shortly.";
  }
}
