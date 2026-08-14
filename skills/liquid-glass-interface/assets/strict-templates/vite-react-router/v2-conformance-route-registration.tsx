// Copy to src/liquid-glass/v2-conformance-route-registration.tsx. Then use the
// v2-conformance-router-consumer.tsx template in the mounted RouterProvider.
import type { RouteObject } from "react-router-dom";
import { V2ConformanceRoute } from "./v2-conformance-route";

export const V2_CONFORMANCE_PATH = "/__liquid-glass-conformance";

/** Vite removes the development/test witness from the production route table. */
export function createV2ConformanceRoute(): RouteObject[] {
  if (import.meta.env.PROD) return [];
  return [{ path: V2_CONFORMANCE_PATH, Component: V2ConformanceRoute }];
}
