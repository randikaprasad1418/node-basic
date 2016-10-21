var Grid = require('gridfs-stream');
var mongoose = require('mongoose');
Grid.mongo = mongoose.mongo;
var conn = mongoose.connection;

var models = [
    'client',
    'code',
    'token',
    'user'
];

// Export models
models.forEach(function(model) {
    module.exports[capitalizeFirstLetter(model)] = require('./' + model);
});

conn.once('open', function(){
    console.log('Mongo connection is opened');
    module.exports.Gfs = Grid(conn.db);
});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}