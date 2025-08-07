const User = require("../model/User");
const Post = require("../model/Post");
const Comment = require("../model/Comment");

const asyncErrorHandler = require("../errors/asyncErrorHandler");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");

//create comment
const createCommentCtr = asyncErrorHandler(async (req, res) => {
  const { description } = req.body;
  //find the post
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new CustomError.NotFoundError(`post not found`);
  }
  //find the user
  const user = await User.findById(req.userId);
  if (!user) {
    throw new CustomError.NotFoundError(`User not found`);
  }

  //create the comment
  const comment = await Comment.create({
    post: post._id,
    user: req.userId,
    description,
  });

  //push the comment to post and user
  post.comments.push(comment._id);
  user.comments.push(comment._id);
  //save
  await user.save({ validateBeforeSave: false });
  await post.save({ validateBeforeSave: false });

  res.status(StatusCodes.CREATED).json({
    comment,
  });
});

//update comment
const updateComment = asyncErrorHandler(async (req, res) => {
  const { description } = req.body;
  const comment = await Comment.findById(req.params.id);
  if (comment.user.toString() !== req.userId.toString()) {
    throw new CustomError.UnauthorizedError(
      "you are not allowed to update this comment"
    );
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    req.params.id,
    { description },
    { new: true, runValidators: true }
  );

  res.status(StatusCodes.OK).json({
    updatedComment,
  });
});

//delete comment
const deleteComment = asyncErrorHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (comment.user.toString() !== req.userId.toString()) {
    throw new CustomError.UnauthorizedError(
      `You are not allowed to deleted this comment`
    );
  }
  await Comment.findByIdAndDelete(req.params.id);
  res.status(StatusCodes.OK).json({
    msg: "Comment has been deleted successfully",
  });
});

module.exports = {
  createCommentCtr,
  updateComment,
  deleteComment,
};
