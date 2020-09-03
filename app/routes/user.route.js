const loginRouter = require('express').Router();
const login = require('../controllers/login.controller.js');
const middleware = require('../../middleware');
const roles = require('../../config/roles.config');

// // Retrieve all Notes
loginRouter.get('/users', middleware.checkToken(roles.Admin), login.findAll);

loginRouter.get('/users/:id', middleware.checkToken(), login.findUserById);

//admin to add user api
loginRouter.post('/users/add', middleware.checkToken(roles.Admin), login.addNewUser)
//admin to add user api
loginRouter.put('/users/edit', middleware.checkToken(roles.Admin), login.editUser)
//admin to add user api
loginRouter.delete('/users/delete/:id', middleware.checkToken(roles.Admin), login.deletUser)

module.exports = loginRouter