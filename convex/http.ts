import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { githubInstallAppCallback, githubWebhook } from "./github/http";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

http.route({
  path: "/api/webhooks/github",
  method: "POST",
  handler: githubWebhook
});

http.route({
  path: "/api/callback/github",
  method: "GET",
  handler: githubInstallAppCallback
});

export default http;
