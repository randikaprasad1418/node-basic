let oauth2Controller = require('../controllers/oauth2');
let clientController = require('../controllers/client');
let authController = require('../controllers/auth');

module.exports = {
    setupRoute : (router) => {
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

    }
}