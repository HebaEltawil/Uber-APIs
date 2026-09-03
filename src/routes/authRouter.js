const express = require('express');
const router = express.Router();
const {register, login} = require('../controllers/authController');
const {body} = require('express-validator');

const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email address'),
    body('password').trim().notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('confirm_password').trim().notEmpty().withMessage('Confirm Password is required'),
    body('carInfo').if((value, { req }) => req.body.role === 'driver').trim().notEmpty().withMessage('Car information is required for drivers'),
    body('licensenumber').if((value, { req }) => req.body.role === 'driver').trim().notEmpty().withMessage('License number is required for drivers')
];

const loginValidation = [
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email address'),
    body('password').trim().notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

module.exports = router;