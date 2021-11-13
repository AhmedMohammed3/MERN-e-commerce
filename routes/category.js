const express = require('express');
const Category = require('../models/category');

const router = express.Router();

// GET /api/v1/categories
router.get('/', async (req, res) => {
    try {
        let categories = await Category.find();
        if (categories) {
            res.status(201).json(categories);
        } else {
            res.status(500).json({
                message: "Can't Get Categories",
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Can't Get Categories",
            success: false,
        });
        console.log(err);
    }
});

module.exports = router;
