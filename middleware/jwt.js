const expressJwt = require('express-jwt');

function authJwt() {
    const api = process.env.API_URL;
    return expressJwt({
        secret: process.env.JWT_SECRET,
        algorithms: ['HS256'],
        isRevoked: async function (req, payload, done) {
            if (!payload.isAdmin) {
                return done(null, true);
            }
            done();
        },
    }).unless({
        path: [
            {
                url: /\/api\/v1\/products(.*)/,
                methods: ['GET', 'OPTIONS'],
            },
            {
                url: /\/api\/v1\/categories(.*)/,
                methods: ['GET', 'OPTIONS'],
            },
            `${api}/users/login`,
            `${api}/users/register`,
        ],
    });
}

module.exports = authJwt;
