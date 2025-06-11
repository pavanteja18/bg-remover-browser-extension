// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Remove.bg Proxy Server is up and running!");
  console.log("GET / request received");
});

app.post("/remove-bg", async (req, res) => {
  console.log("POST /remove-bg request received");

  const { imageUrl, format } = req.body;
  console.log(`Received imageUrl: ${imageUrl}`);
  console.log(`Requested format: ${format}`);

  if (!imageUrl) {
    console.error("Error: Missing imageUrl in request body");
    return res.status(400).json({ error: "Missing imageUrl in request body" });
  }

  try {
    const formData = new URLSearchParams();
    formData.append("size", "auto");
    formData.append("image_url", imageUrl);

    console.log("Sending request to remove.bg API...");
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.REMOVEBG_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("remove.bg API error:", errorData);
      return res.status(500).json({ error: "Failed to remove background" });
    }

    const imageBuffer = await response.arrayBuffer();
    console.log("Successfully received image buffer from remove.bg");

    const contentType =
      format === "jpg"
        ? "image/jpeg"
        : format === "jpeg"
        ? "image/jpeg"
        : "image/png"; // default

    res.set("Content-Type", contentType);
    console.log(
      `Sending processed image back with Content-Type: ${contentType}`
    );
    res.send(Buffer.from(imageBuffer));
  } catch (err) {
    console.error("Internal server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("API Key Loaded:", process.env.REMOVEBG_API_KEY ? "Yes" : "No");
});
