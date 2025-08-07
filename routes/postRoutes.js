const express = require("express");

const multer = require("multer");
const storage = require("../config/cloudinary");
const upload = multer({ storage });

const postRouter = express.Router();

const {
  createPostCtrl,
  fetchPostsCtrl,
  deletePostCtl,
  updatePostCtrl,
  toggleLikesPostrCtr,
  toggleDiskLike,
  postDetailsCtrl,
} = require("../controllers/postCtrl");

const isLogin = require("../middlewares/isLogin");

//POST/api/v1/posts
postRouter.post("/", isLogin, upload.single("image"), createPostCtrl);

//GET/api/v1/posts
postRouter.get("/", isLogin, fetchPostsCtrl);

//Delete/api/v1/posts/:id
postRouter.delete("/:id", isLogin, deletePostCtl);

//PUT/api/v1/posts/:id
postRouter.put("/:id", isLogin, upload.single("image"), updatePostCtrl);

//Get/api/v1/posts/likes/:id
postRouter.get("/likes/:id", isLogin, toggleLikesPostrCtr);

//GET/api/v1/posts/dislikes/:id
postRouter.get("/dislikes/:id", isLogin, toggleDiskLike);

//GET/api/v1/posts/:id
postRouter.get("/:id", isLogin, postDetailsCtrl);

module.exports = postRouter;
