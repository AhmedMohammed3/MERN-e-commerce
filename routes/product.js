const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Product = require('../models/product');
const Category = require('../models/category');

const router = express.Router();

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid Image Type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, './public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, fileName + '-' + Date.now() + '.' + extension);
    },
});

const upload = multer({ storage: storage });

// GET /api/v1/products
router.get('/', async (req, res) => {
    try {
        let filter = {};
        if (req.query.categories) {
            filter = { category: req.query.categories.split(',') };
        }
        console.log('filter', filter);
        let products = await Product.find(filter).populate('category');
        if (products) {
            res.status(201).json({
                data: products,
                success: true,
            });
        } else {
            res.status(404).json({
                message: 'No Products',
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Can't fetch products",
            success: false,
        });
        console.log(err);
    }
});

// GET /api/v1/products/count
router.get('/count', async (req, res) => {
    try {
        let productCount = await Product.countDocuments();
        if (productCount) {
            res.status(201).json({
                data: productCount,
                success: true,
            });
        } else {
            res.status(404).json({
                message: 'No Products',
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Can't fetch products",
            success: false,
        });
        console.log(err);
    }
});

// GET /api/v1/products/featured/:productsCount
router.get('/featured/:productsCount', async (req, res) => {
    try {
        let products = await Product.find({ isFeatured: true }).limit(
            Number(req.params.productsCount)
        );
        if (products) {
            res.status(201).json({
                data: products,
                success: true,
            });
        } else {
            res.status(404).json({
                message: 'No Products',
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Can't fetch products",
            success: false,
        });
        console.log(err);
    }
});

// GET /api/v1/products/featured/
router.get('/featured/', async (req, res) => {
    try {
        let products = await Product.find({ isFeatured: true });
        if (products) {
            res.status(201).json({
                data: products,
                success: true,
            });
        } else {
            res.status(404).json({
                message: 'No Products',
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Can't fetch products",
            success: false,
        });
        console.log(err);
    }
});

// GET /api/v1/products/:productID
router.get('/:productID', async (req, res) => {
    try {
        const { productID } = req.params;
        if (!mongoose.isValidObjectId(productID)) {
            return res.status(400).json({
                message: 'Product ID is not valid',
                success: false,
            });
        }
        const product = await Product.findById(productID).populate('category');
        if (product) {
            res.status(201).json({
                data: product,
                success: true,
            });
        } else {
            res.status(404).json({
                message: 'Product Not Found',
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Can't fetch product",
            success: false,
        });
        console.log(err);
    }
});

// POST /api/v1/products
router.post('/', upload.single('image'), async (req, res) => {
    try {
        console.log('req.body', req.body);
        let { category } = req.body;
        if (!mongoose.isValidObjectId(category)) {
            return res.status(400).json({
                message: 'Category ID is not valid',
                success: false,
            });
        }
        category = await Category.findById(category);
        if (category) {
            if (req.file) {
                const basePath = `${req.protocol}://${req.get(
                    'host'
                )}/public/upload/`;
                req.body.image = basePath + req.file.filename;
                let product = new Product(req.body);
                product = await product.save();
                if (product) {
                    res.status(201).json({
                        data: product,
                        success: true,
                    });
                } else {
                    res.status(500).json({
                        message: "Can't Add product",
                        success: false,
                    });
                }
            } else {
                res.status(400).json({
                    message: 'No image sent',
                    success: false,
                });
            }
        } else {
            res.status(404).json({
                message: "Can't find this category",
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Can't Add product",
            success: false,
        });
        console.log(err);
    }
});

// PUT /api/v1/products/gallery/:productID
router.put(
    '/gallery/:productID',
    upload.array('image', 10),
    async (req, res) => {
        try {
            const { productID } = req.params;
            if (!mongoose.isValidObjectId(productID)) {
                return res.status(400).json({
                    message: 'Product ID is not valid',
                    success: false,
                });
            }
            if (req.files) {
                const basePath = `${req.protocol}://${req.get(
                    'host'
                )}/public/upload/`;
                let imagesPaths = req.files.map(
                    file => basePath + file.filename
                );
                product = await Product.findByIdAndUpdate(
                    productID,
                    {
                        images: imagesPaths,
                    },
                    {
                        new: true,
                    }
                );
                if (product) {
                    res.status(201).json({
                        data: product,
                        success: true,
                    });
                } else {
                    res.status(500).json({
                        message: 'Problem Updating the product',
                        success: false,
                    });
                }
            } else {
                res.status(400).json({
                    message: 'No images sent',
                    success: false,
                });
            }
        } catch (err) {
            res.status(500).json({
                message: 'Problem Updating the product',
                success: false,
            });
            console.log(err);
        }
    }
);

// PUT /api/v1/products/:productID
router.put('/:productID', upload.single('image'), async (req, res) => {
    try {
        const { productID } = req.params;
        if (!mongoose.isValidObjectId(productID)) {
            return res.status(400).json({
                message: 'Product ID is not valid',
                success: false,
            });
        }
        if (req.file) {
            const basePath = `${req.protocol}://${req.get(
                'host'
            )}/public/upload/`;
            req.body.image = basePath + req.file.filename;
        }
        product = await Product.findByIdAndUpdate(productID, req.body, {
            new: true,
        });
        if (product) {
            res.status(201).json({
                message: 'Product Updated Successfully',
                data: product,
                success: true,
            });
        } else {
            res.status(400).json({
                message: "Product doesn't exist",
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: 'Problem Updating the product',
            success: false,
        });
        console.log(err);
    }
});

// DELETE /api/v1/products/:productID
router.delete('/:productID', async (req, res) => {
    try {
        const { productID } = req.params;
        if (!mongoose.isValidObjectId(productID)) {
            return res.status(400).json({
                message: 'Product ID is not valid',
                success: false,
            });
        }
        const product = await Product.findByIdAndRemove(productID);
        if (product) {
            res.status(201).json({
                message: 'Product Deleted Successfully',
                data: product,
                success: true,
            });
        } else {
            res.status(404).json({
                message: 'Product not found',
                success: false,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: 'Problem Deleting the product',
            success: false,
        });
        console.log(err);
    }
});

module.exports = router;
