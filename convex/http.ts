import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { githubWebhook } from "./github/http";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

http.route({
  path: "/webhooks/github",
  method: "POST",
  handler: githubWebhook
});

export default http;
