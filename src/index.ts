import { Hono } from "hono";

import { registerPageRoutes } from "./page-router";

const app = new Hono();

app.get("/status", (c) => {
  return c.text("Ok!");
});

registerPageRoutes(app);

export default app;
