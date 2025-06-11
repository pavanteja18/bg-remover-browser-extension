import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { FormData } from "formdata-node";

dotenv.config();
const app = express();

app.use(express.json()); // allow JSON body parsing

app.post("/remove-bg", async (req, res) => {
  const apiKey = process.env.REMOVEBG_API_KEY;
  const { imageUrl, format = "png" } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "Image URL is required." });
  }

  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_url", imageUrl);
  formData.append("format", format);

  try {
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(errorData);
      return res
        .status(500)
        .json({ error: "Background removal failed", details: errorData });
    }

    const arrayBuffer = await response.arrayBuffer();
    res.set("Content-Type", `image/${format}`);
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
