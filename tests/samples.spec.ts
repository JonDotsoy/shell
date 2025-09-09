import { beforeAll, describe, expect, test } from "bun:test";
import fs from "fs";
import { shell } from "../src/shell.js";
import { ShellRequest } from "../src/shell-request.js";
import type { ReadableStreamController } from "bun";

/**
 * Test suite for JSON-RPC communication samples using the shell utility.
 *
 * This test suite validates that the shell can properly handle bidirectional
 * JSON-RPC communication via stdin/stdout streams with external processes.
 */
describe("JSON-RPC samples", () => {
  /** Path to the sample JSON-RPC implementation file */
  const path = new URL("./__samples__/json-rpc-iostream.ts", import.meta.url);

  /**
   * Map to store pending JSON-RPC request callbacks.
   * Key: request ID (string or number)
   * Value: callback function to handle the response
   */
  const callbacks = new Map<
    string | number,
    (error: any, result: any) => void
  >();

  /** Controller for the stdin stream to send JSON-RPC requests */
  let stdoin: ReadableStreamController<Uint8Array>;

  /**
   * Sends a JSON-RPC request and returns a promise that resolves with the response.
   *
   * @param id - Unique identifier for the JSON-RPC request
   * @returns Promise that resolves with the response result or rejects with an error
   */
  const jsonRpcRequest = (id: string | number) => {
    const promiseWithResolvers = Promise.withResolvers<any>();
    callbacks.set(id, (error: any, result: any) => {
      if (error) {
        promiseWithResolvers.reject(error);
      } else {
        promiseWithResolvers.resolve(result);
      }
    });
    stdoin.enqueue(
      new TextEncoder().encode(JSON.stringify({ jsonrpc: "2.0", id }) + "\n"),
    );
    return promiseWithResolvers.promise;
  };

  /**
   * Setup phase: Creates the sample directory and file if they don't exist.
   * The sample file is initialized with a placeholder error to be implemented later.
   */
  beforeAll(() => {
    fs.mkdirSync(new URL("./", path), { recursive: true });
    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, `throw new Error("Not implemented yet")`);
    }
  });

  /**
   * Test case: Validates JSON-RPC communication via stdin/stdout streams.
   *
   * This test:
   * 1. Creates a shell process running the JSON-RPC sample
   * 2. Sets up bidirectional communication via stdin/stdout
   * 3. Sends multiple JSON-RPC requests with different IDs
   * 4. Verifies that responses are correctly received and matched to requests
   * 5. Ensures the process completes successfully
   */
  test("should handle JSON-RPC communication via stdin/stdout", async () => {
    // Create a shell request with stdin stream for sending JSON-RPC messages
    const request = new ShellRequest({
      command: `bun ${path.pathname}`,
      signal: AbortSignal.timeout(500),
      stdin: new ReadableStream({
        start(controller) {
          stdoin = controller;
        },
      }),
    });

    const response = shell(request);

    // Set up stdout processing to handle JSON-RPC responses
    response.stdout.readable.pipeTo(
      new WritableStream({
        write(chunk) {
          // Parse each line as a JSON-RPC response
          for (const line of chunk.toString().split("\n")) {
            if (line.trim()) {
              const data = JSON.parse(line);
              const callback = callbacks.get(data.id);
              if (callback) {
                callbacks.delete(data.id);
                callback(data.error, data.result);
              }
            }
          }
        },
      }),
    );

    // Test multiple JSON-RPC requests with different IDs
    const res1 = await jsonRpcRequest(1);
    expect(res1).toBe("response for id 1");

    const res2 = await jsonRpcRequest(2);
    expect(res2).toBe("response for id 2");

    const res999 = await jsonRpcRequest(999);
    expect(res999).toBe("response for id 999");

    // Wait for the process to complete
    await response.exitCode;
  });
});
