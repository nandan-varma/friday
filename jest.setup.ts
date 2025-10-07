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
if (typeof globalThis.WritableStream === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  globalThis.WritableStream = require("web-streams-polyfill").WritableStream;
}

// Mock Request and Response for Next.js
global.Request = global.Request || class Request {};
global.Response = global.Response || class Response {};

// any global mocks or setup, e.g. for fetch, window APIs etc.

// Mock ResizeObserver for Radix UI components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
