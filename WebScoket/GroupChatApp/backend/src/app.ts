import express from "express"
import http from "http"
import cors from "cors"
import { Server } from "socket.io"
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*"
    }
})

export { app, server, io }