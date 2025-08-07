const User = require("../model/User");
const Post = require("../model/Post");
const Comment = require("../model/Comment");
const Category = require("../model/Category");

const { StatusCodes } = require("http-status-codes");
const asyncErrorHandler = require("../errors/asyncErrorHandler");
const CustomError = require("../errors");
const { attachCookiesToResponse } = require("../utils/jwt");

//all
const userCtrl = asyncErrorHandler(async (req, res) => {
  const user = await User.find();
  res.status(StatusCodes.OK).json({
    data: {
      user,
    },
  });
});

//get single user
const getSingleUser = asyncErrorHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new CustomError.NotFoundError(`No User with the id ${req.params.id}`);
  }
  res.status(StatusCodes.OK).json({
    user,
  });
});

//profile
const userProfileCtrl = asyncErrorHandler(async (req, res) => {
  const userId = req.userId;
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new CustomError.NotFoundError(`No User with id : ${userId}`);
  }
  res.status(StatusCodes.OK).json({
    user,
  });
});

//update user profile
const updateUserCtrl = asyncErrorHandler(async (req, res) => {
  const { firstname, lastname, email } = req.body;
  //check if email is not taken
  if (email) {
    const emailTaken = await User.findOne({ email });
    if (emailTaken) {
      throw new CustomError.BadRequest(`This email is already taken`);
    }
  }
  const user = await User.findByIdAndUpdate(
    req.userId,
    {
      firstname,
      lastname,
      email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  //send Response
  res.status(StatusCodes.OK).json({
    data: user,
  });
});

//update user password
const updatePasswordCtrl = asyncErrorHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.userId);
  if (!(await user.comparePasswordInDB(currentPassword))) {
    throw new CustomError.UnauthorizedError("Wrong password");
  }
  user.password = newPassword;
  await user.save();
  attachCookiesToResponse({ res, user: user._id });
  res.status(StatusCodes.OK).json({
    msg: "password has been changed successfully",
  });
});

//delete user Accounts
const deleteUserAccountCtrl = asyncErrorHandler(async (req, res) => {
  const userTodelete = await User.findById(req.userId);
  if (!userTodelete) {
    throw new CustomError.NotFoundError("User not found");
  }
  //find all posts to be deleted
  await Post.deleteMany({ user: req.userId });
  //delete all comments
  await Comment.deleteMany({ user: req.userId });
  //delete all categories
  await Category.deleteMany({ user: req.userId });
  //delete the user
  await User.findByIdAndDelete(req.userId);

  res.status(StatusCodes.OK).json({
    msg: "user has been deleted successfully",
  });
});

//Who Viwed My Profile
const whoViwedMyProfileCtrl = asyncErrorHandler(async (req, res, next) => {
  //find the user you want to view his/her profile
  const user = await User.findById(req.params.id);
  //Get the current
  const currentUser = await User.findById(req.userId);
  //check if users are found
  if (!user || !currentUser) {
    throw new CustomError.NotFoundError("User not found");
  }
  //check if the user is already viewed
  const isUserAlreadyViewed = user.viewers.find(
    (viewer) => viewer.toString() === currentUser._id.toString()
  );

  if (isUserAlreadyViewed) {
    return res.status(StatusCodes.OK).json({
      msg: `you have already viewed ${user.firstname}'s profile`,
    });
  }
  user.viewers.push(currentUser._id);
  user.save();

  res.status(StatusCodes.OK).json({
    msg: `You have successfully viewed ${user.firstname}'s Profile`,
  });
});

//profile photo upload
const profilePhotoUpload = asyncErrorHandler(async (req, res) => {
  console.log(req.file);
  const userToUpdate = await User.findById(req.userId);
  if (!userToUpdate) {
    throw new CustomError.NotFoundError(`User not found`);
  }
  if (userToUpdate.isBlocked) {
    throw new CustomError.UnauthenticatedError(`Action not allowed`);
  }

  if (req.file) {
    await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          profilePhoto: req.file.path,
        },
      },
      {
        new: true,
      }
    );
  }
  //respond
  res.status(StatusCodes.OK).json({
    msg: "You have successfully updated your profile photo",
  });
});

//following
const followingCtrl = asyncErrorHandler(async (req, res) => {
  //1.Get the User to be followed
  const followedUser = await User.findById(req.params.id);
  //2.Get the Currently logged-in user (the one who wants to follow)
  const currentUser = await User.findById(req.userId);

  //3.Check if both users exist
  if (!followedUser && !currentUser) {
    throw new CustomError.NotFoundError(`User not found`);
  }

  //4.Check if already following
  const alreadyFollowing = followedUser.followers.find(
    (followerId) => followerId.toString() === currentUser._id.toString()
  );
  if (alreadyFollowing) {
    throw new CustomError.BadRequest(
      `${currentUser.firstname}, You already follwing ${followedUser.firstname}`
    );
  }

  //5.Add currentUser to follwedUser's follwers list
  followedUser.followers.push(currentUser._id);

  //6.Add follwedUser to currentUser's following list
  currentUser.following.push(followedUser._id);

  //7.save both users
  await followedUser.save();
  await currentUser.save();

  //8.Send response
  res.status(StatusCodes.OK).json({
    msg: `${currentUser.firstname}, you have successfully followed ${followedUser.firstname}`,
  });
});

