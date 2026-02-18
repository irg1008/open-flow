import { ConvexHttpClient } from "convex/browser";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const httpClient = new ConvexHttpClient(convexUrl);

export { api, httpClient, useAction, useMutation, useQuery };
