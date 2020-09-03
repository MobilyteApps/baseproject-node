const user = require('../models/user.model.js');
// var nodemailer = require('nodemailer');
const nLog = require("noogger");
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var MailConfig = require('../../config/email.config');

exports.findUserById = (req, res) => {
    user.findById(req.params.id)
        .then(userData => {
            console.log('------------------', userData)
            if (!userData || Object.keys(userData).length === 0) {
                return res.status(404).send({
                    success: false,
                    message: "user not found with id " + req.params.id
                });
            } else {
                res.send({
                    success: true,
                    message: 'user data',
                    data: userData
                });
            }

        }).catch(err => {
            return res.status(500).send({
                success: false,
                message: "Error retrieving user data ",
                error: "Error retrieving user data"
            });
        });
}

exports.addNewUser = (req, res) => {
    // Validate request
    console.log("rere", req.body)
    if (!req.body.username || !req.body.email) {
        if (!req.body.username) {
            return res.status(400).send({
                success: false,
                message: "username content can not be empty",
                body: req.body
            });
        } else {
            return res.status(400).send({
                success: false,
                message: "password can not be empty",
                body: req.body
            });
        }
        // } else if (user.validateEmail(req.body.password)) {
    }
    const userModel = new user({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        isVerified: true
    });

    if (userModel.validateEmail(req.body.email)) {
        // userModel.setPassword(req.body.password);

        // Save Note in the database
        userModel.save()
            .then(data => {
                console.log('successfully signed up.')
                let resPonse = {
                    success: true,
                    data: data,
                    msg: 'user has been successfully.'
                }
                res.send(resPonse);
            }).catch(err => {
                console.log('add user error section');
                res.status(500).send({
                    success: false,
                    message: err.message || "Some error occurred while trying to save user."
                });
            });
    } else {
        return res.status(400).send({
            success: false,
            message: "email format is not correct!",
            body: req.body
        });
    }

};
exports.editUser = (req, res) => {
    let userBody = req.body;

    bcrypt.hash(userBody.password, SALT_WORK_FACTOR)
        .then(function (hash) {
            let query = { '_id': userBody._id };
            let updateUser = {
                username: userBody.username,
                email: userBody.email,
                password: hash
            }
            return user.findByIdAndUpdate(query, updateUser, { new: true })
                .then(editedUser => {
                    return res.status(200).send({
                        success: true,
                        message: 'user updated successfully.',
                        data: editedUser
                    })
                }).catch(err => {
                    return res.send({
                        success: false,
                        message: 'unable to retreive data',
                        error: err || 'unable to retreive data'
                    });
                })
        }).catch(err => {
            console.log('password update failed.');
            res.status(500).send({
                success: false,
                message: err.message || "pasword update failed."
            });
        });
}

exports.deletUser = (req, res) => {
    // Validate request
    console.log("delete user", req.params.id)
    if (!req.params.id) {
        return res.status(400).send({
            success: false,
            message: "Please enter Id to be deleted",
            body: req.body
        });
    }
    user.remove({ _id: req.params.id }, (err, result) => {
        if (err) {
            return res.send({
                success: false,
                message: 'unable to delete user',
                error: err || 'unable to delete user'
            });

        } else {
            return res.send({
                success: true,
                message: 'Deleted User successfully',
                data: result
            });
        }
    })

};

exports.findAll = (req, res) => {
    console.log('this is findAll')
    user.find()
        .then(users => {
            res.send({
                success: true,
                data: users,
                message: 'successfully found all users.'
            });
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while retrieving users."
            });
        });
};