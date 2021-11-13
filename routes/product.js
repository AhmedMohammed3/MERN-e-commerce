const express = require('express');
const Product = require('../models/product');

const router = express.Router();

// GET /api/v1/products
router.get('/', async (req, res) => {
    let products = await Product.find();
    try {
        if (products) {
            res.status(201).json(products);
        } else {
            res.status(404).json({
                message: 'Not Found',
                success: true,
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err,
            success: false,
        });
        console.log(err);
    }
});

// POST /api/v1/products
router.post('/', async (req, res) => {
    const { name, image, stockCount } = req.body;
    const product = new Product({ name, image, stockCount });
    try {
        let newProd = await product.save();
        if (newProd) {
            res.status(201).json(newProd);
        } else {
            res.status(500).json({
                message: "Can't Add product",
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err,
            success: false,
        });
        console.log(err);
    }
});

module.exports = router;
