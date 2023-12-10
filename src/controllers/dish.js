
const Dish = require('../models/dish');
const createError = require('http-errors');
const { dishSchema } = require('../validators/schema-validator');
const mongoose = require('mongoose');



/* The `imageTypes` array is storing the valid image file types that are allowed for the `photo` field
in the `Dish` model. It includes the MIME types for JPEG, PNG, and GIF images. This array is later
used in the `savePhoto` function to check if the provided photo has a valid file type before saving
it to the `dish` object. */
const imageTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];


/* The `searchByCategory` function is an asynchronous function that handles the logic for searching
dishes by category. It takes in three parameters: `req` (request), `res` (response), and `next`
(next middleware function). */
exports.searchByCategory = async (req, res, next) => {

  let { categories } = req.body;

  let criteria = {}

  try {

    if (categories.length === 0) {
      return next(createError(404, 'No categories specified'));

    }

    criteria = { category: { "$in": categories } };

    const result = await Dish.find(criteria)
      .select('-photo')
      .populate('category', '_id name');
    res.status(200).json(result);


  } catch (error) {

    console.log(error)

    next(error);

  }
}




/* The `exports.getDishPhoto` function is responsible for retrieving and sending the photo data of a
dish in the response. */
exports.getDishPhoto = (req, res) => {

  const dish = req.dish;

  if (dish.photo.data) {

    res.set('Content-Type', dish.photo.contentType);
    res.send(dish.photo.data);
  } else {

    return res.status(204).json({ message: 'No data Found' })
  }

}



/* The `exports.createDish` function is responsible for creating a new dish. It is an asynchronous
function that takes in three parameters: `req` (request), `res` (response), and `next` (next
middleware function). */
exports.createDish = async (req, res, next) => {

  const { name, description, price, category, photo } = req.body;

  console.log(req.body);

  let dish;

  try {

    /* This code block is responsible for creating a new dish. */
    const result = await dishSchema.validateAsync({ name, description, price, category });
    dish = new Dish({ name, description, price, category });

    dish.addedBy = "aku";

    savePhoto(dish, photo);
    const newDish = await dish.save();
    newDish.photo = undefined;
    res.status(201).json(newDish);


  } /* The `catch` block is used to handle any errors that occur during the execution of the `try`
  block. */
  catch (error) {
    console.log(error);
    if (error.isJoi === true) {
      console.log(error)
      console.log(error)
      error.status = 422;
    }

    if (error.message.includes("E11000")) {
      return next(createError.Conflict(`The dish ${dish.name} already exists`))
    }

    next(error);

  }
}


/* The `exports.fetchDishById` function is a controller function that is responsible for fetching a
dish by its ID. It takes in the `req` (request) and `res` (response) parameters. */
exports.fetchDishById = (req, res) => {

  req.dish.photo = undefined;
  res.status(200).json(req.dish);

}


/* The `exports.fetchDish` function is a controller function that is responsible for fetching a dish by
its ID. It is an asynchronous function that takes in four parameters: `req` (request), `res`
(response), `next` (next middleware function), and `id` (dish ID). */
exports.fetchDish = async (req, res, next, id) => {

  try {

    const dish = await Dish.findById(id);
    if (!dish) throw createError(404, "Dish not found");

    req.dish = dish;
    next();

  } catch (error) {

    console.log(error);
    if (error instanceof mongoose.CastError) {
      return next(createError(400, 'Invalid Dish Id'))
    }

    next(error);
  }
}




/* The `exports.fetchDishes` function is an asynchronous function that is responsible for fetching all
dishes from the database. It takes in three parameters: `req` (request), `res` (response), and
`next` (next middleware function). */
exports.fetchDishes = async (req, res, next) => {


  try {

    const dishes = await Dish.find()
      .select('-photo')
      .populate('category', '_id, name');

    if (dishes.length === 0) throw createError(400, 'No Disheses found');


    res.status(200).json(dishes);

  } catch (error) {

    console.log(error);
    next(error);


  }

}



/**
 * The function saves a photo to a dish object if the photo is not null and its type is included in the
 * imageTypes array.
 * @param dish - The `dish` parameter is an object that represents a dish. It may have properties such
 * as `name`, `description`, `price`, etc.
 * @param photo - The `photo` parameter is an object that represents an image. It has two properties:
 */

function savePhoto(dish, photo) {

  //TODO: Handle empty object scenario using lodash

  if (photo != null && imageTypes.includes(photo.type)) {

    dish.photo.data = new Buffer.from(photo.data, 'base64');
    dish.photo.contentType = photo.type;

  }

}

