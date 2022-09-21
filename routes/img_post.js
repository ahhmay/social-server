const router = require("express").Router();
const ImagePost = require("../models/ImagePost");
const UserModel = require("../models/User");
const uploadController = require('../middlewares/uploadController');
const multer = require('multer');
const dotenv = require('dotenv');
dotenv.config();

const storage = multer.memoryStorage({
    destination: function (req, res, callback) {
        callback(null, "");
    }
})

const upload = multer({storage}).single("image");

// create a post
router.post("/", upload, uploadController, async (req, res) => {
    console.log("POST REQUEST: ", req.body);
    req.body.userId = req.body.userId;
    req.body.img = req.body.image;
    req.body.location = req.body.location || "";
    req.body.desc = req.body.desc || "";
    req.body.username = req.body.username;
    delete req.body.image;
    const newPost = await new ImagePost(req.body);
    try {
        const savedPost = await newPost.save();
        console.log("SavedPost: ",savedPost);
        res.status(200).json({
            statusCode: 200,
            statusMessage: "Post added successfully.",
            post: savedPost
        });
    }
    catch(error) {
        console.log("ErrorPost: ",error);
        res.status(500).json({
            statusCode: 500,
            statusMessage: "Couldn't upload post.",
            error: error
        });
    }
})

// update a post
router.put("/edit_post/:id", async (req, res) => {
    const postToUpdate = await ImagePost.findById(req.params.id); // req.params.id = Post ID
    try {
        if(postToUpdate.userId === req.body.userId) { // postToUpdate.userId = userID of user who created the post
            await postToUpdate.updateOne({ $set: req.body});
            res.status(200).json("Post Updated");
        }
        else {
            res.status(403).json("Unable to update post at this time. Please try again.");
        }
    }
    catch(error) {
        res.status(500).json(error);
    }
});

// delete a post
router.delete("/delete_post/:id", async (req, res) => {
    try {
        const postToDelete = await ImagePost.findById(req.params.id);
        await postToDelete.deleteOne();
        res.status(200).json({
            statusCode: 200,
            statusMessage: "Post delete successfully.",
            postDeleted: true
        });
    }
    catch(error) {
        res.status(500).json({
            statusCode: 500,
            statusMessage: "Something went wrong. Please try again later",
            postDeleted: false
        });
    }
})

// like/dislike a post
router.put("/:id/likes",async (req, res) => {
    const postToLike = await ImagePost.findById(req.params.id);
    try {
        if(!postToLike.likes.includes(req.body.userId)) {
            await postToLike.updateOne({ $push: { likes: req.body.userId }});
            res.status(200).json({
                statusCode: 200,
                statusMessage: "Liked",
                liked: true
            });
        }
        else {
            await postToLike.updateOne({ $pull: { likes: req.body.userId }});
            res.status(200).json({
                statusCode: 200,
                statusMessage: "Disliked",
                liked: false
            });
        }
    }
    catch(error) {
        res.status(500).json("Something went wrong. Unable to like a post.");
    }
})

// get a post
router.get("/get_post/:id", async (req, res) => {
    try {
        const getPost = await ImagePost.findById(req.params.id);
        res.status(200).json(getPost);
    }
    catch(error) {
        res.status(500).json("Could not load post.");
    }
})

// get all post related to one user
router.get("/:userid/allposts", async (req, res) => {
    try {
        const allPosts = await ImagePost.find({userId: req.params.userid});
        res.status(200).json({
            statusCode: 200,
            statusMessage: "Fetched all posts.",
            posts: allPosts
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).json({
            statusCode: 500,
            statusMessage: "Unable to fetch all the posts.",
            error: error
        })
    }
})

// get timeline posts
router.get("/:id/timeline/feeds", async (req, res) => {
    try {
        const currentUser = await UserModel?.findById(req.params.id);
        const userPosts = await ImagePost?.find({userId: currentUser._id});
        const friendPosts = await Promise.all(
            currentUser?.following?.map(friendId => {
                return ImagePost?.find({ userId: friendId });
            })
        );
        res.status(200).json({
            statusCode: 200,
            statusMessage: "timeline feeds",
            feeds: userPosts.concat(...friendPosts)
        });
    }
    catch(error) {
        res.status(500).json({
            statusCode: 200,
            statusMessage: "Error fetching feeds",
            error: error
        });
    }
})

// Add comment to post
router.post("/:id/comment", async (req, res) => {
    try {
        const findImgToAddComment = await ImagePost.findById(req.params.id);  // Img ID
        await findImgToAddComment.updateOne({$push: {comments: {username: req.body.username, comment: req.body.comment}}})
        // res.status(200).json(findImgToAddComment);
        res.status(200).json({
            statusCode: 200,
            statusMessage: "Comment Added"
        });
    }
    catch(error) {
        console.log("ERROR: ",error);
        res.status(500).json({
            statusCode: 500,
            statusMessage: "Comment could not be added."});
    }
})

module.exports = router;