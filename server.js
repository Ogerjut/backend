
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import { handleSocketConnection } from './controllers/socketController.js'

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    },
    connectionStateRecovery : { }
});

// Gestion des événements socket
handleSocketConnection(io);



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});
