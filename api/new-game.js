export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const initialState = {
      turn: 1,
      history: [],
      stats: {
        influence: 50,
        resources: 50,
        stability: 50,
      },
    };

    return res.status(200).json({
      success: true,
      state: initialState,
      message: "New game started.",
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create new game." });
  }
}