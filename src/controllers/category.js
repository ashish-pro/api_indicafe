const Category = require('../models/category');
const createError = require('http-errors');
const { categorySchema } = require('../validators/schema-validator');
const mongoose = require('mongoose');

/* The `exports.getCategory` function is a controller function that is responsible for handling the
logic to retrieve a single category. It takes in the `req` (request) and `res` (response) objects as
parameters. */
exports.getCategory = (req, res) => {

  res.status(200).json(req.category);

}


/* The `exports.getCategoryId` function is a middleware function that is used to retrieve a category by
its ID. It takes in the `req` (request), `res` (response), `next` (next middleware function), and
`id` parameters. */
exports.getCategoryId = async (req, res, next, id) => {

  try {

    const category = await Category.findById(id);
    if (!category) return next(createError(404, "Category not found"));

    req.category = category;
    next()

  } catch (error) {

    console.log(error);

    if (error instanceof mongoose.CastError) {
      return next(createError(400, "Invalid Category Id"))
    }

    next(error);

  }

}



/* The `exports.fetchAllCategories` function is a controller function that is responsible for handling
the logic to retrieve all categories. It takes in the `req` (request), `res` (response), and `next`
(next middleware function) parameters. */

exports.fetchAllCategories = async (req, res, next) => {

  try {

    const result = await Category.find({});


    if (result.length === 0) {
      // console.log(error)

      return next(createError(404, 'No categories found'));
    }

    res.status(200).json(result);

  } catch (error) {

    console.log(error);
    next(error);

  }

}



/* The `exports.createCategory` function is a controller function that is responsible for handling the
logic to create a new category. It takes in the `req` (request), `res` (response), and `next` (next
middleware function) parameters. */
exports.createCategory = async (req, res, next) => {

  console.log(req.body);

  try {

    const result = await categorySchema.validateAsync(req.body);
    const category = new Category(result);
    category.addedBy = "aku";

    await category.save()

    res.status(201).json(category);


  } catch (error) {

    console.log(error);
    if (error.isJoi === true) error.status = 422;

    if (error.message.includes("E11000")) {
      return next(createError.Conflict(`Category name ${req.body.name} already exists `));
    }

    next(createError(error));

  }

}