import { authCtxOverride } from "#/auth";
import { customAction, customMutation, customQuery } from "convex-helpers/server/customFunctions";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query
} from "../_generated/server";

export const authQuery = customQuery(query, authCtxOverride);
export const internalAuthQuery = customQuery(internalQuery, authCtxOverride);

export const authMutation = customMutation(mutation, authCtxOverride);
export const internalAuthMutation = customMutation(internalMutation, authCtxOverride);

export const authAction = customAction(action, authCtxOverride);
export const internalAuthAction = customAction(internalAction, authCtxOverride);
