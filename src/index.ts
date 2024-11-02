import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { generateImage } from "./openai";
import { uploadImage } from "./storage";

const app = new Hono();

app.get("/status", (c) => {
  return c.text("Ok!");
});

// Serve static files from the 'static' directory
app.use("/static/*", serveStatic({ root: "./src/static" }));

// Serve a specific static HTML file on the root path
app.get("/", serveStatic({ path: "./src/static/index.html" }));

app.get("/print-raw-buffer", (c) => {
  // Check that the content type is a buffer
  const buffer = c.req.raw.body;
  if (!buffer) {
    return c.text("No buffer provided", 400);
  }
  return c.text("Ok!");
});

app.get("/print", async (c) => {
  console.log("/print");
  // Get an array of keywords from the query params
  const keywords = c.req.query("keywords");
  // Parse the keywords as an array of strings
  const keywordsArray = keywords?.split(",").map((keyword) => keyword.trim());
  console.log("keywordsArray", keywordsArray);
  if (!keywordsArray) {
    return c.text("No keywords provided", 400);
  }

  // Generate an image based on the keywords
  const prompt = `A whimsical coloring book page featuring a ${keywordsArray.join(" ")} in chibi style, surrounded by playful patterns and cute details like stars, hearts, and clouds. The scene should invite creativity with simple yet detailed outlines for coloring.`;

  const image = await generateImage(prompt);
  const fileName = `${Date.now()}-${keywordsArray.join("-")}.png`;
  await uploadImage(image, fileName);

  // return the image
  return c.body(image as any, 200, {
    "Content-Type": "image/png",
    "Content-Length": image.length.toString(),
  });
});

export default app;
