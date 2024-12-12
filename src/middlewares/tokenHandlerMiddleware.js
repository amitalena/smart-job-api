const config = require('../../config');
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

//------------------< AUTHORIZATION TOKEN >------------------//
const validateToken = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("Autherization Header", authHeader)

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({ message: "Authorization header is missing or invalid", status: false, data: null });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Authorization header is missing or invalid", status: false, data: null });
    }
});

module.exports = validateToken;