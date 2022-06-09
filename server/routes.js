var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./User.js');
router.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect('mongodb://localhost:27017/PassportSecurity');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected to DB");
});

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with email and password from our form
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({
            'email': username
        }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);
            // if no user is found, return the message
            if (!user)
                console.log('No user found.'); // req.flash is the way to set flashdata using connect-flash
            // if the user is found but the password is wrong
            else if (!user.validPassword(password)) {
                console.log('Oops! Wrong password.'); // create the loginMessage and save it to session as flashdata
            } else {
                // all is well, return successful user
                return done(null, user);
            }
        });
    }));

passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, username, password, done) {
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {
            User.findOne({
                'email': username
            }, function(err, user) {
                console.log(user);
                if (err) {
                    console.log('Error in SignUp: ' + err);
                    return done(err);
                }
                if (user) {
                    console.log('User already exists');
                } else {
                    var newUser = new User();
                    newUser.firstname = req.body.firstname;
                    newUser.lastname = req.body.lastname;
                    newUser.password = newUser.generateHash(password);
                    newUser.email = req.body.email;
                    newUser.save(function(err) {
                        if (err) {
                            console.log('Error in Saving user: ' + err);
                            throw err;
                        }
                        console.log('User Registration succesful');
                        return done(null, newUser);
                    });
                }
            });
        });
    }));

router.post('/signup', passport.authenticate('local-signup'), function(req, res) {
    console.log(req.user);
});

// router.post('/login', passport.authenticate('local-login'), function(req, res){
//   console.log(req.user);
//   res.json(req.user);
// });

router.post('/login', function(req, res, next) {
    passport.authenticate('local-login', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/login');
        }
        req.logIn(user, function(err) {
            console.log('Logged IN ' + user);
            if (err) {
                return next(err);
            }
            // if (user) {
            //     return res.redirect('/profile');
            // }
            res.status(200).json({
                status: 'Login successful!'
            });
        });
    })(req, res, next);
});

router.get('/logout', function(req, res) {
    req.logout();
    res.status(200).json({
        status: 'loggedout'
    });
});

router.get("/loggedin", function(req, res) {
    //console.log('Status ' + req.isAuthenticated());
    //res.send(req.isAuthenticated() ? req.user : '0');
    if (req.isAuthenticated()) {
        res.send(req.user);
    } else {
        res.send('0');
    }
});

module.exports = router;
