const user = require('../app/models/user.model');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

(addAdmin = () => {
    const userModel = {
        username: process.env.ADMIN_USERNAME,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: process.env.ADMIN_ROLE,
        isVerified: true,
        isActive: true,
    };
    bcrypt.hash(process.env.ADMIN_PASSWORD, SALT_WORK_FACTOR)
        .then((hash) => {
            userModel.password = hash;
            let query = { username: process.env.ADMIN_USERNAME }
            let update = userModel
            user.findOneAndUpdate(query, update, { upsert: true })
                .then(data => {
                    console.log('successfully added admin.')
                    let resPonse = {
                        success: true,
                        data: data,
                        msg: 'Admin has been added successfully.'
                    }
                    // res.send(resPonse);
                }).catch(err => {
                    console.log('add admin error section');
                    // res.status(500).send({
                    //     success: false,
                    //     message: err.message || "Some error occurred while trying to add admin."
                    // });
                });
        })
        .catch((err) => {
            console.log('encryption of password for the admin failed.');
        })
})();