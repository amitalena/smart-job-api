// websocket.js
const WebSocket = require("ws");
const { addClient } = require("./notificationSocket.js");

module.exports = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on("connection", (ws, req) => {
        const token = req.url.split("token=")[1]; // Extract token from query parameter

        if (!token) {
            console.error("Missing token in WebSocket connection.");
            ws.close(); // Close the connection if the token is missing
            return;
        }

        // Add client to the notification system
        addClient(token, ws);

        console.log("WebSocket connection established with token:", token);

        // Example: Handling messages from the client
        ws.on("message", (message) => {
            console.log("Received WebSocket message:", message);
        });

        // Handle WebSocket disconnection
        ws.on("close", () => {
            console.log("WebSocket connection closed for token:", token);
        });
    });

    console.log("WebSocket server initialized.");
};