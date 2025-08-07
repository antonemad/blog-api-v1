const express = require("express");
const categoryRouter = express.Router();
const isLogin = require("../middlewares/isLogin");

const {
  createCategory,
  fetchCategoriesCtrl,
  getSingleCategory,
  updateCategoryCtrl,
  deleteCategoryCtrl,
} = require("../controllers/categoriesCtrl");

//POST/api/v1/categories
categoryRouter.post("/", isLogin, createCategory);

//GET/api/v1/categories/
categoryRouter.get("/", fetchCategoriesCtrl);

//GET/api/v1/categorites/:id
categoryRouter.get("/:id", getSingleCategory);

//PUT/api/v1/categories/:id
categoryRouter.put("/:id", isLogin, updateCategoryCtrl);

//DELETE/api/v1/categories/:id
categoryRouter.delete("/:id", deleteCategoryCtrl);

module.exports = categoryRouter;
