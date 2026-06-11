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
    "next-env.d.ts",
    // Cloudflare / OpenNext generated output.
    ".open-next/**",
    ".wrangler/**",
  ]),
  {
    // custom-worker.ts imports the OpenNext-generated worker, which only
    // exists after a build, so the import must use @ts-ignore (with a reason)
    // rather than @ts-expect-error.
    files: ["custom-worker.ts"],
    rules: {
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-ignore": "allow-with-description" },
      ],
    },
  },
]);

export default eslintConfig;
