const user = require('../models/user.model.js');
const userValidEmail = require('../models/userValidEmail.model');
// const jwt = require('jsonwebtoken');
const jwt = require('../../config/jwt.config');
const forgotPasswordModel = require('../models/forgotPassword.model');
// var nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');
const nLog = require("noogger");
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var MailConfig = require('../../config/email.config');
var transporter = MailConfig.GmailTransport;


// var transporter = nodemailer.createTransport({
//     service: process.env.MAILER_SERVICE_PROVIDER,
//     auth: {
//         user: process.env.MAILER_EMAIL_ID,
//         pass: process.env.MAILER_PASSWORD
//     }
// });

var mailOptions = {
    from: process.env.MAILER_EMAIL_ID,
    to: '',
    subject: '',
    html: ''
};

// Create and Save a new user
exports.addUser = (req, res) => {
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
        password: req.body.password
    });

    if (userModel.validateEmail(req.body.email)) {
        // userModel.setPassword(req.body.password);

        // Save Note in the database
        userModel.save()
            .then(data => {
                console.log('add user success section');
                console.log('successfully signed up.')
                let resPonse = {
                    success: true,
                    data: data,
                    msg: 'URL has been sent to the email.Please check!'
                }
                sendUrl(resPonse)
                res.send(resPonse);
            }).catch(err => {
                console.log('add user error section');
                res.status(500).send({
                    success: false,
                    message: err.message || "Some error occurred while trying to login."
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

sendUrl = async (resPonse) => {
    const userValidateEmail = new userValidEmail({
        id: resPonse.data._id,
        // otp: Math.floor((Math.random() * 9000) + 1000)
        token: jwt.createToken(resPonse.data, 300)
    })
    userValidateEmail.save()
        .then(async data => {
            console.log('email has been added successfully.');
            let template = 'emailTemplate'
            await MailConfig.ViewOption(transporter, template, hbs);
            let mailOptions = {
                from: process.env.MAILER_EMAIL_ID,
                to: resPonse.data.email,
                subject: 'Verification Link',
                template: template,
                context: {
                    name: resPonse.data.username,
                    title: "Verification Link",
                    token: data.token,
                    url: process.env.FRONTENDURL,
                    link: process.env.FRONTENDURL + '/login/' + data.token,
                    actionText: 'to Verify your email'
                }
            };
            // let mailOptions = {
            //     to: resPonse.data.email,
            //     subject: 'Verification Link',
            //     html: '<p>Click <a href="' + process.env.FRONTENDURL + '/login/' + data.token + '">here</a> to validate you email</p>'
            // }
            sendEmail(mailOptions);
        }).catch(err => {
            // res.status(500).send({
            //     success: false,
            //     message: err.message || "Some error occurred while trying to save URL."
            // });
            console.log(err.message || "Some error occurred while trying to save URL.");
        });
}

sendEmail = (options) => {
    // mailOptions.to = options.to;
    // mailOptions.subject = options.subject;
    // mailOptions.html = options.html;

    transporter.sendMail(options, async function (error, info) {
        if (error) {
            nLog.error(error);
            // await MailConfig.ClearOption(MailConfig.GmailTransport, '', hbs);
        } else {
            nLog.info('Email sent: ' + info.response);
            // await MailConfig.ClearOption(MailConfig.GmailTransport, '', hbs);
        }
    });

}

exports.findAll = (req, res) => {
    console.log('this is findAll', process.env.ADMIN_USERNAME)
    user.find({ 'username': { $ne: process.env.ADMIN_USERNAME } })
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

// Find a single user with a id
exports.findOne = (req, res) => {
    user.findOne({ username: req.body.username })
        .then(userData => {
            console.log('------------------', userData)
            if (!userData || Object.keys(userData).length === 0) {
                return res.status(404).send({
                    success: false,
                    message: "user not found with name " + req.body.username
                });
            } else {

                if (req.body.username === process.env.ADMIN_USERNAME && req.body.password === process.env.ADMIN_PASSWORD) {
                    console.log('admin has arrived')
                    // let token = jwt.sign({ username: userData.username, role: userData.role, _id: userData._id, isActive: userData.isActive },
                    //     process.env.SECRET,
                    //     {
                    //         expiresIn: '2h' // expires in 4 hours
                    //     }
                    // )
                    let token = jwt.createToken(userData, '2h')
                    let data = {
                        token: token,
                        user: userData,
                        msg: 'Authentication successfull'
                    }
                    return res.send({
                        success: true,
                        message: 'logged in successfully',
                        data: data
                    });
                }

                if (userData && !userData.isActive) {
                    return res.status(401).json({ success: false, message: 'Unauthorized' });
                }

                userData.validatePassword(req.body.password, function (err, isMatch) {
                    if (err || !isMatch) {
                        return res.status(400).send({
                            success: false,
                            message: 'Wrong Password',
                            error: 'wrong password'
                        })
                    }

                    if (!userData.isVerified) {
                        return res.status(400).send({
                            success: false,
                            msg: 'Email is not verified'
                        })
                    }
                    // let token = jwt.sign({ username: userData.username, role: userData.role, _id: userData._id },
                    //     process.env.SECRET,
                    //     {
                    //         expiresIn: '1h' // expires in 4 hours
                    //     }
                    // )
                    let token = jwt.createToken(userData, '1h')
                    let data = {
                        token: token,
                        user: userData,
                        msg: 'Authentication successfull'
                    }
                    return res.send({
                        success: true,
                        message: 'logged in successfully',
                        data: data
                    });
                });



                // if (userData.validatePassword(req.body.password)) {
                //     if (!userData.isVerified) {
                //         return res.status(400).send({
                //             success: false,
                //             msg: 'Email is not verified'
                //         })
                //     }
                //     let token = jwt.sign({ username: req.body.username },
                //         process.env.SECRET,
                //         {
                //             expiresIn: '1h' // expires in 24 hours
                //         }
                //     )
                //     let data = {
                //         token: token,
                //         user: userData,
                //         msg: 'Authentication successfull'
                //     }
                //     res.send({
                //         success: true,
                //         message: 'logged in successfully',
                //         data: data
                //     });
                // } else {
                //     return res.status(400).send({
                //         success: false,
                //         message: 'Wrong Password',
                //         error: 'wrong password'
                //     })
                // }
            }

        }).catch(err => {
            return res.status(500).send({
                success: false,
                message: "Error retrieving user with name " + req.body.username,
                error: "Error retrieving user with name " + req.body.username
            });
        });
};

exports.verifyEmail = (req, res) => {
    userValidEmail.findOne({ token: req.params.token })
        .then(userData => {
            if (!userData || Object.keys(userData).length === 0) {
                return res.status(404).send({
                    success: false,
                    message: "Email verification failed"
                });
            } else {
                user.findOne({ _id: userData.id })
                    .then(user => {
                        if (user) {
                            updateVerifiedEmailStatus(user, res)
                            // user.isVerified = true;
                            // user.save();
                            // return res.status(200).send({
                            //     msg: 'Success',
                            //     res: user
                            // })
                        } else {
                            return res.status(404).send({
                                success: false,
                                message: "Email verification failed."
                            });
                        }
                    })
            }

        }).catch(err => {
            return res.status(500).send({
                success: false,
                message: "Error retrieving user with name " + req.body.username
            });
        });
};

updateVerifiedEmailStatus = (user, res) => {
    if (user) {
        user.isVerified = true;
        user.save()
            .then(data => {
                console.log('Saved verified user')
                let resPonse = {
                    success: true,
                    data: data,
                    msg: 'Email has been verified.'
                }
                res.send(resPonse);
            }).catch(err => {
                res.status(500).send({
                    success: false,
                    message: err.message || "Some error occurred while trying verify the email."
                });
            });
    }
}



exports.getUserData = (req, res) => {
    user.find({ username: req.params.username })
        .then(user => {
            if (!user) {
                return res.status(404).send({
                    success: false,
                    message: "user not found with name " + req.params.username
                });
            }
            res.send({
                success: true,
                data: user,
                message: 'successfully fetched user data.'
            });
        }).catch(err => {
            // if (err.kind === 'ObjectId') {
            //     return res.status(404).send({
            //         message: "Note not found with id " + req.params.noteId
            //     });
            // }
            return res.status(500).send({
                success: false,
                message: "Error retrieving user with name" + req.params.username
            });
        });
};

findUser = (email) => {
    return user.findOne({ 'email': email })
        .then(userData => {
            nLog.info('userData' + userData);
            return userData || {}
        })
        .catch(err => {
            nLog.warning('userdata failure.')
            return {};
        })
}
saveToforgotPasswordModel = (user) => {
    let data = {
        uid: user._id,
        email: user.email,
        token: jwt.createForgotPasswordToken(user, 300)

    }
    let query = { 'uid': user._id };
    let update = data;
    return forgotPasswordModel.findOneAndUpdate(query, data, { upsert: true, new: true })
        .then(forgotPasswordData => {
            return forgotPasswordData
        })
        .catch(err => {
            return err;
        })
}

exports.forgotPassword = async (req, res) => {
    let user = await findUser(req.body.email);
    if (user && Object.keys(user).length > 0) {
        let forgotPasswordData = await saveToforgotPasswordModel(user) || {}
        if (forgotPasswordData && Object.keys(forgotPasswordData).length > 0) {
            let template = 'emailTemplate';
            await MailConfig.ViewOption(transporter, template, hbs);
            let mailOptions = {
                from: process.env.MAILER_EMAIL_ID,
                to: forgotPasswordData.email,
                subject: 'Forgot password Link',
                template: template,
                context: {
                    name: forgotPasswordData.username,
                    title: "Forgot password Link",
                    token: forgotPasswordData.token,
                    uId: forgotPasswordData.uid,
                    url: process.env.FRONTENDURL,
                    link: process.env.FRONTENDURL + '/update-password?token=' + forgotPasswordData.token + '&_id=' + forgotPasswordData.uid,
                    actionText: 'to reset your password.'
                }
            };
            // let mailOptions = {
            //     to: forgotPasswordData.email,
            //     subject: 'Verification Link',
            //     html: '<p>Click <a href="' + process.env.FRONTENDURL + '/update-password?token=' + forgotPasswordData.token + '&_id=' + forgotPasswordData.uid + '">here</a> to reset your password</p>'
            // }
            sendEmail(mailOptions);
            return res.status(200).send({
                success: true,
                message: 'An email has been sent to the mail to reset the password.',
                data: user
            })
        }
        return res.status(500).send({
            success: false,
            message: 'unable to reset password'
        })
    }
    return res.status(500).send({
        success: false,
        message: 'User not found'
    })
}

exports.updatePassword = async (req, res) => {
    // const userModel = new user();
    // let update = await userModel.getSaltAndHash(req.body.password);
    let query = { '_id': req.body._id };
    // bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    //     // hash the password using our new salt
    //     bcrypt.hash(req.body.password, salt, function (err, hash) {
    //         req.body.password = hash;
    //     });
    // });
    // let salt = crypto.randomBytes(16).toString('hex');
    // let hash = crypto.pbkdf2Sync(req.body.password, salt, 1000, 64, 'sha512').toString('hex');



    bcrypt.hash(req.body.password, SALT_WORK_FACTOR)
        .then(function (hash) {
            req.body.password = hash;
            let update = { password: req.body.password };
            user.findByIdAndUpdate(query, update, (error, result) => {
                if (error) {
                    return res.status(500).send({
                        success: false,
                        error: error,
                        message: 'Password update failed.'
                    })
                }
                return res.status(200).send({
                    success: true,
                    message: 'password updated successfully.',
                    data: result
                })
            })
        }).catch(err => {
            console.log('password update failed.');
            res.status(500).send({
                success: false,
                message: err.message || "pasword update failed."
            });
        });
}

exports.resetPassword = async (req, res) => {
    let userInstance = new user();
    user.findOne({ _id: req.decode._id })
        .then(async userData => {
            if (userData && userData.password) {
                // let hash = await getHash(req.body.oldPassword);
                userData.validatePassword(req.body.oldPassword, async function (err, isMatch) {
                    if (err || !isMatch) {
                        return res.status(400).send({
                            success: false,
                            message: 'Wrong Old Password',
                            error: 'wrong Old password'
                        })
                    }
                    let hash = await getHash(req.body.password);
                    userData.update({ password: hash }, { new: true })
                        .then(updatedData => {
                            return res.send({
                                success: true,
                                message: 'successfully updated the password.'
                            })
                        })
                        .catch(err => {
                            return res.send({
                                success: false,
                                message: 'password update failed.',
                                error: err || 'password update failed.'
                            })
                        })
                });
            }
        })
        .catch(err => {
            return res.send({
                success: false,
                message: 'account not found with this object Id',
                error: err || 'account not found with this object Id'
            })
        })
}

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
exports.editUser = async (req, res) => {
    let userBody = req.body;
    let updateUser = {};
    if (req.body.username) {
        updateUser.username = req.body.username;
    }
    if (req.body.email) {
        updateUser.email = req.body.email;
    }
    if (req.body.password) {
        let hash = await getHash(req.body.password);
        if (hash) {
            updateUser.password = hash;
        }
    }
    let query = { '_id': userBody._id };

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
}

getHash = (password) => {
    return bcrypt.hash(password, SALT_WORK_FACTOR)
        .then(hash => {
            return hash;
        })
        .catch(err => {
            return false
        })
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

exports.updateUserStatus = (req, res) => {
    //     user.findByIdAndUpdate(query, update, (error, result) => {
    //         if (error) {
    //             return res.status(500).send({
    //                 success: false,
    //                 error: error,
    //                 message: 'Password update failed.'
    //             })
    //         }
    //         return res.status(200).send({
    //             success: true,
    //             message: 'password updated successfully.',
    //             data: result
    //         })
    //     })
    // }).catch(err => {
    //     console.log('password update failed.');
    //     res.status(500).send({
    //         success: false,
    //         message: err.message || "pasword update failed."
    //     });
    // });
    user.findByIdAndUpdate({ _id: req.body._id }, { 'isActive': req.body.isActive })
        .then(updatedStatus => {
            return res.status(200).send({
                success: true,
                message: 'status updated successfully.',
                data: updatedStatus
            })
        })
        .catch(err => {
            return res.status(500).send({
                success: false,
                message: err.message || "status update failed."
            })
        })
}
