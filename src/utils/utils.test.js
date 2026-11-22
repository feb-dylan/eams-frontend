import { describe, expect, it } from "vitest";
import { getErrorMessage, getFieldErrors } from "./apiError";
import { daysUntil, formatEnum, formatMoney } from "./format";
import { decodeToken, isTokenExpired } from "./jwt";
import { parseInline, parseMarkdown } from "./markdown";
import { parseSseEvent } from "./sse";
import { assetCodeFromScan } from "./scan";

const tokenWith = (payload) =>
  `x.${btoa(JSON.stringify(payload)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_")}.y`;

describe("getErrorMessage", () => {
  it("uses the server message", () => {
    expect(getErrorMessage({ response: { data: { message: "Asset not found" } } })).toBe("Asset not found");
  });

  it("joins validation messages instead of returning an object (old crash)", () => {
    const err = { response: { data: { messages: { name: "Name is required", code: "Too long" } } } };
    expect(getErrorMessage(err)).toBe("Name is required · Too long");
    expect(getFieldErrors(err)).toEqual({ name: "Name is required", code: "Too long" });
  });

  it("never returns a non-string", () => {
    expect(typeof getErrorMessage({ response: { data: { weird: true } } }, "fallback")).toBe("string");
    expect(getErrorMessage({ response: { data: { weird: true } } }, "fallback")).toBe("fallback");
  });

  it("explains network failures", () => {
    expect(getErrorMessage({ code: "ERR_NETWORK", message: "Network Error" })).toMatch(/reach the server/);
  });
});

describe("format", () => {
  it("formats enums for people", () => {
    expect(formatEnum("RETURN_REQUESTED")).toBe("Return requested");
    expect(formatEnum(null)).toBe("-");
  });

  it("formats money and empty values", () => {
    expect(formatMoney(1200)).toContain("1,200");
    expect(formatMoney(null)).toBe("-");
  });

  it("counts days until a date", () => {
    const inFive = new Date();
    inFive.setDate(inFive.getDate() + 5);
    expect(daysUntil(inFive.toISOString().slice(0, 10))).toBe(5);
    expect(daysUntil(null)).toBeNull();
  });
});

describe("jwt", () => {
  it("reads the payload", () => {
    expect(decodeToken(tokenWith({ role: "ADMIN" })).role).toBe("ADMIN");
    expect(decodeToken("not-a-token")).toBeNull();
  });

  it("detects expired tokens", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(isTokenExpired(tokenWith({ exp: now - 10 }))).toBe(true);
    expect(isTokenExpired(tokenWith({ exp: now + 3600 }))).toBe(false);
    expect(isTokenExpired(null)).toBe(true);
  });
});

describe("markdown", () => {
  it("parses tables, lists and paragraphs", () => {
    const blocks = parseMarkdown("Two assets:\n\n| Code | Name |\n|---|---|\n| LAP-1 | Dell |\n\n- one\n- two");
    expect(blocks.map((b) => b.type)).toEqual(["p", "table", "ul"]);
    expect(blocks[1].rows).toEqual([["LAP-1", "Dell"]]);
    expect(blocks[2].items).toEqual(["one", "two"]);
  });

  it("parses inline formatting as data (no HTML)", () => {
    expect(parseInline("a **b** `c`")).toEqual([
      { type: "text", value: "a " },
      { type: "bold", value: "b" },
      { type: "text", value: " " },
      { type: "code", value: "c" },
    ]);
    // HTML stays plain text - React will escape it
    expect(parseInline("<img src=x onerror=alert(1)>")[0].type).toBe("text");
  });
});

describe("sse", () => {
  it("parses named JSON events and ignores comments", () => {
    expect(parseSseEvent('event: notification\ndata: {"id":1}')).toEqual({ name: "notification", data: { id: 1 } });
    expect(parseSseEvent(": ping")).toBeNull();
  });
});

describe("scan", () => {
  it("extracts the asset code from a QR URL", () => {
    expect(assetCodeFromScan("http://localhost:5173/a/LAP-0042")).toBe("LAP-0042");
    expect(assetCodeFromScan("https://eams.app/a/PRJ%20001?x=1")).toBe("PRJ 001");
    expect(assetCodeFromScan(" LAP-7 ")).toBe("LAP-7");
  });
});
