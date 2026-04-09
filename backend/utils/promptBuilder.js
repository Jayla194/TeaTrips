// prompt for descriptions
function buildPrompt(location, reviews) {

    return `
        Write a short travel description for ${location.name} in ${location.city}.

        Use these details:
        ${location.description_short || ""}
        ${location.tags || ""}

        Visitor impressions:
        ${reviews.map(r => "- " + r.text.slice(0, 60)).join("\n")}

        Write 1-2 full paragraphs total.

        Formatting:
        - You may use one short paragraph or two short paragraphs if it feels natural
        - If you use two paragraphs, separate them with a blank line
        - Do not use em dashes
        - Do not quote review text verbatim; paraphrase the impressions instead
        - Do not write in first person when reflecting reviews
        - Prefer third-person phrasing like "visitors often find themselves returning" or "many guests come back for the atmosphere"
        - Avoid repeating exact review wording such as "I always find myself coming back" or "they're consistently amazing"

        Make sure:
        - the paragraph feels complete
        - you do not stop after one sentence
        - you do not use bullet points
        - you do not sound like a list

        Write naturally like a travel guide.
    `;
}
module.exports = { buildPrompt };