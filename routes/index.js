var passport = require('passport');
var appConfig = require('config').application;
var clientController = require('../controllers/client');
var userController = require('../controllers/user');
var authController = require('../controllers/auth');
var oauth2Controller = require('../controllers/oauth2');

module.exports = function (router) {
    // defaults GET
    router.route('/').get(function (req, res) {
       res.status(200).json({message: appConfig.APP_NAME +'  API '+ appConfig.VERSION});
    });

    // Create endpoint handlers for oauth2 authorize
    router.route('/oauth2/authorize')
        .get(authController.isAuthenticated, oauth2Controller.authorization)
        .post(authController.isAuthenticated, oauth2Controller.decision);

    // Create endpoint handlers for oauth2 token
    router.route('/oauth2/token')
        .post(authController.isClientAuthenticated, oauth2Controller.token);

    // Create endpoint handlers for /clients
    router.route('/clients')
        .post(authController.isAuthenticated, clientController.postClients)
        .get(authController.isAuthenticated, clientController.getClients);

    router.route('/auth/facebook')
        .get(authController.authenticateByFb);

    router.route('/auth/facebook/callback')
        .get(authController.setFbAuthenticatedUser, function (req, res, next) {
            req.authenticationType = 'FACEBOOK';
            next();
        }, authController.generateAndSendToken);

    router.route('/auth/google')
        .get(authController.authenticateByGoogle);

    router.route('/auth/google/callback')
        .get(authController.setGoogleAuthenticatedUser, function (req, res, next) {
            req.authenticationType = 'GOOGLE';
            next();
        }, authController.generateAndSendToken);

    router.route('/profile')
        .get(authController.loadProfile);

    // security routes
    router.route('/authenticate')
        /**
         * @api {post} /authenticate Authenticate User
         * @apiName AuthenticateUser
         * @apiGroup Application
         *
         * @apiParam {String} username User's username.
         * @apiParam {String} password User's password.
         *
         * @apiSuccess {String} username Username of the User.
         * @apiSuccess {String} _id  ID of the User.
         * @apiSuccess {String} token  Token of the Authenticated User.
         *
         * @apiSuccessExample Success-Response:
         *     HTTP/1.1 200 OK
         *     {
         *          user : {
         *              _id: "57e4d7ef61503b06141136c1",
         *              username: "randika"
         *          },
         *          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3ZTRkN2VmNjE1MDNiMDYxNDExMzZjMSIsImlhdCI6MTQ3NDg3MDE1MCwiZXhwIjoxNDc0ODc3MzUwfQ.ga8_YZbBPgXplSzNLewzewT9po4MC6-u3_iIP1fJcAY"
         *      }
         *
         * @apiError Unauthorized The requested user is not authorized.
         *
         * @apiErrorExample Error-Response:
         *     HTTP/1.1 401 Unauthorized
         *     Unauthorized
         */
        .post(authController.authenticateUser, authController.generateAndSendToken);

    // User routes
    router.route('/users')
        /**
         * @api {get} /users Get Users
         * @apiName GetUsers
         * @apiGroup User
         *
         * @apiHeader (Header) {String} Authorization Token value.
         *
         * @apiHeaderExample {String} Header Value:
         *     "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3ZTRkN2VmNjE1MDNiMDYxNDExMzZjMSIsImlhdCI6MTQ3NDg3MjM1NCwiZXhwIjoxNDc0ODc5NTU0fQ.Znaj5EHflmw4AUFt-yBszW6b94j5Kaa0ymT2st3cbFo"
         *
         *
         * @apiSuccess {JsonArray} List List of users.
         *
         * @apiSuccessExample Success-Response:
         *     HTTP/1.1 200 OK
         *     [
         *        {
         *          "_id": "57e4d7ef61503b06141136c1",
         *          "username": "randika",
         *          "__v": 0
         *        },
         *        {
         *          "_id": "57e4d7ef61503578141136c4",
         *          "username": "lasantha",
         *          "__v": 0
         *        }
         *     ]
         *
         * @apiError Unauthorized The requested user is not authorized.
         *
         * @apiErrorExample Error-Response:
         *     HTTP/1.1 401 Unauthorized
         *     Unauthorized
         */
        .get(authController.isLocalAuthenticated, userController.getUsers)
        /**
         * @api {post} /users Register a User
         * @apiName RegisterUser
         * @apiGroup User
         *
         * @apiHeader (Header) {String} Authorization Token value.
         *
         * @apiHeaderExample {String} Header Value:
         *     "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3ZTRkN2VmNjE1MDNiMDYxNDExMzZjMSIsImlhdCI6MTQ3NDg3MjM1NCwiZXhwIjoxNDc0ODc5NTU0fQ.Znaj5EHflmw4AUFt-yBszW6b94j5Kaa0ymT2st3cbFo"
         *
         * @apiParam {String} username User's username.
         * @apiParam {String} password User's password.
         *
         * @apiSuccess {JsonArray} List List of users.
         *
         * @apiSuccessExample Success-Response:
         *     HTTP/1.1 200 OK
         *     [
         *        {
         *          "_id": "57e4d7ef61503b06141136c1",
         *          "username": "randika",
         *          "__v": 0
         *        },
         *        {
         *          "_id": "57e4d7ef61503578141136c4",
         *          "username": "lasantha",
         *          "__v": 0
         *        }
         *     ]
         *
         * @apiError Unauthorized The requested user is not authorized.
         *
         * @apiErrorExample Error-Response:
         *     HTTP/1.1 401 Unauthorized
         *     Unauthorized
         */
        .post(userController.postUsers)
        .get(authController.isLocalAuthenticated, userController.getUserById);
    router.get('/users/:id', authController.isLocalAuthenticated, userController.getUserById);
};