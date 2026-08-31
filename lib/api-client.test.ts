import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import { ApiError, parseApiResponse } from "./api-client";

const schema = z.object({ id: z.string() });

test("parseApiResponse returns parsed data for an ok response", async () => {
  const response = new Response(JSON.stringify({ id: "1" }), { status: 200 });
  const result = await parseApiResponse(response, schema, "fallback");
  assert.deepEqual(result, { id: "1" });
});

test("parseApiResponse throws ApiError with the server's message on failure", async () => {
  const response = new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
  });
  await assert.rejects(
    () => parseApiResponse(response, schema, "fallback"),
    (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.message, "Not found");
      assert.equal(error.status, 404);
      return true;
    },
  );
});

test("parseApiResponse falls back when the error body isn't shaped as expected", async () => {
  const response = new Response("not json", { status: 500 });
  await assert.rejects(
    () => parseApiResponse(response, schema, "fallback message"),
    (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.message, "fallback message");
      assert.equal(error.status, 500);
      return true;
    },
  );
});

test("parseApiResponse throws a zod error when the successful body doesn't match the schema", async () => {
  const response = new Response(JSON.stringify({ wrong: true }), {
    status: 200,
  });
  await assert.rejects(() => parseApiResponse(response, schema, "fallback"));
});
