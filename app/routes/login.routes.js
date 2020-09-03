const loginRouter = require('express').Router();
const login = require('../controllers/login.controller.js');
const middleware = require('../../middleware');
const roles = require('../../config/roles.config');
// const LOGIN_ROUTES=[
//     {path:"/signup",method:'POST',handlers:[login.addUser]}
// ]
// Create a new uSER
loginRouter.post('/signup', login.addUser);

// // Retrieve all Notes
loginRouter.get('/users', middleware.checkToken(roles.Admin), login.findAll);

loginRouter.get('/users/:id', middleware.checkToken(), login.findUserById);

//admin to add user api
loginRouter.post('/users/add', middleware.checkToken(roles.Admin), login.addNewUser)
//admin to add user api
loginRouter.put('/users/edit', middleware.checkToken(roles.Admin), login.editUser)

//Toggle user status
loginRouter.post('/users/update-status', middleware.checkToken(roles.Admin), login.updateUserStatus);

//admin to add user api
loginRouter.delete('/users/delete/:id', middleware.checkToken(roles.Admin), login.deletUser)

// Retrieve a single Note with noteId
loginRouter.post('/login', login.findOne);

loginRouter.get('/login/:token', login.verifyEmail);

// loginRouter.get('/home/:username', middleware.checkToken, login.getUserData);

// loginRouter.get('/user', middleware.authorize(roles.Admin), login.getUserData);
// loginRouter.get('/user/:id', middleware.authorize(), login.getUserData);

//forgot password
loginRouter.post('/forgot-password', login.forgotPassword);

//reset password
loginRouter.put('/reset-password', middleware.checkToken(), login.resetPassword);

//Update Password
loginRouter.put('/update-password', login.updatePassword);

// // Update a Note with noteId
// app.put('/notes/:noteId', notes.update);

// // Delete a Note with noteId
// app.delete('/notes/:noteId', notes.delete);
module.exports = loginRouter