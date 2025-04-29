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
import programsRoutes from './routes/programs.routes.js';
import formsRoutes from './routes/forms.routes.js';
import experimentalRoutes from './routes/experimental.routes.js';
import { SocketManager } from './lib/SocketManager.js';
import { Server } from 'socket.io';

config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGINS?.split(',') || [],
        credentials: true
    }
});

try {
    const socketManager = SocketManager.getInstance(io);
    socketManager.start();
} catch (error) {
    console.error('Error al inicializar el socket manager:', error);
}

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
    windowMs: process.env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX,
    message: { message: 'Muchas peticiones, por favor intente mas tarde.' }
});
app.use(limiter);

const PORT = process.env.PORT || 3000;

app.use("/users", userRoutes);
app.use("/events", eventsRoutes);
app.use("/files", filesRoutes);
app.use("/auth", authRoutes);
app.use("/roles", rolesRoutes);
app.use("/scenery", sceneryRoutes);
app.use("/programs", programsRoutes);
app.use("/forms", formsRoutes);
app.use("/experimental", experimentalRoutes);

app.get("/", (req, res) => {
    res.json({
        buni: "Estamos conectados uwu"
    })
})

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
