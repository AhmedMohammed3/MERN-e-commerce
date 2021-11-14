const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/user');
const router = express.Router();
const jwt = require('jsonwebtoken');

// GET /api/v1/users
router.get('/', async (req, res) => {
    try {
        let users = await User.find().select('-passwordHash');
        if (users) {
            res.status(201).json({
                data: users,
                success: true,
            });
        } else {
            res.status(500).json({
                message: "Can't Get Users",
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Can't Get Users",
            success: false,
        });
        console.log(err);
    }
});

// GET /api/v1/users/count
router.get('/count', async (req, res) => {
    try {
        let userCount = await User.countDocuments();
        if (userCount) {
            res.status(201).json({
                data: userCount,
                success: true,
            });
        } else {
            res.status(404).json({
                message: 'No Users',
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Can't fetch Users",
            success: false,
        });
        console.log(err);
    }
});

// GET /api/v1/users/:userID
router.get('/:userID', async (req, res) => {
    try {
        const { userID } = req.params;
        let user = await User.findById(userID).select('-passwordHash');
        if (user) {
            res.status(201).json({
                data: user,
                succes: true,
            });
        } else {
            res.status(404).json({
                message: "User doesn't exist",
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Can't Get User",
            success: false,
        });
        console.log(err);
    }
});

// POST /api/v1/users
router.post('/', async (req, res) => {
    try {
        let newUser = req.body;
        newUser.passwordHash = bcrypt.hashSync(req.body.password, 12);
        delete newUser.password;
        let user = new User(newUser);
        user = await user.save();
        if (user) {
            res.status(201).json({
                data: user,
                success: true,
            });
        } else {
            res.status(500).json({
                message: 'Problem Creating a User',
                success: false,
            });
        }
    } catch (err) {
        if (
            err.message.includes('index: email_1 dup key') &&
            err.message.includes('duplicate key error')
        ) {
            res.status(400).json({
                message: 'User already exist',
                success: false,
            });
        } else {
            res.status(500).json({
                message: 'Problem Creating a User',
                success: false,
            });
        }
        console.log(err);
    }
});

// POST /api/v1/users/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            if (bcrypt.compareSync(password, user.passwordHash)) {
                const token = jwt.sign(
                    {
                        userID: user.id,
                        isAdmin: user.isAdmin,
                        email,
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '1d' }
                );
                res.status(404).json({
                    data: {
                        user,
                        token,
                    },
                    success: true,
                });
            } else {
                res.status(404).json({
                    message: 'Wrong Password',
                    success: false,
                });
            }
        } else {
            res.status(404).json({
                message: 'User is not exist',
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: 'Problem Creating a User',
            success: false,
        });
        console.log(err);
    }
});

// POST /api/v1/users/register
router.post('/register', async (req, res) => {
    try {
        let newUser = req.body;
        newUser.passwordHash = bcrypt.hashSync(req.body.password, 12);
        delete newUser.password;
        let user = new User(newUser);
        user = await user.save();
        if (user) {
            res.status(201).json({
                data: user,
                success: true,
            });
        } else {
            res.status(500).json({
                message: 'Problem Creating a User',
                success: false,
            });
        }
    } catch (err) {
        if (
            err.message.includes('index: email_1 dup key') &&
            err.message.includes('duplicate key error')
        ) {
            res.status(400).json({
                message: 'User already exist',
                success: false,
            });
        } else {
            res.status(500).json({
                message: 'Problem Creating a User',
                success: false,
            });
        }
        console.log(err);
    }
});

// DELETE /api/v1/users/:userID
router.delete('/:userID', async (req, res) => {
    try {
        const { userID } = req.params;
        if (!mongoose.isValidObjectId(userID)) {
            return res.status(400).json({
                message: 'User ID is not valid',
                success: false,
            });
        }
        const user = await User.findByIdAndRemove(userID);
        if (user) {
            res.status(201).json({
                message: 'User Deleted Successfully',
                data: user,
                success: true,
            });
        } else {
            res.status(404).json({
                message: 'User not found',
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: 'Problem Deleting the user',
            success: false,
        });
        console.log(err);
    }
});

module.exports = router;
