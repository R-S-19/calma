const Growth = require("../models/Growth");
const FocusSession = require("../models/FocusSession");
const Completion = require("../models/Completion");
const { TRAIT_KEYS, TRAIT_LABELS, getRequiredXP, getTitle } = require("../config/traits");
const { getArchetype } = require("../config/archetypes");

const MAX_LEVEL = 50;
const MAX_RECENT_GROWTH = 5;

function requiredXP(level) {
  if (level >= MAX_LEVEL) return Infinity;
  return Math.floor(100 + Math.pow(level, 1.5) * 40);
}

async function getOrCreateGrowth(userId) {
  let growth = await Growth.findOne({ userId });
  if (!growth) {
    growth = await Growth.create({
      userId,
      totalLevel: 1,
      totalXP: 0,
      traits: Object.fromEntries(TRAIT_KEYS.map((k) => [k, { level: 1, xp: 0 }])),
      title: "The Beginner",
      archetype: "",
    });
  }
  return growth;
}

async function applyTraitXP(userId, traitKey, amount) {
  const growth = await getOrCreateGrowth(userId);
  const trait = growth.traits[traitKey] || { level: 1, xp: 0 };
  const prevLevel = trait.level || 1;
  let xp = (trait.xp || 0) + amount;
  let level = prevLevel;

  while (level < MAX_LEVEL && xp >= requiredXP(level)) {
    xp -= requiredXP(level);
    level += 1;
  }

  growth.traits[traitKey] = { level, xp };
  const leveledUp = level > prevLevel;

  if (leveledUp) {
    const arr = growth.recentGrowth || [];
    arr.unshift({ trait: traitKey, message: `${TRAIT_LABELS[traitKey]} strengthened.`, at: new Date() });
    growth.recentGrowth = arr.slice(0, MAX_RECENT_GROWTH);
  }

  const traitSum =
    (growth.traits.consistency?.level || 1) +
    (growth.traits.attention?.level || 1) +
    (growth.traits.momentum?.level || 1) +
    (growth.traits.awareness?.level || 1) +
    (growth.traits.learning?.level || 1);
  growth.totalLevel = Math.floor(traitSum / 5);
  growth.totalXP = TRAIT_KEYS.reduce((acc, k) => acc + (growth.traits[k]?.xp || 0), 0);
  growth.title = getTitle(growth.totalLevel);
  growth.archetype = getArchetype(growth.traits);
  growth.markModified("traits");
  await growth.save();

  return { growth, leveledUpTraits: leveledUp ? [traitKey] : [] };
}

async function applyAction(userId, actionType, metadata = {}) {
  switch (actionType) {
    case "TASK_COMPLETE":
      return applyTraitXP(userId, "momentum", 5);
    case "SMALL_TASK_COMPLETE":
      return applyTraitXP(userId, "consistency", 3);
    case "OVERDUE_TASK_COMPLETE":
      return applyTraitXP(userId, "momentum", 8);
    case "FOCUS_SESSION_COMPLETE": {
      const growth = await getOrCreateGrowth(userId);
      const today = new Date().toISOString().slice(0, 10);
      await FocusSession.create({ userId, date: today });
      const countToday = await FocusSession.countDocuments({ userId, date: today });

      const r1 = await applyTraitXP(userId, "attention", 10);
      const r2 = await applyTraitXP(userId, "consistency", countToday >= 3 ? 8 : 3);
      const leveledUpTraits = [...new Set([...r1.leveledUpTraits, ...r2.leveledUpTraits])];
      const updatedGrowth = await getOrCreateGrowth(userId);
      return { growth: updatedGrowth, leveledUpTraits };
    }
    case "JOURNAL_ENTRY":
      return applyTraitXP(userId, "awareness", 6);
    case "MOOD_CHECKIN":
      return applyTraitXP(userId, "awareness", 3);
    case "LEARNING_TASK_COMPLETE":
      return applyTraitXP(userId, "learning", 8);
    case "HABIT_7_DAY_STREAK": {
      const habitId = metadata.habitId;
      if (!habitId) return { growth: await getOrCreateGrowth(userId), leveledUpTraits: [] };
      const dates = new Set();
      const d = new Date();
      for (let i = 0; i < 7; i++) {
        dates.add(d.toISOString().slice(0, 10));
        d.setDate(d.getDate() - 1);
      }
      const count = await Completion.countDocuments({ habitId, userId, date: { $in: [...dates] } });
      if (count < 7) return { growth: await getOrCreateGrowth(userId), leveledUpTraits: [] };
      return applyTraitXP(userId, "consistency", 15);
    }
    default:
      return { growth: await getOrCreateGrowth(userId), leveledUpTraits: [] };
  }
}

function formatGrowthForResponse(growth) {
  const traits = {};
  for (const k of TRAIT_KEYS) {
    const t = growth.traits[k] || { level: 1, xp: 0 };
    const required = requiredXP(t.level);
    traits[k] = {
      level: t.level,
      xp: t.xp,
      requiredXP: t.level >= MAX_LEVEL ? null : required,
      progressPercent: t.level >= MAX_LEVEL ? 100 : Math.min(100, (t.xp / required) * 100),
    };
  }
  return {
    totalLevel: growth.totalLevel,
    totalXP: growth.totalXP,
    title: growth.title,
    archetype: growth.archetype,
    traits,
    recentGrowth: (growth.recentGrowth || []).slice(0, MAX_RECENT_GROWTH),
  };
}

module.exports = {
  getOrCreateGrowth,
  applyAction,
  applyTraitXP,
  formatGrowthForResponse,
  requiredXP,
};
