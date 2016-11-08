let authController = require('../controllers/auth');
let userController = require('../controllers/user');

module.exports = {
    setpRoute : (router) => {
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
    }
}