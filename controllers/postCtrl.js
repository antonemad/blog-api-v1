const { StatusCodes } = require("http-status-codes");
const Post = require("../model/Post");
const User = require("../model/User");
const asyncErrorHandler = require("../errors/asyncErrorHandler");
const CustomError = require("../errors");

//create post
const createPostCtrl = asyncErrorHandler(async (req, res) => {
  const { title, description, category } = req.body;
  //find the user
  const author = await User.findById(req.userId);
  //check if the user is blocked
  if (author.isBlocked) {
    throw new CustomError.UnauthorizedError("Access Denied, account blocked");
  }

  //create the post
  const postCreated = await Post.create({
    title,
    description,
    user: author._id,
    category,
    photo: req?.file?.path,
  });
  //associate user to a post - push the post into the user posts field
  author.posts.push(postCreated);
  //save
  await author.save();
  //respond
  res.status(StatusCodes.CREATED).json({
    data: postCreated,
  });
});

//Get all posts
const fetchPostsCtrl = asyncErrorHandler(async (req, res) => {
  //find all posts
  const posts = await Post.find({})
    .populate("user")
    .populate("category", "title");

  //check if the user is blocked by the post owner
  const filteredPosts = posts.filter((post) => {
    const blockedUsers = post.user.blocked;
    const isBlocked = blockedUsers.includes(req.userId);
    return !isBlocked;
  });

  res.status(StatusCodes.OK).json({
    data: filteredPosts,
  });
});

//toggleLike
const toggleLikesPostrCtr = asyncErrorHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  const isLiked = post.likes.includes(req.userId);

  if (isLiked) {
    post.likes.filter((like) => like.toString() !== req.userId.toString());
    await post.save();
  } else {
    post.likes.push(req.userId);
    await post.save();
  }
  res.status(StatusCodes.OK).json({
    post,
  });
});

//toggleDiskLike
const toggleDiskLike = asyncErrorHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  const isUnliked = post.dislikes.includes(req.userId);

  if (isUnliked) {
    post.dislikes = post.dislikes.filter(
      (dislike) => dislike.toString() !== req.userId.toString()
    );
    await post.save();
  } else {
    post.dislikes.push(req.userId);
    await post.save();
  }

  res.status(StatusCodes.OK).json({
    post,
  });
});

//post details - Number of People who viwed the post
const postDetailsCtrl = asyncErrorHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  //Check if user viewed this post
  const isViewed = post.numViews.includes(req.userId);
  if (!isViewed) {
    //push the user into numViews
    post.numViews.push(req.userId);
    await post.save();
  }

  res.status(StatusCodes.OK).json({
    data: post,
  });
});

//Update Post
const updatePostCtrl = asyncErrorHandler(async (req, res) => {
  const { title, description, category } = req.body;
  const post = await Post.findById(req.params.id);
  if (post.user.toString() !== req.userId.toString()) {
    throw new CustomError.UnauthorizedError(
      `You are not allowed to update this post`
    );
  }
  await Post.findByIdAndUpdate(
    req.params.id,
    {
      title,
      description,
      category,
      photo: req?.file?.path,
    },
    {
      new: true,
    }
  );
  res.status(StatusCodes.OK).json({
    data: post,
  });
});

//Delete Post
const deletePostCtl = asyncErrorHandler(async (req, res) => {
  //find the post
  const post = await Post.findById(req.params.id);
  if (post.user.toString() !== req.userId.toString()) {
    throw new CustomError.UnauthorizedError(
      `You are not allowed to deleted this post`
    );
  }
  await Post.findByIdAndDelete(req.params.id);
  res.status(StatusCodes.Ok).json({
    msg: "post deleted successfully",
  });
});

module.exports = {
  createPostCtrl,
  fetchPostsCtrl,
  postDetailsCtrl,
  deletePostCtl,
  updatePostCtrl,
  toggleLikesPostrCtr,
  toggleDiskLike,
};
