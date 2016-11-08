// Load required packages
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
let HttpStatus = require('http-status-codes');
let config = require('config');
let appConfig = config.application;
let passport = require('passport');
let BasicStrategy = require('passport-http').BasicStrategy;
let BearerStrategy = require('passport-http-bearer').Strategy;
let FacebookStrategy = require('passport-facebook').Strategy;
let GoogleStrategy = require('passport-google-oauth20').Strategy;
let localStrategy = require('passport-local');
let Model = require('../models');
let Token = Model.Token;
let User = Model.User;
let Client = Model.Client;


passport.use(new localStrategy((username, password, callback) => {
        User.findOne({ username: username }, (err, user) => {
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
    profileFields   : config.facebookAuth.SCOPES
}, (token, refreshToken, profile, done) => {
    process.nextTick(() => {
        // Prepare user information
        var queryConditions = [];
        if(profile.emails){
            queryConditions.push({email : profile.emails[0].value });
        }
        queryConditions.push({'facebook.id' : profile.id });
        // find the user in the database based on their facebook id
        User.findOne({ $or : queryConditions }, (err, user) => {

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
                let newUser = new User();
                // set all of the facebook information in our user model
                newUser.facebook.id    = profile.id; // set the users facebook id
                newUser.facebook.token = token; // we will save the token that facebook provides to the user
                newUser.facebook.name  = profile.displayName;//profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                newUser.facebook.email = profile.emails ? profile.emails[0].value : null; // facebook can return multiple emails so we'll take the first
                newUser.email = profile.emails ? profile.emails[0].value : null;
                newUser.firstname = profile.name.givenName;
                newUser.lastname = profile.name.familyName;
                newUser.username = profile.emails ? profile.emails[0].value : profile.id;
                // save our user to the database
                newUser.save((err) => {
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
    },(accessToken, refreshToken, profile, done) => {
        // Prepare user information
        var queryConditions = [];
        if(profile.emails){
            queryConditions.push({email : profile.emails[0].value });
        }
        queryConditions.push({'google.id' : profile.id });
        // find the user in the database based on their facebook id
        User.findOne({ 'google.id' : profile.id }, (err, user) => {
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
                let newUser = new User();

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
                // save our user to the database
                newUser.save((err) => {
                    if (err)
                        throw err;

                    // if successful, return the new user
                    return done(null, newUser);
                });
            }

        });
    }
));

passport.use(new BasicStrategy((username, password, callback) => {
        User.findOne({ username: username }, (err, user) => {
            if (err) { return callback(err); }

            // No user found with that username
            if (!user) { return callback(null, false); }

            // Make sure the password is correct
            user.verifyPassword(password,(err, isMatch) => {
                if (err) { return callback(err); }

                // Password did not match
                if (!isMatch) { return callback(null, false); }

                // Success
                return callback(null, user);
            });
        });
    }
));

passport.use(appConfig.STRATEGIES.CLIENT_BASIC, new BasicStrategy((username, password, callback) => {
        Client.findOne({ username: username },  (err, client) => {
            if (err) { return callback(err); }

            // No client found with that id or bad password
            if (!client || client.secret !== password) { return callback(null, false); }

            // Success
            return callback(null, client);
        });
    }
));

passport.use(new BearerStrategy((accessToken, callback) => {
        Token.findOne({value: accessToken }, (err, token) => {
            if (err) { return callback(err); }

            // No token found
            if (!token) { return callback(null, false); }

            User.findOne({ _id: token.userId }, (err, user) => {
                if (err) { return callback(err); }

                // No user found
                if (!user) { return callback(null, false); }

                // Simple example with no scope
                callback(null, user, { scope: '*' });
            });
        });
    }
));

exports.generateAndSendToken = (req, res) => {

    var token = jwt.sign({
        id: req.user.id || req.user._id,
    }, config.secret.KEY, {
        expiresIn: config.secret.EXPIRE_TIME
    });

    if(req.user && token){
        if(req.authenticationType == appConfig.AUTH_TYPES.FACEBOOK || req.authenticationType == appConfig.AUTH_TYPES.GOOGLE){
            // This added for testing so it should changed.
            res.redirect(config.client.BASE_URL+'/login?token='+token);
        }else{
            res.status(HttpStatus.OK).json({
                user: {
                    _id : req.user._id,
                    username : req.user.username
                },
                token: token
            });
        }
    }else{
        res.status(HttpStatus.UNAUTHORIZED).json({message : HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED)});
    }
};

exports.loadProfile = (req, res) => {
    // Only for testing 
    res.render('profile.ejs', {
        user : req.user
    });
};

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

exports.hasAdminPermission = (req, res, next) => {
    Model.User.findById(req.user.id)
    .select('role')
    .exec((_err, _response) => {
        if(_err){
            res.status(HttpStatus.UNAUTHORIZED).json({message : HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED)});
        }else if(_response.role == appConfig.USER_ROLES.ADMIN){
            next();
        }else{
            res.status(HttpStatus.UNAUTHORIZED).json({message : HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED)});
        }
    });
};

exports.isUserHasPermission = (req, res, next) => {
    next();
};

exports.isLicenValied = (req, res, next) =>{
    next();
}

exports.authenticateUser = passport.authenticate(appConfig.STRATEGIES.LOCAL, { session: false });
exports.isLocalAuthenticated = expressJwt({secret : config.secret.KEY});
exports.isAuthenticated = passport.authenticate([appConfig.STRATEGIES.BASIC, appConfig.STRATEGIES.BEARER], { session : false });
exports.isClientAuthenticated = passport.authenticate(appConfig.STRATEGIES.CLIENT_BASIC, { session : false });
exports.isBearerAuthenticated = passport.authenticate(appConfig.STRATEGIES.BEARER, { session: false });
exports.authenticateByFb = passport.authenticate(appConfig.STRATEGIES.FACEBOOK, { scope: config.facebookAuth.SCOPES  }); //scope : 'email'
exports.setFbAuthenticatedUser = passport.authenticate(appConfig.STRATEGIES.FACEBOOK, { failureRedirect : '/' });
exports.authenticateByGoogle = passport.authenticate(appConfig.STRATEGIES.GOOGLE, { scope: config.googleAuth.SCOPES });
exports.setGoogleAuthenticatedUser = passport.authenticate(appConfig.STRATEGIES.GOOGLE, { failureRedirect: '/' });