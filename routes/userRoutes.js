const express = require("express");
const userRouter = express.Router();

const { userRegisterCtrl, userLoginCtrl } = require("../controllers/AuthCtrl");

const storage = require("../config/cloudinary");
const multer = require("multer");
//instance of multer
const upload = multer({ storage });

const {
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
} = require("../controllers/userCtrl");

const isLogin = require("../middlewares/isLogin");
const isAdmin = require("../middlewares/isAdmin");

//POST/api/v1/users/register
userRouter.post("/register", userRegisterCtrl);

//POST/api/v1/users/login
userRouter.post("/login", userLoginCtrl);

//GET/api/v1/users
userRouter.get("/", isLogin, userCtrl);

//GET/api/v1/users/profile/:id
userRouter.get("/profile", isLogin, userProfileCtrl);

//delete/api/v1/users/:id
userRouter.delete("/delete-account", isLogin, deleteUserAccountCtrl);

//PUT/api/v1/users/
userRouter.put("/update-user", isLogin, updateUserCtrl);

//PUT/api/v1/users/updatePassword
userRouter.put("/update-password", isLogin, updatePasswordCtrl);

//GET/api/v1/users/profile-viewers
userRouter.get("/profile-viewers/:id", isLogin, whoViwedMyProfileCtrl);

//GET/api/v1/users/following/:id
userRouter.get("/following/:id", isLogin, followingCtrl);

//GET/api/v1/users/unfollow/:id
userRouter.get("/unfollow/:id", isLogin, unFollowCtrl);

//GET/api/v1/:id
userRouter.get("/:id", isLogin, getSingleUser);

//POST/api/v1/users/profile-photo-upload
userRouter.post(
  "/profile-photo-upload",
  isLogin,
  upload.single("profile"),
  profilePhotoUpload
);

//GET/api/users/block/:id
userRouter.get("/block/:id", isLogin, blockUserCtrl);

//GET/api/users/unblock/:id
userRouter.get("/unblock/:id", isLogin, unBlockUserCtrl);

//GET/api/users/admin-block/:id
userRouter.put("/admin-block/:id", isLogin, isAdmin, adminBlockUserCtrl);

//GET/api/users/admin-unblock/:id
userRouter.put("/admin-unblock/:id", isLogin, isAdmin, adminUnBlockUserCtrl);

module.exports = userRouter;
