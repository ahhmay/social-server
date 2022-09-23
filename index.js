const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

app.use(cors({ origin: 'https://social-server-ahhmay.herokuapp.com' }));

// routes
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const imgPostRoute = require('./routes/img_post');
const s3UploadRoute = require('./routes/s3_uploads');

dotenv.config();

mongoose.connect(
    process.env.MONGO_URL,
    {useNewUrlParser: true, useUnifiedTopology: true},
    () => {console.log("MongoDB Connected.")}
)

// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/user", userRoute);
app.use("/auth", authRoute);
app.use("/post", imgPostRoute);
app.use("/s3", s3UploadRoute);

app.listen(process.env.PORT || 8080, () => console.log("Server running on 8080."));