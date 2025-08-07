const mongoose = require("mongoose");

// Categories are used to organize blog posts into different topics
// (e.g., Tech, Health, Sports) and are referenced by the Post model
// to allow filtering and better content management.

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user is required"],
    },
    title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", categorySchema);
