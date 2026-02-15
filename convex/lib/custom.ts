import { DataModel } from "#/_generated/dataModel";
import { GenericCtx } from "@convex-dev/better-auth";
import {
  customAction,
  customCtx,
  customMutation,
  customQuery
} from "convex-helpers/server/customFunctions";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query
} from "../_generated/server";

export const authCtxOverride = customCtx(async (ctx: GenericCtx<DataModel>) => {
  const user = await ctx.auth.getUserIdentity();
  if (!user) throw new Error("Unauthorized");
  return { user };
});

export const authQuery = customQuery(query, authCtxOverride);
export const internalAuthQuery = customQuery(internalQuery, authCtxOverride);

export const authMutation = customMutation(mutation, authCtxOverride);
export const internalAuthMutation = customMutation(internalMutation, authCtxOverride);

export const authAction = customAction(action, authCtxOverride);
export const internalAuthAction = customAction(internalAction, authCtxOverride);
