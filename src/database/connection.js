const mongoose = require('mongoose');
const config = require('../../config');

const DB = config.MONGO_URI;

mongoose.connect(DB).then(() => console.log("Database connected successfully to MongoDB Atlas"))
    .catch((err) => console.log("Database connection error:", err));