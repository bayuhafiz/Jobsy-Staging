// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 1234;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

// Multer setting ==============================================================
var multer = require('multer');
app.use(multer())

// configuration ===============================================================
var configDB = require('./config/database.js');
mongoose.connect(configDB.url); // connect to our database
require('./config/passport')(passport); // pass passport for configuration
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'madewithlovebycolorblindlabs' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// Load our main route ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// seeding (development stage ONLY!!!) =========================================
require('./app/seeding/job.js'); // loads sample job
require('./app/seeding/user.js'); // loads sample user

// launch ======================================================================
app.listen(port);
console.log('JOBSY is running on port ' + port + ' on development mode...');
