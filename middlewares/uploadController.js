const multer = require("multer");
const AWS = require("aws-sdk");
const uuid = require('uuid/v4');
const dotenv = require("dotenv");
dotenv.config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

function uploadToS3(req, res, next) {
    if(req.file) {
        let myFile = req.file.originalname.split(".");
        const fileType = myFile[myFile.length - 1];
        const uploadParams = {
            Key: `${uuid()}.${fileType}`,
            Bucket: process.env.S3_BUCKET,
            Body: req.file.buffer
        }
        s3.upload(uploadParams).promise()
            .then(data => {
                imagePath = data.Location;
                req.body.image = data.Location;
                next();
            })
    }
    else {
        req.body.image = "";
        next();
    }
}

module.exports = uploadToS3;