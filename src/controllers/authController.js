const User = require('../models/User');
const Driver = require('../models/Driver');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator');

// Register a new user
exports.register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password, confirm_password, role } = req.body;
    try {
        //check if all fields are provided
        if (!name || !email || !password || !confirm_password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        //check name validation
        if (!name|| typeof name !== 'string' || !name.trim() || name.length < 3) {
            return res.status(400).json({ message: 'Name must be a non-empty string with at least 3 characters' });
        }
        // Check if email is valid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || typeof email !== 'string' || !emailRegex.test(email)|| !email.trim()) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }
        // Check if password is valid
        if (!password || typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ message: 'Password must be a non-empty string with at least 6 characters' });
        }
        // Check if confirm password is valid
        if (!confirm_password || typeof confirm_password !== 'string' || confirm_password.length < 6) {
            return res.status(400).json({ message: 'Confirm Password must be a non-empty string with at least 6 characters' });
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check if passwords match
        if (password !== confirm_password) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const user = new User({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role: role? 'driver' : 'user', // Default role is 'user', if role is provided and true, set to 'driver'
        });

        // Save the user to the database
        await user.save();
        if(role === 'driver'){
            const driver = new Driver({
                userId: user._id
            })
            await driver.save();
        }

        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        next(error);
    }
};

// Login an existing user
exports.login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password' });
        }
        // Check if user exists
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        //  Generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ message: 'Login successful', token, user });
    } catch (error) {
        next(error);
    }
};
