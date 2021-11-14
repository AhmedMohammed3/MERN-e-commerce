const express = require('express');
const Category = require('../models/category');

const router = express.Router();

// GET /api/v1/categories
router.get('/', async (req, res) => {
    try {
        let categories = await Category.find();
        if (categories) {
            res.status(201).json({
                data: categories,
                success: true,
            });
        } else {
            res.status(404).json({
                message: 'No Categories',
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

// GET /api/v1/categories/:categoryID
router.get('/:categoryID', async (req, res) => {
    try {
        const { categoryID } = req.params;
        let category = await Category.findById(categoryID);
        if (category) {
            res.status(201).json({
                data: category,
                succes: true,
            });
        } else {
            res.status(404).json({
                message: "Category doesn't exist",
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Can't Get Category",
            success: false,
        });
        console.log(err);
    }
});

// POST /api/v1/categories
router.post('/', async (req, res) => {
    try {
        const { name, icon, color } = req.body;
        let category = new Category({
            name,
            icon,
            color,
        });
        category = await category.save();
        if (category) {
            res.status(201).json({
                data: category,
                success: true,
            });
        } else {
            res.status(500).json({
                message: 'Problem Creating a Category',
                success: false,
            });
        }
    } catch (err) {
        if (
            err.message.includes('index: name_1 dup key') &&
            err.message.includes('duplicate key error')
        ) {
            res.status(400).json({
                message: 'Category already exist',
                success: false,
            });
        } else {
            res.status(500).json({
                message: 'Problem Creating a Category',
                success: false,
            });
        }
        console.log(err);
    }
});

// PUT /api/v1/categories/:categoryID
router.put('/:categoryID', async (req, res) => {
    try {
        const { categoryID } = req.params;
        const { name, icon, color } = req.body;
        const category = await Category.findByIdAndUpdate(
            categoryID,
            {
                name,
                icon,
                color,
            },
            { new: true }
        );
        if (category) {
            res.status(201).json({
                message: 'Category Updated Successfully',
                data: category,
                success: true,
            });
        } else {
            res.status(400).json({
                message: "Category doesn't exist",
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: 'Problem Updating the Category',
            success: false,
        });
        console.log(err);
    }
});

// DELETE /api/v1/categories/:categoryID
router.delete('/:categoryID', async (req, res) => {
    try {
        const { categoryID } = req.params;
        const category = await Category.findByIdAndRemove(categoryID);
        if (category) {
            res.status(201).json({
                message: 'Category Deleted Successfully',
                data: category,
                success: true,
            });
        } else {
            res.status(404).json({
                message: 'Category not found',
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: 'Problem Deleting the Category',
            success: false,
        });
        console.log(err);
    }
});

module.exports = router;
