import http from "node:http";
import { WebSocketServer } from "ws";
import fs from "node:fs/promises"
import path from "node:path";

const httpServer = http.createServer(async(req, res) => {
    const indexFile = await fs.readFile(path.resolve("./index.html"), "utf-8");
    res.setHeader("Content-Type", "text/html");
    return res.end(indexFile);

});

const wsServer = new WebSocketServer({ server: httpServer });

wsServer.on("connection", (socket) => {
  console.log("New WebSocket connection established.");
  socket.on("message", (message) => {
    console.log(`Received message: ${message.toString()}`);
    wsServer.clients.forEach((client) => {
      client.send(JSON.stringify({ message: message.toString() }));
    });
  });
});

httpServer.listen(3000, () => {
  console.log("HTTP server is running on http://localhost:3000");
});