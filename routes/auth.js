const router = require("express").Router();
const UserModel = require("../models/User");
const bcrypt = require("bcrypt");

// Register API
router.post("/register", async (req, res)=> {
    try {
        // hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        // Check if user trying to register already exists
        const checkForExistingUser = await UserModel.findOne({username: req.body.username});
        if(checkForExistingUser) {
            return res.status(500).json({
                statusCode: 500,
                statusMessage: "Username already exists.",
                userExists: true
            });
        }
        // check if user trying to login already exists
        const checkForExistingEmail = await UserModel.findOne({email: req.body.email});
        if(checkForExistingEmail) {
            return res.status(200).json({
                statusCode: 500,
                statusMessage: "Email already exists.",
                userExists: true
            });
        }
        // capturing request
        const newUser = await new UserModel({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });
        // save user details and return response
        const user = await newUser.save();
        if(user) {
            return res.status(200).json({
                statusCode: 200,
                statusMessage: "SUCCESS",
                userData: user
            });
        }
    }
    catch(error) {
        res.status(500).json(error);
    }
})

// Login API
router.post("/login", async (req, res) => {
    try {
        // check if email exists in DB
        const findUserExistanceinDB = await UserModel.findOne({$or: [{email: req.body.emailORusername}, {username: req.body.emailORusername}]});
        if(!findUserExistanceinDB) {
            return res.status(200).json({
                statusCode: 500,
                statusMessage: "User not found."
            });
        }
        // check if password matches from DB
        const validPassword = await bcrypt.compare(req.body.password, findUserExistanceinDB.password);
        if(!validPassword) {
            return res.status(200).json({
                statusCode: 500,
                statusMessage: "Password Incorrect."
            });
        }
        res.status(200).json({
            statusCode: 200,
            statusMessage: "Login Successful",    
            userData: findUserExistanceinDB
        });
    }
    catch(error) {
        res.status(500).json(error);
    }
})

module.exports = router;