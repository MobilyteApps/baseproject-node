const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const userValidEmail = new Schema({
    id: { type: Schema.Types.ObjectId, unique: true },
    token: String
}, {
    timestamps: true
});
userValidEmail.index({ createdAt: 1 }, { expireAfterSeconds: 480 }); // 8minutes

module.exports = mongoose.model('UserValidEmail', userValidEmail);