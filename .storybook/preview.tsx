import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/globals.css";

// Load fonts for Storybook
const link = document.createElement("link");
link.href =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@400;500;600;700&display=swap";
link.rel = "stylesheet";
document.head.appendChild(link);

// Set CSS variables for fonts (normally set by Next.js font optimization)
document.documentElement.style.setProperty("--font-inter", "Inter, sans-serif");
document.documentElement.style.setProperty("--font-sora", "Sora, sans-serif");

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "dark",
      values: [
        {
          name: "dark",
          value: "#050505",
        },
        {
          name: "light",
          value: "#ffffff",
        },
      ],
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
  decorators: [
    (Story, context) => (
      <div className={context.globals.theme}>
        <Story />
      </div>
    ),
  ],
  initialGlobals: {
    theme: "dark",
  },
  globalTypes: {
    theme: {
      description: "Global theme for components",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "circlehollow", title: "Light" },
          { value: "dark", icon: "circle", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
