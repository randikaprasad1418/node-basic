// Load required packages
var Client = require('../models').Client;
var HttpStatus = require('http-status-codes');
// Create endpoint /api/client for POST
exports.postClients = function(req, res) {
    // Create a new instance of the Client model
    var client = new Client();

    // Set the client properties that came from the POST data
    client.name = req.body.name;
    client.id = req.body.id;
    client.secret = req.body.secret;
    client.userId = req.user._id;

    // Save the client and check for errors
    client.save(function(err) {
        if (err){
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({error: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR)});
        }

        res.status(HttpStatus.OK).json({ message: HttpStatus.getStatusText(HttpStatus.OK), data: client });
    });
};

// Create endpoint /api/clients for GET
exports.getClients = function(req, res) {
    // Use the Client model to find all clients
    Client.find({ userId: req.user._id }, function(err, clients) {
        if (err){
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({error: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR)});
        }

        res.status(HttpStatus.OK).json(clients);
    });
};