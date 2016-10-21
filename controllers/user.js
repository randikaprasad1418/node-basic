// Load required packages
var Model = require('../models');

module.exports = {
    postUsers : function(req, res) {
        console.log(req.body);
        var user = new Model.User(req.body);

        user.save(function(err) {
            // if (err)
            //     res.send(err);

            res.json({ message: 'User registered !' });
        });
    },

    getUsers : function (req, res) {
        console.log(req.params);
        Model.User.find(function(err, users) {
            if (err)
                res.send(err);
            res.json(users);
        });
    },

    getUserById : function (req, res) {
        Model.User.find({_id: req.params.id})
        .select('-password -__v')
        .exec(function (err, user) {
           res.json(user);
        });
    }
};