// oxlint-disable no-restricted-imports
import { DataModel } from "#/_generated/dataModel";
import { triggers } from "#/triggers";
import { GenericCtx } from "@convex-dev/better-auth";
import {
  customAction,
  customCtx,
  customMutation,
  customQuery
} from "convex-helpers/server/customFunctions";
import {
  action as rawAction,
  internalAction as rawInternalAction,
  internalMutation as rawInternalMutation,
  internalQuery as rawInternalQuery,
  mutation as rawMutation,
  query as rawQuery
} from "../_generated/server";

// See https://labs.convex.dev/better-auth/basic-usage/authorization for more info

const authCtxOverride = customCtx(async (ctx: GenericCtx<DataModel>) => {
  const user = await ctx.auth.getUserIdentity();
  if (!user) throw new Error("Unauthorized");
  return { user };
});

export {
  rawAction as action,
  rawInternalAction as internalAction,
  rawInternalQuery as internalQuery,
  rawQuery as query
};

export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(rawInternalMutation, customCtx(triggers.wrapDB));

export const authQuery = customQuery(rawQuery, authCtxOverride);
export const internalAuthQuery = customQuery(rawInternalQuery, authCtxOverride);

export const authMutation = customMutation(mutation, authCtxOverride);
export const internalAuthMutation = customMutation(internalMutation, authCtxOverride);

export const authAction = customAction(rawAction, authCtxOverride);
export const internalAuthAction = customAction(rawInternalAction, authCtxOverride);
