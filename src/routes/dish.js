const express = require('express');
const router = express.Router();

const { createDish, fetchDishes, fetchDish, fetchDishById, getDishPhoto, searchByCategory } = require('../controllers/dish');



router.post('/dishes', createDish);

router.get('/dishes', fetchDishes);

router.param("id", fetchDish);

router.get('/dishes/:id', fetchDishById);

router.get('/dishes/:id/photo', getDishPhoto);


router.post('/dishes/category/_search', searchByCategory);
module.exports = router;