/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as comments_mutations from "../comments/mutations.js";
import type * as comments_queries from "../comments/queries.js";
import type * as crons from "../crons.js";
import type * as github_actions from "../github/actions.js";
import type * as github_http from "../github/http.js";
import type * as github_mutations from "../github/mutations.js";
import type * as github_queries from "../github/queries.js";
import type * as github_validators from "../github/validators.js";
import type * as http from "../http.js";
import type * as lib_functions from "../lib/functions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "comments/mutations": typeof comments_mutations;
  "comments/queries": typeof comments_queries;
  crons: typeof crons;
  "github/actions": typeof github_actions;
  "github/http": typeof github_http;
  "github/mutations": typeof github_mutations;
  "github/queries": typeof github_queries;
  "github/validators": typeof github_validators;
  http: typeof http;
  "lib/functions": typeof lib_functions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
  actionCache: import("@convex-dev/action-cache/_generated/component.js").ComponentApi<"actionCache">;
};
