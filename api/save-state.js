export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { state } = req.body;

    if (!state) {
      return res.status(400).json({ error: "No state provided" });
    }

    // Placeholder until you integrate database or KV
    global.savedState = state;

    return res.status(200).json({
      success: true,
      message: "State saved temporarily (no database configured yet).",
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to save state." });
  }
}