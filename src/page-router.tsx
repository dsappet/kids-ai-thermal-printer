import { Context, Hono } from "hono";
import { Layout } from "./app/layout";
import { Page } from "./app/page";
import { Example } from "./app/example";

export const registerPageRoutes = (app: Hono) => {
  app.get("/", (c: Context) => {
    return c.html(
      <Layout>
        <Page />
      </Layout>
    );
  });
  
  app.get("/example", (c: Context) => {
    const messages = ["Good Morning", "Good Evening", "Good Night"];
    return c.html(
      <Layout>
        <Example messages={messages} />
      </Layout>
    );
  });
};
