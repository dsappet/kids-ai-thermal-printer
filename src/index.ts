import { Context, Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { generateImage } from "./openai";
import { uploadImage } from "./storage";
import { sendBufferToDevice } from "./usb";
import { encodeImage } from "./printer-encoder";
import { connectAndSend } from "./usb-legacy";
import { serve } from "bun";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["*"],
    allowHeaders: ["*"],
    exposeHeaders: ["Content-Disposition"],
  })
);

app.get("/status", (c) => {
  return c.text("Ok!");
});

app.get("/version", async (c) => {
  const version = "1.0.0";
  console.log("Version:", version);
  return c.text(version);
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

app.get("/print", async (c: Context) => {
  // Detailed request info
  console.log("\n=== Request Start ===");
  console.log("Time:", new Date(Date.now()).toISOString());
  // console.log("Stack trace:", requestInfo.stack);

  try {
    console.log("/print");
    // Get an array of keywords from the query params
    const keywords = c.req.query("keywords");
    // Parse the keywords as an array of strings
    const keywordsArray = keywords?.split(",").map((keyword) => keyword.trim());
    console.log("keywordsArray", keywordsArray);

    if (!keywordsArray || keywordsArray.length === 0) {
      return c.json({ error: "No keywords provided" }, 400);
    }

    // Generate an image based on the keywords
    const prompt = `A whimsical coloring page featuring a ${keywordsArray.join(
      " "
    )} in chibi style, surrounded by playful patterns and cute details like stars, hearts, and clouds. The scene should invite creativity with simple yet detailed outlines for coloring.`;

    const image = await generateImage(prompt);

    // Verify we have valid image data
    if (!image || !(image instanceof Uint8Array || Buffer.isBuffer(image))) {
      console.error("Invalid image data received");
      return c.json({ error: "Failed to generate image" }, 500);
    }

    // Print to the thermal printer if the printer is connected
    const printData = await encodeImage(image);

    // The webusb library way, this doesn't seem supported on the raspberry pi
    // await sendBufferToDevice(printData);

    // the legacy way, this works on the raspberry pi
    await connectAndSend(printData);

    // Upload the image to the cloud
    const fileName = `${Date.now()}-${keywordsArray.join("-")}.png`;
    await uploadImage(image, fileName);

    console.log("Time:", new Date(Date.now()).toISOString());
    console.log("\n=== Request Complete ===");

    // return c.json({ success: true });

    // Create proper headers
    const headers = {
      "Content-Type": "image/png",
      "Content-Length": image.byteLength.toString(),
      "Cache-Control": "no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    };

    return new Response(image, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error in /print endpoint:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// export default app;
export default {
  serve() {
    return serve({
      fetch: app.fetch,
      port: process.env.PORT || 3000,
      // Set timeout to 90 seconds or adjust as needed
      idleTimeout: 90,
      // Optional development settings
      development: process.env.NODE_ENV !== "production",
      // Error handling
      error(error) {
        console.error("Server error:", error);
        return new Response("Internal Server Error", { status: 500 });
      },
    });
  },
};
