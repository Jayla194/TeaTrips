const express = require('express');
const router = express.Router()

const requireLogin = require('../controllers/requireLogin');
const reviewController = require('../controllers/reviewController');
const requireAdmin = require('../controllers/requireAdmin');

// public routes
router.get('/location/:locationId', reviewController.getByLocation);

// logged in routes
router.get('/user', requireLogin, reviewController.getByUser);
router.post('/location/:locationId', requireLogin, reviewController.create);
router.put('/:reviewId', requireLogin, reviewController.update);
router.delete('/:reviewId', requireLogin, reviewController.remove);
router.post('/:reviewId/like', requireLogin, reviewController.like);
router.delete('/:reviewId/like', requireLogin, reviewController.unlike);


module.exports = router;
