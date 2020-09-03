const jwt = require('jsonwebtoken');
const apis = require('./config/roles.config');
var role = 'User';

let checkToken = (role) => {
    return (req, res, next) => {
        console.log('this is request from check token', req);
        let token = req.headers['x-access-token'] || req.headers['authorization'];
        if (token) {
            jwt.verify(token, process.env.SECRET, (err, decode) => {
                if (err) {
                    return res.json({
                        success: false,
                        message: 'Token is not valid'
                    })
                } else {
                    req.decode = decode;
                    if (role) {
                        if (!decode.role || role.toLowerCase() !== req.decode.role.toLowerCase() || !req.decode.isActive) {
                            return res.status(401).json({ success: false, message: 'Unauthorized' });
                        }
                    }
                    next();
                }
            })
        } else {
            return res.status(500).send({
                success: false,
                message: 'Auth token in not supplied'
            })
        }
    }
}
let checkAdminToken = (req, res, next) => {
    role = 'Admin'
    checkToken(req, res, next);
}

let checkUserToken = (req, res, next) => {
    role = 'User'
}

let permission = (req, res, next) => {
    console.log('this is request from permission token', req);
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (token) {
        jwt.verify(token, process.env.SECRET, (err, decode) => {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Token is not valid'
                })
            } else {
                req.decode = decode;
                if (!decode.role || req.decode.role.toLowerCase() !== 'admin') {
                    return res.status(401).json({ message: 'permission denied.' });
                }
                next();
            }
        })
    } else {
        return res.status(500).send({
            success: false,
            message: 'Auth token in not supplied'
        })
    }
}

module.exports = { checkToken: checkToken, checkAdminToken: checkAdminToken, permission: permission };
