const growthService = require("../services/growthService");

async function applyAction(req, res) {
  try {
    const { actionType, metadata } = req.body;
    if (!actionType || typeof actionType !== "string") {
      return res.status(400).json({ message: "actionType is required." });
    }
    const { growth, leveledUpTraits } = await growthService.applyAction(
      req.userId,
      actionType,
      metadata || {}
    );
    const formatted = growthService.formatGrowthForResponse(growth);
    return res.status(200).json({
      growth: formatted,
      leveledUpTraits,
      leveledUp: leveledUpTraits.length > 0,
    });
  } catch (err) {
    return res.status(500).json({ message: "Growth update failed" });
  }
}

async function getGrowth(req, res) {
  try {
    const growth = await growthService.getOrCreateGrowth(req.userId);
    const formatted = growthService.formatGrowthForResponse(growth);
    return res.json({ growth: formatted });
  } catch (err) {
    return res.status(500).json({ message: "Growth update failed" });
  }
}

module.exports = { applyAction, getGrowth };
