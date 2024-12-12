module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("Notification socket: A user connected:", socket.id);

        // Example: Sending a notification
        socket.on("send-notification", (data) => {
            console.log("Notification received:", data);
            io.emit("receive-notification", data); // Broadcast notification
        });

        socket.on("disconnect", () => {
            console.log("Notification socket: User disconnected:", socket.id);
        });
    });
};