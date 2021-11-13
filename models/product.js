const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    image: String,
    stockCount: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model('Product', productSchema);
