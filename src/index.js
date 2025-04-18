import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import http from 'http';
import responseTime from 'response-time';
import userRoutes from './routes/user.routes.js';
import eventsRoutes from './routes/events.routes.js';
import filesRoutes from './routes/files.routes.js';
import authRoutes from './routes/auth.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import sceneryRoutes from './routes/scenery.routes.js';
import facultyRoutes from './routes/faculty.routes.js';
import { setupWebSocket } from './websocket.js';

config();
const app = express();
const server = http.createServer(app);

const upload = multer({ dest: "uploads/" });

app.use(upload.single("file"));
app.use(express.json());
app.use(helmet());
app.use(responseTime());

const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { message: 'Too many requests, please try again later.' }
});
app.use(limiter);

const PORT = process.env.PORT || 3000;

app.use("/users", userRoutes);
app.use("/events", eventsRoutes);
app.use("/files", filesRoutes);
app.use("/auth", authRoutes);
app.use("/roles", rolesRoutes);
app.use("/scenery", sceneryRoutes);
app.use("/faculty", facultyRoutes);

setupWebSocket(server);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
