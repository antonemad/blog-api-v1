const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Post = require("./Post");
const CustomError = require("../errors");
const asyncErrorHandler = require("../errors/asyncErrorHandler");

//Create Schema
const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "First Name is "],
    },
    lastname: {
      type: String,
      required: [true, "Last name is required "],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    profilePhoto: {
      type: String,
    },

    //Admin can Block a certain user
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["Admin", "Guest", "Editor"],
    },
    //we are going to save IDs of the users who viwed this particular user profile
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],

    //contain all the users that a particular user blocked
    blocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    //determine what plan a user is on
    // (free plan -> can create for example 3 or 4 posts )
    plan: {
      type: String,
      enum: ["Free", "Premium", "Pro"],
      default: "Free",
    },

    //for example if a user create create more than 10 posts
    //we are giving the user a tag (bronze|silver|gold)
    userAward: {
      type: String,
      enum: ["Bronze", "Silver", "Gold"],
      default: "Bronze",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    next(err);
  }
});

//compare plain text password with hased password
userSchema.methods.comparePasswordInDB = async function (pswd) {
  return await bcrypt.compare(pswd, this.password);
};

// Get the last post Date
userSchema.virtual("lastPostDate").get(function () {
  return this._lastPostDateStr;
});

userSchema.virtual("isInactive").get(function () {
  return this._isInactive;
});

userSchema.virtual("lastActive").get(function () {
  return this._lastActive;
});

userSchema.post("findOne", async function (doc) {
  if (!doc) return;
  //------------------ Get Last Post ---------------
  const lastPost = await Post.findOne({ user: doc._id }).sort({
    createdAt: -1,
  });
  if (!lastPost) {
    doc._lastPostDateStr = "No Posts yet";
    return;
  }
  const lastPostDate = new Date(lastPost.createdAt);
  doc._lastPostDateStr = lastPostDate.toDateString();

  //---------------check if user is inactive for 30 days ---------------
  const diffInDays = Math.floor(
    (Date.now() - lastPostDate.getTime()) / (1000 * 3600 * 24)
  );
  doc._isInactive = diffInDays > 30;

  const shouldBlock = diffInDays > 30;
  if (doc.isBlocked !== shouldBlock) {
    doc.isBlocked = shouldBlock;
    await doc.save();
  }
  //----------------Last Active Date-------------------
  if (diffInDays === 0) {
    doc._lastActive = "Today";
  } else if (diffInDays === 1) {
    doc._lastActive = "Yesterday";
  } else {
    doc._lastActive = `${diffInDays} Days ago`;
  }

  //---------------- update userAward ----------------------

  let newAward;
  const postCount = await Post.countDocuments({ user: doc._id });

  if (postCount < 10) {
    newAward = "Bronze";
  } else if (postCount >= 10 && postCount < 20) {
    newAward = "Silver";
  } else if (postCount >= 20) {
    newAward = "Gold";
  }

  if (doc.userAward !== newAward) {
    doc.userAward = newAward;
    await doc.save();
  }
});

//Get post counts
userSchema.virtual("postCount").get(function () {
  return this.posts?.length || 0;
});

//Get followers count
userSchema.virtual("followrsCount").get(function () {
  return this.followers?.length || 0;
});

//Get following Count
userSchema.virtual("followingCount").get(function () {
  return this.following?.length || 0;
});

//Get viewers Count
userSchema.virtual("viwersCount").get(function () {
  return this.viewers?.length || 0;
});

//compile the user model
module.exports = mongoose.model("User", userSchema);
