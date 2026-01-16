import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send({ error: "Only POST allowed" });

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).send({ error: "Prompt required" });

    const apiKey = process.env.GEMINI_KEY; // secure API key stored on Vercel
    if (!apiKey) return res.status(500).send({ error: "API key not set" });

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
}