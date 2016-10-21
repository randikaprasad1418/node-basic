var Model = require('../models');
var Busboy = require('busboy');
var mongoose = require('mongoose');
var appConfig = require('config').application;
var fileConfig = appConfig.FILES;
const im = require('imagemagick-stream');

module.exports = {
    addFile : function(req, res){
        var gfs = Model.Gfs;
        var busboy = new Busboy({ headers: req.headers,  limits: { files: fileConfig.NO_OF_FILES , fileSize: fileConfig.FILE_SIZE }  });
        var fileId = mongoose.Types.ObjectId();

        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            var writeStream = gfs.createWriteStream({
                _id: fileId,
                filename: filename,
                mode: 'w',
                // chunkSize : 1024*1024,
                content_type: mimetype,
            });
            file.pipe(writeStream);
        }).on('finish', function() {
            res.status(HttpStatus.OK).json({ message: HttpStatus.getStatusText(HttpStatus.OK) , resUrl: appConfig.BASE_URL+"/file/"+fileId});
        });
        req.pipe(busboy);
    },

    getFile : function(req, res) {
        var gfs = Model.Gfs;
        gfs.exist({ _id: req.params.id }, function (err, found) {
            if (err) {
                console.log(err); 
                return;
            }

            if (!found) {
                res.send('Error on the database looking for the file.')
                return;
            }
            res.set('Content-Type', 'image/png');
            // We only get here if the file actually exists, so pipe it to the response
            
            gfs.createReadStream({ _id: req.params.id }).pipe(im().resize(req.query.q)).pipe(res);
        });
    }
}