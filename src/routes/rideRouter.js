const express = require('express');
const router = express.Router();
const {requestRide, getRides, getRide, acceptRide, startRide, completedRide, canceledRide} = require('../controllers/rideController');
const authMiddleware = require("../middlewares/authMiddleware");
const {body} = require('express-validator');

const requestRideValidation = [
    body('pickupLocation').trim().notEmpty().withMessage('Pickup location is required'),
    body('dropoffLocation').trim().notEmpty().withMessage('Dropoff location is required'),
];


router.post('/',authMiddleware, requestRideValidation, requestRide);
router.get('/',authMiddleware, getRides);
router.get('/:id',authMiddleware, getRide);
router.put('/:id/accept',authMiddleware, acceptRide);
router.put('/:id/start',authMiddleware, startRide);
router.put('/:id/complete',authMiddleware, completedRide);
router.put('/:id/cancel',authMiddleware, canceledRide);

module.exports = router;