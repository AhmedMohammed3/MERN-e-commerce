const express = require('express');
const Order = require('../models/order');
const router = express.Router();

// GET /api/v1/orders
router.get('/', async (req, res) => {
    try {
        let orders = await Order.find();
        if (orders) {
            res.status(201).json({
                data: orders,
                success: true,
            });
        } else {
            res.status(500).json({
                message: "Can't Get Orders",
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Can't Get Orders",
            success: false,
        });
        console.log(err);
    }
});

module.exports = router;
