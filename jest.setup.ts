import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";
import { TransformStream } from "stream/web";

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

// Polyfill Web Streams API for Node.js test environment
global.TransformStream = TransformStream as unknown as typeof global.TransformStream;
global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;

// any global mocks or setup, e.g. for fetch, window APIs etc.

// Mock ResizeObserver for Radix UI components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));