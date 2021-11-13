require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());
app.use(morgan('tiny'));

const api = process.env.API_URL;

app.get(`${api}/products`, (req, res) => {
    const product = {
        id: 1,
        name: 'T-shirt',
        image: 'some_url',
    };
    res.send(product);
});

app.post(`${api}/products`, (req, res) => {
    const product = req.body;
    res.send(product);
});

const connectionURL = `http://localhost:27017/${process.env.DB_NAME}`;
const PORT = process.env.PORT;
mongoose.connect(connectionURL, () => {
    console.log('Connected To DB!');
    app.listen(PORT, () => {
        console.log(`Server Running On Port ${PORT}`);
    });
});
