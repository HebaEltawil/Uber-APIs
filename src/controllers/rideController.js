const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const {validationResult} = require('express-validator');


const requestRide= async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try{
        const {pickupLocation, dropoffLocation} = req.body;
        if(!pickupLocation || typeof pickupLocation !== 'string' || !dropoffLocation || typeof dropoffLocation !== 'string'){
            return res.status(400).json({message: 'Pickup and Dropoff location are required and must be string'});
        }
        const ride = new Ride({
            passengerId: req.userId,
            pickupLocation: pickupLocation.trim(),
            dropoffLocation: dropoffLocation.trim(),
            status: 'requested'
        });
        await ride.save();
        res.status(201).json({message: 'Request ride successfully!', ride});
    }catch(error){
        next(error);
    }
}

const getRides = async (req, res, next) => {
    try{
        const rides = await Ride.find({
            $or:[
                {passengerId: req.userId},
                {driverId: req.userId}
            ]
        }).sort({createdAt: -1}).populate('passengerId', 'name email').populate('driverId', 'name email');
        res.status(200).json({rides});
    }
    catch(error){
        next(error);
    }
}

const getRide = async (req, res, next) => {
    try{
        const ride = await Ride.findById(req.params.id).populate('passengerId', 'name email').populate('driverId', 'name email');
        if(!ride){
            return res.status(404).json({message: 'Ride not found'});
        }
        if(ride.passengerId._id.toString() !== req.userId && ride.driverId?._id.toString() !== req.userId){
            return res.status(403).json({message: 'You are not authorized to view this ride'});
        }
        res.status(200).json({ride});
    }
    catch(error){
        next(error);
    }
}

const acceptRide = async (req, res, next) => {
    try{
        const driver = await Driver.findOne({userId: req.userId});
        if(!driver){
            return res.status(404).json({message: 'Driver not found'});
        }
        if(!driver.isAvailable){
            return res.status(400).json({message: 'You are not available to accept rides'});
        }
        const ride = await Ride.findById(req.params.id);
        if(!ride){
            return res.status(404).json({message: 'Ride not found'});
        }
        if(ride.status !== 'requested'){
            return res.status(400).json({message: 'Ride is not available for acceptance'});
        }
        if(ride.driverId){
            return res.status(400).json({message: 'Ride is already accepted by another driver'});
        }
        ride.driverId = req.userId;
        ride.status = 'accepted';
        await ride.save();
        driver.isAvailable = false;
        await driver.save();
        const updatedRide = await Ride.findById(ride._id).populate('passengerId', 'name email').populate('driverId', 'name email');
        res.status(200).json({message: 'Ride accepted successfully!', ride:updatedRide});
    }
    catch(error){
        next(error);
    }
}

const startRide = async (req, res, next) => {
    try{
        const ride = await Ride.findById(req.params.id);
        if(!ride){
            return res.status(404).json({message: 'Ride not found'});
        }
        if(ride.driverId?.toString() !== req.userId.toString()){
            return res.status(403).json({message: 'You are not authorized to start this ride'});
        }
        if(ride.status !== 'accepted'){
            return res.status(400).json({message: 'Ride is not in accepted status'});
        }
        ride.status = 'started';
        ride.startedAt = new Date();
        await ride.save();
        const updatedRide = await Ride.findById(ride._id).populate('passengerId', 'name email').populate('driverId', 'name email');
        res.status(200).json({message: 'Ride started successfully!', ride:updatedRide});
    }
    catch(error){
        next(error);
    }
}
const completedRide = async (req, res, next) => {
    try{
        const ride = await Ride.findById(req.params.id);
        if(!ride){
            return res.status(404).json({message: 'Ride not found'});
        }
        if(ride.driverId?.toString() !== req.userId.toString()){
            return res.status(403).json({message: 'You are not authorized to start this ride'});
        }
        if(ride.status !== 'started'){
            return res.status(400).json({message: 'Ride is not in started status'});
        }
        const fare = req.body.fare != null ? Number(req.body.fare): null;
        ride.status = 'completed';
        ride.completedAt = new Date();
        if(fare != null && !isNaN(fare) && fare >= 0){
            ride.fare = fare;
        }
        await ride.save();
        const driver = await Driver.findOne({userId: req.userId});
        if(driver){
            driver.isAvailable = true;
            await driver.save();
        }
        const updatedRide = await Ride.findById(ride._id).populate('passengerId', 'name email').populate('driverId', 'name email');
        res.status(200).json({message: 'Ride completed successfully!', ride:updatedRide});
    }
    catch(error){
        next(error);
    }
}

const canceledRide = async (req, res, next) => {
    try{
        const ride = await Ride.findById(req.params.id);
        if(!ride){
            return res.status(404).json({message: 'Ride not found'});
        }
        const ispassenger = ride.passengerId?.toString() === req.userId.toString();
        const isdriver = ride.driverId?.toString() === req.userId.toString();
        if(!ispassenger && !isdriver){
            return res.status(403).json({message: 'You are not authorized to cancel this ride'});
        }
        if(ride.status === 'completed' || ride.status === 'started' || ride.status === 'cancelled'){
            return res.status(400).json({message: 'Ride cannot be cancelled in its current status'});
        }
        ride.status = 'cancelled';
        await ride .save();
        const driver = await Driver.findOne({userId: ride.driverId});
        if(driver){
            driver.isAvailable = true;
            await driver.save();
        }
        const updatedRide = await Ride.findById(ride._id).populate('passengerId', 'name email').populate('driverId', 'name email');
        res.status(200).json({message: 'Ride cancelled successfully!', ride: updatedRide});
    }
    catch(error){
        next(error);
    }
}

module.exports = {requestRide, getRides, getRide, acceptRide, startRide, completedRide, canceledRide};