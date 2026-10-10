import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheInvalidatePattern,
} from "@/lib/cache";

describe("cache functions (memory fallback)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.UPSTASH_REDIS_REST_URL = "";
    process.env.UPSTASH_REDIS_REST_TOKEN = "";
  });

  afterEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  describe("cacheGet", () => {
    it("returns null for non-existent key", async () => {
      const result = await cacheGet<string>("non-existent-key");
      expect(result).toBeNull();
    });

    it("retrieves stored value", async () => {
      await cacheSet("test-key", "test-value", 60);
      const result = await cacheGet<string>("test-key");
      expect(result).toBe("test-value");
    });

    it("retrieves complex objects", async () => {
      const obj = { foo: "bar", num: 42, nested: { deep: true } };
      await cacheSet("test-obj", obj, 60);
      const result = await cacheGet<typeof obj>("test-obj");
      expect(result).toEqual(obj);
    });

    it("returns null for expired keys", async () => {
      await cacheSet("expiring-key", "value", 0.001);
      await new Promise((resolve) => setTimeout(resolve, 10));
      const result = await cacheGet<string>("expiring-key");
      expect(result).toBeNull();
    });
  });

  describe("cacheSet", () => {
    it("stores string values", async () => {
      await cacheSet("string-key", "string-value", 60);
      const result = await cacheGet<string>("string-key");
      expect(result).toBe("string-value");
    });

    it("stores object values", async () => {
      const obj = { id: 1, name: "test" };
      await cacheSet("obj-key", obj, 60);
      const result = await cacheGet<typeof obj>("obj-key");
      expect(result).toEqual(obj);
    });

    it("stores array values", async () => {
      const arr = [1, 2, 3, 4, 5];
      await cacheSet("array-key", arr, 60);
      const result = await cacheGet<number[]>("array-key");
      expect(result).toEqual(arr);
    });

    it("overwrites existing key", async () => {
      await cacheSet("overwrite-key", "old-value", 60);
      await cacheSet("overwrite-key", "new-value", 60);
      const result = await cacheGet<string>("overwrite-key");
      expect(result).toBe("new-value");
    });
  });

  describe("cacheDelete", () => {
    it("deletes existing key", async () => {
      await cacheSet("delete-key", "value", 60);
      await cacheDelete("delete-key");
      const result = await cacheGet<string>("delete-key");
      expect(result).toBeNull();
    });

    it("handles deleting non-existent key", async () => {
      await expect(cacheDelete("non-existent-key")).resolves.not.toThrow();
    });
  });

  describe("cacheInvalidatePattern", () => {
    it("deletes keys matching prefix pattern", async () => {
      await cacheSet("dj_ratings:1:1:10:all", "value1", 60);
      await cacheSet("dj_ratings:1:1:10:direct", "value2", 60);
      await cacheSet("dj_ratings:2:1:10:all", "value3", 60);
      await cacheSet("other_key", "value4", 60);

      await cacheInvalidatePattern("dj_ratings:1:*");

      expect(await cacheGet<string>("dj_ratings:1:1:10:all")).toBeNull();
      expect(await cacheGet<string>("dj_ratings:1:1:10:direct")).toBeNull();
      expect(await cacheGet<string>("dj_ratings:2:1:10:all")).not.toBeNull();
      expect(await cacheGet<string>("other_key")).not.toBeNull();
    });

    it("handles pattern without wildcard (prefix match)", async () => {
      await cacheSet("exact_key", "value", 60);
      await cacheSet("exact_key_suffix", "value2", 60);

      await cacheInvalidatePattern("exact_key");

      expect(await cacheGet<string>("exact_key")).toBeNull();
      expect(await cacheGet<string>("exact_key_suffix")).toBeNull();
    });

    it("handles empty pattern (matches all keys)", async () => {
      await cacheSet("key1", "value1", 60);
      await cacheSet("key2", "value2", 60);

      await cacheInvalidatePattern("");

      expect(await cacheGet<string>("key1")).toBeNull();
      expect(await cacheGet<string>("key2")).toBeNull();
    });
  });

  describe("memory store cleanup", () => {
    it("evicts expired entries", async () => {
      await cacheSet("expire1", "value1", 0.001);
      await cacheSet("expire2", "value2", 0.001);
      await cacheSet("keep", "value3", 60);

      await new Promise((resolve) => setTimeout(resolve, 10));
      await cacheGet<string>("expire1");

      expect(await cacheGet<string>("expire1")).toBeNull();
      expect(await cacheGet<string>("expire2")).toBeNull();
      expect(await cacheGet<string>("keep")).toBe("value3");
    });
  });
});
