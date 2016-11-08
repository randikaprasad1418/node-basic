// Load required packages
let Client = require('../models').Client;
let HttpStatus = require('http-status-codes');
// Create endpoint /api/client for POST
exports.postClients = (req, res) => {
    // Create a new instance of the Client model
    let client = new Client();

    // Set the client properties that came from the POST data
    client.name = req.body.name;
    client.id = req.body.id;
    client.secret = req.body.secret;
    client.userId = req.user._id;

    // Save the client and check for errors
    client.save((err) => {
        if (err){
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({error: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR)});
        }

        res.status(HttpStatus.OK).json({ message: HttpStatus.getStatusText(HttpStatus.OK), data: client });
    });
};

// Create endpoint /api/clients for GET
exports.getClients = (req, res) => {
    // Use the Client model to find all clients
    Client.find({ userId: req.user._id }, (err, clients) => {
        if (err){
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({error: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR)});
        }

        res.status(HttpStatus.OK).json(clients);
    });
};