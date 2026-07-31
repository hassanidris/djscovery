import type { StorybookConfig } from "@storybook/nextjs-vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-a11y"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
  viteFinal: async (config) => {
    // Use native Vite tsconfig paths support
    config.resolve = config.resolve || {};
    config.resolve.tsconfigPaths = true;

    // Mock next/navigation, next-themes, and next/image
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias["next/navigation"] = path.resolve(
      __dirname,
      "./next-navigation-mock.tsx",
    );
    config.resolve.alias["next-themes"] = path.resolve(
      __dirname,
      "./next-themes-mock.tsx",
    );
    config.resolve.alias["next/image"] = path.resolve(
      __dirname,
      "./next-image-mock.tsx",
    );

    return config;
  },
};
export default config;
