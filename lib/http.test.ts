import { describe, expect, it } from "vitest";
import { readJson, readRequestText } from "./http";

describe("bounded request bodies", () => {
  it("rejects oversized bodies without relying on Content-Length", async () => {
    const request = new Request("http://localhost", { method: "POST", body: "a".repeat(100) });
    await expect(readRequestText(request, 20)).rejects.toMatchObject({ status: 413 });
  });
  it("distinguishes malformed JSON and unsupported content types", async () => {
    await expect(readJson(new Request("http://localhost", { method: "POST", body: "{" }))).rejects.toMatchObject({ status: 415 });
    await expect(readJson(new Request("http://localhost", { method: "POST", body: "{", headers: { "Content-Type": "application/json" } }))).rejects.toMatchObject({ status: 400 });
  });
});
