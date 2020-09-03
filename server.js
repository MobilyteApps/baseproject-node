require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
var multer = require('multer')
var upload = multer();
var hbs = require('express-handlebars');
var PORT = process.env.PORT;
// var routes = require('./app/routes/index.routes');
require('./config/admin.config');

//databse connection
require("./config/db")
// create express app
const app = express();

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())
app.use(upload.array());

// require('./app/routes/note.routes.js')(app);
// require('./app/routes/login.routes.js')(app);
require('./app/routes/index.routes')(app);

// app.use('/', routes);
// require('./app/routes/login.routes.js')(app);
// require('./app/routes/index.routes.js')(app);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.set("port", process.env.PORT || 3000);

// listen for requests
app.listen(app.get("port"), function () {
    console.log("Server started on port " + app.get("port"));
});