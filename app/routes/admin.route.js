var express = require('express');
// var router = express.Router();
const admin = require('../controllers/admin.controller');
const middleware = require('../../middleware');


// router.get('/get-admin-data', middleware.checkToken, middleware.checkRole, admin.getUserData);

module.exports = (app) => {
    app.get('/', middleware.checkToken, middleware.checkRole, admin.getUserData);
}