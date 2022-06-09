var express = require('express');
var app = express();
var session = require('express-session');
var passport = require('passport');
var bodyParser = require('body-parser');
var routes = require('./server/routes.js');
app.use(express.static(__dirname + '/client'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'secrettexthere',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api', routes);

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get("/", function(req, res) {
    res.render('index');
});

app.listen(8000, function() {
    console.log('Server running on port 8000...');
});
