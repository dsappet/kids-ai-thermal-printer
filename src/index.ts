import { Hono } from "hono";
import { serveStatic } from "hono/bun";

const app = new Hono();

app.get("/status", (c) => {
  return c.text("Ok!");
});

// Serve static files from the 'static' directory
app.use("/static/*", serveStatic({ root: "./src/static" }));

// Serve a specific static HTML file on the root path
app.get("/", serveStatic({ path: "./src/static/index.html" }));

export default app;
