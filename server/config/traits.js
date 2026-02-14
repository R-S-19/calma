/**
 * Trait keys and display names. Do not hardcode trait names elsewhere.
 */
const TRAIT_KEYS = ["consistency", "attention", "momentum", "awareness", "learning"];

const TRAIT_LABELS = {
  consistency: "Consistency",
  attention: "Attention",
  momentum: "Momentum",
  awareness: "Awareness",
  learning: "Learning",
};

const TITLE_BY_LEVEL = {
  5: "The Beginner",
  10: "Focused Builder",
  15: "Steady Climber",
  20: "Deep Worker",
  30: "Architect",
  40: "Calm Operator",
  50: "Master of Flow",
};

const MAX_LEVEL = 50;

function getRequiredXP(level) {
  if (level >= MAX_LEVEL) return Infinity;
  return Math.floor(100 + Math.pow(level, 1.5) * 40);
}

function getTitle(totalLevel) {
  const levels = Object.keys(TITLE_BY_LEVEL)
    .map(Number)
    .sort((a, b) => b - a);
  for (const lvl of levels) {
    if (totalLevel >= lvl) return TITLE_BY_LEVEL[lvl];
  }
  return "The Beginner";
}

module.exports = {
  TRAIT_KEYS,
  TRAIT_LABELS,
  TITLE_BY_LEVEL,
  MAX_LEVEL,
  getRequiredXP,
  getTitle,
};
