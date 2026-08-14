// Copy to src/router.tsx and mount V3StrictRouterProvider from the Vite entry.
import { useMemo } from "react";
import { createBrowserRouter, RouterProvider, type RouteObject } from "react-router-dom";
import { createV3ConformanceRoute } from "./v3-conformance-route-registration";

export interface V3StrictRouterProviderProps {
  applicationRoutes: RouteObject[];
}

/** The mounted router consumes the guarded development/test conformance route. */
export function V3StrictRouterProvider({ applicationRoutes }: V3StrictRouterProviderProps) {
  const router = useMemo(() => createBrowserRouter([...applicationRoutes, ...createV3ConformanceRoute()]), [applicationRoutes]);
  return <RouterProvider router={router} />;
}
