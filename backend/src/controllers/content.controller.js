const { logger } = require("../utils/logger");
const { generateWithOpenAI } = require("../services/open.service");

const extractJSON = (text) => {
    const cleaned = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(cleaned);
};

const generateContentStrategy = async (req, res, next) => {
    try {
        const { keyword } = req.body;

        if (!keyword) {
            const err = new Error("Keyword required");
            err.statusCode = 400;
            throw err;
        }

        const logs = [];
        const pushLog = (type, message) => {
            logs.push({
                type,
                message,
                time: new Date().toLocaleTimeString(),
            });
        };

        logger.info(`Content strategy requested for: ${keyword}`);

        pushLog("info", "Calling OpenAI");
        pushLog("info", `Analyzing niche: "${keyword}"`);

        const prompt = `
Create an SEO content strategy.

Keyword: "${keyword}"

Return ONLY valid JSON.
Do not add markdown or explanations.

Format:
{
  "pillar": "",
  "clusters": [],
  "calendar": []
}
`;

        const aiText = await generateWithOpenAI(prompt);

        pushLog("info", "Parsing AI response");

        let result;
        try {
            result = extractJSON(aiText);
        } catch {
            pushLog("error", "AI response parsing failed");
            throw new Error("Invalid AI response format");
        }

        pushLog("success", "AI content strategy generated");

        res.json({
            success: true,
            keyword,
            logs,
            result,
            generatedAt: new Date(),
        });
    } catch (err) {
        logger.error("Content strategist error", err);
        next(err);
    }
};

module.exports = { generateContentStrategy };
