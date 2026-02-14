import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: process.env.SITE_URL,
    database: authComponent.adapter(ctx),

    // Configure simple, non-verified email/password to get started
    emailAndPassword: {
      enabled: false,
      requireEmailVerification: false
    },

    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        scopes: ["read:user", "user:email"]
      }
    },

    user: {
      deleteUser: {
        enabled: true
      }
    },

    plugins: [convex({ authConfig })]
  });
};

// See https://labs.convex.dev/better-auth/basic-usage/authorization for more info
