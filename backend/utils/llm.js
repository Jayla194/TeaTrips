const axios = require("axios");

const API_KEY = process.env.API_KEY;
const MODEL = "gemma-3-4b-it";

async function generateText(prompt) {
    try {
        const res = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
            {
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    
                }
            }
        );

        // Pull the first text block from response
        const text = res.data.candidates?.[0]?.content?.parts
            ?.map((part) => part?.text || "")
            .join("")
            .trim();

        return text;
    } catch (err) {
        // If Gemini rejects the request, pass error
        throw new Error(`Gemini request failed: ${err?.response?.status || "unknown"} ${JSON.stringify(err?.response?.data || {})}`);
    }
}

module.exports = { generateText };