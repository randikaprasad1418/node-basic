var passport = require('passport');
var appConfig = require('config').application;



let Auth = require('./auth');
let User = require('./user');

module.exports = function (router) {
    // defaults GET
    router.route('/').get(function (req, res) {
       res.status(200).json({message: appConfig.APP_NAME +'  API '+ appConfig.VERSION});
    });

    Auth.setupRoute(router);

};