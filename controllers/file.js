let Model = require('../models');
let Busboy = require('busboy');
let mongoose = require('mongoose');
let appConfig = require('config').application;
let fileConfig = appConfig.FILES;
const im = require('imagemagick-stream');
let HttpStatus = require('http-status-codes');

module.exports = {
    addFile : (req, res) => {
        let gfs = Model.Gfs;
        let busboy = new Busboy({ headers: req.headers,  limits: { files: fileConfig.NO_OF_FILES , fileSize: fileConfig.FILE_SIZE }  });
        let fileId = mongoose.Types.ObjectId();

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            var writeStream = gfs.createWriteStream({
                _id: fileId,
                filename: filename,
                mode: fileConfig.MODES.WRITE,
                content_type: mimetype,
            });
            file.pipe(writeStream);
        }).on('finish', function() {
            res.status(HttpStatus.OK).json({ message: HttpStatus.getStatusText(HttpStatus.OK) , resUrl: appConfig.RESOUCE_URL+"/"+fileId});
        });
        req.pipe(busboy);
    },

    getFile : (req, res) => {
        var gfs = Model.Gfs;
        gfs.exist({ _id: req.params.id },(err, found) => {
            if (err) {
                console.log(err); 
                return;
            }

            if (!found) {
                res.status(HttpStatus.NOT_FOUND).json({message :HttpStatus.getStatusText(HttpStatus.NOT_FOUND) })
                return;
            }
            res.set('Content-Type', fileConfig.CONTENT_TYPES.IMAGE_PNG);
            
            if(!req.query.q){
                res.status(HttpStatus.BAD_REQUEST).send('Image size is required (E.x : ?q=400x400)');
                return;
            }

            gfs.createReadStream({ _id: req.params.id }).pipe(im().resize(req.query.q)).pipe(res);
        });
    }
}