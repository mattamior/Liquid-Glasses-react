// Copy to src/liquid-glass/v3-conformance-route-registration.tsx. Then use the
// v3-conformance-router-consumer.tsx template in the mounted RouterProvider.
import type { RouteObject } from "react-router-dom";
import { V3ConformanceRoute } from "./v3-conformance-route";

export const V3_CONFORMANCE_PATH = "/__liquid-glass-conformance";

/** Vite removes the development/test witness from the production route table. */
export function createV3ConformanceRoute(): RouteObject[] {
  if (import.meta.env.PROD) return [];
  return [{ path: V3_CONFORMANCE_PATH, Component: V3ConformanceRoute }];
}
