import { describe, it, expect, vi, beforeEach } from "vitest";
import { requestGeneration } from "../src/api/generate";

describe("requestGeneration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts JSON and returns parsed body", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ text: "hello", warnings: [] }),
    });

    const result = await requestGeneration({ contentType: "blog" });

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/generate",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(result.text).toBe("hello");
  });

  it("throws with the server's error message on failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Validation failed", details: {} }),
    });

    await expect(requestGeneration({})).rejects.toThrow("Validation failed");
  });

  it("throws a generic error when no message is provided", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    await expect(requestGeneration({})).rejects.toThrow("Request failed");
  });
});