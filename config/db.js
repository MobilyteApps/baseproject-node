"use strict";
const nLog=require("noogger")
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
if (process.env.ENV === 'development')
    mongoose.set('debug', true);
    
mongoose.connect(process.env.DB,{ useUnifiedTopology: true,useNewUrlParser: true });

mongoose.connection.on('connected', function () {
    nLog.info('Mongoose default connection open to ' + process.env.DB);
});

mongoose.connection.once('open', () => {
    nLog.info('Connected to mongodb!');
});

mongoose.connection.on('error', function(err) {
    nLog.error('Mongoose default connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
    nLog.warning('Mongoose default connection disconnected');
});

process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        nLog.warning('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});
