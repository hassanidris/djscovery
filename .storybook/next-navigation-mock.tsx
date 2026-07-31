import { fn } from "@storybook/test";

// Mock next/navigation
export const useRouter = fn();
export const usePathname = fn(() => "/");
export const useSearchParams = fn(() => new URLSearchParams());
export const useParams = fn(() => ({}));

// Mock next-themes
export const useTheme = fn(() => ({
  theme: "dark",
  setTheme: fn(),
  resolvedTheme: "dark",
}));

// Mock next/image
export const Image = ({ src, alt, ...props }: any) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src as string} alt={alt} {...props} />
);

export default Image;
