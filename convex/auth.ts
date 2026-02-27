import { CreateAuth, createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { MutationCtx, QueryCtx } from "./_generated/server";
import authConfig from "./auth.config";
import { authMutation, authQuery } from "./lib/functions";

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth: CreateAuth<DataModel> = (ctx) => {
  return betterAuth({
    baseURL: process.env.SITE_URL,
    database: authComponent.adapter(ctx),

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

export const getCurrentUser = authQuery({
  handler: async (ctx) => {
    return await authComponent.getAuthUser(ctx);
  }
});

export const getAuth = (ctx: MutationCtx | QueryCtx) => {
  return authComponent.getAuth(createAuth, ctx);
};

export const deleteAccount = authMutation({
  handler: async (ctx) => {
    const { auth, headers } = await getAuth(ctx);
    await auth.api.deleteUser({ headers, body: {} });
  }
});
