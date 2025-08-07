const Category = require("../model/Category");
const CustomError = require("../errors");
const asyncErrorHandler = require("../errors/asyncErrorHandler");
const { StatusCodes } = require("http-status-codes");

//create
const createCategory = asyncErrorHandler(async (req, res) => {
  const { title } = req.body;
  const category = await Category.create({ title, user: req.userId });
  res.status(StatusCodes.CREATED).json({
    data: category,
  });
});

//get all categories
const fetchCategoriesCtrl = asyncErrorHandler(async (req, res) => {
  const categories = await Category.find();
  res.status(StatusCodes.OK).json({
    data: categories,
  });
});

//get single category
const getSingleCategory = asyncErrorHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  res.status(StatusCodes.OK).json({
    data: category,
  });
});

//update category
const updateCategoryCtrl = asyncErrorHandler(async (req, res) => {
  const { title } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { title },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(StatusCodes.OK).json({
    data: category,
  });
});

//delete category
const deleteCategoryCtrl = asyncErrorHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  res.status(StatusCodes.OK).json({
    msg: "Category deleted successfully",
  });
});

module.exports = {
  createCategory,
  fetchCategoriesCtrl,
  getSingleCategory,
  updateCategoryCtrl,
  deleteCategoryCtrl,
};
