const router = require("express").Router();
const UserModel = require("../models/User");
const bcrypt = require("bcrypt");

// update user details
// http://localhost:8080/user/6308fb53d41d72f75f280b1a
router.put("/:id", async (req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin) {
        if(req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }
            catch(error) {
                console.log(error);
                return res.status(500).json(error);
            }
        }

        try {
            const user = await UserModel.findByIdAndUpdate(req.params.id, {
                $set: req.body
            });
            res.status(200).json("Account has been updated");
        }
        catch(error) {
            res.status(500).json(error);
        }
    }
    else {
        return res.status(403).json("You can update only your account details.");
    }
})

// delete user
router.delete("/delete_user/:id", async (req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            const deleteUser = await UserModel.findByIdAndDelete(req.params.id);
            res.status(200).json("Account deleted successfully.");
        }
        catch(error) {
            res.status(500).json(error);
        }
    }
    else {
        return res.status(403).json("Something went wrong!!\nAccount could not be deleted.");
    }
})

// get a user
router.get("/get_user/:id", async (req, res) => {
    try {
        const getUserDetails = await UserModel.findById(req.params.id);
        const {password, updatedAt, isAdmin, ...other} = getUserDetails._doc;
        res.status(200).json(other);
    }
    catch(error) {
        res.status(500).json("User does not exists.");
    }
})

// follow user
router.put("/:id/follow", async (req, res) => {
    if(req.params.id !== req.body.userId) {
        try {
            const user = await UserModel.findById(req.body.userId);   // User we want to follow. ID sent in request body
            const currentUser = await UserModel.findById(req.params.id); // loggedInUser
            if(!currentUser.following.includes(req.body.userId)) {
                await user.updateOne({ $push: {followers: req.params.id}});
                await currentUser.updateOne({ $push: {following: req.body.userId}});
                res.status(200).json({
                    statusCode: 200,
                    statusMessage: "User Followed.",
                    following: true
                });
            }
            else {
                res.status(200).json({
                    statusCode: 200,
                    statusMessage: "User Already Followed.",
                    following: true
                });
            }
        }
        catch(error) {
            res.status(500).json({
                statusCode: 500,
                statusMessage: "Something went wrong.\n Please try again later.",
                error: error
            });
        }
    }
    else {
        res.status(500).json({
            statusCode: 500,
            statusMessage: "You cannot follow/unfollow yourself.",
            following: true
        });
    }
})

// unfollow user
router.put("/:id/unfollow", async (req, res) => {
    if(req.params.id !== req.body.userId) {
        try {
            const user = await UserModel.findById(req.body.userId);  // User we want to unfollow
            const currentUser = await UserModel.findById(req.params.id); // LoggedInUser
            if(currentUser.following.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.params.id }});
                await currentUser.updateOne({ $pull: {following: req.body.userId} });
                res.status(200).json({
                    statusCode: 200,
                    statusMessage: "User Unfollowed",
                    following: false
                });
            }
            else {
                res.status(200).json({
                    statusCode: 200,
                    statusMessage: "User Already Unfollowed.",
                    following: false
                });
            }
        }
        catch(error) {
            res.status(500).json({
                statusCode: 500,
                statusMessage: "Something went wrong.\n Please try again later.",
                error: error
            })
        }
    }
    else {
        res.status(500).json({
            statusCode: 500,
            statusMessage: "You cannot follow/unfollow yourself.",
            following: false
        })
    }
})

// Find Users to follow
router.post('/search/people', async (req, res) => {
    try {
        const search = req.body.searchedKeyword;
        const users = await UserModel.find({username: new RegExp(search, 'i')});
        !users.length && res.status(200).json({
            statusCode: 200,
            statusMessage: "No Users found",
            users: []
        })
        users.length && res.status(200).json({
            statusCode: 200,
            statusMessage: "Users found",
            users: users
        });
    }
    catch(error) {
        res.status(500).json({
            statusCode: 500,
            statusMessage: "Something went wrong.",
            error: error
        })
    }
})

module.exports = router;