import { defineConfig, type UserConfig } from "tsdown";
import { solid } from "rolldown-plugin-solid-compiler";

const entry = { index: "./src/index.tsx" };

const env = (mode: "development" | "production") => ({
  "process.env.NODE_ENV": JSON.stringify(mode),
  "process.env.PROD": mode === "production" ? "true" : "false",
  "process.env.DEV": mode === "development" ? "true" : "false",
  "process.env.SSR": "false",
  "import.meta.env.NODE_ENV": JSON.stringify(mode),
  "import.meta.env.PROD": mode === "production" ? "true" : "false",
  "import.meta.env.DEV": mode === "development" ? "true" : "false",
  "import.meta.env.SSR": "false",
});

const baseConfig = {
  entry,
  format: "esm",
  platform: "browser",
  target: "esnext",
  outDir: "dist",
  fixedExtension: false,
  hash: false,
  treeshake: true,
} satisfies UserConfig;

export default defineConfig([
  {
    ...baseConfig,
    name: "production",
    clean: true,
    dts: true,
    define: env("production"),
    minify: {
      compress: {
        dropConsole: true,
        dropDebugger: true,
      },
      mangle: false,
      codegen: {
        removeWhitespace: false,
      },
    },
    plugins: [solid()],
  },
  {
    ...baseConfig,
    name: "development",
    entry: { dev: "./src/index.tsx" },
    clean: false,
    dts: false,
    define: env("development"),
    plugins: [solid()],
  },
  {
    ...baseConfig,
    name: "solid",
    clean: false,
    dts: false,
    define: env("production"),
    outExtensions: () => ({ js: ".jsx" }),
  },
  {
    ...baseConfig,
    name: "solid-development",
    entry: { dev: "./src/index.tsx" },
    clean: false,
    dts: false,
    define: env("development"),
    outExtensions: () => ({ js: ".jsx" }),
  },
]);
