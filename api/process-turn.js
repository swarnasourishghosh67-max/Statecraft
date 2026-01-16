import generateAIResponse from "./generate-ai-response";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { state, action } = req.body;

    if (!state || !action) {
      return res.status(400).json({ error: "Missing state or action" });
    }

    const aiResult = await generateAIResponse({
      state,
      actionText: action,
    });

    const updatedState = {
      ...state,
      turn: state.turn + 1,
      history: [...state.history, action],
      aiResponse: aiResult.output,
    };

    return res.status(200).json({
      success: true,
      state: updatedState,
      ai: aiResult.output,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to process turn." });
  }
}