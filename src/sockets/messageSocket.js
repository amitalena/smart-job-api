module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("Message socket: A user connected:", socket.id);

        // Handle sending a message
        socket.on("send-message", (data) => {
            console.log("Message received:", data);
            // Broadcast to the recipient
            io.to(data.to).emit("receive-message", data);
        });

        // Handle message deletion
        socket.on("delete-message", (data) => {
            console.log("Message deleted:", data.messageId);
            io.emit("delete-message", data); // Notify all users
        });

        socket.on("disconnect", () => {
            console.log("Message socket: User disconnected:", socket.id);
        });
    });
};