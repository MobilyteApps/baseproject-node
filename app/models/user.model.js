const mongoose = require('mongoose');
var crypto = require('crypto');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

const userSchema = mongoose.Schema({
    username: { type: String, unique: true },
    password: { type: String, required: true },
    email: { type: String, unique: true },
    isVerified: { type: Boolean, default: false },
    role: {
        type: String, default: 'user',
        enum: ['user', 'admin']
    },
    isActive: {
        type: Boolean, default: true,
        enum: [true, false]
    }
}, {
    timestamps: true
});

userSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

// userSchema.pre('save', (next) => {
//     let salt = crypto.randomBytes(16).toString('hex');
//     this.password = crypto.pbkdf2Sync(this.password, salt, 1000, 64, 'sha512').toString('hex');
//     console.log('i am pre called before saving the user.')
//     next();
// })

// userSchema.methods.setPassword = function (password) {
//     this.salt = crypto.randomBytes(16).toString('hex');
//     this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
// }

userSchema.methods.getSaltAndHash = function (password) {
    return new Promise((resolve, reject) => {
        salt = crypto.randomBytes(16).toString('hex');
        hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
        resolve({ 'salt': salt, 'hash': hash })
    }).then(hashAndSalt = () => {
        return hashAndSalt
    }).
        catch(err = () => {
            return err
        })

}

// userSchema.methods.validatePassword = function (password) {
//     let hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
//     console.log('the has generated', hash);
//     return this.hash === hash;
// }

userSchema.methods.validatePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
}

userSchema.methods.validateEmail = function (email) {
    var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailRegex.test(email);
}

module.exports = mongoose.model('User', userSchema);