//UnFollowing
const unFollowCtrl = asyncErrorHandler(async (req, res) => {
  //1.Get the user to be unfollowed.
  const unfollowedUser = await User.findById(req.params.id);
  //2.Get the Currently logged-in User (the one who is unfollowing)
  const currentUser = await User.findById(req.userId);

  //3.Check if both users exist
  if (!unfollowedUser || !currentUser) {
    throw new CustomError.NotFoundError("user not found");
  }

  //4.Check if currentUser is actually following unfollowedUser
  const isFollowing = currentUser.following.find(
    (userId) => userId.toString() === unfollowedUser._id.toString()
  );
  if (!isFollowing) {
    throw new CustomError.BadRequest(`You are not following this user`);
  }

  //5.Remove unfollowedUser from currentUser's follwing list
  currentUser.following = currentUser.following.filter(
    (userId) => userId.toString() !== unfollowedUser._id.toString()
  );

  //6.Remove currentUser from unfollowedUser's follower list
  unfollowedUser.followers = unfollowedUser.followers.filter(
    (userId) => userId.toString() !== currentUser._id.toString()
  );

  //7.save both users
  await currentUser.save();
  await unfollowedUser.save();

  //8.Send response
  res.status(StatusCodes.OK).json({
    msg: `You have successfully unfollowed ${unfollowedUser.firstname}`,
  });
});

//Block
const blockUserCtrl = asyncErrorHandler(async (req, res) => {
  //1. Find the user to be blocked
  const userToBeBlocked = await User.findById(req.params.id);
  //2. Get Currently logged-in user
  const currentUser = await User.findById(req.userId);

  //3.Check if both users exist
  if (!userToBeBlocked || !currentUser) {
    throw new CustomError.NotFoundError(`User not found`);
  }

  //4.Check if currentUser is actually following unfollowedUser
  const isUserAlreadyBlocked = currentUser.blocked.find(
    (userId) => userId.toString() === userToBeBlocked._id.toString()
  );
  if (isUserAlreadyBlocked) {
    throw new CustomError.BadRequest(`User Already Blocked`);
  }

  //5.Push userToBeBlocked to currentUser's Blocked array
  currentUser.blocked.push(userToBeBlocked._id);

  //save User
  await currentUser.save();
  res.status(StatusCodes.OK).json({
    msg: `${currentUser.firstname}, you have Blocked ${userToBeBlocked.firstname}`,
  });
});

//UnBlock
const unBlockUserCtrl = asyncErrorHandler(async (req, res) => {
  // 1. Find the user to be unblocked
  const userToBeUnblocked = await User.findById(req.params.id);

  // 2. Get the currently logged-in user
  const currentUser = await User.findById(req.userId);

  //3.Check if both users exists
  if (!currentUser || !userToBeUnblocked) {
    throw new CustomError.NotFoundError(`user not found`);
  }

  //4. Check if user si actually blocked
  const isBlocked = await currentUser.blocked.find(
    (id) => id.toString() === userToBeUnblocked._id.toString()
  );
  if (!isBlocked) {
    throw new CustomError.BadRequest("This user is not blocked");
  }

  //5.Remove the user from the blocked array
  currentUser.blocked = currentUser.blocked.filter(
    (userId) => userId.toString() !== userToBeUnblocked._id.toString()
  );

  //6.save changes
  await currentUser.save();

  //7.Respond
  res.status(StatusCodes.OK).json({
    msg: `${currentUser.firstname}, you have unblocked ${userToBeUnblocked.firstname}`,
  });
});

//admin-Block
const adminBlockUserCtrl = asyncErrorHandler(async (req, res) => {
  //1.Find the user to be blocked by the admin
  const userToBeBlocked = await User.findById(req.params.id);
  //2.Check if user found
  if (!userToBeBlocked) {
    throw new CustomError.NotFoundError(`User not Found`);
  }
  //3. Change the isBlocked to true
  userToBeBlocked.isBlocked = true;
  //4.save
  await userToBeBlocked.save();
  //5.Respond
  res.status(StatusCodes.OK).json({
    msg: `You have successfully blocked ${userToBeBlocked.firstname}`,
  });
});

//admin-UnBlock
const adminUnBlockUserCtrl = asyncErrorHandler(async (req, res) => {
  //1.Find the user to be unblocked
  const userToBeUnblocked = await User.findById(req.params.id);
  //2. Check if user found
  if (!userToBeUnblocked) {
    throw new CustomError.NotFoundError("user not found");
  }
  //3.Change the isBlocked to false
  userToBeUnblocked.isBlocked = false;
  //4.save
  await userToBeUnblocked.save();
  res.status(StatusCodes.OK).json({
    msg: `You have successfully unblocked ${userToBeUnblocked.firstname}`,
  });
});

module.exports = {
  userCtrl,
  getSingleUser,
  userProfileCtrl,
  deleteUserAccountCtrl,
  updateUserCtrl,
  updatePasswordCtrl,
  whoViwedMyProfileCtrl,
  profilePhotoUpload,
  followingCtrl,
  unFollowCtrl,
  blockUserCtrl,
  unBlockUserCtrl,
  adminBlockUserCtrl,
  adminUnBlockUserCtrl,
};
