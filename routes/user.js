const express = require('express');
const User = require('../models/user');
const router = express.Router();

// GET /api/v1/users
router.get('/', async (req, res) => {
    try {
        let users = await User.find();
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

module.exports = router;
