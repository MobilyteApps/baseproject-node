const jwt = require('jsonwebtoken');

module.exports.createToken = (user, expiry) => {
    return jwt.sign({
        username: user.username,
        role: user.role,
        _id: user._id,
        isActive: user.isActive
    },
        process.env.SECRET,
        {
            expiresIn: expiry || '1h'
        })
}

module.exports.createForgotPasswordToken = (user, expiry) => {
    return jwt.sign({
        email: user.email
    },
        process.env.SECRET,
        {
            expiresIn: expiry || 300
        })
}

// module.exports = () => {
//     createToken = function (user, expiry) {
//         return jwt.sign({
//             username: user.username,
//             role: user.role,
//             _id: user._id,
//             isActive: user.isActive
//         },
//             process.env.SECRET,
//             {
//                 expiresIn: expiry || '1h'
//             })
//     }

//     createForgotPasswordToken = function (user, expiry) {
//         return jwt.sign({
//             email: user.email
//         },
//             process.env.SECRET,
//             {
//                 expiresIn: expiry || 300
//             })
//     }
// }