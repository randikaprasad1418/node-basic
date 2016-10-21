// Load required packages
var Model = require('../models');
var config = require('config').application;
var Promise = require('bluebird');
var HttpStatus = require('http-status-codes');

module.exports = {
    postUsers : function(req, res) {
        if(req.body.role == 'ADMIN'){
            if(req.body.secret && req.body.secret === config.API_SECRET){
                registerUser(req.body).then(function(_response){
                    res.status(HttpStatus.OK).json(_response);
                }, function(_err){
                    res.status(HttpStatus.UNAUTHORIZED).json({error: _err.errmsg});
                });
            }else{
                res.status(HttpStatus.UNAUTHORIZED).json({error: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED)});
            }
        }else{
            req.body.role = config.USER_ROLES.USER;
            registerUser(req.body).then(function(_response){
                res.status(HttpStatus.OK).json(_response);
            }, function(_err){
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({error: _err.errmsg});
            });
        }
    }
};

function registerUser(_dataObj){
    return new Promise(function(_resolve, _reject){
        var user = new Model.User(_dataObj);
        user.save(function(err) {
            if (err)
               _reject(err);

            _resolve({ message: 'User registered !' });
        });
    });
}