import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    // Experimental screenshots and bundled fixtures are not application source.
    "output/**",
    "next-env.d.ts",
  ]),
  // V1's documented state-in-effect exception remains local to its source line;
  // do not exclude app/v1/** from the repository lint surface.
]);

export default eslintConfig;
