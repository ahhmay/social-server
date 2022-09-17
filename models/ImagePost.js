const mongoose = require("mongoose");

const ImagePost = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        username: {
            type: String,
            default: ""
        },
        location: {
            type: String,
            default: ""
        },
        desc: {
            type: String,
            max: 500
        },
        img: {
            type: String
        },
        likes: {
            type: Array,
            default: []
        },
        comments: {
            type: Array,
            default: []
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("ImagePost", ImagePost);