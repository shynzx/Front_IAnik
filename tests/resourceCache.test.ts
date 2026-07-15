import { beforeEach, describe, expect, it, vi } from "vitest";
import { cachedResource, clearResourceCache, invalidateResource } from "@/lib/resourceCache";

describe("resourceCache", () => {
  beforeEach(clearResourceCache);

  it("deduplica solicitudes simultáneas", async () => {
    const loader = vi.fn(async () => ["resultado"]);
    const [first, second] = await Promise.all([cachedResource("notebooks", loader), cachedResource("notebooks", loader)]);
    expect(first).toEqual(second);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("invalida recursos por prefijo", async () => {
    const loader = vi.fn(async () => loader.mock.calls.length);
    await cachedResource("study:1:exams", loader);
    invalidateResource("study:1:");
    await cachedResource("study:1:exams", loader);
    expect(loader).toHaveBeenCalledTimes(2);
  });
});
