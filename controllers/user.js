// Load required packages
let Model = require('../models');
let config = require('config').application;
let Promise = require('bluebird');
let HttpStatus = require('http-status-codes');

module.exports = {
    postUsers : (req, res) => {
        if(req.body.role == config.USER_ROLES.ADMIN){
            if(req.body.secret && req.body.secret === config.API_SECRET){
                registerUser(req.body).then((_response) => {
                    res.status(HttpStatus.OK).json(_response);
                }, (_err) => {
                    res.status(HttpStatus.UNAUTHORIZED).json({error: _err.errmsg});
                });
            }else{
                res.status(HttpStatus.UNAUTHORIZED).json({error: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED)});
            }
        }else{
            req.body.role = config.USER_ROLES.USER;
            registerUser(req.body).then((_response) => {
                res.status(HttpStatus.OK).json(_response);
            }, (_err) => {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({error: _err.errmsg});
            });
        }
    }
};

let registerUser = (_dataObj) => {
    return new Promise((_resolve, _reject) => {
        let user = new Model.User(_dataObj);
        user.save((err) => {
            if (err)
               _reject(err);

            _resolve({ message: 'OK' });
        });
    });
}