export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!global.savedState) {
      return res.status(200).json({
        success: true,
        archives: [],
        message: "No saved states available.",
      });
    }

    return res.status(200).json({
      success: true,
      archives: [global.savedState],
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load archives." });
  }
}