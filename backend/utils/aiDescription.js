const { buildPrompt } = require("./promptBuilder");
const { generateText } = require("./llm");
const locationModel = require("../models/locationModel");
const reviewModel = require("../models/reviewModel");


// Tidy up spacing so the saved text is easier to read.
function clean(text) {
    return String(text || "")
        .replace(/\s+/g, " ")
        .trim();
}

async function getOrGenerateDescription(locationId) {
    const location = await locationModel.getLocationById(locationId);

    if (!location) {
        return null;
    }

    const currentDescription = clean(location.description_long);

    if (currentDescription) {
        return currentDescription;
    }

    // Only generate when the description is missing, and use a few reviews for context.
    const reviews = await reviewModel.getTopReviewsByLocation(locationId, 3);

    try {
        const prompt = buildPrompt(location, reviews);
        const generated = await generateText(prompt);
        const cleaned = clean(generated);

        if (!cleaned) {
            throw new Error("Empty LLM response");
        }

        // Save the new description so future page loads do not regenerate it.
        await locationModel.updateLocationDescription(locationId, {
            description: cleaned,
            review_count_at_generation: await reviewModel.getReviewCountByLocation(locationId),
            description_last_generated: new Date()
        });

        return cleaned;
    } catch (err) {
        // If Gemini fails, do not save anything so description_long stays empty.
        console.error(`Error generating description for location ${locationId}:`, err.message);
        return clean(location.description_short || "");
    }
}

module.exports = { getOrGenerateDescription };
