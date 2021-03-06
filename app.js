require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const productRoutes = require('./routes/product');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const orderRoutes = require('./routes/order');
const authJwt = require('./middleware/jwt');

const app = express();

const api = process.env.API_URL;
const PORT = process.env.PORT;

// middlewares
app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());

// routes
app.use(`${api}/products`, productRoutes);
app.use(`${api}/users`, userRoutes);
app.use(`${api}/categories`, categoryRoutes);
app.use(`${api}/orders`, orderRoutes);
app.use('/public', express.static(__dirname + '/public'));
app.use((err, req, res, next) => {
    if (err) {
        console.log(err);
        res.status(500).json({
            message: 'Server Error',
            error: err.message,
            success: false,
        });
    }
});
// handling connection and starting server
const connectionURL = `mongodb://localhost:27017/${process.env.DB_NAME}`;
mongoose.connect(connectionURL, err => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Connected To DB!');
    app.listen(PORT, () => {
        console.log(`Server Running On Port ${PORT}`);
    });
});
