const mongoose = require("mongoose");

//Create Schema
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Post description is required"],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Post Category is required field"],
    },

    numViews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    photo: {
      type: String,
      required: [true, "Post Image is required"],
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

//Vortual fields.
postSchema.virtual("viewsCount").get(function () {
  return this.numViews.length;
});

postSchema.virtual("LikesCount").get(function () {
  return this.likes?.length || 0;
});

postSchema.virtual("disLikesCount").get(function () {
  return this.dislikes?.length || 0;
});

postSchema.virtual("likesPercentage").get(function () {
  const _likes = this.likes?.length || 0;
  const _disLikes = this.dislikes?.length || 0;
  const total = _likes + _disLikes;
  if (total === 0) return "0%";

  const percentage = (_likes / total) * 100;
  return `${percentage.toFixed(2)}%`;
});

postSchema.virtual("disLikesPercentage").get(function () {
  const _likes = this.likes?.length || 0;
  const _disLikes = this.likes?.length || 0;
  const total = _likes + _disLikes;
  if (total === 0) return "0%";

  const percentage = (_disLikes / total) * 100;
  return `${percentage.toFixed(2)}%`;
});

postSchema.virtual("daysAgo").get(function () {
  const date = new Date(this.createdAt);
  const daysAgo = Math.floor((Date.now() - date) / 86400000);
  if (daysAgo === 0) return "Today";
  else if (daysAgo === 1) return "Yesterday";
  else return `${daysAgo} days ago`;
});

//Compile the Post model
module.exports = mongoose.model("Post", postSchema);
