const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
const config = require("./config.js");
//------------------< ALL CONTROLLERS >------------------//
const admin = require("./src/routes/AdminRoute.js");
const recruiter = require("./src/routes/RecruiterRoute.js");
const applicant = require("./src/routes/ApplicantRoute.js");
const employee = require("./src/routes/EmployeeRoute.js");
const candidate = require("./src/routes/CandidateRoute.js");
const notification = require("./src/routes/NotificationRoute.js");
const jd = require("./src/routes/JdRoute.js");
const messageRoutes = require("./src/routes/MessageRoute.js");
const jobCategory = require("./src/routes/JobCategoriesRoute.js");
const contactUs = require("./src/routes/ContactUsRoute.js");
const applyJob = require('./src/routes/JobApplyRoute.js');
const messageSocket = require("./src/sockets/messageSocket.js");
const notificationSocket = require("./src/sockets/notificationSocket.js");
const resumeRoutes = require('./src/routes/ResumeRoute.js');
const customResumeRoute = require("./src/routes/ResumeCustomRoute.js")
//------------------< DATABASE CONNECTION >------------------//
require("./src/database/connection.js");

//------------------< EXPRESS APP SETUP >------------------//
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

//------------------< STATIC FILES >------------------//
app.use("/upload", express.static("./upload"));
app.use("/resumes", express.static("./resumes"));
app.use("/uploads", express.static("./uploads"));

//------------------< ROUTES >------------------//
app.use(admin);
app.use(recruiter);
app.use(employee);
app.use(candidate);
app.use(jd);
app.use(jobCategory);
app.use(contactUs);
app.use(applicant);
app.use(applyJob)
app.use(notification);
app.use(messageRoutes);
app.use(resumeRoutes);
app.use(customResumeRoute)

//------------------< HEALTH CHECK ROUTE >------------------//
app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is live" });
});
//------------------< ATACH SOCKET.IO TO REQ>------------------//
app.use((req, res, next) => {
    req.io = io;
    next();
});
//------------------< SERVER AND WEBSOCKET SETUP >------------------//
const port = process.env.PORT || config.port || 5005;
const server = http.createServer(app);

//------------------< INTILIAZE SOCKET TO SERVER>------------------//
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true,
    },
});

io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
});
//------------------< SOCKET HANDLER >------------------//
messageSocket(io);
notificationSocket(io);

//------------------< START SERVER >------------------//
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});