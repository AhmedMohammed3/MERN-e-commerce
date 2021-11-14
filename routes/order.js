const express = require('express');
const Order = require('../models/order');
const OrderItem = require('../models/order-item');
const router = express.Router();

// GET /api/v1/orders
router.get('/', async (req, res) => {
    try {
        let orders = await Order.find().populate('user');
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

// GET /api/v1/orders/users/:userID
router.get('/users/:userID', async (req, res) => {
    try {
        let orders = await Order.find({ user: req.params.userID }).populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                populate: { path: 'category' },
            },
        });
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

// GET /api/v1/orders/totalsales
router.get('/totalsales', async (req, res) => {
    try {
        // const orders = await Order.find().select('totalPrice');
        // if (orders) {
        //     let totalPrice = 0;
        //     totalPrice = orders.reduce((accumulator, arrItem) => {
        //         return accumulator + arrItem.totalPrice;
        //     }, 0);
        //     console.log(totalPrice);
        //     res.status(201).json({
        //         data: totalPrice,
        //         success: true,
        //     });
        // } else {
        //     res.status(500).json({
        //         message: "Can't Get Orders",
        //         success: false,
        //     });
        // }
        const totalSales = await Order.aggregate([
            { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } },
        ]);
        if (totalSales) {
            res.status(400).json({
                data: totalSales[0].totalSales,
                success: true,
            });
        } else {
            res.status(500).json({
                message: "Can't Get Price",
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Can't Get Price",
            success: false,
        });
        console.log(err);
    }
});

// GET /api/v1/orders/count
router.get('/count', async (req, res) => {
    try {
        let orderCount = await Order.countDocuments();
        if (orderCount) {
            res.status(201).json({
                data: orderCount,
                success: true,
            });
        } else {
            res.status(404).json({
                message: 'No Orders',
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Can't fetch Orders",
            success: false,
        });
        console.log(err);
    }
});

// GET /api/v1/orders/:orderID
router.get('/:orderID', async (req, res) => {
    try {
        let order = await Order.findById(req.params.orderID)
            .populate('user')
            .populate({
                path: 'orderItems',
                // populate: 'product',
                populate: { path: 'product', populate: 'category' },
            });
        if (order) {
            res.status(201).json({
                data: order,
                success: true,
            });
        } else {
            res.status(404).json({
                message: "Can't find Order",
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Can't Get Order",
            success: false,
        });
        console.log(err);
    }
});

// POST /api/v1/orders
router.post('/', async (req, res) => {
    try {
        const { orderItems } = req.body;
        let orderItemsIds = await Promise.all(
            orderItems.map(async item => {
                let newItem = new OrderItem(item);
                newItem = await newItem.save();
                return newItem.id;
            })
        );

        req.body.orderItems = orderItemsIds;

        const totalPrices = await Promise.all(
            orderItemsIds.map(async itemId => {
                const item = await OrderItem.findById(itemId).populate(
                    'product',
                    'price'
                );
                return item.quantity * item.product.price;
            })
        );

        const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

        req.body.totalPrice = totalPrice;
        let order = new Order(req.body);
        order = await order.save();
        if (order) {
            res.status(201).json({
                data: order,
                success: true,
            });
        } else {
            res.status(500).json({
                message: 'Problem Creating a Order',
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: 'Problem Creating a Order',
            success: false,
        });
        console.log(err);
    }
});

// PUT /api/v1/orders/:orderID
router.put('/:orderID', async (req, res) => {
    try {
        const { orderID } = req.params;
        const order = await Order.findByIdAndUpdate(
            orderID,
            {
                status: req.body.status,
            },
            { new: true }
        );
        if (order) {
            res.status(201).json({
                message: 'Order Updated Successfully',
                data: order,
                success: true,
            });
        } else {
            res.status(400).json({
                message: "Order doesn't exist",
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: 'Problem Updating the Order',
            success: false,
        });
        console.log(err);
    }
});

// DELETE /api/v1/orders/:orderID
router.delete('/:orderID', async (req, res) => {
    try {
        const { orderID } = req.params;
        let order = await Order.findById(orderID);
        order.orderItems.forEach(async item => {
            await OrderItem.findByIdAndRemove(item);
        });
        order = await order.remove();
        // order = await Order.findByIdAndRemove(orderID);
        if (order) {
            res.status(201).json({
                message: 'Order Deleted Successfully',
                data: order,
                success: true,
            });
        } else {
            res.status(404).json({
                message: 'Order not found',
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: 'Problem Deleting the Order',
            success: false,
        });
        console.log(err);
    }
});

module.exports = router;
