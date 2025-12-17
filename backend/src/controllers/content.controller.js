const { logger } = require("../utils/logger")

const generateContentStrategy = async (req, res, next) => {
    try {
        const { keyword } = req.body;
        if (!keyword) {
            const err = new Error("Kyeword required");
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
        }

        logger.info(`Content strategy requested for: ${keyword}`);

        pushLog("info", "Initializing AI Content Strategist");
        pushLog("info", `Analyzing niche: "${keyword}"`);
        pushLog("info", "Detecting search intent");
        pushLog("info", "Generating topic clusters");
        pushLog("info", "Building content calendar");

        const result = {
            pillar: `Complete guide to ${keyword}`,
            clusters: [
                `What is ${keyword}`,
                `Beniits of ${keyword}`,
                `Common mistakes in ${keyword}`,
                `Best tools for ${keyword}`,
            ],
            calender: [
                "Week 1: Pillar article",
                "Week 2: Cluster articles",
                "Week 3: Tools & comparisons",
            ],
        }

        pushLog("success", "Content strategy generated successfully");

        res.json({
            sussess: true,
            keyword,
            result,
            logs,
            generatedAt: new Date(),
        });
    } catch (err) {
        logger.error("Content strategist error", err);
        next(err);
    }
}

module.exports = {
    generateContentStrategy,
};
