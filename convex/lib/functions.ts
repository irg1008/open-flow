import { authCtxOverride } from "#/auth";
import { triggers } from "#/triggers";
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

export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(rawInternalMutation, customCtx(triggers.wrapDB));

export const authQuery = customQuery(rawQuery, authCtxOverride);
export const internalAuthQuery = customQuery(rawInternalQuery, authCtxOverride);

export const authMutation = customMutation(mutation, authCtxOverride);
export const internalAuthMutation = customMutation(internalMutation, authCtxOverride);

export const authAction = customAction(rawAction, authCtxOverride);
export const internalAuthAction = customAction(rawInternalAction, authCtxOverride);
