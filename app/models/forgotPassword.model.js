var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const forgotPassword = new Schema({
    uid: { type: Schema.Types.ObjectId },
    email: String,
    token: String
}, {
    timestamps: true
})

forgotPassword.index({ createdAt: 1 }, { expireAfterSeconds: 480 });

module.exports = mongoose.model('forgotpassword', forgotPassword);