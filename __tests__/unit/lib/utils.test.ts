import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges multiple class names", () => {
    expect(cn("btn", "btn-primary")).toBe("btn btn-primary");
  });

  it("handles conditional classes", () => {
    const isPrimary = true;
    const isHidden = false;

    expect(cn("btn", isPrimary && "btn-primary", isHidden && "hidden")).toBe(
      "btn btn-primary",
    );
  });

  it("removes falsy values", () => {
    expect(cn("btn", null, undefined, false, "btn-primary")).toBe(
      "btn btn-primary",
    );
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});
