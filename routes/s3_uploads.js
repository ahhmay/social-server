const express = require('express').Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();
const uploadController = require('../middlewares/uploadController');
const UserModel = require('../models/User');
const router = require('./auth');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const storage = multer.memoryStorage({
    destination: function (req, res, callback) {
        callback(null, "");
    }
})

const upload = multer({
    storage
}).single('image'); // "image should be passed as req payload"

router.post("/upload/profile", upload, uploadController, async (req, res) => {
    try {
        const user = await UserModel.findById(req.body.userId);
        user.profilePicture = req.body.image;
        await UserModel.findByIdAndUpdate(req.body.userId, {
            $set: user
        })
        res.status(200).json("Profile pic updated");
    } 
    catch(error) {
        res.status(500).json("Profile not updated");
    }
})

module.exports = router;