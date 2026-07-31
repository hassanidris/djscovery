import React from "react";
import { fn } from "@storybook/test";

export const useTheme = fn(() => ({
  theme: "dark",
  setTheme: fn(),
  resolvedTheme: "dark",
}));

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
export const ThemeConsumer = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
export const ThemeViewer = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
export const ThemeSwitcher = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
