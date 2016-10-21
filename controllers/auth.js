// Load required packages
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
var config = require('config');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var localStrategy = require('passport-local');

var Model = require('../models');
var Token = Model.Token;
var User = Model.User;
var Client = Model.Client;


passport.use(new localStrategy(
    function(username, password, callback) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return callback(err); }

            // No user found with that username
            if (!user) { return callback(null, false); }

            // Make sure the password is correct
            user.verifyPassword(password, function(err, isMatch) {
                if (err) { return callback(err); }

                // Password did not match
                if (!isMatch) { return callback(null, false); }

                // Success
                return callback(null, user);
            });
        });
    }
));

passport.use(new FacebookStrategy({
    clientID        : config.facebookAuth.CLIENT_ID,
    clientSecret    : config.facebookAuth.CLIENT_SECRET,
    callbackURL     : config.facebookAuth.CALLBACK_URL,
    profileFields   : ['id', 'displayName', 'photos', 'email']
}, function(token, refreshToken, profile, done) {
    process.nextTick(function() {
        // Prepare user information
        var queryConditions = [];
        if(profile.emails){
            queryConditions.push({email : profile.emails[0].value });
        }
        queryConditions.push({'facebook.id' : profile.id });
        // find the user in the database based on their facebook id
        User.findOne({ $or : queryConditions }, function(err, user) {

            // if there is an error, stop everything and return that
            // ie an error connecting to the database
            if (err)
                return done(err);

            // if the user is found, then log them in
            if (user) {
                 user.facebook.id    = profile.id;  
                 user.facebook.token = token;
                 user.email = profile.emails ? profile.emails[0].value : null;
                 user.save();
                return done(null, user); // user found, return that user
            } else {
                // if there is no user found with that facebook id, create them
                var newUser = new User();
                // set all of the facebook information in our user model
                newUser.facebook.id    = profile.id; // set the users facebook id
                newUser.facebook.token = token; // we will save the token that facebook provides to the user
                newUser.facebook.name  = profile.displayName;//profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                newUser.facebook.email = profile.emails ? profile.emails[0].value : null; // facebook can return multiple emails so we'll take the first
                newUser.email = profile.emails ? profile.emails[0].value : null;
                newUser.firstname = profile.name.givenName;
                newUser.lastname = profile.name.familyName;
                newUser.username = profile.emails ? profile.emails[0].value : profile.id;
                newUser.password = 'NOT_SET****_***';
                // save our user to the database
                newUser.save(function(err) {
                    if (err)
                        throw err;

                    // if successful, return the new user
                    return done(null, newUser);
                });
            }

        });
    });

}));

passport.use(new GoogleStrategy({
        clientID: config.googleAuth.CLIENT_ID,
        clientSecret: config.googleAuth.CLIENT_SECRET,
        callbackURL: config.googleAuth.CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, done) {
        // Prepare user information
        var queryConditions = [];
        if(profile.emails){
            queryConditions.push({email : profile.emails[0].value });
        }
        queryConditions.push({'google.id' : profile.id });
        // find the user in the database based on their facebook id
        User.findOne({ 'google.id' : profile.id }, function(err, user) {
            // if there is an error, stop everything and return that
            // ie an error connecting to the database
            if (err)
                return done(err);

            // if the user is found, then log them in
            if (user) {
                 user.google.id    = profile.id;  
                 user.google.token = accessToken;
                 user.google.email = profile.emails[0].value;
                 user.email = profile.emails ? profile.emails[0].value : null;
                 user.save();
                return done(null, user); // user found, return that user
            } else {
                // if there is no user found with that google id, create them
                var newUser = new User();

                // console.log(profile);
                // set all of the google information in our user model
                newUser.google.id    = profile.id; // set the users google id
                newUser.google.token = accessToken; // we will save the token that google provides to the user
                newUser.google.name  = profile.displayName;//profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                newUser.google.email = profile.emails[0].value; // google can return multiple emails so we'll take the first
                newUser.firstname = profile.name.givenName;
                newUser.lastname = profile.name.familyName;
                newUser.google.image = profile.photos[0].value;
                newUser.username = profile.emails[0].value;
                newUser.password = 'NOT_SET****_***';
                // save our user to the database
                newUser.save(function(err) {
                    if (err)
                        throw err;

                    // if successful, return the new user
                    return done(null, newUser);
                });
            }

        });
    }
));

passport.use(new BasicStrategy(
    function(username, password, callback) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return callback(err); }

            // No user found with that username
            if (!user) { return callback(null, false); }

            // Make sure the password is correct
            user.verifyPassword(password, function(err, isMatch) {
                if (err) { return callback(err); }

                // Password did not match
                if (!isMatch) { return callback(null, false); }

                // Success
                return callback(null, user);
            });
        });
    }
));

passport.use('client-basic', new BasicStrategy(
    function(username, password, callback) {
        Client.findOne({ username: username }, function (err, client) {
            if (err) { return callback(err); }

            // No client found with that id or bad password
            if (!client || client.secret !== password) { return callback(null, false); }

            // Success
            return callback(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    function(accessToken, callback) {
        Token.findOne({value: accessToken }, function (err, token) {
            if (err) { return callback(err); }

            // No token found
            if (!token) { return callback(null, false); }

            User.findOne({ _id: token.userId }, function (err, user) {
                if (err) { return callback(err); }

                // No user found
                if (!user) { return callback(null, false); }

                // Simple example with no scope
                callback(null, user, { scope: '*' });
            });
        });
    }
));

exports.generateAndSendToken = function (req, res) {

    var token = jwt.sign({
        id: req.user.id || req.user._id,
    }, config.secret.KEY, {
        expiresIn: '120m'
    });

    if(req.user && token){
        if(req.authenticationType == 'FACEBOOK' || req.authenticationType == 'GOOGLE'){
            res.redirect(config.client.BASE_URL+'/login?token='+token);
        }else{
            res.status(200).json({
                user: {
                    _id : req.user._id,
                    username : req.user.username
                },
                token: token
            });
        }
    }else{
        res.status(401).json({message : 'Unauthorized', success: false});
    }
};

exports.loadProfile = function (req, res) {
    console.log(req);
    res.render('profile.ejs', {
        user : req.user
    });
};

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});


exports.authenticateUser = passport.authenticate('local', { session: false });
exports.isLocalAuthenticated = expressJwt({secret : config.secret.KEY});
exports.isAuthenticated = passport.authenticate(['basic', 'bearer'], { session : false });
exports.isClientAuthenticated = passport.authenticate('client-basic', { session : false });
exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });
exports.authenticateByFb = passport.authenticate('facebook', { scope : 'email' });
exports.setFbAuthenticatedUser = passport.authenticate('facebook', { failureRedirect : '/' });
exports.authenticateByGoogle = passport.authenticate('google', { scope:[ 'https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read' ] });
exports.setGoogleAuthenticatedUser = passport.authenticate('google', { failureRedirect: '/' });

exports.hasAdminPermission = function (req, res, next) {
    
};

exports.isUserHasPermission = function(req, res, next){
    console.log(req.user);
    next();
};