// Copy to src/router.tsx and mount V2StrictRouterProvider from the Vite entry.
import { useMemo } from "react";
import { createBrowserRouter, RouterProvider, type RouteObject } from "react-router-dom";
import { createV2ConformanceRoute } from "./v2-conformance-route-registration";

export interface V2StrictRouterProviderProps {
  applicationRoutes: RouteObject[];
}

/** The mounted router consumes the guarded development/test conformance route. */
export function V2StrictRouterProvider({ applicationRoutes }: V2StrictRouterProviderProps) {
  const router = useMemo(() => createBrowserRouter([...applicationRoutes, ...createV2ConformanceRoute()]), [applicationRoutes]);
  return <RouterProvider router={router} />;
}
