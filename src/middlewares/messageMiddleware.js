// websocketServer.js
const { Server } = require('socket.io');

const io = new Server();

const clients = {}; // To store connected users

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user connection
    socket.on('userConnected', (userId) => {
        clients[userId] = socket;
        console.log(`User ${userId} connected.`);
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        const disconnectedUser = Object.keys(clients).find((key) => clients[key].id === socket.id);
        if (disconnectedUser) {
            delete clients[disconnectedUser];
            console.log(`User ${disconnectedUser} disconnected.`);
        }
    });
});

function sendRealTimeMessage({ userId, applicantId, message }) {
    const client = clients[applicantId];
    if (client) {
        client.emit('newMessage', { senderId: userId, message }); // Emit message to the receiver
        console.log(`Real-time message sent to user ${applicantId}`);
    } else {
        console.error(`User ${applicantId} is not connected.`);
    }
}

module.exports = { io, sendRealTimeMessage };
