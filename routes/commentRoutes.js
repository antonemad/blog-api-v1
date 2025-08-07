const express = require("express");
const commentRouter = express.Router();
const isLogin = require("../middlewares/isLogin");
const {
  createCommentCtr,
  updateComment,
  deleteComment,
} = require("../controllers/commentCtrl");

//POST/api/v1/comments/:id (id of post)
commentRouter.post("/:id", isLogin, createCommentCtr);

//PUT/api/v1/comments/:id (id of comment)
commentRouter.put("/:id", isLogin, updateComment);

//DELETE/api/v1/comments/:id(id of comment)
commentRouter.delete("/:id", isLogin, deleteComment);

module.exports = commentRouter;
