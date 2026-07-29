import dotenv from "dotenv";
import app from "./app";
import { testConnection } from "./db/pool";
import { conneectRedis, disconnectRedis } from "./redis/client";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await testConnection();
    await conneectRedis()

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// SIGINT kab aata hai?

// Terminal mein Ctrl + C dabane par.
// User application ko manually stop karta hai.

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await disconnectRedis();
  process.exit(0);
});

startServer();
