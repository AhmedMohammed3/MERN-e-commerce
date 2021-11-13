const express = require('express');

const router = express.Router();

const api = process.env.API_URL;

module.exports = {
    getRequest(endpoint, cb) {
        return router.get(`${api}${endpoint}`, cb);
    },
};
