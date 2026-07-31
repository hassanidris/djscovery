import { fn } from "@storybook/test";

// Mock next/navigation
export const useRouter = fn(() => ({
  push: fn(),
  replace: fn(),
  prefetch: fn(),
  back: fn(),
  forward: fn(),
  refresh: fn(),
  pathname: "/",
  query: {},
  asPath: "/",
  route: "/",
}));
export const usePathname = fn(() => "/");
export const useSearchParams = fn(() => new URLSearchParams());
export const useParams = fn(() => ({}));
