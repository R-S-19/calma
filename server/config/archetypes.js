/**
 * Archetype mapping: top 2 traits (by level) -> archetype name.
 * Order of traits in key doesn't matter (normalized).
 */
const ARCHETYPE_MAP = {
  "attention,learning": "The Scholar",
  "awareness,momentum": "The Sprinter",
  "consistency,momentum": "The Architect",
  "awareness,consistency": "The Reflective Builder",
  "attention,consistency": "The Steady Focus",
  "attention,momentum": "The Driven Learner",
  "attention,awareness": "The Mindful Observer",
  "learning,momentum": "The Quick Learner",
  "consistency,learning": "The Diligent Student",
  "awareness,learning": "The Thoughtful Explorer",
};

function getArchetype(traitLevels) {
  const entries = Object.entries(traitLevels)
    .filter(([_, v]) => v && typeof (v.level ?? v?.level) === "number")
    .map(([k, v]) => [k, v.level ?? v?.level ?? 1])
    .sort((a, b) => (b[1] || 0) - (a[1] || 0));
  const top2 = entries
    .slice(0, 2)
    .map(([k]) => k)
    .sort()
    .join(",");
  return ARCHETYPE_MAP[top2] || "The Beginner";
}

module.exports = { getArchetype };
