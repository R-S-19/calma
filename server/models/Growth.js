const mongoose = require("mongoose");
const { TRAIT_KEYS, MAX_LEVEL, getTitle } = require("../config/traits");

const traitSubSchema = {
  level: { type: Number, default: 1, min: 1, max: MAX_LEVEL },
  xp: { type: Number, default: 0, min: 0 },
};

const traitsDefault = {};
for (const key of TRAIT_KEYS) {
  traitsDefault[key] = { level: 1, xp: 0 };
}

const growthSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    totalLevel: { type: Number, default: 1, min: 1 },
    totalXP: { type: Number, default: 0, min: 0 },
    traits: {
      consistency: { type: traitSubSchema, default: () => ({ level: 1, xp: 0 }) },
      attention: { type: traitSubSchema, default: () => ({ level: 1, xp: 0 }) },
      momentum: { type: traitSubSchema, default: () => ({ level: 1, xp: 0 }) },
      awareness: { type: traitSubSchema, default: () => ({ level: 1, xp: 0 }) },
      learning: { type: traitSubSchema, default: () => ({ level: 1, xp: 0 }) },
    },
    title: { type: String, default: "The Beginner" },
    archetype: { type: String, default: "" },
    recentGrowth: [
      {
        trait: String,
        message: String,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);


module.exports = mongoose.model("Growth", growthSchema);
