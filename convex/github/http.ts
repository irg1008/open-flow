import { httpAction } from "#/_generated/server";
import { verify } from "@octokit/webhooks-methods";

const secret = process.env.GITHUB_WEBHOOK_SECRET;

export const githubWebhook = httpAction(async (ctx, request) => {
  const signature = request.headers.get("x-hub-signature-256");
  const payload = await request.text();

  if (!signature || !secret) {
    return new Response("Missing signature", { status: 400 });
  }

  const isValid = await verify(secret, payload, signature);
  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = request.headers.get("x-github-event");
  const data = JSON.parse(payload);

  console.log({ event, data });

  // blablabla

  return new Response("Webhook processed successfully", { status: 200 });
});
