const mongoose = require("mongoose");

const completionSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
  },
  { timestamps: true }
);

completionSchema.index({ habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Completion", completionSchema);
