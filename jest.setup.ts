import "@testing-library/jest-dom";

// Polyfills for Node.js environment
if (typeof globalThis.TransformStream === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  globalThis.TransformStream = require("web-streams-polyfill").TransformStream;
}
if (typeof globalThis.ReadableStream === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  globalThis.ReadableStream = require("web-streams-polyfill").ReadableStream;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
if (typeof globalThis.WritableStream === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  globalThis.WritableStream = require("web-streams-polyfill").WritableStream;
}

// Mock Request and Response for Next.js
global.Request = global.Request || class Request {};

global.Response =
  global.Response ||
  class {
    status: number;
    headers: Map<string, string>;
    body: unknown;

    constructor(
      body?: unknown,
      init?: { status?: number; headers?: Record<string, string> },
    ) {
      this.body = body;
      this.status = init?.status ?? 200;
      this.headers = new Map(Object.entries(init?.headers ?? {}));
    }

    json() {
      return Promise.resolve(this.body);
    }

    text() {
      return Promise.resolve(
        typeof this.body === "string" ? this.body : JSON.stringify(this.body),
      );
    }
  };

// any global mocks or setup, e.g. for fetch, window APIs etc.

// Mock ResizeObserver for Radix UI components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Suppress console logs for passing tests, show for failing
let logs: Array<{ method: keyof Console; args: any[] }> = [];
let origLog: typeof console.log;
let origError: typeof console.error;
let origWarn: typeof console.warn;

beforeEach(() => {
  logs = [];
  origLog = console.log;
  origError = console.error;
  origWarn = console.warn;

  console.log = (...args: any[]) => {
    logs.push({ method: "log", args });
  };
  console.error = (...args: any[]) => {
    logs.push({ method: "error", args });
  };
  console.warn = (...args: any[]) => {
    logs.push({ method: "warn", args });
  };
});

afterEach(() => {
  // Restore console
  console.log = origLog;
  console.error = origError;
  console.warn = origWarn;

  const state = (global as any).expect?.getState?.() || {};
  const { assertionCalls = 0, currentTestName = "" } = state;

  // Heuristic: if no assertions were run, consider the test failed (may need adjustment)
  const considerFailed = assertionCalls === 0;
  if (considerFailed && logs.length > 0) {
    console.log(
      `\n--- Buffered console output for failing test: ${currentTestName} ---`,
    );
    for (const entry of logs) {
      (console as any)[entry.method](...entry.args);
    }
    console.log("--- End buffered output ---\n");
  }
});
