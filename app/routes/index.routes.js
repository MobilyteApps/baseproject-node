// const configRoutes= require("../_helpers/route-configrator")
// const routes = [
//     ...require('./login.routes'),
//     ...require('./admin.route'),
    // ...require('./user.route')
// ]
module.exports = (app) => {
    // app.use('/users', require('./user.route'));
    app.use('/', require('./login.routes'));

    // OTHER ROUTES STARTING POINT CAN BE ADDED :

    // app.use('/get-admin-data', require('./admin.route')(app));
    // app.use('/get-admin-data', require('./admin.route')(app));
    // app.use('/get-user-data', require('./admin.route')(app));
    // app.use('/roles', require('./login.routes'))
}
// module.exports=configRoutes(routes)